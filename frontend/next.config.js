/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS || '',
    NEXT_PUBLIC_MERGE_VERIFIER_ADDRESS: process.env.NEXT_PUBLIC_MERGE_VERIFIER_ADDRESS || '',
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    NEXT_PUBLIC_RELAY_URL: process.env.NEXT_PUBLIC_RELAY_URL || '',
  },
}

module.exports = nextConfig