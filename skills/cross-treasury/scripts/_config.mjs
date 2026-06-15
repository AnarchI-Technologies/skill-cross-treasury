import { parseEther } from 'viem';
import { fail } from './_json.mjs';

export function numberEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name] ?? String(fallback);
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) fail(`${name} must be a number between ${min} and ${max}`);
  return n;
}

export function policy() {
  const liquidReservePct = numberEnv('TREASURY_LIQUID_RESERVE_PCT', 10, { min: 0, max: 100 });
  const nativeStakePct = numberEnv('TREASURY_NATIVE_STAKE_PCT', 45, { min: 0, max: 100 });
  const agentTokenLpPct = numberEnv('TREASURY_AGENT_TOKEN_LP_PCT', 45, { min: 0, max: 100 });
  const pctTotal = liquidReservePct + nativeStakePct + agentTokenLpPct;
  if (pctTotal !== 100) fail(`treasury percentages must total 100, got ${pctTotal}`);
  return {
    liquidReservePct,
    nativeStakePct,
    agentTokenLpPct,
    minGasNativeCROSS: numberEnv('MIN_GAS_NATIVE_CROSS', 5, { min: 0 }),
    maxActionCROSS: numberEnv('MAX_TREASURY_ACTION_CROSS', 100, { min: 0 }),
    confirmThresholdCROSS: numberEnv('CONFIRM_THRESHOLD_CROSS', 1, { min: 0 }),
    agentTokenSymbol: process.env.AGENT_TOKEN_SYMBOL || null,
    agentTokenAddress: process.env.AGENT_TOKEN_ADDRESS || null,
    agentLpSymbol: process.env.AGENT_LP_SYMBOL || process.env.AGENT_TOKEN_SYMBOL || null,
    writesEnabled: String(process.env.CROSS_TREASURY_ENABLE_WRITES || 'false').toLowerCase() === 'true',
  };
}

export function parseCrossAmount(amount) {
  return parseEther(String(amount));
}
