# @deepseek-ai/dsh-client-ui-a2a-assistant

[English](README.md) | 中文

这个仓库把 Voice Assistant DSH 做成 DeepSeek Harness 的外部 bundle 插件。GitHub 仓库名是 `voice-assistant-dsh`；第一版拆包会暂时保留内部包名 `@deepseek-ai/dsh-client-ui-a2a-assistant`，这样可以复用当前已经构建并验证过的浏览器 bundle，不需要先解决外部构建链。

安装到本机 Harness web profile：

```sh
dsh plugin --profile web add github:weiee666/voice-assistant-dsh
dsh web --no-open
```

GitHub 更新后升级插件：

```sh
dsh plugin --profile web update @deepseek-ai/dsh-client-ui-a2a-assistant
dsh web --no-open
```

添加或更新 bundle 后需要重启 web profile。Vercel 指向 `apps/public-dashboard`；它先负责公网入口页，后续再承载 relay。本地文件、模型凭据、Telegram polling 和 Agent 执行仍由本机 Harness Host 负责。

这个浏览器插件在 Harness 侧栏的“设置”上方增加 `微信助手（beta）` 操作。点击后，应用级工作区覆盖中间会话列与右侧详情列，同时保留 Harness 全局侧栏。该页面不属于所选 Session 的“对话／轨迹”页签；选择侧栏里的其他目标会关闭微信助手。

工作区迁移原 `wechat-Agent-helper` 看板的展示设计，包括固定的 DiceBear 头像种子、角色配色、分组会话列表、参与者头像组、左右消息气泡、连接状态、桌面分栏和手机端“列表到聊天”切换。首批会话为“我和秘书”“老师 Agent”“Claude”和“ChatGPT”。在 Host A2A 目录提供真实 pair 前，Agent 对话分组明确保持空状态。

当前兼容传输把消息发送到选中的 Harness Session。秘书文本保持不变；老师和 Claude 会增加可见的角色路由前缀。该传输不宣称角色具有独立 Agent 身份、历史、工具或权限。展示消息统一保存在一个浏览器本地工作区键下，模型可见内容仍以 Harness 事件为权威记录。

秘书会话头部保留兼容模式语音电话。浏览器语音识别文本会在统一的语音停顿判定时间后进入 Harness 普通消息路径；临时识别状态保留在通话条中，只有最终用户文本进入聊天流。通话期间，完成的助手文本会经 Harness Host 发送到 MiniMax 文字转语音服务朗读。暂停按钮只停止麦克风收音，不会请求回复。这是“转写 + 文字转语音”，不是原生语音到语音模型。MiniMax `speech-2.8-turbo` 使用国内 `https://api.minimaxi.com/v1` 端点，并读取只写的 `MINIMAX_API_KEY` 凭据。

ChatGPT 使用独立的 OpenAI Realtime WebRTC 通话。Harness Host 解析 `OPENAI_API_KEY` 并签发短期 Realtime 凭据，浏览器使用该临时凭据把原始 SDP offer 直接发送到 `/v1/realtime/calls`；已保存的 API key 不会到达浏览器。随后麦克风音频和模型音频通过 WebRTC 传输。页面中长期挂载的原生音频元素负责默认播放远端媒体流，独立分析器只观察同一条流，不承担输出；转写事件独立更新字幕，不会取代音频播放。浏览器采集明确请求回声消除、降噪和自动增益；服务端自动打断关闭，并在远端播放开始到播放结束之间停止麦克风发送，避免扬声器输出被误判为新的用户发言。因此第一版可靠播放模式不支持在 ChatGPT 说话时用语音插话。通话期间，输入增量转写在用户侧气泡中逐步增长，输出增量转写在 Agent 侧气泡中逐步增长，完成后的转写保留为普通会话消息。统一的语音停顿判定时间会同时用于 ChatGPT Realtime 服务端 VAD 和秘书语音电话；通话状态条可以暂停麦克风且不请求回复，再次点击则恢复聆听且不关闭连接。只有顶部“挂断”会结束通话。通话期间发送的文字也进入同一个 Realtime 上下文。可配置默认值为 `gpt-realtime-2.1`、`marin` 音色、用于输入转写的 `gpt-4o-mini-transcribe`，以及 2,800 毫秒的统一语音停顿判定。

