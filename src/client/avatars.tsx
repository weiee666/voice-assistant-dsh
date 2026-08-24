/** Avatar roles retained from the original WeChat assistant dashboard. */
export type AvatarRole = 'user' | 'bot' | 'teacher' | 'claude' | 'chatgpt' | 'peer_bot'

const AVATAR_URL: Record<AvatarRole, string> = {
  user: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Weibo&backgroundColor=b6e3f4,c0aede&backgroundType=gradientLinear',
  bot: 'https://api.dicebear.com/9.x/shapes/svg?seed=Assistant&backgroundColor=00d6b9,4ecdc4&backgroundType=gradientLinear',
  teacher: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Professor&backgroundColor=c084fc,a78bfa&backgroundType=gradientLinear',
  claude: 'https://api.dicebear.com/9.x/initials/svg?seed=Claude&backgroundColor=D97757&fontWeight=600&textColor=ffffff',
  chatgpt: 'https://api.dicebear.com/9.x/initials/svg?seed=GPT&backgroundColor=10A37F&fontWeight=600&textColor=ffffff',
  peer_bot: 'https://api.dicebear.com/9.x/shapes/svg?seed=Peer&backgroundColor=fca5a5,f87171&backgroundType=gradientLinear',
}

const FALLBACK_BG: Record<AvatarRole, string> = {
  user: '#3370ff',
  bot: '#00a0c4',
  teacher: '#8b5cf6',
  claude: '#d97757',
  chatgpt: '#10a37f',
  peer_bot: '#f87171',
}

/** Render one original dashboard avatar with its stable role seed. */
export function Avatar({ role, size = 32 }: { readonly role: AvatarRole; readonly size?: number }) {
  return (
    <img
      src={AVATAR_URL[role]}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      loading="lazy"
      style={{ width: size, height: size, borderRadius: '50%', display: 'block', objectFit: 'cover', background: FALLBACK_BG[role] }}
    />
  )
}
