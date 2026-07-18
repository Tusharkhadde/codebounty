# CodeBounty agent operating guide

Autonomous changes must stay small, reversible, and scoped to the current task.

1. Inspect the affected component, its tests, and environment template before editing.
2. Never invent on-chain data, contract addresses, deployments, or completed transactions. Empty and clearly labelled states are preferred until a real indexer is configured.
3. Preserve the dark Stellar theme: use the tokens in `frontend/src/app/globals.css`, maintain keyboard access and reduced-motion support, and keep layouts responsive from 375px upwards.
4. For frontend changes, run `npm run lint`, `npm run test`, and `npm run build` in `frontend` before handoff.
5. For relay changes, run its lint, tests, and build. For contracts, run workspace tests and the WASM build.
6. Never add credentials to files or logs. Deployments require configured GitHub environments and secrets; package or validate instead of faking deployment output.
7. Report changed files, commands run, results, and any remaining deployment configuration required from the maintainer.
