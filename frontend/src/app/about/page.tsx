'use client'

export default function AboutPage() {
  return (
    <div className="container-main py-10 space-y-10">
      <header className="max-w-3xl">
        <h1 className="heading-lg mb-3">About CodeBounty</h1>
        <p className="text-gray-400 leading-relaxed">
          CodeBounty transforms open source collaboration with trustless bounties.
          Fund GitHub issues, verify merges, and reward contributors—all powered by
          Soroban smart contracts on Stellar&apos;s Futurenet.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: '🔒',
            title: 'Trustless Escrow',
            desc: 'Funds are locked in a Soroban contract, not held by a middleman.',
          },
          {
            icon: '⚡',
            title: 'Instant Payout',
            desc: 'When a linked pull request merges, payment releases automatically.',
          },
          {
            icon: '🌐',
            title: 'Open Source',
            desc: 'Built for the community, verifiable on-chain and on GitHub.',
          },
        ].map(s => (
          <div key={s.title} className="glass-card p-6 animate-fade-in-up">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-gray-400">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="glass-card p-8 max-w-3xl">
        <h2 className="heading-md mb-3">How it works</h2>
        <ol className="space-y-3 text-sm text-gray-400 list-decimal list-inside">
          <li>Open a GitHub issue describing the bug or feature.</li>
          <li>Fund the bounty—funds lock in a Stellar smart contract escrow.</li>
          <li>Contributors submit pull requests linked to the issue.</li>
          <li>Funds release instantly when the PR is merged and verified.</li>
        </ol>
      </section>
    </div>
  )
}
