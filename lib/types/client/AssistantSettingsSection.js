import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Settings page for the WeChat Assistant's write-only OpenAI credential and voice options. */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, IconCheckOutline16, StateDot, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './AssistantSettingsSection.module.css';
const EMPTY_DRAFT = {
    key: '', minimaxKey: '', telegramKey: '', model: '', voice: '', transcriptionModel: '', instructions: '', voiceSilenceMs: '',
    minimaxApiKeyEnv: '', minimaxBaseURL: '', minimaxModel: '', minimaxVoice: '', minimaxFormat: '',
    publicDashboardUrl: '', bridgeDeviceName: '', bridgePollIntervalMs: '', telegramBotTokenEnv: '',
    telegramAllowedUserIds: '',
};
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
/** Render the WeChat Assistant settings page. */
export function AssistantSettingsSection(props) {
    const { scope, api, t } = props;
    if (scope === undefined || api === undefined)
        return null;
    const snapshot = useSyncExternalStore(listener => scope.subscribe(listener), () => scope.getSnapshot());
    const current = snapshot.value;
    const credentialRef = current?.apiKeyEnv ?? 'OPENAI_API_KEY';
    const minimaxCredentialRef = current?.minimaxApiKeyEnv ?? 'MINIMAX_API_KEY';
    const telegramCredentialRef = current?.telegramBotTokenEnv ?? 'TELEGRAM_BOT_TOKEN';
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [configured, setConfigured] = useState(false);
    const [minimaxConfigured, setMinimaxConfigured] = useState(false);
    const [telegramConfigured, setTelegramConfigured] = useState(false);
    const [credentialWritable, setCredentialWritable] = useState(true);
    const [minimaxCredentialWritable, setMinimaxCredentialWritable] = useState(true);
    const [telegramCredentialWritable, setTelegramCredentialWritable] = useState(true);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState();
    useEffect(() => {
        if (current === undefined || dirty)
            return;
        setDraft({
            key: '',
            minimaxKey: '',
            telegramKey: '',
            model: current.model,
            voice: current.voice,
            transcriptionModel: current.transcriptionModel,
            instructions: current.instructions,
            voiceSilenceMs: String(current.voiceSilenceMs),
            minimaxApiKeyEnv: current.minimaxApiKeyEnv,
            minimaxBaseURL: current.minimaxBaseURL,
            minimaxModel: current.minimaxModel,
            minimaxVoice: current.minimaxVoice,
            minimaxFormat: current.minimaxFormat,
            publicDashboardUrl: current.publicDashboardUrl,
            bridgeDeviceName: current.bridgeDeviceName,
            bridgePollIntervalMs: String(current.bridgePollIntervalMs),
            telegramBotTokenEnv: current.telegramBotTokenEnv,
            telegramAllowedUserIds: current.telegramAllowedUserIds,
        });
    }, [current, dirty]);
    useEffect(() => {
        let active = true;
        void api.credentials.describe({ refs: [credentialRef, minimaxCredentialRef, telegramCredentialRef] }).then((response) => {
            if (!active || !response.result.ok)
                return;
            const openaiView = response.result.value.credentials[credentialRef];
            const minimaxView = response.result.value.credentials[minimaxCredentialRef];
            const telegramView = response.result.value.credentials[telegramCredentialRef];
            setConfigured(openaiView?.configured ?? false);
            setCredentialWritable(openaiView?.writable ?? true);
            setMinimaxConfigured(minimaxView?.configured ?? false);
            setMinimaxCredentialWritable(minimaxView?.writable ?? true);
            setTelegramConfigured(telegramView?.configured ?? false);
            setTelegramCredentialWritable(telegramView?.writable ?? true);
        }).catch(() => { });
        return () => { active = false; };
    }, [api, credentialRef, minimaxCredentialRef, telegramCredentialRef]);
    const edit = (field, value) => {
        setDraft(previous => ({ ...previous, [field]: value }));
        setDirty(true);
        setNotice(undefined);
    };
    const save = async () => {
        if (current === undefined)
            return;
        setBusy(true);
        setNotice(undefined);
        try {
            const key = draft.key.trim();
            if (key !== '') {
                const response = await api.credentials.set({ ref: credentialRef, value: key });
                if (!response.result.ok)
                    throw new Error(response.result.error.message);
                setConfigured(true);
            }
            const minimaxKey = draft.minimaxKey.trim();
            if (minimaxKey !== '') {
                const response = await api.credentials.set({ ref: draft.minimaxApiKeyEnv.trim(), value: minimaxKey });
                if (!response.result.ok)
                    throw new Error(response.result.error.message);
                setMinimaxConfigured(true);
            }
            const telegramKey = draft.telegramKey.trim();
            if (telegramKey !== '') {
                const response = await api.credentials.set({ ref: draft.telegramBotTokenEnv.trim(), value: telegramKey });
                if (!response.result.ok)
                    throw new Error(response.result.error.message);
                setTelegramConfigured(true);
            }
            const fields = [
                'model',
                'voice',
                'transcriptionModel',
                'instructions',
                'minimaxApiKeyEnv',
                'minimaxBaseURL',
                'minimaxModel',
                'minimaxVoice',
                'minimaxFormat',
                'bridgeDeviceName',
                'telegramBotTokenEnv',
            ];
            for (const field of fields) {
                const value = draft[field].trim();
                if (value === '')
                    throw new Error(t(`settings.${field}.required`));
                if (value !== current[field])
                    await scope.set(field, value);
            }
            const optionalFields = ['publicDashboardUrl', 'telegramAllowedUserIds'];
            for (const field of optionalFields) {
                const value = draft[field].trim();
                if (value !== current[field])
                    await scope.set(field, value);
            }
            const bridgePollIntervalMs = Number.parseInt(draft.bridgePollIntervalMs.trim(), 10);
            if (!Number.isSafeInteger(bridgePollIntervalMs) || bridgePollIntervalMs < 500) {
                throw new Error(t('settings.bridgePollIntervalMs.required'));
            }
            if (bridgePollIntervalMs !== current.bridgePollIntervalMs) {
                await scope.set('bridgePollIntervalMs', bridgePollIntervalMs);
            }
            const voiceSilenceMs = Number.parseInt(draft.voiceSilenceMs.trim(), 10);
            if (!Number.isSafeInteger(voiceSilenceMs) || voiceSilenceMs < 250) {
                throw new Error(t('settings.voiceSilenceMs.required'));
            }
            if (voiceSilenceMs !== current.voiceSilenceMs) {
                await scope.set('voiceSilenceMs', voiceSilenceMs);
            }
            setDraft(previous => ({ ...previous, key: '', minimaxKey: '', telegramKey: '' }));
            setDirty(false);
            setNotice({ kind: 'ok', text: t('settings.saved') });
        }
        catch (error) {
            setNotice({ kind: 'error', text: messageOf(error) });
        }
        finally {
            setBusy(false);
        }
    };
    const removeKey = async (ref, kind) => {
        setBusy(true);
        setNotice(undefined);
        try {
            const response = await api.credentials.unset({ ref });
            if (!response.result.ok)
                throw new Error(response.result.error.message);
            if (kind === 'openai') {
                setConfigured(false);
                setDraft(previous => ({ ...previous, key: '' }));
            }
            else if (kind === 'minimax') {
                setMinimaxConfigured(false);
                setDraft(previous => ({ ...previous, minimaxKey: '' }));
            }
            else {
                setTelegramConfigured(false);
                setDraft(previous => ({ ...previous, telegramKey: '' }));
            }
            setNotice({ kind: 'ok', text: t('settings.key.removed') });
        }
        catch (error) {
            setNotice({ kind: 'error', text: messageOf(error) });
        }
        finally {
            setBusy(false);
        }
    };
    const unavailable = snapshot.status !== 'ready';
    const disabled = busy || unavailable || !snapshot.writable;
    return (_jsxs("div", { className: css.page, children: [_jsxs("header", { className: css.header, children: [_jsx("h2", { children: t('settings.title') }), _jsx("p", { children: t('settings.description') })] }), _jsxs("section", { className: css.section, children: [_jsxs("div", { className: css.sectionHead, children: [_jsxs("div", { children: [_jsx("h3", { children: t('settings.realtime.title') }), _jsx("p", { children: t('settings.realtime.description') })] }), _jsxs("span", { className: css.status, children: [_jsx(StateDot, { state: configured ? 'done' : 'warning' }), configured ? t('settings.key.configured') : t('settings.key.missing')] })] }), _jsxs("div", { className: css.form, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.key.label') }), _jsx("input", { type: "password", autoComplete: "off", value: draft.key, placeholder: configured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder'), disabled: busy || !credentialWritable, onChange: event => { edit('key', event.target.value); } }), _jsx("small", { children: t('settings.key.hint') })] }), _jsxs("div", { className: css.grid, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.model.label') }), _jsx("input", { type: "text", value: draft.model, disabled: disabled, onChange: event => { edit('model', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.voice.label') }), _jsx("select", { value: draft.voice, disabled: disabled, onChange: event => { edit('voice', event.target.value); }, children: ['marin', 'cedar', 'coral', 'sage', 'verse', 'alloy'].map(voice => (_jsx("option", { value: voice, children: voice }, voice))) })] })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.transcriptionModel.label') }), _jsx("input", { type: "text", value: draft.transcriptionModel, disabled: disabled, onChange: event => { edit('transcriptionModel', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.instructions.label') }), _jsx("textarea", { rows: 4, value: draft.instructions, disabled: disabled, onChange: event => { edit('instructions', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.voiceSilenceMs.label') }), _jsx("input", { type: "number", min: 250, step: 100, value: draft.voiceSilenceMs, disabled: disabled, onChange: event => { edit('voiceSilenceMs', event.target.value); } }), _jsx("small", { children: t('settings.voiceSilenceMs.hint') })] })] }), _jsxs("div", { className: css.sectionHead, children: [_jsxs("div", { children: [_jsx("h3", { children: t('settings.minimax.title') }), _jsx("p", { children: t('settings.minimax.description') })] }), _jsxs("span", { className: css.status, children: [_jsx(StateDot, { state: minimaxConfigured ? 'done' : 'warning' }), minimaxConfigured ? t('settings.key.configured') : t('settings.key.missing')] })] }), _jsxs("div", { className: css.form, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxKey.label') }), _jsx("input", { type: "password", autoComplete: "off", value: draft.minimaxKey, placeholder: minimaxConfigured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder'), disabled: busy || !minimaxCredentialWritable, onChange: event => { edit('minimaxKey', event.target.value); } }), _jsx("small", { children: t('settings.minimaxKey.hint') })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxApiKeyEnv.label') }), _jsx("input", { type: "text", value: draft.minimaxApiKeyEnv, disabled: disabled, onChange: event => { edit('minimaxApiKeyEnv', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxBaseURL.label') }), _jsx("input", { type: "text", value: draft.minimaxBaseURL, disabled: disabled, onChange: event => { edit('minimaxBaseURL', event.target.value); } })] }), _jsxs("div", { className: css.grid, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxModel.label') }), _jsx("input", { type: "text", value: draft.minimaxModel, disabled: disabled, onChange: event => { edit('minimaxModel', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxVoice.label') }), _jsx("input", { type: "text", value: draft.minimaxVoice, disabled: disabled, onChange: event => { edit('minimaxVoice', event.target.value); } })] })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.minimaxFormat.label') }), _jsx("select", { value: draft.minimaxFormat, disabled: disabled, onChange: event => { edit('minimaxFormat', event.target.value); }, children: ['mp3', 'wav', 'flac', 'pcm'].map(format => (_jsx("option", { value: format, children: format }, format))) })] })] }), _jsx("div", { className: css.sectionHead, children: _jsxs("div", { children: [_jsx("h3", { children: t('settings.public.title') }), _jsx("p", { children: t('settings.public.description') })] }) }), _jsxs("div", { className: css.form, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.publicDashboardUrl.label') }), _jsx("input", { type: "url", value: draft.publicDashboardUrl, placeholder: "https://your-assistant.vercel.app", disabled: disabled, onChange: event => { edit('publicDashboardUrl', event.target.value); } }), _jsx("small", { children: t('settings.publicDashboardUrl.hint') })] }), _jsxs("div", { className: css.grid, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.bridgeDeviceName.label') }), _jsx("input", { type: "text", value: draft.bridgeDeviceName, disabled: disabled, onChange: event => { edit('bridgeDeviceName', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.bridgePollIntervalMs.label') }), _jsx("input", { type: "number", min: 500, step: 100, value: draft.bridgePollIntervalMs, disabled: disabled, onChange: event => { edit('bridgePollIntervalMs', event.target.value); } })] })] })] }), _jsxs("div", { className: css.sectionHead, children: [_jsxs("div", { children: [_jsx("h3", { children: t('settings.telegram.title') }), _jsx("p", { children: t('settings.telegram.description') })] }), _jsxs("span", { className: css.status, children: [_jsx(StateDot, { state: telegramConfigured ? 'done' : 'warning' }), telegramConfigured ? t('settings.key.configured') : t('settings.key.missing')] })] }), _jsxs("div", { className: css.form, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.telegramKey.label') }), _jsx("input", { type: "password", autoComplete: "off", value: draft.telegramKey, placeholder: telegramConfigured ? t('settings.key.placeholderConfigured') : t('settings.key.placeholder'), disabled: busy || !telegramCredentialWritable, onChange: event => { edit('telegramKey', event.target.value); } }), _jsx("small", { children: t('settings.telegramKey.hint') })] }), _jsxs("div", { className: css.grid, children: [_jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.telegramBotTokenEnv.label') }), _jsx("input", { type: "text", value: draft.telegramBotTokenEnv, disabled: disabled, onChange: event => { edit('telegramBotTokenEnv', event.target.value); } })] }), _jsxs("label", { className: css.field, children: [_jsx("span", { children: t('settings.telegramAllowedUserIds.label') }), _jsx("input", { type: "text", value: draft.telegramAllowedUserIds, placeholder: "123456789, 987654321", disabled: disabled, onChange: event => { edit('telegramAllowedUserIds', event.target.value); } })] })] })] }), _jsxs("footer", { className: css.actions, children: [notice === undefined ? _jsx("span", {}) : (_jsx("span", { className: notice.kind === 'ok' ? css.success : css.failure, children: notice.text })), _jsxs("div", { children: [configured ? (_jsx(Button, { variant: "ghost", disabled: busy || !credentialWritable, onClick: () => { void removeKey(credentialRef, 'openai'); }, children: t('settings.key.remove') })) : null, minimaxConfigured ? (_jsx(Button, { variant: "ghost", disabled: busy || !minimaxCredentialWritable, onClick: () => { void removeKey(minimaxCredentialRef, 'minimax'); }, children: t('settings.key.remove') })) : null, telegramConfigured ? (_jsx(Button, { variant: "ghost", disabled: busy || !telegramCredentialWritable, onClick: () => { void removeKey(telegramCredentialRef, 'telegram'); }, children: t('settings.telegramKey.remove') })) : null, _jsx(Button, { variant: "primary", icon: _jsx(IconCheckOutline16, {}), disabled: disabled || !dirty, onClick: () => { void save(); }, children: busy ? t('settings.saving') : t('settings.save') })] })] })] })] }));
}
//# sourceMappingURL=AssistantSettingsSection.js.map