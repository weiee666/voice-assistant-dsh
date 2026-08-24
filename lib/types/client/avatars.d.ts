/** Avatar roles retained from the original WeChat assistant dashboard. */
export type AvatarRole = 'user' | 'bot' | 'teacher' | 'claude' | 'chatgpt' | 'peer_bot';
/** Render one original dashboard avatar with its stable role seed. */
export declare function Avatar({ role, size }: {
    readonly role: AvatarRole;
    readonly size?: number;
}): import("react").JSX.Element;
//# sourceMappingURL=avatars.d.ts.map