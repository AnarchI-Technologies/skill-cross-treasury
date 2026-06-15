# cross-treasury

AnarchI Technologies (TM) CROSS Mainnet treasury planning and guarded allocation skill.

Hardcoding freedom into the systems of tomorrow.

## Purpose

Coordinates CROSS earned by agents, games, or wallets. It reads wallet state, applies deterministic policy, checks risk gates, and produces allocation plans across liquid reserve, native staking, and Forge agent-token or LP exposure.

## Use Cases

- Plan how autonomous agents route earned CROSS.
- Preserve gas and emergency reserves before yield actions.
- Split deployable capital between native staking and agent-token or LP exposure.
- Dry-run rebalance plans before permitting writes.
- Provide a policy core for game agents, treasuries, and dashboards.

## Setup

~~~bash
git clone https://github.com/AnarchI-Technologies/skill-cross-treasury.git
cd skill-cross-treasury
./install.sh
~~~

The installer symlinks skills/cross-treasury into ~/.claude/skills/cross-treasury and installs the package dependencies.

## Common Commands

~~~bash
cd skills/cross-treasury
node scripts/status.mjs <0xTreasury>
node scripts/risk.mjs <0xTreasury>
node scripts/plan.mjs <0xTreasury>
node scripts/simulate.mjs 100
node scripts/rebalance.mjs <0xTreasury> --dry-run
node scripts/rebalance.mjs <0xTreasury> --execute --confirm
~~~

## Configuration

- TREASURY_ADDRESS: default treasury wallet.
- PRIVATE_KEY: required only for guarded writes.
- CROSS_SKILLS_ROOT: shared parent folder containing sibling skills.
- TREASURY_LIQUID_RESERVE_PCT, TREASURY_NATIVE_STAKE_PCT, TREASURY_AGENT_TOKEN_LP_PCT: allocation policy.
- MIN_GAS_NATIVE_CROSS, MAX_TREASURY_ACTION_CROSS, CONFIRM_THRESHOLD_CROSS: safety rails.
- AGENT_TOKEN_SYMBOL, AGENT_TOKEN_ADDRESS, AGENT_LP_SYMBOL: optional agent-token or LP targets.
- CROSS_TREASURY_ENABLE_WRITES: explicit write gate.

## Alternative Configurations

- Read-only planning: omit PRIVATE_KEY and use status, risk, plan, and simulate only.
- Conservative operations: increase liquid reserve and lower max action size.
- Growth mode: increase agent-token or LP allocation only after risk checks.
- Multi-agent treasury: combine with cross-game-agent-wallet for role-safe spending.

## Validation

~~~bash
npm run check
npm run smoke:read
~~~

Run the skill validator after documentation or frontmatter changes:

~~~bash
python C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\Administrator\Desktop\cross-skills\skill-cross-treasury\skills\cross-treasury
~~~

## Trademark Notice

AnarchI Technologies (TM) and the phrase "Hardcoding freedom into the systems of tomorrow" are used as source-identifying marks of AnarchI Technologies. This project is not an official to-nexus package unless and until the upstream team adopts it.

## License

Apache License 2.0. See LICENSE and NOTICE.md.
