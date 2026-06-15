#!/usr/bin/env node
import { formatEther, parseEther } from 'viem';
import { fileURLToPath } from 'node:url';
import { addressFromEnvOrArg, nativeSnapshot } from './_chain.mjs';
import { policy } from './_config.mjs';
import { out, handleMain } from './_json.mjs';
import { siblingReport } from './_sibling.mjs';

function pctOfWei(amount, pct) {
  return (amount * BigInt(Math.round(pct * 100))) / 10000n;
}

function action(kind, amountWei, status, reason = null, target = null) {
  const finalStatus = amountWei === 0n ? 'no-op' : status;
  return {
    kind,
    amountCROSS: formatEther(amountWei),
    amountWei: amountWei.toString(),
    status: finalStatus,
    reason: finalStatus === 'no-op' ? 'zero deployable amount' : reason,
    target,
  };
}

export async function buildPlan(address) {
  const cfg = policy();
  const snap = await nativeSnapshot(address);
  const siblings = siblingReport();
  const minGasWei = parseEther(String(cfg.minGasNativeCROSS));
  const maxActionWei = parseEther(String(cfg.maxActionCROSS));
  const blocked = [];
  const deployableWei = snap.nativeWei > minGasWei ? snap.nativeWei - minGasWei : 0n;

  if (deployableWei <= 0n) blocked.push(`native balance does not exceed gas floor ${cfg.minGasNativeCROSS} CROSS`);

  const liquidWei = pctOfWei(deployableWei, cfg.liquidReservePct);
  const stakeWei = pctOfWei(deployableWei, cfg.nativeStakePct);
  const agentWei = deployableWei - liquidWei - stakeWei;

  const stakeDriver = siblings.find((s) => s.name === 'cross-stake');
  const forgeDriver = siblings.find((s) => s.name === 'cross-forge');
  const dexDriver = siblings.find((s) => s.name === 'cross-dex-trade');
  const agentTarget = cfg.agentLpSymbol || cfg.agentTokenSymbol || cfg.agentTokenAddress;
  const agentDriverPresent = forgeDriver?.exists || dexDriver?.exists;
  const agentStatus = !agentTarget ? 'blocked' : agentDriverPresent ? 'planned' : 'blocked';
  const agentReason = !agentTarget
    ? 'AGENT_TOKEN_SYMBOL, AGENT_TOKEN_ADDRESS, or AGENT_LP_SYMBOL is required'
    : agentDriverPresent
      ? null
      : 'missing cross-forge/cross-dex-trade sibling skill';

  const actions = [
    action('hold-liquid-reserve', liquidWei, 'planned', null, 'wallet'),
    action(
      'native-stake',
      stakeWei,
      stakeDriver?.exists ? 'planned' : 'blocked',
      stakeDriver?.exists ? null : 'missing cross-stake sibling skill',
      'cross-stake'
    ),
    action(
      cfg.agentLpSymbol ? 'agent-token-or-lp-allocation' : 'agent-token-or-lp-allocation',
      agentWei,
      agentStatus,
      agentReason,
      agentTarget || 'unconfigured-agent-token'
    ),
  ];

  for (const item of actions) {
    if (item.status !== 'no-op' && BigInt(item.amountWei) > maxActionWei && item.kind !== 'hold-liquid-reserve') {
      item.status = 'blocked';
      item.reason = `amount exceeds MAX_TREASURY_ACTION_CROSS=${cfg.maxActionCROSS}`;
    }
  }

  blocked.push(...actions.filter((a) => a.status === 'blocked' && BigInt(a.amountWei) > 0n).map((a) => `${a.kind}: ${a.reason}`));

  return {
    ok: blocked.length === 0,
    skill: 'cross-treasury',
    command: 'plan',
    address,
    chainId: snap.chainId,
    blockNumber: snap.blockNumber,
    balances: {
      nativeCROSS: snap.nativeCROSS,
      gasFloorCROSS: String(cfg.minGasNativeCROSS),
      deployableCROSS: formatEther(deployableWei),
    },
    policy: cfg,
    siblingSkills: siblings,
    plan: {
      liquidReserveCROSS: formatEther(liquidWei),
      nativeStakeCROSS: formatEther(stakeWei),
      agentTokenLpCROSS: formatEther(agentWei),
    },
    actions,
    blocked: blocked.filter(Boolean),
  };
}

async function main() {
  const address = addressFromEnvOrArg(process.argv[2]);
  out(await buildPlan(address));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  handleMain(main());
}
