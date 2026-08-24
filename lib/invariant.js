//#region lib/types/invariant.js
/** Package-owned invariant companion for the browser-only A2A assistant view. */
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-a2a-assistant";
/** Cordis companion plugin name. */
const name = "client-ui-a2a-assistant-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** The view has no host relationship to audit. */
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns The installed registration's disposer.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
