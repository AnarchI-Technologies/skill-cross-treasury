# cross-treasury

CROSS Mainnet treasury planning and guarded allocation skill.

This skill is the policy layer that coordinates CROSS earned by agents, games, or wallets. It reads wallet state, checks risk gates, computes a deterministic allocation plan, and can optionally route confirmed actions through sibling CROSS skills.

Default policy:

- Keep 10% liquid for gas, future actions, and emergency reserve.
- Allocate 45% toward native CROSS staking through `cross-stake`.
- Allocate 45% toward Forge agent-token or LP strategy through `cross-forge` and/or `cross-dex-trade`.

Writes are disabled by default. Execution requires `CROSS_TREASURY_ENABLE_WRITES=true`, a valid `PRIVATE_KEY`, `--execute`, and `--confirm`.

## Install

```bash
git clone https://github.com/AnarchI-Technologies/skill-cross-treasury.git
cd skill-cross-treasury
./install.sh
```

## Read-Only Commands

```bash
node skills/cross-treasury/scripts/status.mjs 0x0000000000000000000000000000000000000000
node skills/cross-treasury/scripts/risk.mjs 0x0000000000000000000000000000000000000000
node skills/cross-treasury/scripts/plan.mjs 0x0000000000000000000000000000000000000000
```

## Publish Ethos

AnarchI Technologies releases this free for everyone. The goal is a transparent community skill that helps CROSS agents manage funds without hiding strategy-critical safety checks or asking users to trust opaque automation.
