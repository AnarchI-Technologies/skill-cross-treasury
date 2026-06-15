# cross-treasury policy

This skill is deterministic by default. It turns wallet state into a compact plan and leaves final execution behind explicit gates.

Default allocation after preserving the configured gas floor:

- `TREASURY_LIQUID_RESERVE_PCT=10`
- `TREASURY_NATIVE_STAKE_PCT=45`
- `TREASURY_AGENT_TOKEN_LP_PCT=45`

The liquid reserve is for gas, emergency recovery, and future opportunities. The native stake bucket targets stable CROSS yield. The agent-token/LP bucket targets upside tied to the user's own Forge agent token or selected GameToken LP route.

If LP staking is verified later, prefer:

1. Buy or acquire agent-token/LP exposure.
2. Stake LP only through a verified dedicated skill.
3. Keep the liquid reserve untouched.

If LP staking is unavailable, keep the default 45/45/10 split.

Never infer that a write is safe merely because a plan exists. Re-run risk gates immediately before execution.
