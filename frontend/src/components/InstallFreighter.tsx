'use client'

interface Props {
  className?: string
}

const FREIGHTER_INSTALL_URL = 'https://freighter.app'

export function InstallFreighter({ className = '' }: Props) {
  return (
    <div className={`glass-card p-8 animate-fade-in-up ${className}`}>
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-teal-400/10 border border-teal-300/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">Freighter not installed</h3>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Freighter is a Stellar wallet browser extension. Install it to connect
            your wallet and start funding bounties.
          </p>
        </div>
        <a
          href={FREIGHTER_INSTALL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-sm inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Install Freighter
        </a>
      </div>
    </div>
  )
}
