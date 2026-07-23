import type { Bounty } from '@/types'

export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 101,
    issue_url: 'https://github.com/stellar/soroban-cli/issues/412',
    creator: 'GBSK3XQZ776WNX3X2QG327PYR67E36WJ6J3N7C2F5S4L4X4L4X4L4X4L',
    amount: 1500,
    token: 'XLM',
    deadline: Math.floor(Date.now() / 1000) + 14 * 86400,
    status: 'funded',
    linked_pr_url: null,
    contributor: null,
    funded_at: Math.floor(Date.now() / 1000) - 86400 * 2,
    paid_at: 0,
  },
  {
    id: 102,
    issue_url: 'https://github.com/stellar/js-stellar-sdk/issues/1280',
    creator: 'GAMK7YQZ446WNX3X2QG327PYR67E36WJ6J3N7C2F5S4L4X4L4X4L4X4L',
    amount: 500,
    token: 'USDC',
    deadline: Math.floor(Date.now() / 1000) + 21 * 86400,
    status: 'linked',
    linked_pr_url: 'https://github.com/stellar/js-stellar-sdk/pull/1289',
    contributor: 'GCONTRIBUTOR888888888888888888888888888888888888',
    funded_at: Math.floor(Date.now() / 1000) - 86400 * 5,
    paid_at: 0,
  },
  {
    id: 103,
    issue_url: 'https://github.com/stellar/rs-soroban-sdk/issues/890',
    creator: 'GBPL7YQZ996WNX3X2QG327PYR67E36WJ6J3N7C2F5S4L4X4L4X4L4X4L',
    amount: 3000,
    token: 'XLM',
    deadline: Math.floor(Date.now() / 1000) + 30 * 86400,
    status: 'funded',
    linked_pr_url: null,
    contributor: null,
    funded_at: Math.floor(Date.now() / 1000) - 86400,
    paid_at: 0,
  }
]

const BOUNTIES_STORE: Bounty[] = [...INITIAL_BOUNTIES]

export { BOUNTIES_STORE }