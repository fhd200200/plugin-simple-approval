/**
 * Build the two client lanes of the plugin as UMD bundles, byte-compatible
 * with the official NocoBase plugin package format:
 *
 *   dist/client/index.js     -> v1 UI entry (default, without /v)   [marker: client.js]
 *        define("@mhd/plugin-simple-approval", [deps], factory)
 *   dist/client-v2/index.js  -> v2 UI entry (/v)                    [marker: client-v2.js]
 *        define("@mhd/plugin-simple-approval/client-v2", [deps], factory)
 *
 * All framework dependencies are externalized; the host application provides
 * them at runtime (defineGlobalDeps / requirejs).
 *
 * esbuild has no UMD output, so bundles are produced as CJS and then wrapped
 * in a webpack-style UMD shell (CJS / named AMD define / browser globals) —
 * the exact shape of the official packages (see @nocobase/plugin-acl:
 * `define("@nocobase/plugin-acl", [...], t)`).
 *
 * Requires: esbuild (devDependency).
 */
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const PKG_NAME = '@mhd/plugin-simple-approval';

const V1_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-router-dom',
  'antd',
  '@ant-design/icons',
  '@nocobase/client',
  '@nocobase/utils/client',
  'react-i18next',
  'ahooks',
  'lodash',
  'dayjs',
];

const V2_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'antd',
  '@ant-design/icons',
  '@nocobase/client-v2',
  '@nocobase/flow-engine',
  'react-i18next',
  'ahooks',
  'lodash',
];

/** Find which externals are actually referenced by the generated code. */
function usedExternals(code, externals) {
  return externals.filter((name) =>
    new RegExp(`require\\(["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(code),
  );
}

/** Best-effort global variable name for the browser-globals fallback. */
function globalName(name) {
  if (name === 'react') return 'React';
  if (name === 'react-dom') return 'ReactDOM';
  if (name === 'react/jsx-runtime') return 'React';
  const parts = name.split('/');
  return parts[parts.length - 1];
}

/**
 * Wrap CJS code in a UMD shell (webpack-like), with a NAMED AMD define —
 * exactly like the official NocoBase plugin bundles.
 */
function wrapUmd(code, amdName, depNames) {
  const amdDeps = JSON.stringify(depNames);
  const globalsEntries = depNames
    .map((n) => `      ${JSON.stringify(n)}: root[${JSON.stringify(globalName(n))}],`)
    .join('\n');
  return `!function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory(require);
  } else if (typeof define === 'function' && define.amd) {
    define(${JSON.stringify(amdName)}, ${amdDeps}, function () {
      var __names = ${amdDeps};
      var __map = {};
      for (var __i = 0; __i < __names.length; __i++) __map[__names[__i]] = arguments[__i];
      return factory(function (name) {
        if (name in __map) return __map[name];
        throw new Error('Cannot resolve module: ' + name);
      });
    });
  } else {
    var __globals = {
${globalsEntries}
    };
    factory(function (name) {
      if (name in __globals && __globals[name] !== undefined) return __globals[name];
      throw new Error('Cannot resolve module: ' + name);
    });
  }
}(typeof self !== 'undefined' ? self : this, function (require) {
  var module = { exports: {} };
${code}
  return module.exports;
});
`;
}

async function buildLane(entry, outfile, amdName, externals) {
  const result = await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: ['es2019'],
    jsx: 'automatic',
    sourcemap: false,
    minify: false,
    logLevel: 'info',
    external: externals,
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
  });
  const code = result.outputFiles[0].text;
  const deps = usedExternals(code, externals);
  const umd = wrapUmd(code, amdName, deps);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, umd);
  console.log(
    `[simple-approval] built ${outfile} (${umd.length} bytes, amd name: ${amdName}, deps: ${deps.join(', ') || 'none'})`,
  );
}

async function main() {
  await buildLane(
    path.join(__dirname, 'src/client/index.tsx'),
    path.join(__dirname, 'dist/client/index.js'),
    PKG_NAME,
    V1_EXTERNALS,
  );
  await buildLane(
    path.join(__dirname, 'src/client-v2/index.tsx'),
    path.join(__dirname, 'dist/client-v2/index.js'),
    `${PKG_NAME}/client-v2`,
    V2_EXTERNALS,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
