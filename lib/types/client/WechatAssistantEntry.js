import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSyncExternalStore } from 'react';
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import { Avatar } from "./avatars.js";
import css from './WechatAssistantWorkspace.module.css';
/** Sidebar footer entry displayed immediately above Settings. */
export function WechatAssistantEntry({ wide, workspace, t }) {
    const open = useSyncExternalStore(workspace.subscribe, workspace.getSnapshot).open;
    return (_jsx(Tooltip, { label: t('entry.label'), delayMs: 500, disabled: wide, children: _jsxs("button", { type: "button", className: `${css.entry}${wide ? '' : ` ${css.entryRail}`}${open ? ` ${css.entryActive}` : ''}`, "aria-label": t('entry.label'), "aria-pressed": open, onClick: () => { workspace.setOpen(!open); }, children: [_jsx("span", { className: css.entryAvatar, children: _jsx(Avatar, { role: "bot", size: wide ? 20 : 22 }) }), wide && _jsx("span", { className: css.entryLabel, children: t('entry.name') }), wide && _jsx("span", { className: css.beta, children: "beta" })] }) }));
}
//# sourceMappingURL=WechatAssistantEntry.js.map