“设置”中包含独立的“微信助手”页面。API key 输入框只写不读，仅显示是否已配置，并通过 Harness 凭据域保存，不会读取已保存的原值。同一页面可修改 Realtime 模型、音色、转录模型、系统提示词、统一语音停顿判定时间和 MiniMax 朗读选项；这些设置实时生效，下一通电话或朗读请求会直接使用，无需重启 Harness。

同一个设置页包含公网看板与通道 Bridge 设置。`publicDashboardUrl` 指向承载远程微信助手页面的 Vercel 部署；Telegram 中发送“看板”、`dashboard` 或 `/dashboard` 时，秘书会返回这个地址，未配置时会提示先填写公网看板地址。`bridgeDeviceName` 与 `bridgePollIntervalMs` 标识本机 Harness Bridge。`telegramBotTokenEnv` 是 Telegram Bot API polling 使用的只写凭据引用，`telegramAllowedUserIds` 限定哪些 Telegram 账号可以进入秘书会话。

Telegram 秘书桥已在 Host 侧启动。本机 Harness 会主动 polling Telegram Bot API，所以不需要 Telegram 从公网访问本机 3080。普通 Telegram 文字会进入“秘书”会话并出现在看板；当前看板会把这条消息送入所选 Harness Session，收到 Harness 助手回复后再通过 Telegram Bot 发回同一个 chat。这个 MVP 仍复用当前选中的 Session，独立的每用户秘书 Session 和公网 relay 队列会在后续版本补上。

Vercel 部署配置在仓库根目录的 `vercel.json`，会构建 `apps/public-dashboard` 并输出 `apps/public-dashboard/dist`。Vercel 不能直接把你本机的 `127.0.0.1:3080` 变成公网服务；它只能承载公网前端或 relay。需要远程页面控制本机时，本机 DSH 仍要在线，并由本机插件主动轮询 relay 或 Telegram。

## 模型体验

### 兼容路由

#### 模型看到的内容

秘书消息保持不变。老师与 Claude 消息以简短的 `[A2A channel: ...]` 指令开头，后接用户原文。

#### Token 影响

秘书消息不增加 token。老师与 Claude 的每条消息增加一段固定路由前缀。

#### KV Cache 影响

前缀随新用户消息追加，不修改此前请求内容。

## 已知限制与暂缓事项

- **命名会话仍共享所选 Session**：独立 Harness Session 和 Host 助手目录尚未实现。
- **Agent 对话分组刻意为空**：不会用示例 pair 冒充 iLink/A2A 后端已经迁移。
- **秘书语音依赖浏览器和 MiniMax 可用性**：识别质量因浏览器而异，语音播放需要已配置的 MiniMax API key。
- **ChatGPT Live 需要 OpenAI API 计费**：ChatGPT 网页订阅不是 API 凭据；需要在 Harness 设置或凭据来源中配置 `OPENAI_API_KEY`。
- **Realtime 文字需要通话处于连接状态**：第一版把打字和说话保留在同一段 WebRTC 会话中，不另建 REST 对话。
- **Realtime 历史目前保存在浏览器本地**：转写尚未投影为 Harness Session 事件，清除站点数据会删除记录。
- **浏览器消息状态可丢弃**：清除站点数据会删除工作区分组，但不会删除 Harness 日志。
- **公网 relay 尚未实现**：Vercel 入口页已有部署配置，Telegram polling 已在本机 Host 启动；远程页面到本机的 relay 队列仍待实现。
