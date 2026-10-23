/** Masterspread's logo: a blue shopping bag. */
export function MasterspreadLogo({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <rect width="64" height="64" rx="16" fill="#2f66f0" />
      <path d="M18 24h28l-3 22a4 4 0 0 1-4 3.5H25a4 4 0 0 1-4-3.5z" fill="#fff" />
      <path d="M25 26v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 34h16M24 40h16M32 30v14" stroke="#2f66f0" strokeWidth="2.5" />
    </svg>
  );
}
