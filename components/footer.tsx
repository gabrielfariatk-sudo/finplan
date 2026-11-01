function LogoMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="footer-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="3" y="22" width="9" height="15" rx="2.5" fill="url(#footer-grad)" />
      <rect x="15.5" y="13" width="9" height="24" rx="2.5" fill="url(#footer-grad)" />
      <rect x="28" y="3" width="9" height="34" rx="2.5" fill="url(#footer-grad)" />
    </svg>
  );
}

const slogans = ["Mais controle", "Mais clareza", "Mais conquistas"];

export default function Footer() {
  return (
    <footer
      className="relative z-20 w-full shrink-0 border-t border-white/10
                 bg-linear-to-r from-[#05010f] via-[#120637] to-[#1a0a5c]
                 px-6 py-3 sm:px-10"
    >
      {/* Linhas + logo */}
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-purple-400" />
        <LogoMark />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-purple-400" />
      </div>

      {/* Lema */}
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-purple-200/90">
        {slogans.map((text, i) => (
          <li key={text} className="flex items-center gap-4">
            {i > 0 && (
              <span
                className="h-1 w-1 rounded-full bg-purple-300/70"
                aria-hidden="true"
              />
            )}
            {text}
          </li>
        ))}
      </ul>
    </footer>
  );
}