/**
 * Build the two client lanes of the plugin as UMD bundles
 * (the format the NocoBase browser loader / requirejs expects):
 *
 *   dist/client/index.js     -> v1 UI entry (default, without /v)   [marker: client.js]
 *   dist/client-v2/index.js  -> v2 UI entry (/v)                    [marker: client-v2.js]
 *
 * All framework dependencies are externalized; the host application provides
 * them at runtime (see defineGlobalDeps / requirejs in @nocobase/client).
 *
 * esbuild has no UMD output, so bundles are produced as CJS and then wrapped
 * in a webpack-style UMD shell (CJS / AMD / browser globals).
 *
 * Requires: esbuild (devDependency).
 */
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

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
  return externals.filter((name) => new RegExp(`require\\(["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(code));
}

/** Wrap CJS code in a UMD shell (webpack-like: CJS / AMD / globals). */
function wrapUmd(code, depNames) {
  const amdDeps = JSON.stringify(['require', ...depNames]);
  return `!function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory(require);
  } else if (typeof define === 'function' && define.amd) {
    define(${amdDeps}, factory);
  } else {
    var __globals = {
${depNames.map((n) => `      ${JSON.stringify(n)}: root[${JSON.stringify(globalName(n))}],`).join('\n')}
    };
    factory(function (name) {
      if (name in __globals && __globals[name] !== undefined) return __globals[name];
      throw new Error('Cannot resolve module: ' + name);
    });
  }
}(typeof self !== 'undefined' ? self : this, function (__hostRequire) {
  var __injected = Array.prototype.slice.call(arguments, 1);
  var __names = ${JSON.stringify(depNames)};
  var __map = {};
  for (var __i = 0; __i < __names.length; __i++) __map[__names[__i]] = __injected[__i];
  var require = function (name) {
    if (name in __map) {
      if (__map[name] === undefined && typeof __hostRequire === 'function') return __hostRequire(name);
      return __map[name];
    }
    if (typeof __hostRequire === 'function') return __hostRequire(name);
    throw new Error('Cannot resolve module: ' + name);
  };
  var module = { exports: {} };
${code}
  return module.exports;
});
`;
}

/** Best-effort global variable name for the browser-globals fallback. */
function globalName(name) {
  if (name === 'react') return 'React';
  if (name === 'react-dom') return 'ReactDOM';
  if (name === 'react/jsx-runtime') return 'React';
  const parts = name.split('/');
  return parts[parts.length - 1];
}

async function buildLane(entry, outfile, externals) {
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
    write: false,
  });
  const code = result.outputFiles[0].text;
  const deps = usedExternals(code, externals);
  const umd = wrapUmd(code, deps);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  fs.writeFileSync(outfile, umd);
  console.log(`[simple-approval] built ${outfile} (${umd.length} bytes, externals: ${deps.join(', ') || 'none'})`);
}

async function main() {
  await buildLane(
    path.join(__dirname, 'src/client/index.tsx'),
    path.join(__dirname, 'dist/client/index.js'),
    V1_EXTERNALS,
  );
  await buildLane(
    path.join(__dirname, 'src/client-v2/index.tsx'),
    path.join(__dirname, 'dist/client-v2/index.js'),
    V2_EXTERNALS,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
