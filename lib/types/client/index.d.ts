/** Browser plugin registering the WeChat Assistant entry and app-level workspace. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type A2aAssistantLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Copy owned by the WeChat Assistant workspace. */
        'a2a-assistant': A2aAssistantLocaleKey;
    }
}
/** Required browser services. */
export declare const inject: string[];
/**
 * Register the root-scoped sidebar entry and independent application page.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map