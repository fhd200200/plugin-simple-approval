import { tExpr as _tExpr, useFlowEngine } from '@nocobase/flow-engine';

export const NAMESPACE = '@mhd/plugin-simple-approval';

/** Translate a static string (used in FlowModel definitions). */
export function tExpr(key: string) {
  return _tExpr(key, { ns: [NAMESPACE, 'client'] });
}

/** Translation hook for React components. */
export function useT() {
  const engine = useFlowEngine();
  return (str: string) => engine?.context?.t?.(str, { ns: [NAMESPACE, 'client'] }) ?? str;
}
