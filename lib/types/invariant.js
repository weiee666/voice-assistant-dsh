/** Package-owned invariant companion for the browser-only A2A assistant view. */
const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-a2a-assistant';
/** Cordis companion plugin name. */
export const name = 'client-ui-a2a-assistant-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** The view has no host relationship to audit. */
const install = () => { };
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns The installed registration's disposer.
 */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map