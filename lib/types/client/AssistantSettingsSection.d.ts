/** Settings page for the WeChat Assistant's write-only OpenAI credential and voice options. */
import type { ReactNode } from 'react';
import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client';
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { AssistantSettings } from '../settings-contract.ts';
/** Settings and credential operations supplied by the browser plugin. */
export interface AssistantSettingsSectionInjected {
    readonly scope: SettingsScope<AssistantSettings>;
    readonly api: Pick<IApiClient, 'credentials'>;
}
/** Props composed by the settings section slot. */
export type AssistantSettingsSectionProps = PropsRuntime<'settings.section'> & PropsLocale<'a2a-assistant'> & Partial<InjectFace<AssistantSettingsSectionInjected>>;
/** Render the WeChat Assistant settings page. */
export declare function AssistantSettingsSection(props: AssistantSettingsSectionProps): ReactNode;
//# sourceMappingURL=AssistantSettingsSection.d.ts.map