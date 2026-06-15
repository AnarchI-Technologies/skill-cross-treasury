---
name: cross-treasury
description: CROSS Mainnet treasury policy and guarded allocation skill. Use when the user asks to inspect, plan, rebalance, allocate, or risk-check CROSS funds across liquid reserve, native staking, Forge agent-token exposure, GameToken LP, rewards pools, or multi-agent wallet treasuries on CROSS Chain 612055. Triggers include "CROSS treasury", "allocate earned CROSS", "rebalance agent funds", "stake part and buy agent token", "keep gas reserve", "agent treasury policy", "profit routing", and "CROSS risk preflight".
---

# cross-treasury

Use this skill as the treasury policy layer for CROSS Mainnet. It plans and gates fund movement; it does not duplicate protocol-specific drivers already owned by `cross-stake`, `cross-forge`, `cross-dex-trade`, or `cross-rewards`.

## Operating Rules

- Start with read-only commands: `status`, `risk`, then `plan`.
- Treat `plan` output as the source of truth for suggested actions.
- Execute only when the user explicitly asks to execute and all gates pass.
- Never print private keys, mnemonics, API keys, or raw `.env` contents.
- For writes, require `CROSS_TREASURY_ENABLE_WRITES=true`, `PRIVATE_KEY`, `--execute`, and `--confirm`.
- Keep at least `MIN_GAS_NATIVE_CROSS` and the configured reserve percentage liquid.
- Refuse any single action above `MAX_TREASURY_ACTION_CROSS`.
- Use chain id `612055` only.

## Commands

Run commands from `skills/cross-treasury`.

```bash
node scripts/status.mjs <0xTreasury>
node scripts/risk.mjs <0xTreasury>
node scripts/plan.mjs <0xTreasury>
node scripts/simulate.mjs <nativeCROSS>
node scripts/rebalance.mjs <0xTreasury> --dry-run
node scripts/rebalance.mjs <0xTreasury> --execute --confirm
```

If `<0xTreasury>` is omitted, scripts use `TREASURY_ADDRESS`, then the address derived from `PRIVATE_KEY`.

## Default Policy

See `references/policy.md` when changing strategy assumptions.

Default split of deployable CROSS after gas floor:

- 10% liquid reserve.
- 45% native CROSS staking through `cross-stake`.
- 45% Forge agent-token or LP allocation through `cross-forge` and/or `cross-dex-trade`.

## Output Contract

Every script emits exactly one JSON object on stdout. Failures exit non-zero and print a concise error to stderr.

Important fields:

- `ok`: boolean.
- `address`: treasury address.
- `chainId`: observed chain.
- `blockNumber`: observed block.
- `gates`: pass/fail risk gates.
- `plan`: deterministic allocation plan.
- `actions`: ordered proposed or executed actions.
- `blocked`: reasons execution cannot proceed.

## Execution Strategy

`rebalance` composes sibling skills instead of embedding their protocol calls:

- Native staking: `../skill-cross-stake/skills/cross-stake/scripts/delegate.mjs`.
- Forge token buys: `../skill-cross-forge/skills/cross-forge/scripts/buy.mjs`.
- GameToken LP deposits: `../skill-cross-dex-trade/skills/cross-dex-trade/scripts/trade.mjs deposit`.

If a sibling skill is missing, execution must block with a clear reason. Planning may still continue and report the missing driver.
