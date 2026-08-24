window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-a2a-assistant",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Users/admin/Desktop/python project/deepseek-harness-workbench-backup-20260824-165800/packages/client/ui-a2a-assistant/src/client/AssistantSettingsSection.module.css.mjs
		const css$1 = ".vwlEeq_page{box-sizing:border-box;width:100%;max-width:840px;margin:0 auto;padding:28px 32px 48px}.vwlEeq_header{margin-bottom:24px}.vwlEeq_header h2{letter-spacing:0;margin:0;font-size:22px;line-height:30px}.vwlEeq_header p,.vwlEeq_sectionHead p{color:var(--dsw-alias-label-secondary);margin:6px 0 0;font-size:13px;line-height:20px}.vwlEeq_section{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:8px;overflow:hidden}.vwlEeq_sectionHead{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:flex-start;gap:20px;padding:20px 22px;display:flex}.vwlEeq_sectionHead h3{letter-spacing:0;margin:0;font-size:16px;line-height:24px}.vwlEeq_status{border:1px solid var(--dsw-alias-border-l2);min-height:28px;color:var(--dsw-alias-label-secondary);border-radius:5px;flex:none;align-items:center;gap:7px;padding:0 10px;font-size:12px;display:inline-flex}.vwlEeq_form{flex-direction:column;gap:18px;padding:22px;display:flex}.vwlEeq_grid{grid-template-columns:minmax(0,1fr) minmax(180px,.55fr);gap:16px;display:grid}.vwlEeq_field{min-width:0;color:var(--dsw-alias-label-primary);flex-direction:column;gap:7px;font-size:13px;font-weight:500;display:flex}.vwlEeq_field input,.vwlEeq_field select,.vwlEeq_field textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l3);width:100%;min-width:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font:inherit;border-radius:6px;outline:none;font-weight:400}.vwlEeq_field input,.vwlEeq_field select{height:38px;padding:0 11px}.vwlEeq_field textarea{resize:vertical;padding:10px 11px;line-height:20px}.vwlEeq_field input:focus,.vwlEeq_field select:focus,.vwlEeq_field textarea:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent)}.vwlEeq_field input:disabled,.vwlEeq_field select:disabled,.vwlEeq_field textarea:disabled{opacity:.55;cursor:not-allowed}.vwlEeq_field small{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;line-height:18px}.vwlEeq_actions{border-top:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:16px;min-height:58px;padding:10px 16px 10px 22px;display:flex}.vwlEeq_actions>div{align-items:center;gap:8px;display:flex}.vwlEeq_success{color:var(--dsw-alias-state-success-primary);font-size:12px}.vwlEeq_failure{color:var(--dsw-alias-state-error-primary);font-size:12px}@media (width<=700px){.vwlEeq_page{padding:20px 16px 36px}.vwlEeq_sectionHead{flex-direction:column}.vwlEeq_grid{grid-template-columns:minmax(0,1fr)}.vwlEeq_actions{flex-direction:column;align-items:flex-start}.vwlEeq_actions>div{justify-content:flex-end;width:100%}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-a2a-assistant/AssistantSettingsSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-a2a-assistant";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var AssistantSettingsSection_module_css_default = {
			"actions": "vwlEeq_actions",
			"failure": "vwlEeq_failure",
			"field": "vwlEeq_field",
			"form": "vwlEeq_form",
			"grid": "vwlEeq_grid",
			"header": "vwlEeq_header",
			"page": "vwlEeq_page",
			"section": "vwlEeq_section",
			"sectionHead": "vwlEeq_sectionHead",
			"status": "vwlEeq_status",
			"success": "vwlEeq_success"
		};
		//#endregion
		//#region src/client/AssistantSettingsSection.tsx
		/** Settings page for the WeChat Assistant's write-only OpenAI credential and voice options. */
		const EMPTY_DRAFT = {
			key: "",
			minimaxKey: "",
			aliyunToken: "",
			telegramKey: "",
			model: "",
			voice: "",
			transcriptionModel: "",
			instructions: "",
			voiceSilenceMs: "",
			minimaxApiKeyEnv: "",
			minimaxBaseURL: "",
			minimaxModel: "",
			minimaxVoice: "",
			minimaxFormat: "",
			aliyunNlsTokenEnv: "",
			aliyunNlsAppKey: "",
			aliyunAsrURL: "",
			aliyunAsrFormat: "",
			aliyunAsrSampleRate: "",
			publicDashboardUrl: "",
			bridgeDeviceName: "",
			bridgePollIntervalMs: "",
			telegramBotTokenEnv: "",
			telegramAllowedUserIds: ""
		};
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/** Render the WeChat Assistant settings page. */
		function AssistantSettingsSection(props) {
			const { scope, api, t } = props;
			if (scope === void 0 || api === void 0) return null;
			const snapshot = (0, react.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot());
			const current = snapshot.value;
			const credentialRef = current?.apiKeyEnv ?? "OPENAI_API_KEY";
			const minimaxCredentialRef = current?.minimaxApiKeyEnv ?? "MINIMAX_API_KEY";
			const aliyunCredentialRef = current?.aliyunNlsTokenEnv ?? "ALIYUN_NLS_TOKEN";
			const telegramCredentialRef = current?.telegramBotTokenEnv ?? "TELEGRAM_BOT_TOKEN";
			const [draft, setDraft] = (0, react.useState)(EMPTY_DRAFT);
			const [configured, setConfigured] = (0, react.useState)(false);
			const [minimaxConfigured, setMinimaxConfigured] = (0, react.useState)(false);
			const [aliyunConfigured, setAliyunConfigured] = (0, react.useState)(false);
			const [telegramConfigured, setTelegramConfigured] = (0, react.useState)(false);
			const [credentialWritable, setCredentialWritable] = (0, react.useState)(true);
			const [minimaxCredentialWritable, setMinimaxCredentialWritable] = (0, react.useState)(true);
			const [aliyunCredentialWritable, setAliyunCredentialWritable] = (0, react.useState)(true);
			const [telegramCredentialWritable, setTelegramCredentialWritable] = (0, react.useState)(true);
			const [dirty, setDirty] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)();
			(0, react.useEffect)(() => {
				if (current === void 0 || dirty) return;
				setDraft({
					key: "",
					minimaxKey: "",
					aliyunToken: "",
					telegramKey: "",
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
					aliyunNlsTokenEnv: current.aliyunNlsTokenEnv,
					aliyunNlsAppKey: current.aliyunNlsAppKey,
					aliyunAsrURL: current.aliyunAsrURL,
					aliyunAsrFormat: current.aliyunAsrFormat,
					aliyunAsrSampleRate: String(current.aliyunAsrSampleRate),
					publicDashboardUrl: current.publicDashboardUrl,
					bridgeDeviceName: current.bridgeDeviceName,
					bridgePollIntervalMs: String(current.bridgePollIntervalMs),
					telegramBotTokenEnv: current.telegramBotTokenEnv,
					telegramAllowedUserIds: current.telegramAllowedUserIds
				});
			}, [current, dirty]);
			(0, react.useEffect)(() => {
				let active = true;
				api.credentials.describe({ refs: [
					credentialRef,
					minimaxCredentialRef,
					aliyunCredentialRef,
					telegramCredentialRef
				] }).then((response) => {
					if (!active || !response.result.ok) return;
					const openaiView = response.result.value.credentials[credentialRef];
					const minimaxView = response.result.value.credentials[minimaxCredentialRef];
					const aliyunView = response.result.value.credentials[aliyunCredentialRef];
					const telegramView = response.result.value.credentials[telegramCredentialRef];
					setConfigured(openaiView?.configured ?? false);
					setCredentialWritable(openaiView?.writable ?? true);
					setMinimaxConfigured(minimaxView?.configured ?? false);
					setMinimaxCredentialWritable(minimaxView?.writable ?? true);
					setAliyunConfigured(aliyunView?.configured ?? false);
					setAliyunCredentialWritable(aliyunView?.writable ?? true);
					setTelegramConfigured(telegramView?.configured ?? false);
					setTelegramCredentialWritable(telegramView?.writable ?? true);
				}).catch(() => {});
				return () => {
					active = false;
				};
			}, [
				api,
				credentialRef,
				minimaxCredentialRef,
				aliyunCredentialRef,
				telegramCredentialRef
			]);
			const edit = (field, value) => {
				setDraft((previous) => ({
					...previous,
					[field]: value
				}));
				setDirty(true);
				setNotice(void 0);
			};
			const save = async () => {
				if (current === void 0) return;
				setBusy(true);
				setNotice(void 0);
				try {
					const key = draft.key.trim();
					if (key !== "") {
						const response = await api.credentials.set({
							ref: credentialRef,
							value: key
						});
						if (!response.result.ok) throw new Error(response.result.error.message);
						setConfigured(true);
					}
					const minimaxKey = draft.minimaxKey.trim();
					if (minimaxKey !== "") {
						const response = await api.credentials.set({
							ref: draft.minimaxApiKeyEnv.trim(),
							value: minimaxKey
						});
						if (!response.result.ok) throw new Error(response.result.error.message);
						setMinimaxConfigured(true);
					}
					const aliyunToken = draft.aliyunToken.trim();
					if (aliyunToken !== "") {
						const response = await api.credentials.set({
							ref: draft.aliyunNlsTokenEnv.trim(),
							value: aliyunToken
						});
						if (!response.result.ok) throw new Error(response.result.error.message);
						setAliyunConfigured(true);
					}
					const telegramKey = draft.telegramKey.trim();
					if (telegramKey !== "") {
						const response = await api.credentials.set({
							ref: draft.telegramBotTokenEnv.trim(),
							value: telegramKey
						});
						if (!response.result.ok) throw new Error(response.result.error.message);
						setTelegramConfigured(true);
					}
					for (const field of [
						"model",
						"voice",
						"transcriptionModel",
						"instructions",
						"minimaxApiKeyEnv",
						"minimaxBaseURL",
						"minimaxModel",
						"minimaxVoice",
						"minimaxFormat",
						"aliyunNlsTokenEnv",
						"aliyunNlsAppKey",
						"aliyunAsrURL",
						"aliyunAsrFormat",
						"bridgeDeviceName",
						"telegramBotTokenEnv"
					]) {
						const value = draft[field].trim();
						if (value === "") throw new Error(t(`settings.${field}.required`));
						if (value !== current[field]) await scope.set(field, value);
					}
					for (const field of ["publicDashboardUrl", "telegramAllowedUserIds"]) {
						const value = draft[field].trim();
						if (value !== current[field]) await scope.set(field, value);
					}
					const bridgePollIntervalMs = Number.parseInt(draft.bridgePollIntervalMs.trim(), 10);
					if (!Number.isSafeInteger(bridgePollIntervalMs) || bridgePollIntervalMs < 500) throw new Error(t("settings.bridgePollIntervalMs.required"));
					if (bridgePollIntervalMs !== current.bridgePollIntervalMs) await scope.set("bridgePollIntervalMs", bridgePollIntervalMs);
					const voiceSilenceMs = Number.parseInt(draft.voiceSilenceMs.trim(), 10);
					if (!Number.isSafeInteger(voiceSilenceMs) || voiceSilenceMs < 250) throw new Error(t("settings.voiceSilenceMs.required"));
					if (voiceSilenceMs !== current.voiceSilenceMs) await scope.set("voiceSilenceMs", voiceSilenceMs);
					const aliyunAsrSampleRate = Number.parseInt(draft.aliyunAsrSampleRate.trim(), 10);
					if (!Number.isSafeInteger(aliyunAsrSampleRate) || aliyunAsrSampleRate < 8e3) throw new Error(t("settings.aliyunAsrSampleRate.required"));
					if (aliyunAsrSampleRate !== current.aliyunAsrSampleRate) await scope.set("aliyunAsrSampleRate", aliyunAsrSampleRate);
					setDraft((previous) => ({
						...previous,
						key: "",
						minimaxKey: "",
						aliyunToken: "",
						telegramKey: ""
					}));
					setDirty(false);
					setNotice({
						kind: "ok",
						text: t("settings.saved")
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: messageOf(error)
					});
				} finally {
					setBusy(false);
				}
			};
			const removeKey = async (ref, kind) => {
				setBusy(true);
				setNotice(void 0);
				try {
					const response = await api.credentials.unset({ ref });
					if (!response.result.ok) throw new Error(response.result.error.message);
					if (kind === "openai") {
						setConfigured(false);
						setDraft((previous) => ({
							...previous,
							key: ""
						}));
					} else if (kind === "minimax") {
						setMinimaxConfigured(false);
						setDraft((previous) => ({
							...previous,
							minimaxKey: ""
						}));
					} else if (kind === "aliyun") {
						setAliyunConfigured(false);
						setDraft((previous) => ({
							...previous,
							aliyunToken: ""
						}));
					} else {
						setTelegramConfigured(false);
						setDraft((previous) => ({
							...previous,
							telegramKey: ""
						}));
					}
					setNotice({
						kind: "ok",
						text: t("settings.key.removed")
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: messageOf(error)
					});
				} finally {
					setBusy(false);
				}
			};
			const unavailable = snapshot.status !== "ready";
			const disabled = busy || unavailable || !snapshot.writable;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: AssistantSettingsSection_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: AssistantSettingsSection_module_css_default.header,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("settings.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.description") })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: AssistantSettingsSection_module_css_default.section,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.sectionHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.realtime.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.realtime.description") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: AssistantSettingsSection_module_css_default.status,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: configured ? "done" : "warning" }), configured ? t("settings.key.configured") : t("settings.key.missing")]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.form,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.key.label") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: "off",
											value: draft.key,
											placeholder: configured ? t("settings.key.placeholderConfigured") : t("settings.key.placeholder"),
											disabled: busy || !credentialWritable,
											onChange: (event) => {
												edit("key", event.target.value);
											}
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.key.hint") })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: AssistantSettingsSection_module_css_default.grid,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.model.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "text",
											value: draft.model,
											disabled,
											onChange: (event) => {
												edit("model", event.target.value);
											}
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.voice.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: draft.voice,
											disabled,
											onChange: (event) => {
												edit("voice", event.target.value);
											},
											children: [
												"marin",
												"cedar",
												"coral",
												"sage",
												"verse",
												"alloy"
											].map((voice) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: voice,
												children: voice
											}, voice))
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.transcriptionModel.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.transcriptionModel,
										disabled,
										onChange: (event) => {
											edit("transcriptionModel", event.target.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.instructions.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										rows: 4,
										value: draft.instructions,
										disabled,
										onChange: (event) => {
											edit("instructions", event.target.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.voiceSilenceMs.label") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "number",
											min: 250,
											step: 100,
											value: draft.voiceSilenceMs,
											disabled,
											onChange: (event) => {
												edit("voiceSilenceMs", event.target.value);
											}
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.voiceSilenceMs.hint") })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.sectionHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.minimax.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.minimax.description") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: AssistantSettingsSection_module_css_default.status,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: minimaxConfigured ? "done" : "warning" }), minimaxConfigured ? t("settings.key.configured") : t("settings.key.missing")]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.form,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxKey.label") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: "off",
											value: draft.minimaxKey,
											placeholder: minimaxConfigured ? t("settings.key.placeholderConfigured") : t("settings.key.placeholder"),
											disabled: busy || !minimaxCredentialWritable,
											onChange: (event) => {
												edit("minimaxKey", event.target.value);
											}
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.minimaxKey.hint") })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxApiKeyEnv.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.minimaxApiKeyEnv,
										disabled,
										onChange: (event) => {
											edit("minimaxApiKeyEnv", event.target.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxBaseURL.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.minimaxBaseURL,
										disabled,
										onChange: (event) => {
											edit("minimaxBaseURL", event.target.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: AssistantSettingsSection_module_css_default.grid,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxModel.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "text",
											value: draft.minimaxModel,
											disabled,
											onChange: (event) => {
												edit("minimaxModel", event.target.value);
											}
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxVoice.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "text",
											value: draft.minimaxVoice,
											disabled,
											onChange: (event) => {
												edit("minimaxVoice", event.target.value);
											}
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.minimaxFormat.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										value: draft.minimaxFormat,
										disabled,
										onChange: (event) => {
											edit("minimaxFormat", event.target.value);
										},
										children: [
											"mp3",
											"wav",
											"flac",
											"pcm"
										].map((format) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: format,
											children: format
										}, format))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.sectionHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.aliyun.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.aliyun.description") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: AssistantSettingsSection_module_css_default.status,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: aliyunConfigured ? "done" : "warning" }), aliyunConfigured ? t("settings.key.configured") : t("settings.key.missing")]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.form,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunToken.label") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: "off",
											value: draft.aliyunToken,
											placeholder: aliyunConfigured ? t("settings.key.placeholderConfigured") : t("settings.key.placeholder"),
											disabled: busy || !aliyunCredentialWritable,
											onChange: (event) => {
												edit("aliyunToken", event.target.value);
											}
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.aliyunToken.hint") })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: AssistantSettingsSection_module_css_default.grid,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunNlsTokenEnv.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "text",
											value: draft.aliyunNlsTokenEnv,
											disabled,
											onChange: (event) => {
												edit("aliyunNlsTokenEnv", event.target.value);
											}
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunNlsAppKey.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "text",
											value: draft.aliyunNlsAppKey,
											disabled,
											onChange: (event) => {
												edit("aliyunNlsAppKey", event.target.value);
											}
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunAsrURL.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "url",
										value: draft.aliyunAsrURL,
										disabled,
										onChange: (event) => {
											edit("aliyunAsrURL", event.target.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: AssistantSettingsSection_module_css_default.grid,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunAsrFormat.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
											value: draft.aliyunAsrFormat,
											disabled,
											onChange: (event) => {
												edit("aliyunAsrFormat", event.target.value);
											},
											children: ["pcm"].map((format) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: format,
												children: format
											}, format))
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: AssistantSettingsSection_module_css_default.field,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.aliyunAsrSampleRate.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "number",
											min: 8e3,
											step: 8e3,
											value: draft.aliyunAsrSampleRate,
											disabled,
											onChange: (event) => {
												edit("aliyunAsrSampleRate", event.target.value);
											}
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: AssistantSettingsSection_module_css_default.sectionHead,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.public.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.public.description") })] })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.form,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: AssistantSettingsSection_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.publicDashboardUrl.label") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "url",
										value: draft.publicDashboardUrl,
										placeholder: "https://your-assistant.vercel.app",
										disabled,
										onChange: (event) => {
											edit("publicDashboardUrl", event.target.value);
										}
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.publicDashboardUrl.hint") })
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: AssistantSettingsSection_module_css_default.grid,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.bridgeDeviceName.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.bridgeDeviceName,
										disabled,
										onChange: (event) => {
											edit("bridgeDeviceName", event.target.value);
										}
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.bridgePollIntervalMs.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 500,
										step: 100,
										value: draft.bridgePollIntervalMs,
										disabled,
										onChange: (event) => {
											edit("bridgePollIntervalMs", event.target.value);
										}
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.sectionHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.telegram.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settings.telegram.description") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: AssistantSettingsSection_module_css_default.status,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: telegramConfigured ? "done" : "warning" }), telegramConfigured ? t("settings.key.configured") : t("settings.key.missing")]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: AssistantSettingsSection_module_css_default.form,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: AssistantSettingsSection_module_css_default.field,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.telegramKey.label") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "password",
										autoComplete: "off",
										value: draft.telegramKey,
										placeholder: telegramConfigured ? t("settings.key.placeholderConfigured") : t("settings.key.placeholder"),
										disabled: busy || !telegramCredentialWritable,
										onChange: (event) => {
											edit("telegramKey", event.target.value);
										}
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("settings.telegramKey.hint") })
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: AssistantSettingsSection_module_css_default.grid,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.telegramBotTokenEnv.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.telegramBotTokenEnv,
										disabled,
										onChange: (event) => {
											edit("telegramBotTokenEnv", event.target.value);
										}
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: AssistantSettingsSection_module_css_default.field,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("settings.telegramAllowedUserIds.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										value: draft.telegramAllowedUserIds,
										placeholder: "123456789, 987654321",
										disabled,
										onChange: (event) => {
											edit("telegramAllowedUserIds", event.target.value);
										}
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: AssistantSettingsSection_module_css_default.actions,
							children: [notice === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: notice.kind === "ok" ? AssistantSettingsSection_module_css_default.success : AssistantSettingsSection_module_css_default.failure,
								children: notice.text
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								configured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									disabled: busy || !credentialWritable,
									onClick: () => {
										removeKey(credentialRef, "openai");
									},
									children: t("settings.key.remove")
								}) : null,
								minimaxConfigured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									disabled: busy || !minimaxCredentialWritable,
									onClick: () => {
										removeKey(minimaxCredentialRef, "minimax");
									},
									children: t("settings.key.remove")
								}) : null,
								aliyunConfigured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									disabled: busy || !aliyunCredentialWritable,
									onClick: () => {
										removeKey(aliyunCredentialRef, "aliyun");
									},
									children: t("settings.aliyunToken.remove")
								}) : null,
								telegramConfigured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									disabled: busy || !telegramCredentialWritable,
									onClick: () => {
										removeKey(telegramCredentialRef, "telegram");
									},
									children: t("settings.telegramKey.remove")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}),
									disabled: disabled || !dirty,
									onClick: () => {
										save();
									},
									children: busy ? t("settings.saving") : t("settings.save")
								})
							] })]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/avatars.tsx
		const AVATAR_URL = {
			user: "https://api.dicebear.com/9.x/thumbs/svg?seed=Weibo&backgroundColor=b6e3f4,c0aede&backgroundType=gradientLinear",
			bot: "https://api.dicebear.com/9.x/shapes/svg?seed=Assistant&backgroundColor=00d6b9,4ecdc4&backgroundType=gradientLinear",
			teacher: "https://api.dicebear.com/9.x/thumbs/svg?seed=Professor&backgroundColor=c084fc,a78bfa&backgroundType=gradientLinear",
			claude: "https://api.dicebear.com/9.x/initials/svg?seed=Claude&backgroundColor=D97757&fontWeight=600&textColor=ffffff",
			chatgpt: "https://api.dicebear.com/9.x/initials/svg?seed=GPT&backgroundColor=10A37F&fontWeight=600&textColor=ffffff",
			peer_bot: "https://api.dicebear.com/9.x/shapes/svg?seed=Peer&backgroundColor=fca5a5,f87171&backgroundType=gradientLinear"
		};
		const FALLBACK_BG = {
			user: "#3370ff",
			bot: "#00a0c4",
			teacher: "#8b5cf6",
			claude: "#d97757",
			chatgpt: "#10a37f",
			peer_bot: "#f87171"
		};
		/** Render one original dashboard avatar with its stable role seed. */
		function Avatar({ role, size = 32 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: AVATAR_URL[role],
				alt: "",
				width: size,
				height: size,
				referrerPolicy: "no-referrer",
				loading: "lazy",
				style: {
					width: size,
					height: size,
					borderRadius: "50%",
					display: "block",
					objectFit: "cover",
					background: FALLBACK_BG[role]
				}
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/admin/Desktop/python project/deepseek-harness-workbench-backup-20260824-165800/packages/client/ui-a2a-assistant/src/client/WechatAssistantWorkspace.module.css.mjs
		const css = ".uMV3Ma_entry{box-sizing:border-box;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;background:0 0;border:0;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-size:14px;line-height:22px;display:flex;overflow:hidden}.uMV3Ma_entry:hover{background:var(--dsw-alias-interactive-bg-hover)}.uMV3Ma_entryActive{background:var(--dsw-alias-interactive-bg-active)}.uMV3Ma_entryRail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}.uMV3Ma_entryAvatar{border-radius:50%;flex:none;overflow:hidden}.uMV3Ma_entryLabel{white-space:nowrap;overflow:hidden}.uMV3Ma_beta{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);border-radius:3px;margin-left:auto;padding:0 4px;font-size:9px;line-height:16px}.uMV3Ma_workspace{z-index:1;min-width:0;min-height:0;color:var(--dsw-alias-label-primary);pointer-events:auto;background:#f4f5f7;grid-template-columns:280px minmax(0,1fr);display:grid;position:absolute;top:0;bottom:0;right:0}.uMV3Ma_conversationSidebar{border-right:1px solid var(--dsw-alias-border-l2);background:#fff;flex-direction:column;min-width:0;min-height:0;display:flex}.uMV3Ma_sidebarHeader{flex:none;padding:14px 16px 10px}.uMV3Ma_sidebarHeader strong{font-size:16px;display:block}.uMV3Ma_onlineDot,.uMV3Ma_offlineDot{background:#00b42a;border-radius:50%;flex:none;width:8px;height:8px;display:inline-block}.uMV3Ma_offlineDot{background:#f53f3f}.uMV3Ma_connectingDot{background:#ff9a2e;border-radius:50%;flex:none;width:8px;height:8px;display:inline-block}.uMV3Ma_groupLabel{color:#8a9099;padding:12px 16px 5px;font-size:11px;font-weight:600}.uMV3Ma_conversationRow,.uMV3Ma_conversationActive{min-height:58px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:10px;margin:2px 8px;padding:9px 10px;display:grid}.uMV3Ma_conversationRow:hover,.uMV3Ma_conversationActive{background:#f1f2f4}.uMV3Ma_conversationCopy{min-width:0}.uMV3Ma_conversationCopy strong,.uMV3Ma_conversationCopy small{text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.uMV3Ma_conversationCopy strong{font-size:14px;font-weight:500}.uMV3Ma_conversationCopy small{color:#8a9099;margin-top:3px;font-size:12px}.uMV3Ma_conversationRow time,.uMV3Ma_conversationActive time{color:#a0a5ad;align-self:start;padding-top:2px;font-size:10px}.uMV3Ma_pairEmpty{color:#a0a5ad;padding:9px 16px;font-size:12px}.uMV3Ma_chat{background:#f4f5f7;flex-direction:column;min-width:0;min-height:0;display:flex}.uMV3Ma_chatHeader{border-bottom:1px solid var(--dsw-alias-border-l2);background:#fff;flex:none;justify-content:space-between;align-items:center;gap:12px;min-height:58px;padding:0 16px;display:flex}.uMV3Ma_chatIdentity{align-items:center;gap:6px;min-width:0;display:flex}.uMV3Ma_chatIdentity strong,.uMV3Ma_chatIdentity span{text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.uMV3Ma_chatIdentity strong{font-size:15px;font-weight:600}.uMV3Ma_chatIdentity span{color:#858b95;margin-top:3px;font-size:12px}.uMV3Ma_headerActions{flex:none;align-items:center;gap:8px;display:flex}.uMV3Ma_participants{padding-left:7px;display:flex}.uMV3Ma_participants span{border:2px solid #fff;border-radius:50%;margin-left:-7px;overflow:hidden}.uMV3Ma_call,.uMV3Ma_callActive,.uMV3Ma_more{border:1px solid var(--dsw-alias-border-l3);color:#4d5561;cursor:pointer;height:34px;font:inherit;background:#fff;border-radius:6px;justify-content:center;align-items:center;gap:6px;padding:0 10px;font-size:12px;display:flex}.uMV3Ma_call:hover,.uMV3Ma_more:hover{background:#f5f6f7}.uMV3Ma_callActive{color:#d9363e;border-color:#f53f3f}.uMV3Ma_more{width:34px;padding:0}.uMV3Ma_mobileBack{background:0 0;border:0;place-items:center;width:32px;height:32px;display:none}.uMV3Ma_callStrip{color:#315d9b;background:#eef4ff;border-bottom:1px solid #dfe6f3;flex:none;align-items:center;gap:7px;padding:8px 16px;font-size:12px;display:flex}.uMV3Ma_callStrip span{color:#71809a;margin-left:auto}.uMV3Ma_pauseListening,.uMV3Ma_resumeListening{color:#315d9b;cursor:pointer;height:28px;font:inherit;background:#fff;border:1px solid #b8c9e5;border-radius:5px;flex:none;align-items:center;gap:5px;padding:0 9px;font-size:11px;display:flex}.uMV3Ma_pauseListening:hover{background:#f7faff}.uMV3Ma_pauseListening b,.uMV3Ma_resumeListening b{font-weight:400}.uMV3Ma_resumeListening{color:#fff;background:#3370ff;border-color:#3370ff}.uMV3Ma_resumeListening:hover{background:#245bdb}.uMV3Ma_remoteAudio{opacity:0;pointer-events:none;width:1px;height:1px;position:absolute}.uMV3Ma_messages{flex:1;min-height:0;padding:18px 24px;overflow:hidden auto}.uMV3Ma_messageFlow{flex-direction:column;gap:10px;max-width:780px;min-height:100%;margin:0 auto;display:flex}.uMV3Ma_empty{color:#959ba4;flex:1;place-items:center;font-size:13px;display:grid}.uMV3Ma_messageMine,.uMV3Ma_messageAgent{align-items:flex-start;gap:8px;display:flex}.uMV3Ma_messageMine{flex-direction:row-reverse}.uMV3Ma_bubbleWrap{flex-direction:column;gap:4px;max-width:68%;display:flex}.uMV3Ma_bubbleWrap>span{color:#8a9099;margin:0 8px;font-size:11px}.uMV3Ma_messageMine .uMV3Ma_bubbleWrap>span{text-align:right}.uMV3Ma_bubbleWrap p{color:#202124;overflow-wrap:anywhere;white-space:pre-wrap;background:#fff;border-radius:4px 14px 14px;margin:0;padding:9px 13px;font-size:14px;line-height:1.55}.uMV3Ma_messageMine .uMV3Ma_bubbleWrap p{color:#fff;background:#3370ff;border-radius:14px 4px 14px 14px}.uMV3Ma_bubbleWrap .uMV3Ma_liveBubble{min-width:42px;min-height:22px}.uMV3Ma_voiceBars{justify-content:center;align-items:center;gap:3px;width:38px;height:22px;display:flex}.uMV3Ma_voiceBars i{background:#3370ff;border-radius:2px;width:3px;min-height:6px;max-height:22px;transition:height 80ms linear;display:block}.uMV3Ma_messageMine .uMV3Ma_voiceBars i{background:#fff}.uMV3Ma_bubbleWrap time{color:#a0a5ad;padding:0 4px;font-size:10px}.uMV3Ma_messageMine .uMV3Ma_bubbleWrap time{text-align:right}.uMV3Ma_systemMessage{color:#858b95;background:#0000000f;border-radius:12px;align-self:center;max-width:90%;padding:6px 12px;font-size:12px}.uMV3Ma_replying{color:#858b95;font-size:12px}.uMV3Ma_composer{border-top:1px solid var(--dsw-alias-border-l2);background:#fff;flex:none;padding:10px 16px}.uMV3Ma_inputRow{align-items:flex-end;gap:8px;max-width:820px;margin:0 auto;display:flex}.uMV3Ma_inputRow textarea{resize:vertical;box-sizing:border-box;color:#202124;min-height:40px;max-height:120px;font:inherit;background:#fff;border:1px solid #d8dbe0;border-radius:6px;flex:1;padding:10px 12px;font-size:14px;line-height:20px}.uMV3Ma_inputRow button{color:#fff;cursor:pointer;background:#3370ff;border:0;border-radius:6px;flex:none;place-items:center;width:40px;height:40px;display:grid}.uMV3Ma_inputRow button:disabled{opacity:.45;cursor:default}.uMV3Ma_sendHint{color:#9ba0a8;text-align:right;max-width:820px;margin:5px auto 0;font-size:10px;display:block}.uMV3Ma_error{color:#d9363e;max-width:820px;margin:0 auto 6px;font-size:12px}body[data-ds-dark-theme] .uMV3Ma_workspace,body[data-ds-dark-theme] .uMV3Ma_chat{background:#1b1d20}body[data-ds-dark-theme] .uMV3Ma_conversationSidebar,body[data-ds-dark-theme] .uMV3Ma_sidebarHeader,body[data-ds-dark-theme] .uMV3Ma_chatHeader,body[data-ds-dark-theme] .uMV3Ma_composer{background:#222428}body[data-ds-dark-theme] .uMV3Ma_conversationRow:hover,body[data-ds-dark-theme] .uMV3Ma_conversationActive{background:#303338}body[data-ds-dark-theme] .uMV3Ma_groupLabel,body[data-ds-dark-theme] .uMV3Ma_conversationCopy small,body[data-ds-dark-theme] .uMV3Ma_chatIdentity span{color:#a6acb5}body[data-ds-dark-theme] .uMV3Ma_participants span{border-color:#222428}body[data-ds-dark-theme] .uMV3Ma_call,body[data-ds-dark-theme] .uMV3Ma_more,body[data-ds-dark-theme] .uMV3Ma_bubbleWrap p,body[data-ds-dark-theme] .uMV3Ma_inputRow textarea{color:#eef0f3;background:#292c31}body[data-ds-dark-theme] .uMV3Ma_messageMine .uMV3Ma_bubbleWrap p{color:#fff;background:#3370ff}body[data-ds-dark-theme] .uMV3Ma_callStrip{color:#b9c9e5;background:#222b38;border-color:#343d4c}body[data-ds-dark-theme] .uMV3Ma_callStrip span{color:#98a8c1}body[data-ds-dark-theme] .uMV3Ma_pauseListening{color:#c3d0e5;background:#292f39;border-color:#4c5b72}@media (width<=760px){.uMV3Ma_workspace{grid-template-columns:minmax(0,1fr)}.uMV3Ma_conversationSidebar.uMV3Ma_mobileHidden,.uMV3Ma_chat{display:none}.uMV3Ma_chat.uMV3Ma_mobileChat{display:flex}.uMV3Ma_mobileBack{display:grid}.uMV3Ma_participants,.uMV3Ma_call span,.uMV3Ma_callActive span{display:none}.uMV3Ma_call,.uMV3Ma_callActive{width:34px;padding:0}.uMV3Ma_callStrip{white-space:nowrap}.uMV3Ma_callStrip span{display:none}.uMV3Ma_pauseListening,.uMV3Ma_resumeListening{justify-content:center;width:30px;padding:0}.uMV3Ma_pauseListening b,.uMV3Ma_resumeListening b{display:none}.uMV3Ma_messages{padding:14px 12px}.uMV3Ma_bubbleWrap{max-width:84%}}";
		const tagId = "@deepseek-ai/dsh-client-ui-a2a-assistant/WechatAssistantWorkspace.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-a2a-assistant";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WechatAssistantWorkspace_module_css_default = {
			"beta": "uMV3Ma_beta",
			"bubbleWrap": "uMV3Ma_bubbleWrap",
			"call": "uMV3Ma_call",
			"callActive": "uMV3Ma_callActive",
			"callStrip": "uMV3Ma_callStrip",
			"chat": "uMV3Ma_chat",
			"chatHeader": "uMV3Ma_chatHeader",
			"chatIdentity": "uMV3Ma_chatIdentity",
			"composer": "uMV3Ma_composer",
			"connectingDot": "uMV3Ma_connectingDot",
			"conversationActive": "uMV3Ma_conversationActive",
			"conversationCopy": "uMV3Ma_conversationCopy",
			"conversationRow": "uMV3Ma_conversationRow",
			"conversationSidebar": "uMV3Ma_conversationSidebar",
			"empty": "uMV3Ma_empty",
			"entry": "uMV3Ma_entry",
			"entryActive": "uMV3Ma_entryActive",
			"entryAvatar": "uMV3Ma_entryAvatar",
			"entryLabel": "uMV3Ma_entryLabel",
			"entryRail": "uMV3Ma_entryRail",
			"error": "uMV3Ma_error",
			"groupLabel": "uMV3Ma_groupLabel",
			"headerActions": "uMV3Ma_headerActions",
			"inputRow": "uMV3Ma_inputRow",
			"liveBubble": "uMV3Ma_liveBubble",
			"messageAgent": "uMV3Ma_messageAgent",
			"messageFlow": "uMV3Ma_messageFlow",
			"messageMine": "uMV3Ma_messageMine",
			"messages": "uMV3Ma_messages",
			"mobileBack": "uMV3Ma_mobileBack",
			"mobileChat": "uMV3Ma_mobileChat",
			"mobileHidden": "uMV3Ma_mobileHidden",
			"more": "uMV3Ma_more",
			"offlineDot": "uMV3Ma_offlineDot",
			"onlineDot": "uMV3Ma_onlineDot",
			"pairEmpty": "uMV3Ma_pairEmpty",
			"participants": "uMV3Ma_participants",
			"pauseListening": "uMV3Ma_pauseListening",
			"remoteAudio": "uMV3Ma_remoteAudio",
			"replying": "uMV3Ma_replying",
			"resumeListening": "uMV3Ma_resumeListening",
			"sendHint": "uMV3Ma_sendHint",
			"sidebarHeader": "uMV3Ma_sidebarHeader",
			"systemMessage": "uMV3Ma_systemMessage",
			"voiceBars": "uMV3Ma_voiceBars",
			"workspace": "uMV3Ma_workspace"
		};
		//#endregion
		//#region src/client/WechatAssistantEntry.tsx
		/** Sidebar footer entry displayed immediately above Settings. */
		function WechatAssistantEntry({ wide, workspace, t }) {
			const open = (0, react.useSyncExternalStore)(workspace.subscribe, workspace.getSnapshot).open;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("entry.label"),
				delayMs: 500,
				disabled: wide,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `${WechatAssistantWorkspace_module_css_default.entry}${wide ? "" : ` ${WechatAssistantWorkspace_module_css_default.entryRail}`}${open ? ` ${WechatAssistantWorkspace_module_css_default.entryActive}` : ""}`,
					"aria-label": t("entry.label"),
					"aria-pressed": open,
					onClick: () => {
						workspace.setOpen(!open);
					},
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: WechatAssistantWorkspace_module_css_default.entryAvatar,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
								role: "bot",
								size: wide ? 20 : 22
							})
						}),
						wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: WechatAssistantWorkspace_module_css_default.entryLabel,
							children: t("entry.name")
						}),
						wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: WechatAssistantWorkspace_module_css_default.beta,
							children: "beta"
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/openai-realtime.ts
		/** Browser WebRTC client for the assistant's OpenAI Realtime conversation. */
		const SESSION_PATH = "/api/wechat-assistant/openai/realtime";
		const VOICE_RESPONSE_SETTLE_MS = 500;
		/** One browser-to-OpenAI speech-to-speech session. */
		var OpenAIRealtimeCall = class {
			callbacks;
			peer;
			channel;
			input;
			audioContext;
			inputSource;
			outputSource;
			inputAnalyser;
			outputAnalyser;
			meterFrame;
			smoothedLevel = 0;
			responseInFlight = false;
			responseTimer;
			muted = false;
			constructor(callbacks) {
				this.callbacks = callbacks;
			}
			/** Establish the microphone and WebRTC session through the Harness host. */
			async start() {
				if (this.peer !== void 0) return;
				this.callbacks.onState("connecting");
				const peer = new RTCPeerConnection();
				this.peer = peer;
				try {
					peer.ontrack = (event) => {
						const stream = event.streams[0] ?? new MediaStream([event.track]);
						this.callbacks.onRemoteStream(stream);
						this.outputSource?.disconnect();
						this.outputAnalyser?.disconnect();
						const outputMeter = this.createMeter(stream);
						this.outputSource = outputMeter.source;
						this.outputAnalyser = outputMeter.analyser;
					};
					const input = await navigator.mediaDevices.getUserMedia({ audio: {
						echoCancellation: true,
						noiseSuppression: true,
						autoGainControl: true
					} });
					this.input = input;
					for (const track of input.getAudioTracks()) {
						track.contentHint = "speech";
						peer.addTrack(track, input);
					}
					const context = new AudioContext();
					this.audioContext = context;
					try {
						await context.resume();
					} catch {}
					const inputMeter = this.createMeter(input);
					this.inputSource = inputMeter.source;
					this.inputAnalyser = inputMeter.analyser;
					this.startMeter();
					const channel = peer.createDataChannel("oai-events");
					this.channel = channel;
					channel.onopen = () => {
						this.callbacks.onState("connected");
					};
					channel.onmessage = (event) => {
						this.receive(event.data);
					};
					channel.onerror = () => {
						this.callbacks.onError("OpenAI Realtime data channel failed");
					};
					peer.onconnectionstatechange = () => {
						if (peer.connectionState === "failed") this.callbacks.onError("OpenAI Realtime connection failed");
					};
					const offer = await peer.createOffer();
					await peer.setLocalDescription(offer);
					const sdp = offer.sdp;
					if (sdp === void 0 || sdp.trim() === "") throw new Error("Browser did not create a WebRTC SDP offer");
					const tokenResponse = await fetch(SESSION_PATH, { method: "POST" });
					const tokenBody = await tokenResponse.text();
					if (!tokenResponse.ok) throw new Error(readError(tokenBody, tokenResponse.status));
					const token = readToken(tokenBody);
					const response = await fetch(token.callsURL, {
						method: "POST",
						headers: {
							authorization: `Bearer ${token.value}`,
							"content-type": "application/sdp"
						},
						body: sdp
					});
					const answer = await response.text();
					if (!response.ok) throw new Error(readError(answer, response.status));
					await peer.setRemoteDescription({
						type: "answer",
						sdp: answer
					});
				} catch (error) {
					this.stop();
					throw error;
				}
			}
			/** Add one typed user turn to the active Realtime conversation.
			* @param text - final user text.
			*/
			sendText(text) {
				const channel = this.channel;
				if (channel?.readyState !== "open") throw new Error("Start the ChatGPT Live call first");
				channel.send(JSON.stringify({
					type: "conversation.item.create",
					item: {
						type: "message",
						role: "user",
						content: [{
							type: "input_text",
							text
						}]
					}
				}));
				this.responseInFlight = true;
				channel.send(JSON.stringify({
					type: "response.create",
					response: { output_modalities: ["audio"] }
				}));
			}
			/** Pause or resume microphone transmission without ending the call.
			* @param muted - whether local audio tracks should stop transmitting.
			*/
			setMuted(muted) {
				this.muted = muted;
				this.syncInputTracks();
			}
			/** Close media, data, and peer resources. */
			stop() {
				this.channel?.close();
				this.channel = void 0;
				for (const track of this.input?.getTracks() ?? []) track.stop();
				this.input = void 0;
				this.peer?.close();
				this.peer = void 0;
				if (this.meterFrame !== void 0) cancelAnimationFrame(this.meterFrame);
				this.meterFrame = void 0;
				this.clearResponseTimer();
				this.inputSource?.disconnect();
				this.inputSource = void 0;
				this.outputSource?.disconnect();
				this.outputSource = void 0;
				this.inputAnalyser?.disconnect();
				this.inputAnalyser = void 0;
				this.outputAnalyser?.disconnect();
				this.outputAnalyser = void 0;
				if (this.audioContext !== void 0) this.audioContext.close();
				this.audioContext = void 0;
				this.smoothedLevel = 0;
				this.responseInFlight = false;
				this.muted = false;
				this.callbacks.onRemoteStream(null);
				this.callbacks.onUserSpeechState(false);
				this.callbacks.onRemoteAudioStop();
				this.callbacks.onAudioLevel(0, "user");
				this.callbacks.onState("idle");
			}
			createMeter(stream) {
				const context = this.audioContext;
				if (context === void 0) throw new Error("Audio meter is not initialized");
				const source = context.createMediaStreamSource(stream);
				const analyser = context.createAnalyser();
				analyser.fftSize = 256;
				analyser.smoothingTimeConstant = .72;
				source.connect(analyser);
				return {
					source,
					analyser
				};
			}
			startMeter() {
				const inputSamples = new Uint8Array(256);
				const outputSamples = new Uint8Array(256);
				const measure = () => {
					const input = audioLevel(this.inputAnalyser, inputSamples);
					const output = audioLevel(this.outputAnalyser, outputSamples);
					const assistantSpeaking = output > .025;
					const next = Math.min(1, (assistantSpeaking ? output : input) * 4.8);
					this.smoothedLevel += (next - this.smoothedLevel) * (next > this.smoothedLevel ? .38 : .14);
					this.callbacks.onAudioLevel(this.smoothedLevel, assistantSpeaking ? "assistant" : "user");
					this.meterFrame = requestAnimationFrame(measure);
				};
				this.meterFrame = requestAnimationFrame(measure);
			}
			receive(raw) {
				if (typeof raw !== "string") return;
				let event;
				try {
					event = JSON.parse(raw);
				} catch {
					return;
				}
				if (event.type === "conversation.item.input_audio_transcription.delta" && event.delta !== void 0) this.callbacks.onUserTranscriptDelta(event.delta);
				else if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript !== void 0) this.callbacks.onUserTranscript(event.transcript);
				else if (event.type === "response.output_audio_transcript.delta" && event.delta !== void 0) this.callbacks.onAssistantTranscriptDelta(event.delta);
				else if (event.type === "response.output_audio_transcript.done" && event.transcript !== void 0) this.callbacks.onAssistantTranscript(event.transcript);
				else if (event.type === "input_audio_buffer.speech_started") {
					this.clearResponseTimer();
					this.callbacks.onUserSpeechState(true);
				} else if (event.type === "input_audio_buffer.speech_stopped") {
					this.callbacks.onUserSpeechState(false);
					this.scheduleVoiceResponse();
				} else if (event.type === "output_audio_buffer.started") this.callbacks.onRemoteAudioStart();
				else if (event.type === "output_audio_buffer.stopped" || event.type === "output_audio_buffer.cleared") this.callbacks.onRemoteAudioStop();
				else if (event.type === "response.done") this.responseInFlight = false;
				else if (event.type === "error") {
					this.responseInFlight = false;
					this.callbacks.onError(event.error?.message ?? "OpenAI Realtime returned an error");
				}
			}
			scheduleVoiceResponse() {
				this.clearResponseTimer();
				if (this.muted || this.responseInFlight) return;
				this.responseTimer = setTimeout(() => {
					this.responseTimer = void 0;
					const channel = this.channel;
					if (channel?.readyState !== "open" || this.muted || this.responseInFlight) return;
					this.responseInFlight = true;
					channel.send(JSON.stringify({
						type: "response.create",
						response: { output_modalities: ["audio"] }
					}));
				}, VOICE_RESPONSE_SETTLE_MS);
			}
			clearResponseTimer() {
				if (this.responseTimer !== void 0) clearTimeout(this.responseTimer);
				this.responseTimer = void 0;
			}
			syncInputTracks() {
				for (const track of this.input?.getAudioTracks() ?? []) track.enabled = !this.muted;
			}
		};
		function readToken(body) {
			let parsed;
			try {
				parsed = JSON.parse(body);
			} catch {
				throw new Error("Harness returned an invalid OpenAI Realtime token");
			}
			if (typeof parsed.value !== "string" || parsed.value === "" || typeof parsed.callsURL !== "string" || parsed.callsURL === "") throw new Error("Harness returned an invalid OpenAI Realtime token");
			return {
				value: parsed.value,
				callsURL: parsed.callsURL
			};
		}
		function audioLevel(analyser, samples) {
			if (analyser === void 0) return 0;
			analyser.getByteTimeDomainData(samples);
			let sum = 0;
			for (const sample of samples) {
				const centered = (sample - 128) / 128;
				sum += centered * centered;
			}
			return Math.sqrt(sum / samples.length);
		}
		function readError(body, status) {
			try {
				const parsed = JSON.parse(body);
				if (typeof parsed.error === "string") return parsed.error;
				if (parsed.error?.message !== void 0) return parsed.error.message;
			} catch {}
			return body.trim() || `OpenAI Realtime request failed (${String(status)})`;
		}
		//#endregion
		//#region src/client/speech-player.ts
		/** Browser audio client for the assistant's speech output. */
		const TTS_PATH = "/api/wechat-assistant/tts";
		/** One cancellable speech playback request. */
		var SpeechPlayer = class {
			audio;
			objectURL;
			aborter;
			/** Request synthesized speech from the Harness host and play it.
			* @param text - Assistant text to read aloud.
			*/
			async speak(text) {
				this.stop();
				const aborter = new AbortController();
				this.aborter = aborter;
				try {
					const response = await fetch(TTS_PATH, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ text }),
						signal: aborter.signal
					});
					if (!response.ok) throw new Error(await readSpeechError(response));
					const blob = await response.blob();
					if (aborter.signal.aborted) return;
					const objectURL = URL.createObjectURL(blob);
					const audio = new Audio(objectURL);
					this.audio = audio;
					this.objectURL = objectURL;
					await audio.play();
					await waitForPlayback(audio, aborter.signal);
				} catch (error) {
					if (!isAbortError(error)) throw error;
				} finally {
					if (this.aborter === aborter) this.release();
				}
			}
			/** Stop active network work and playback. */
			stop() {
				this.aborter?.abort();
				this.aborter = void 0;
				this.release();
			}
			release() {
				this.audio?.pause();
				this.audio = void 0;
				if (this.objectURL !== void 0) URL.revokeObjectURL(this.objectURL);
				this.objectURL = void 0;
			}
		};
		function waitForPlayback(audio, signal) {
			return new Promise((resolve, reject) => {
				const cleanup = () => {
					audio.removeEventListener("ended", onEnded);
					audio.removeEventListener("error", onError);
					signal.removeEventListener("abort", onAbort);
				};
				const onEnded = () => {
					cleanup();
					resolve();
				};
				const onError = () => {
					cleanup();
					reject(/* @__PURE__ */ new Error("TTS audio playback failed"));
				};
				const onAbort = () => {
					cleanup();
					resolve();
				};
				audio.addEventListener("ended", onEnded, { once: true });
				audio.addEventListener("error", onError, { once: true });
				signal.addEventListener("abort", onAbort, { once: true });
			});
		}
		function isAbortError(error) {
			return error instanceof DOMException && error.name === "AbortError";
		}
		async function readSpeechError(response) {
			const body = await response.text();
			try {
				const parsed = JSON.parse(body);
				if (typeof parsed.error === "string" && parsed.error !== "") return parsed.error;
			} catch {
				return body === "" ? `TTS failed (${String(response.status)})` : body;
			}
			return `TTS failed (${String(response.status)})`;
		}
		//#endregion
		//#region src/client/WechatAssistantWorkspace.tsx
		const DEFINITIONS = [
			{
				id: "self",
				nameKey: "conversation.self",
				subtitleKey: "conversation.self.subtitle",
				role: "bot"
			},
			{
				id: "teacher",
				nameKey: "conversation.teacher",
				subtitleKey: "conversation.teacher.subtitle",
				role: "teacher"
			},
			{
				id: "claude",
				nameKey: "conversation.claude",
				subtitleKey: "conversation.claude.subtitle",
				role: "claude"
			},
			{
				id: "chatgpt",
				nameKey: "conversation.chatgpt",
				subtitleKey: "conversation.chatgpt.subtitle",
				role: "chatgpt"
			}
		];
		const EMPTY_MESSAGES = {
			self: [],
			teacher: [],
			claude: [],
			chatgpt: []
		};
		const STORAGE_KEY = "dsh.wechat-assistant.beta.minimax";
		const LEGACY_STORAGE_KEYS = ["dsh.wechat-assistant.beta"];
		const ASSISTANT_MESSAGES_PATH = "/api/wechat-assistant/messages";
		const ASSISTANT_REPLIES_PATH = "/api/wechat-assistant/replies";
		const SECRETARY_ASR_PATH = "/api/wechat-assistant/asr";
		const SECRETARY_ASR_SAMPLE_RATE = 16e3;
		const SECRETARY_VOICE_THRESHOLD = .022;
		const SECRETARY_PREFIX_MS = 450;
		function loadMessages() {
			for (const key of LEGACY_STORAGE_KEYS) localStorage.removeItem(key);
			try {
				const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
				return {
					self: Array.isArray(value.self) ? value.self : [],
					teacher: Array.isArray(value.teacher) ? value.teacher : [],
					claude: Array.isArray(value.claude) ? value.claude : [],
					chatgpt: Array.isArray(value.chatgpt) ? value.chatgpt : []
				};
			} catch {
				return EMPTY_MESSAGES;
			}
		}
		function assistantText(blocks) {
			return blocks.filter((block) => block.kind === "text").map((block) => block.text ?? "").join("\n").trim();
		}
		function formatTime(value) {
			return new Date(value).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		}
		function rms(samples) {
			let sum = 0;
			for (const sample of samples) sum += sample * sample;
			return Math.sqrt(sum / samples.length);
		}
		function downsampleToPcm16(input, inputSampleRate, outputSampleRate) {
			const ratio = inputSampleRate / outputSampleRate;
			const outputLength = Math.max(1, Math.floor(input.length / ratio));
			const output = new Int16Array(outputLength);
			for (let index = 0; index < outputLength; index += 1) {
				const start = Math.floor(index * ratio);
				const end = Math.min(input.length, Math.floor((index + 1) * ratio));
				let sum = 0;
				for (let inputIndex = start; inputIndex < end; inputIndex += 1) sum += input[inputIndex] ?? 0;
				const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
				output[index] = sample < 0 ? sample * 32768 : sample * 32767;
			}
			return output;
		}
		function readAsrTranscript(body) {
			try {
				const parsed = JSON.parse(body);
				const result = typeof parsed.result === "string" ? parsed.result : parsed.Result;
				return typeof result === "string" ? result.trim() : "";
			} catch {
				return "";
			}
		}
		function readAsrError(body, status) {
			try {
				const parsed = JSON.parse(body);
				return (typeof parsed.message === "string" ? parsed.message : typeof parsed.status_text === "string" ? parsed.status_text : void 0) ?? `Aliyun ASR failed (${String(status)})`;
			} catch {
				return body.trim() || `Aliyun ASR failed (${String(status)})`;
			}
		}
		function base64FromBytes(bytes) {
			let binary = "";
			const chunkSize = 32768;
			for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
			return btoa(binary);
		}
		function definitionOf(definitions, id) {
			const definition = definitions.find((candidate) => candidate.id === id);
			if (definition === void 0) throw new Error(`ui-a2a-assistant: missing conversation definition for ${id}`);
			return definition;
		}
		async function fetchHostMessages() {
			const response = await fetch(ASSISTANT_MESSAGES_PATH, { cache: "no-store" });
			if (!response.ok) throw new Error(`Assistant bridge returned ${response.status}`);
			const body = await response.json();
			return Array.isArray(body.messages) ? body.messages : [];
		}
		async function postHostReply(messageId, text) {
			const response = await fetch(ASSISTANT_REPLIES_PATH, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					messageId,
					text
				})
			});
			if (!response.ok) throw new Error(`Assistant bridge returned ${response.status}`);
		}
		/** Independent WeChat Assistant page, preserving the original dashboard layout. */
		function WechatAssistantWorkspace({ useSessions, workspace, settings, resolveSession, send, t }) {
			const open = (0, react.useSyncExternalStore)(workspace.subscribe, workspace.getSnapshot).open;
			const settingsSnapshot = (0, react.useSyncExternalStore)((listener) => settings.subscribe(listener), () => settings.getSnapshot());
			const sessionId = useSessions((snapshot) => snapshot.current);
			const session = resolveSession(sessionId);
			const subscribeSession = (0, react.useCallback)((listener) => session?.subscribe(listener) ?? (() => {}), [session]);
			const readSession = (0, react.useCallback)(() => session?.getSnapshot(), [session]);
			const snapshot = (0, react.useSyncExternalStore)(subscribeSession, readSession, readSession);
			const [sidebarWidth, setSidebarWidth] = (0, react.useState)(0);
			const [conversation, setConversation] = (0, react.useState)("self");
			const [messages, setMessages] = (0, react.useState)(loadMessages);
			const [draft, setDraft] = (0, react.useState)("");
			const [sending, setSending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [calling, setCalling] = (0, react.useState)(false);
			const [callState, setCallState] = (0, react.useState)("idle");
			const [audioLevel, setAudioLevel] = (0, react.useState)(0);
			const [voiceSpeaker, setVoiceSpeaker] = (0, react.useState)("user");
			const [liveUserText, setLiveUserText] = (0, react.useState)("");
			const [liveAssistantText, setLiveAssistantText] = (0, react.useState)("");
			const [liveUserActive, setLiveUserActive] = (0, react.useState)(false);
			const [callPaused, setCallPaused] = (0, react.useState)(false);
			const [voiceError, setVoiceError] = (0, react.useState)(null);
			const [mobileChat, setMobileChat] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const endRef = (0, react.useRef)(null);
			const remoteAudioRef = (0, react.useRef)(null);
			const microphoneStream = (0, react.useRef)(null);
			const secretaryAudioContext = (0, react.useRef)(null);
			const secretarySource = (0, react.useRef)(null);
			const secretaryProcessor = (0, react.useRef)(null);
			const secretarySilentOutput = (0, react.useRef)(null);
			const secretaryRecording = (0, react.useRef)(false);
			const secretaryChunks = (0, react.useRef)([]);
			const secretaryPrefix = (0, react.useRef)([]);
			const secretaryPrefixSamples = (0, react.useRef)(0);
			const secretarySilentSince = (0, react.useRef)(void 0);
			const secretarySubmitting = (0, react.useRef)(false);
			const recognitionPaused = (0, react.useRef)(false);
			const realtimeCall = (0, react.useRef)(null);
			const speechPlayer = (0, react.useRef)(null);
			const speechSeq = (0, react.useRef)(0);
			const voiceSubmitTimer = (0, react.useRef)(void 0);
			const pendingVoiceText = (0, react.useRef)("");
			const voiceSilenceMs = (0, react.useRef)(settingsSnapshot.value?.voiceSilenceMs ?? 2800);
			const lastVoiceSubmission = (0, react.useRef)();
			const pendingConversation = (0, react.useRef)(null);
			const pendingHostReplyId = (0, react.useRef)(null);
			const displayedHostMessageIds = (0, react.useRef)(/* @__PURE__ */ new Set());
			const processingHostMessageIds = (0, react.useRef)(/* @__PURE__ */ new Set());
			const seenAssistantSeq = (0, react.useRef)(0);
			const busy = (0, react.useRef)(false);
			const definitions = (0, react.useMemo)(() => DEFINITIONS.map((definition) => ({
				...definition,
				name: t(definition.nameKey),
				subtitle: t(definition.subtitleKey)
			})), [t]);
			const active = definitionOf(definitions, conversation);
			const selfDefinition = definitionOf(definitions, "self");
			const callStatus = callPaused ? t("call.paused") : callState === "connecting" ? t("call.connecting") : voiceSpeaker === "assistant" ? t(conversation === "chatgpt" ? "call.chatgptSpeaking" : "call.secretarySpeaking") : liveUserActive || liveUserText !== "" ? t("call.transcribing") : t("call.listening");
			const callHint = callPaused ? t("call.pausedHint") : t("call.liveHint");
			(0, react.useLayoutEffect)(() => {
				if (!open) return;
				const layer = rootRef.current?.closest("[data-shell-overlay]");
				const frame = layer?.parentElement;
				const sidebar = frame?.firstElementChild;
				if (!(frame instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) return;
				const coveredSurfaces = Array.from(frame.children).slice(1).filter((child) => child instanceof HTMLElement && child !== layer);
				const previousInert = coveredSurfaces.map((surface) => surface.inert);
				const previousAriaHidden = coveredSurfaces.map((surface) => surface.getAttribute("aria-hidden"));
				for (const surface of coveredSurfaces) {
					surface.inert = true;
					surface.setAttribute("aria-hidden", "true");
				}
				const update = () => {
					setSidebarWidth(sidebar.getBoundingClientRect().width);
				};
				update();
				const observer = new ResizeObserver(update);
				observer.observe(sidebar);
				return () => {
					observer.disconnect();
					coveredSurfaces.forEach((surface, index) => {
						surface.inert = previousInert[index] ?? false;
						const ariaHidden = previousAriaHidden[index];
						if (ariaHidden === null || ariaHidden === void 0) surface.removeAttribute("aria-hidden");
						else surface.setAttribute("aria-hidden", ariaHidden);
					});
				};
			}, [open]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeFromSidebar = (event) => {
					const root = rootRef.current;
					if (root === null || !(event.target instanceof Node)) return;
					if (!root.contains(event.target) && event.clientX < sidebarWidth) workspace.setOpen(false);
				};
				document.addEventListener("pointerdown", closeFromSidebar, true);
				return () => {
					document.removeEventListener("pointerdown", closeFromSidebar, true);
				};
			}, [
				open,
				sidebarWidth,
				workspace
			]);
			(0, react.useEffect)(() => {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
			}, [messages]);
			(0, react.useEffect)(() => {
				voiceSilenceMs.current = settingsSnapshot.value?.voiceSilenceMs ?? voiceSilenceMs.current;
			}, [settingsSnapshot]);
			(0, react.useEffect)(() => {
				endRef.current?.scrollIntoView({ block: "end" });
			}, [
				conversation,
				liveAssistantText,
				liveUserActive,
				liveUserText,
				messages,
				sending
			]);
			(0, react.useEffect)(() => {
				const nodes = snapshot?.nodes ?? [];
				let latest;
				for (let index = nodes.length - 1; index >= 0; index -= 1) if (nodes[index]?.kind === "assistant") {
					latest = nodes[index];
					break;
				}
				if (latest?.kind !== "assistant" || latest.seq <= seenAssistantSeq.current) return;
				seenAssistantSeq.current = latest.seq;
				const target = pendingConversation.current;
				if (target === null) return;
				const text = assistantText(latest.blocks);
				if (text === "") return;
				setMessages((current) => ({
					...current,
					[target]: [...current[target], {
						id: `assistant-${latest.seq}`,
						role: "assistant",
						text,
						time: latest.time
					}]
				}));
				pendingConversation.current = null;
				const hostReplyId = pendingHostReplyId.current;
				pendingHostReplyId.current = null;
				busy.current = false;
				setSending(false);
				if (hostReplyId !== null) postHostReply(hostReplyId, text).catch((failure) => {
					setError(failure instanceof Error ? failure.message : String(failure));
				});
				if (calling && target === "self") {
					const player = speechPlayer.current ?? new SpeechPlayer();
					speechPlayer.current = player;
					const seq = speechSeq.current + 1;
					speechSeq.current = seq;
					setVoiceSpeaker("assistant");
					player.speak(text).catch((failure) => {
						setVoiceError(failure instanceof Error ? failure.message : String(failure));
					}).finally(() => {
						if (speechSeq.current === seq) setVoiceSpeaker("user");
					});
				}
			}, [calling, snapshot]);
			(0, react.useEffect)(() => {
				if (!open) return;
				let disposed = false;
				const sync = async () => {
					const hostMessages = await fetchHostMessages();
					if (disposed) return;
					const freshMessages = hostMessages.filter((message) => message.source === "telegram" && !displayedHostMessageIds.current.has(message.id));
					if (freshMessages.length > 0) {
						for (const message of freshMessages) displayedHostMessageIds.current.add(message.id);
						setMessages((current) => {
							const next = { ...current };
							for (const message of freshMessages) next[message.conversation] = [...next[message.conversation], {
								id: `bridge-${message.id}`,
								role: message.role,
								text: message.text,
								time: message.time
							}];
							return next;
						});
					}
					if (sessionId === void 0 || busy.current || snapshot?.running === true) return;
					const pending = hostMessages.find((message) => message.source === "telegram" && message.conversation === "self" && message.role === "user" && message.status === "pending" && !processingHostMessageIds.current.has(message.id));
					if (pending === void 0) return;
					processingHostMessageIds.current.add(pending.id);
					setError(null);
					setSending(true);
					busy.current = true;
					pendingConversation.current = "self";
					pendingHostReplyId.current = pending.id;
					const failure = await send(sessionId, "self", pending.text);
					if (failure !== null) {
						pendingConversation.current = null;
						pendingHostReplyId.current = null;
						busy.current = false;
						setSending(false);
						setError(failure);
						processingHostMessageIds.current.delete(pending.id);
					}
				};
				const interval = window.setInterval(() => {
					sync().catch((failure) => {
						if (!disposed) setError(failure instanceof Error ? failure.message : String(failure));
					});
				}, settingsSnapshot.value?.bridgePollIntervalMs ?? 1500);
				sync().catch((failure) => {
					if (!disposed) setError(failure instanceof Error ? failure.message : String(failure));
				});
				return () => {
					disposed = true;
					window.clearInterval(interval);
				};
			}, [
				open,
				send,
				sessionId,
				settingsSnapshot.value?.bridgePollIntervalMs,
				snapshot?.running
			]);
			(0, react.useEffect)(() => () => {
				stopSecretaryCapture();
				realtimeCall.current?.stop();
				speechPlayer.current?.stop();
			}, []);
			function clearPendingVoiceSubmit() {
				if (voiceSubmitTimer.current !== void 0) window.clearTimeout(voiceSubmitTimer.current);
				voiceSubmitTimer.current = void 0;
				pendingVoiceText.current = "";
			}
			function playRemoteAudio() {
				const audio = remoteAudioRef.current;
				if (audio === null || audio.srcObject === null) return;
				audio.muted = false;
				audio.volume = 1;
				audio.play().catch(() => {
					setVoiceError(t("call.playback"));
				});
			}
			function bindRemoteAudio(stream) {
				const audio = remoteAudioRef.current;
				if (audio === null) return;
				if (stream === null) {
					audio.pause();
					audio.srcObject = null;
					return;
				}
				audio.muted = false;
				audio.volume = 1;
				audio.srcObject = stream;
				playRemoteAudio();
			}
			function submitVoiceTranscript(raw) {
				const text = raw.trim();
				clearPendingVoiceSubmit();
				setLiveUserText("");
				setLiveUserActive(false);
				if (text === "") return;
				const normalized = text.replace(/\s+/gu, " ");
				const now = Date.now();
				const previous = lastVoiceSubmission.current;
				if (previous !== void 0 && previous.text === normalized && now - previous.time < 3e3) return;
				lastVoiceSubmission.current = {
					text: normalized,
					time: now
				};
				submit(text);
			}
			function resetSecretarySegment() {
				secretaryRecording.current = false;
				secretaryChunks.current = [];
				secretarySilentSince.current = void 0;
			}
			function resetSecretaryPrefix() {
				secretaryPrefix.current = [];
				secretaryPrefixSamples.current = 0;
			}
			function appendSecretaryPrefix(chunk) {
				secretaryPrefix.current.push(chunk);
				secretaryPrefixSamples.current += chunk.length;
				const maxSamples = Math.round((settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE) * SECRETARY_PREFIX_MS / 1e3);
				while (secretaryPrefixSamples.current > maxSamples && secretaryPrefix.current.length > 0) {
					const removed = secretaryPrefix.current.shift();
					secretaryPrefixSamples.current -= removed?.length ?? 0;
				}
			}
			function stopSecretaryCapture() {
				secretaryProcessor.current?.disconnect();
				secretaryProcessor.current = null;
				secretarySource.current?.disconnect();
				secretarySource.current = null;
				secretarySilentOutput.current?.disconnect();
				secretarySilentOutput.current = null;
				secretaryAudioContext.current?.close().catch(() => {});
				secretaryAudioContext.current = null;
				resetSecretarySegment();
				resetSecretaryPrefix();
			}
			function finishSecretarySegment() {
				const chunks = secretaryChunks.current;
				const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
				resetSecretarySegment();
				resetSecretaryPrefix();
				setAudioLevel(0);
				setLiveUserActive(false);
				if (total < Math.round((settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE) * .35)) return;
				const bytes = new Uint8Array(total * 2);
				let offset = 0;
				for (const chunk of chunks) {
					bytes.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), offset);
					offset += chunk.byteLength;
				}
				submitSecretaryAudio(bytes);
			}
			async function submitSecretaryAudio(audio) {
				if (secretarySubmitting.current) return;
				secretarySubmitting.current = true;
				setVoiceError(null);
				try {
					const response = await fetch(SECRETARY_ASR_PATH, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ audio: base64FromBytes(audio) })
					});
					const body = await response.text();
					if (!response.ok) throw new Error(readAsrError(body, response.status));
					const transcript = readAsrTranscript(body);
					if (transcript !== "") submitVoiceTranscript(transcript);
				} catch (failure) {
					setVoiceError(failure instanceof Error ? failure.message : String(failure));
				} finally {
					secretarySubmitting.current = false;
				}
			}
			async function submit(raw) {
				const text = raw.trim();
				if (text === "") return;
				if (conversation === "chatgpt") {
					const call = realtimeCall.current;
					if (call === null || callState !== "connected") {
						setError(t("call.chatgptRequired"));
						return;
					}
					setDraft("");
					setError(null);
					setMessages((current) => ({
						...current,
						chatgpt: [...current.chatgpt, {
							id: `user-${Date.now()}`,
							role: "user",
							text,
							time: Date.now()
						}]
					}));
					try {
						call.sendText(text);
					} catch (failure) {
						setError(failure instanceof Error ? failure.message : String(failure));
					}
					return;
				}
				if (busy.current || snapshot?.running === true) return;
				setDraft("");
				setError(null);
				setSending(true);
				busy.current = true;
				pendingConversation.current = conversation;
				setMessages((current) => ({
					...current,
					[conversation]: [...current[conversation], {
						id: `user-${Date.now()}`,
						role: "user",
						text,
						time: Date.now()
					}]
				}));
				const failure = await send(sessionId, conversation, text);
				if (failure !== null) {
					pendingConversation.current = null;
					busy.current = false;
					setSending(false);
					setError(failure);
				}
			}
			const stopCall = () => {
				clearPendingVoiceSubmit();
				stopSecretaryCapture();
				microphoneStream.current?.getTracks().forEach((track) => {
					track.stop();
				});
				microphoneStream.current = null;
				speechSeq.current += 1;
				speechPlayer.current?.stop();
				realtimeCall.current?.stop();
				realtimeCall.current = null;
				setCallState("idle");
				setAudioLevel(0);
				setVoiceSpeaker("user");
				setLiveUserText("");
				setLiveAssistantText("");
				setLiveUserActive(false);
				bindRemoteAudio(null);
				recognitionPaused.current = false;
				setCallPaused(false);
				setCalling(false);
			};
			const startSecretaryCall = async () => {
				setVoiceError(null);
				bindRemoteAudio(null);
				try {
					const stream = await navigator.mediaDevices.getUserMedia({ audio: {
						echoCancellation: true,
						noiseSuppression: true,
						autoGainControl: true
					} });
					microphoneStream.current?.getTracks().forEach((track) => {
						track.stop();
					});
					microphoneStream.current = stream;
				} catch (failure) {
					setVoiceError(failure instanceof Error ? `${t("call.permission")}: ${failure.message}` : t("call.permission"));
					stopCall();
					return;
				}
				clearPendingVoiceSubmit();
				stopSecretaryCapture();
				lastVoiceSubmission.current = void 0;
				resetSecretarySegment();
				resetSecretaryPrefix();
				const audioContext = new AudioContext();
				const source = audioContext.createMediaStreamSource(microphoneStream.current);
				const processor = audioContext.createScriptProcessor(4096, 1, 1);
				const silentOutput = audioContext.createGain();
				silentOutput.gain.value = 0;
				processor.onaudioprocess = (event) => {
					if (recognitionPaused.current) return;
					handleSecretaryAudio(event.inputBuffer.getChannelData(0), audioContext.sampleRate);
				};
				source.connect(processor);
				processor.connect(silentOutput);
				silentOutput.connect(audioContext.destination);
				secretaryAudioContext.current = audioContext;
				secretarySource.current = source;
				secretaryProcessor.current = processor;
				secretarySilentOutput.current = silentOutput;
				recognitionPaused.current = false;
				setCallPaused(false);
				setCallState("connected");
				setCalling(true);
			};
			function handleSecretaryAudio(input, inputSampleRate) {
				const chunk = downsampleToPcm16(input, inputSampleRate, settingsSnapshot.value?.aliyunAsrSampleRate ?? SECRETARY_ASR_SAMPLE_RATE);
				const level = rms(input);
				setAudioLevel(level);
				if (level >= SECRETARY_VOICE_THRESHOLD) {
					setLiveUserActive(true);
					setLiveUserText("");
					if (!secretaryRecording.current) {
						secretaryRecording.current = true;
						secretaryChunks.current = [...secretaryPrefix.current, chunk];
					} else secretaryChunks.current.push(chunk);
					secretarySilentSince.current = void 0;
					return;
				}
				if (!secretaryRecording.current) {
					appendSecretaryPrefix(chunk);
					setLiveUserActive(false);
					return;
				}
				secretaryChunks.current.push(chunk);
				const now = Date.now();
				secretarySilentSince.current ??= now;
				if (now - secretarySilentSince.current >= voiceSilenceMs.current) finishSecretarySegment();
			}
			const ensureSecretaryAudioContext = async () => {
				if (secretaryAudioContext.current?.state === "suspended") await secretaryAudioContext.current.resume();
			};
			const recoverSecretaryAudioContext = () => {
				ensureSecretaryAudioContext().catch((failure) => {
					setVoiceError(failure instanceof Error ? `${t("call.permission")}: ${failure.message}` : t("call.permission"));
					stopCall();
				});
			};
			const startRealtimeCall = async () => {
				setVoiceError(null);
				recognitionPaused.current = false;
				setCallPaused(false);
				const call = new OpenAIRealtimeCall({
					onUserTranscriptDelta: (text) => {
						setLiveUserText((current) => current + text);
					},
					onUserTranscript: (text) => {
						const transcript = text.trim();
						setLiveUserText("");
						setLiveUserActive(false);
						if (transcript === "") return;
						setMessages((current) => ({
							...current,
							chatgpt: [...current.chatgpt, {
								id: `user-voice-${Date.now()}`,
								role: "user",
								text: transcript,
								time: Date.now()
							}]
						}));
					},
					onAssistantTranscriptDelta: (text) => {
						const audio = remoteAudioRef.current;
						if (audio !== null && audio.paused) audio.play().catch(() => {
							setVoiceError(t("call.playback"));
						});
						setLiveAssistantText((current) => current + text);
					},
					onAssistantTranscript: (text) => {
						const transcript = text.trim();
						setLiveAssistantText("");
						if (transcript === "") return;
						setMessages((current) => ({
							...current,
							chatgpt: [...current.chatgpt, {
								id: `assistant-live-${Date.now()}`,
								role: "assistant",
								text: transcript,
								time: Date.now()
							}]
						}));
					},
					onUserSpeechState: (active) => {
						setLiveUserActive(active);
					},
					onError: (message) => {
						setVoiceError(message);
					},
					onState: (state) => {
						setCallState(state);
						if (state !== "idle") setCalling(true);
					},
					onAudioLevel: (level) => {
						setAudioLevel(level);
					},
					onRemoteStream: bindRemoteAudio,
					onRemoteAudioStart: () => {
						playRemoteAudio();
						setVoiceSpeaker("assistant");
					},
					onRemoteAudioStop: () => {
						setVoiceSpeaker("user");
					}
				});
				realtimeCall.current = call;
				try {
					await call.start();
				} catch (failure) {
					setVoiceError(failure instanceof Error ? failure.message : String(failure));
					realtimeCall.current = null;
				}
			};
			const startCall = () => {
				if (conversation === "chatgpt") startRealtimeCall();
				else startSecretaryCall();
			};
			const togglePause = () => {
				const next = !recognitionPaused.current;
				recognitionPaused.current = next;
				setCallPaused(next);
				if (next) {
					setAudioLevel(0);
					clearPendingVoiceSubmit();
					setLiveUserText("");
					setLiveUserActive(false);
				}
				if (conversation === "chatgpt") {
					realtimeCall.current?.setMuted(next);
					return;
				}
				if (!next) recoverSecretaryAudioContext();
			};
			const selectConversation = (id) => {
				if (conversation !== id) stopCall();
				setConversation(id);
				setMobileChat(true);
				setError(null);
			};
			if (!open) return null;
			const activeMessages = messages[conversation];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: WechatAssistantWorkspace_module_css_default.workspace,
				style: { left: sidebarWidth },
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
					className: `${WechatAssistantWorkspace_module_css_default.conversationSidebar}${mobileChat ? ` ${WechatAssistantWorkspace_module_css_default.mobileHidden}` : ""}`,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
							className: WechatAssistantWorkspace_module_css_default.sidebarHeader,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("workspace.title") })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WechatAssistantWorkspace_module_css_default.groupLabel,
							children: t("group.mine")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConversationButton, {
							definition: selfDefinition,
							messages: messages.self,
							active: conversation === "self",
							onSelect: () => {
								selectConversation("self");
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WechatAssistantWorkspace_module_css_default.groupLabel,
							children: t("group.system")
						}),
						definitions.slice(1).map((definition) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConversationButton, {
							definition,
							messages: messages[definition.id],
							active: conversation === definition.id,
							onSelect: () => {
								selectConversation(definition.id);
							}
						}, definition.id)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WechatAssistantWorkspace_module_css_default.groupLabel,
							children: t("group.pairs")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WechatAssistantWorkspace_module_css_default.pairEmpty,
							children: t("group.pairs.empty")
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: `${WechatAssistantWorkspace_module_css_default.chat}${mobileChat ? ` ${WechatAssistantWorkspace_module_css_default.mobileChat}` : ""}`,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: WechatAssistantWorkspace_module_css_default.chatHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: WechatAssistantWorkspace_module_css_default.chatIdentity,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: WechatAssistantWorkspace_module_css_default.mobileBack,
									"aria-label": t("action.back"),
									onClick: () => {
										setMobileChat(false);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, {})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: active.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: active.subtitle })] })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: WechatAssistantWorkspace_module_css_default.headerActions,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: WechatAssistantWorkspace_module_css_default.participants,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
											role: "user",
											size: 30
										}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
											role: active.role,
											size: 30
										}) })]
									}),
									(conversation === "self" || conversation === "chatgpt") && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: calling ? WechatAssistantWorkspace_module_css_default.callActive : WechatAssistantWorkspace_module_css_default.call,
										"aria-label": calling ? t("call.stop") : t("call.start"),
										onClick: calling ? stopCall : startCall,
										children: [calling ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFill16, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: calling ? t("call.stop") : t("call.start") })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: WechatAssistantWorkspace_module_css_default.more,
										"aria-label": t("action.more"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutline16, {})
									})
								]
							})]
						}),
						calling && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: WechatAssistantWorkspace_module_css_default.callStrip,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: callState === "connecting" ? WechatAssistantWorkspace_module_css_default.connectingDot : WechatAssistantWorkspace_module_css_default.onlineDot }),
								callStatus,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: callHint }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: callPaused ? WechatAssistantWorkspace_module_css_default.resumeListening : WechatAssistantWorkspace_module_css_default.pauseListening,
									onClick: togglePause,
									"aria-label": callPaused ? t("call.resume") : t("call.pause"),
									title: callPaused ? t("call.resume") : t("call.pause"),
									children: [callPaused ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutline16, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPauseOutline16, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: callPaused ? t("call.resume") : t("call.pause") })]
								})
							]
						}),
						conversation === "chatgpt" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("audio", {
							ref: remoteAudioRef,
							className: WechatAssistantWorkspace_module_css_default.remoteAudio,
							autoPlay: true,
							playsInline: true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WechatAssistantWorkspace_module_css_default.messages,
							"aria-live": "polite",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: WechatAssistantWorkspace_module_css_default.messageFlow,
								children: [
									activeMessages.length === 0 && !calling && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: WechatAssistantWorkspace_module_css_default.empty,
										children: t("message.empty")
									}),
									activeMessages.map((message) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRow, {
										message,
										agentRole: active.role,
										agentName: active.name,
										t
									}, message.id)),
									calling && (liveUserActive || liveUserText !== "") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LiveVoiceRow, {
										mine: true,
										text: liveUserText,
										level: audioLevel,
										agentRole: active.role,
										agentName: active.name,
										t
									}),
									calling && conversation === "chatgpt" && liveAssistantText !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LiveVoiceRow, {
										mine: false,
										text: liveAssistantText,
										level: audioLevel,
										agentRole: active.role,
										agentName: active.name,
										t
									}),
									sending && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: WechatAssistantWorkspace_module_css_default.replying,
										children: [t("status.sending"), "..."]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { ref: endRef })
								]
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: WechatAssistantWorkspace_module_css_default.composer,
							children: [
								(error !== null || voiceError !== null) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: WechatAssistantWorkspace_module_css_default.error,
									role: "status",
									children: voiceError ?? `${t("status.failed")}: ${error}`
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: WechatAssistantWorkspace_module_css_default.inputRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										value: draft,
										rows: 1,
										placeholder: t("composer.placeholder"),
										onChange: (event) => {
											setDraft(event.target.value);
										},
										onKeyDown: (event) => {
											if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
												event.preventDefault();
												submit(draft);
											}
										}
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("composer.send"),
										disabled: draft.trim() === "" || sending || snapshot?.running === true,
										onClick: () => {
											submit(draft);
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline16, {})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WechatAssistantWorkspace_module_css_default.sendHint,
									children: t("composer.hint")
								})
							]
						})
					]
				})]
			});
		}
		function LiveVoiceRow({ mine, text, level, agentRole, agentName, t }) {
			const activeLevel = Math.max(.08, level);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: mine ? WechatAssistantWorkspace_module_css_default.messageMine : WechatAssistantWorkspace_module_css_default.messageAgent,
				"aria-live": "polite",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
					role: mine ? "user" : agentRole,
					size: 34
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: WechatAssistantWorkspace_module_css_default.bubbleWrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: mine ? t("message.you") : agentName }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: WechatAssistantWorkspace_module_css_default.liveBubble,
						children: text !== "" ? text : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: WechatAssistantWorkspace_module_css_default.voiceBars,
							"aria-label": mine ? t("call.transcribing") : t("call.chatgptSpeaking"),
							children: [
								.55,
								.9,
								.7,
								1,
								.62
							].map((weight, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { height: `${String(7 + activeLevel * weight * 17)}px` } }, String(index)))
						})
					})]
				})]
			});
		}
		function ConversationButton({ definition, messages, active, onSelect }) {
			const last = messages.at(-1);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: active ? WechatAssistantWorkspace_module_css_default.conversationActive : WechatAssistantWorkspace_module_css_default.conversationRow,
				onClick: onSelect,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
						role: definition.role,
						size: 36
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: WechatAssistantWorkspace_module_css_default.conversationCopy,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: definition.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: last?.text ?? definition.subtitle })]
					}),
					last !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(last.time) })
				]
			});
		}
		function MessageRow({ message, agentRole, agentName, t }) {
			if (message.role === "system") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WechatAssistantWorkspace_module_css_default.systemMessage,
				children: message.text
			});
			const mine = message.role === "user";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: mine ? WechatAssistantWorkspace_module_css_default.messageMine : WechatAssistantWorkspace_module_css_default.messageAgent,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
					role: mine ? "user" : agentRole,
					size: 34
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: WechatAssistantWorkspace_module_css_default.bubbleWrap,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: mine ? t("message.you") : agentName }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: message.text }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", { children: formatTime(message.time) })
					]
				})]
			});
		}
		//#endregion
		//#region src/client/workspace-store.ts
		/** Root-scoped workspace selection shared by the two browser registrations. */
		var WechatAssistantWorkspaceStore = class {
			snapshot = { open: false };
			listeners = /* @__PURE__ */ new Set();
			/** Return the current page selection. */
			getSnapshot = () => this.snapshot;
			/** Observe page selection changes. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Select or leave the WeChat Assistant page.
			* @param open Whether the application page is selected.
			*/
			setOpen(open) {
				if (this.snapshot.open === open) return;
				this.snapshot = { open };
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/locales.ts
		/** Simplified Chinese dictionary for the WeChat Assistant workspace. */
		const zh = {
			"entry.label": "微信助手（beta）",
			"entry.name": "微信助手",
			"workspace.title": "微信助手",
			"group.mine": "我的助手",
			"group.system": "系统 Agent",
			"group.pairs": "Agent 对话",
			"group.pairs.empty": "有跨 Agent 对话时会显示在这里",
			"conversation.self": "秘书",
			"conversation.teacher": "老师 Agent",
			"conversation.claude": "Claude",
			"conversation.chatgpt": "ChatGPT",
			"conversation.self.subtitle": "专属助手",
			"conversation.teacher.subtitle": "苏格拉底 + 费曼",
			"conversation.claude.subtitle": "本地 Claude Code CLI",
			"conversation.chatgpt.subtitle": "OpenAI Realtime Live",
			"composer.placeholder": "输入消息，Ctrl/⌘ + Enter 发送",
			"composer.send": "发送",
			"composer.hint": "Ctrl/⌘ + Enter 发送",
			"call.start": "语音电话",
			"call.stop": "挂断",
			"call.pause": "暂停收音",
			"call.resume": "继续通话",
			"call.paused": "收音已暂停",
			"call.pausedHint": "暂停期间不会触发回复，点击继续后恢复收音",
			"call.listening": "正在聆听",
			"call.connecting": "正在连接 ChatGPT Live",
			"call.secretarySpeaking": "秘书正在回复",
			"call.chatgptSpeaking": "ChatGPT 正在回复",
			"call.youSpeaking": "正在聆听你说话",
			"call.transcribing": "正在识别你的语音",
			"call.live": "实时语音通话",
			"call.liveHint": "直接说话即可，停顿后会自动回复",
			"call.playback": "浏览器无法播放远端语音，请检查页面声音权限和系统输出设备",
			"call.transcript": "语音转写会进入当前秘书会话",
			"call.chatgptTranscript": "AI 生成语音 · 实时语音与转写处于同一段对话",
			"call.chatgptRequired": "请先点击语音电话，连接 ChatGPT Live 后再发送",
			"call.unsupported": "当前浏览器不支持语音识别",
			"call.permission": "无法使用麦克风",
			"message.you": "你",
			"message.empty": "暂无消息",
			"action.back": "返回会话列表",
			"action.more": "更多",
			"status.connected": "实时连接",
			"status.offline": "未连接",
			"status.currentSession": "使用当前 Harness Session",
			"status.noSession": "未选择 Harness Session",
			"status.noSessionError": "请先在左侧选择一个 Harness Session",
			"status.sending": "正在回复",
			"status.failed": "发送失败",
			"settings.nav": "微信助手",
			"settings.title": "微信助手",
			"settings.description": "管理 ChatGPT 实时语音连接和本机保存的 OpenAI 凭据。",
			"settings.realtime.title": "OpenAI Realtime",
			"settings.realtime.description": "用于 ChatGPT Agent 的实时语音和文字对话。",
			"settings.key.label": "OpenAI API Key",
			"settings.key.hint": "密钥仅写入 Harness 本地凭据仓库，页面不会读取或回显原值。",
			"settings.key.configured": "已配置",
			"settings.key.missing": "未配置",
			"settings.key.placeholder": "输入新的 API Key",
			"settings.key.placeholderConfigured": "留空则保留当前密钥",
			"settings.key.remove": "移除本地密钥",
			"settings.key.removed": "本地密钥已移除",
			"settings.model.label": "Realtime 模型",
			"settings.model.required": "Realtime 模型不能为空",
			"settings.voice.label": "语音",
			"settings.voice.required": "语音不能为空",
			"settings.transcriptionModel.label": "语音转录模型",
			"settings.transcriptionModel.required": "语音转录模型不能为空",
			"settings.instructions.label": "ChatGPT 系统提示词",
			"settings.instructions.required": "ChatGPT 系统提示词不能为空",
			"settings.voiceSilenceMs.label": "语音停顿判定（毫秒）",
			"settings.voiceSilenceMs.hint": "同一套等待时间用于 ChatGPT Realtime 和秘书语音电话。",
			"settings.voiceSilenceMs.required": "语音停顿判定必须至少为 250 毫秒",
			"settings.minimax.title": "MiniMax 国内语音",
			"settings.minimax.description": "用于把秘书的 DeepSeek 文字回复交给 MiniMax speech-2.8-turbo 朗读，API Key 只保存在本机。",
			"settings.minimaxKey.label": "MiniMax API Key",
			"settings.minimaxKey.hint": "密钥仅写入 Harness 本地凭据仓库，页面不会读取或回显原值。",
			"settings.minimaxApiKeyEnv.label": "MiniMax 凭据名称",
			"settings.minimaxApiKeyEnv.required": "MiniMax 凭据名称不能为空",
			"settings.minimaxBaseURL.label": "MiniMax API 地址",
			"settings.minimaxBaseURL.required": "MiniMax API 地址不能为空",
			"settings.minimaxModel.label": "MiniMax 模型",
			"settings.minimaxModel.required": "MiniMax 模型不能为空",
			"settings.minimaxVoice.label": "MiniMax 音色",
			"settings.minimaxVoice.required": "MiniMax 音色不能为空",
			"settings.minimaxFormat.label": "MiniMax 音频格式",
			"settings.minimaxFormat.required": "MiniMax 音频格式不能为空",
			"settings.aliyun.title": "阿里云语音识别",
			"settings.aliyun.description": "用于把秘书语音电话里的麦克风音频识别成文字；MiniMax 仍负责朗读秘书回复。",
			"settings.aliyunToken.label": "阿里云 NLS Token",
			"settings.aliyunToken.hint": "Token 仅写入 Harness 本地凭据仓库，页面不会读取或回显原值。Token 过期后需要重新填写。",
			"settings.aliyunToken.remove": "移除阿里云 Token",
			"settings.aliyunNlsTokenEnv.label": "阿里云 Token 凭据名称",
			"settings.aliyunNlsTokenEnv.required": "阿里云 Token 凭据名称不能为空",
			"settings.aliyunNlsAppKey.label": "阿里云 AppKey",
			"settings.aliyunNlsAppKey.required": "阿里云 AppKey 不能为空",
			"settings.aliyunAsrURL.label": "阿里云 ASR 地址",
			"settings.aliyunAsrURL.required": "阿里云 ASR 地址不能为空",
			"settings.aliyunAsrFormat.label": "阿里云音频格式",
			"settings.aliyunAsrFormat.required": "阿里云音频格式不能为空",
			"settings.aliyunAsrSampleRate.label": "阿里云采样率",
			"settings.aliyunAsrSampleRate.required": "阿里云采样率必须至少为 8000",
			"settings.public.title": "公网看板",
			"settings.public.description": "Vercel 前端只承载页面和中转；本机 Bridge 在线时才执行本地命令。",
			"settings.publicDashboardUrl.label": "公网看板地址",
			"settings.publicDashboardUrl.hint": "部署到 Vercel 后填入生产地址。留空时只使用本机页面。",
			"settings.bridgeDeviceName.label": "本机设备名",
			"settings.bridgeDeviceName.required": "本机设备名不能为空",
			"settings.bridgePollIntervalMs.label": "Bridge 轮询间隔（毫秒）",
			"settings.bridgePollIntervalMs.required": "Bridge 轮询间隔必须至少为 500 毫秒",
			"settings.telegram.title": "Telegram 秘书",
			"settings.telegram.description": "本机 Harness 使用 polling 主动连接 Telegram，消息默认进入秘书会话。",
			"settings.telegramKey.label": "Telegram Bot Token",
			"settings.telegramKey.hint": "Token 仅写入 Harness 本地凭据仓库；公网看板不会读取原值。",
			"settings.telegramKey.remove": "移除 Telegram token",
			"settings.telegramBotTokenEnv.label": "Telegram 凭据名称",
			"settings.telegramBotTokenEnv.required": "Telegram 凭据名称不能为空",
			"settings.telegramAllowedUserIds.label": "允许的 Telegram 用户 ID",
			"settings.save": "保存",
			"settings.saving": "正在保存",
			"settings.saved": "设置已保存，将从下一通电话生效"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			"entry.label": "WeChat Assistant (beta)",
			"entry.name": "WeChat Assistant",
			"workspace.title": "WeChat Assistant",
			"group.mine": "My assistant",
			"group.system": "System Agents",
			"group.pairs": "Agent conversations",
			"group.pairs.empty": "Cross-agent conversations will appear here",
			"conversation.self": "Secretary",
			"conversation.teacher": "Teacher Agent",
			"conversation.claude": "Claude",
			"conversation.chatgpt": "ChatGPT",
			"conversation.self.subtitle": "Personal assistant",
			"conversation.teacher.subtitle": "Socratic + Feynman",
			"conversation.claude.subtitle": "Local Claude Code CLI",
			"conversation.chatgpt.subtitle": "OpenAI Realtime Live",
			"composer.placeholder": "Type a message, Ctrl/⌘ + Enter to send",
			"composer.send": "Send",
			"composer.hint": "Ctrl/⌘ + Enter to send",
			"call.start": "Voice call",
			"call.stop": "Hang up",
			"call.pause": "Pause microphone",
			"call.resume": "Resume call",
			"call.paused": "Microphone paused",
			"call.pausedHint": "Pausing does not trigger a reply; resume to enable the microphone",
			"call.listening": "Listening",
			"call.connecting": "Connecting to ChatGPT Live",
			"call.secretarySpeaking": "Secretary is speaking",
			"call.chatgptSpeaking": "ChatGPT is speaking",
			"call.youSpeaking": "Listening to you",
			"call.transcribing": "Transcribing your speech",
			"call.live": "Live voice call",
			"call.liveHint": "Speak naturally; a pause will trigger the reply",
			"call.playback": "The browser could not play remote audio; check site audio permission and the system output device",
			"call.transcript": "Speech transcripts enter the current Secretary conversation",
			"call.chatgptTranscript": "AI-generated voice · Live audio and transcripts share one conversation",
			"call.chatgptRequired": "Start the voice call to connect ChatGPT Live before sending",
			"call.unsupported": "Voice recognition is unavailable in this browser",
			"call.permission": "Microphone access failed",
			"message.you": "You",
			"message.empty": "No messages yet",
			"action.back": "Back to conversations",
			"action.more": "More",
			"status.connected": "Live connection",
			"status.offline": "Disconnected",
			"status.currentSession": "Using current Harness Session",
			"status.noSession": "No Harness Session selected",
			"status.noSessionError": "Select a Harness Session from the sidebar first",
			"status.sending": "Replying",
			"status.failed": "Send failed",
			"settings.nav": "WeChat Assistant",
			"settings.title": "WeChat Assistant",
			"settings.description": "Manage the ChatGPT live voice connection and the OpenAI credential stored on this device.",
			"settings.realtime.title": "OpenAI Realtime",
			"settings.realtime.description": "Live voice and text conversation for the ChatGPT Agent.",
			"settings.key.label": "OpenAI API Key",
			"settings.key.hint": "The key is written only to the Harness credential store; this page never reads or reveals it.",
			"settings.key.configured": "Configured",
			"settings.key.missing": "Not configured",
			"settings.key.placeholder": "Enter a new API key",
			"settings.key.placeholderConfigured": "Leave blank to keep the current key",
			"settings.key.remove": "Remove local key",
			"settings.key.removed": "Local key removed",
			"settings.model.label": "Realtime model",
			"settings.model.required": "Realtime model is required",
			"settings.voice.label": "Voice",
			"settings.voice.required": "Voice is required",
			"settings.transcriptionModel.label": "Speech transcription model",
			"settings.transcriptionModel.required": "Speech transcription model is required",
			"settings.instructions.label": "ChatGPT system instructions",
			"settings.instructions.required": "ChatGPT system instructions are required",
			"settings.voiceSilenceMs.label": "Voice silence window (ms)",
			"settings.voiceSilenceMs.hint": "The same wait time is shared by ChatGPT Realtime and Secretary voice calls.",
			"settings.voiceSilenceMs.required": "Voice silence window must be at least 250 ms",
			"settings.minimax.title": "MiniMax China speech",
			"settings.minimax.description": "Reads Secretary replies from DeepSeek through MiniMax speech-2.8-turbo; the API key stays in the local credential store.",
			"settings.minimaxKey.label": "MiniMax API Key",
			"settings.minimaxKey.hint": "The key is written only to the Harness credential store; this page never reads or reveals it.",
			"settings.minimaxApiKeyEnv.label": "MiniMax credential name",
			"settings.minimaxApiKeyEnv.required": "MiniMax credential name is required",
			"settings.minimaxBaseURL.label": "MiniMax API URL",
			"settings.minimaxBaseURL.required": "MiniMax API URL is required",
			"settings.minimaxModel.label": "MiniMax model",
			"settings.minimaxModel.required": "MiniMax model is required",
			"settings.minimaxVoice.label": "MiniMax voice",
			"settings.minimaxVoice.required": "MiniMax voice is required",
			"settings.minimaxFormat.label": "MiniMax audio format",
			"settings.minimaxFormat.required": "MiniMax audio format is required",
			"settings.aliyun.title": "Aliyun speech recognition",
			"settings.aliyun.description": "Transcribes Secretary voice-call microphone audio; MiniMax still reads Secretary replies aloud.",
			"settings.aliyunToken.label": "Aliyun NLS Token",
			"settings.aliyunToken.hint": "The token is written only to the Harness credential store; this page never reads or reveals it. Re-enter it after it expires.",
			"settings.aliyunToken.remove": "Remove Aliyun token",
			"settings.aliyunNlsTokenEnv.label": "Aliyun token credential name",
			"settings.aliyunNlsTokenEnv.required": "Aliyun token credential name is required",
			"settings.aliyunNlsAppKey.label": "Aliyun AppKey",
			"settings.aliyunNlsAppKey.required": "Aliyun AppKey is required",
			"settings.aliyunAsrURL.label": "Aliyun ASR URL",
			"settings.aliyunAsrURL.required": "Aliyun ASR URL is required",
			"settings.aliyunAsrFormat.label": "Aliyun audio format",
			"settings.aliyunAsrFormat.required": "Aliyun audio format is required",
			"settings.aliyunAsrSampleRate.label": "Aliyun sample rate",
			"settings.aliyunAsrSampleRate.required": "Aliyun sample rate must be at least 8000",
			"settings.public.title": "Public dashboard",
			"settings.public.description": "The Vercel frontend hosts the page and relay only; local commands run when this device bridge is online.",
			"settings.publicDashboardUrl.label": "Public dashboard URL",
			"settings.publicDashboardUrl.hint": "Enter the production URL after deploying to Vercel. Leave blank for local-only use.",
			"settings.bridgeDeviceName.label": "Local device name",
			"settings.bridgeDeviceName.required": "Local device name is required",
			"settings.bridgePollIntervalMs.label": "Bridge poll interval (ms)",
			"settings.bridgePollIntervalMs.required": "Bridge poll interval must be at least 500 ms",
			"settings.telegram.title": "Telegram Secretary",
			"settings.telegram.description": "Local Harness connects to Telegram by polling; messages enter the Secretary conversation by default.",
			"settings.telegramKey.label": "Telegram Bot Token",
			"settings.telegramKey.hint": "The token is written only to the local Harness credential store; the public dashboard never reads it.",
			"settings.telegramKey.remove": "Remove Telegram token",
			"settings.telegramBotTokenEnv.label": "Telegram credential name",
			"settings.telegramBotTokenEnv.required": "Telegram credential name is required",
			"settings.telegramAllowedUserIds.label": "Allowed Telegram user IDs",
			"settings.save": "Save",
			"settings.saving": "Saving",
			"settings.saved": "Saved; new calls will use these settings"
		};
		//#endregion
		//#region src/settings-contract.ts
		/** Settings values shared by the WeChat Assistant Host and browser faces. */
		/** Durable settings namespace owned by the WeChat Assistant. */
		const A2A_ASSISTANT_SETTINGS_NAMESPACE = "ui-a2a-assistant";
		//#endregion
		//#region src/client/index.ts
		const NS = "a2a-assistant";
		/** Required browser services. */
		const inject = [
			"slots",
			"sessions",
			"locale",
			"connection",
			"settingsScope"
		];
		function promptFor(conversation, text) {
			if (conversation === "self") return text;
			if (conversation === "teacher") return `[A2A channel: teacher]\nRespond as a patient teacher. Explain assumptions and check understanding.\n\n${text}`;
			if (conversation === "chatgpt") return `[A2A channel: chatgpt]\nRespond as an OpenAI assistant.\n\n${text}`;
			return `[A2A channel: claude]\nRespond as a coding assistant for code and computer tasks.\n\n${text}`;
		}
		/**
		* Register the root-scoped sidebar entry and independent application page.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-a2a-assistant: dictionaries");
			const workspace = new WechatAssistantWorkspaceStore();
			if (new URLSearchParams(window.location.search).get("wechatAssistant") === "1") workspace.setOpen(true);
			const settingsScope = ctx.settingsScope.bind({ namespace: A2A_ASSISTANT_SETTINGS_NAMESPACE });
			const { api } = ctx.get("connection");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "wechat-assistant",
				order: 12,
				label: () => ctx.locale.bind(NS)("settings.nav"),
				locale: NS,
				inject: () => ({
					scope: settingsScope,
					api
				})
			}, AssistantSettingsSection));
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "wechat-assistant-beta",
				order: -100,
				locale: NS,
				label: "WeChat Assistant (beta)",
				inject: () => ({ workspace })
			}, WechatAssistantEntry));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "wechat-assistant-workspace",
				order: 10,
				locale: NS,
				inject: () => ({
					workspace,
					settings: settingsScope,
					resolveSession: (sessionId) => sessionId === void 0 ? void 0 : ctx.sessions.binding(sessionId)?.session,
					send: async (sessionId, conversation, text) => {
						if (sessionId === void 0) return ctx.locale.bind(NS)("status.noSessionError");
						const session = ctx.sessions.binding(sessionId)?.session;
						if (session === void 0) return ctx.locale.bind(NS)("status.noSessionError");
						const result = await session.prompt([{
							type: "text",
							text: promptFor(conversation, text)
						}], "queue");
						return result.ok ? null : `${result.error.message} (${result.error.code})`;
					}
				})
			}, WechatAssistantWorkspace));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map