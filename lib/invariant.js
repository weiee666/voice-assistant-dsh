//#region lib/types/invariant.js
/** Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-a2a-assistant`. */
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-a2a-assistant";
/** Cordis companion plugin name. */
const name = "client-ui-a2a-assistant-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
