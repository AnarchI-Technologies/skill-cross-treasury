#!/usr/bin/env node
import { formatEther, parseEther } from 'viem';
import { policy } from './_config.mjs';
import { fail, handleMain, out } from './_json.mjs';

function pctOfWei(amount, pct) {
  return (amount * BigInt(Math.round(pct * 100))) / 10000n;
}

async function main() {
  const amount = process.argv[2];
  if (!amount) fail('amount required: node simulate.mjs <nativeCROSS>');
  const cfg = policy();
  const nativeWei = parseEther(amount);
  const minGasWei = parseEther(String(cfg.minGasNativeCROSS));
  const deployableWei = nativeWei > minGasWei ? nativeWei - minGasWei : 0n;
  const liquidWei = pctOfWei(deployableWei, cfg.liquidReservePct);
  const stakeWei = pctOfWei(deployableWei, cfg.nativeStakePct);
  const agentWei = deployableWei - liquidWei - stakeWei;
  out({
    ok: true,
    skill: 'cross-treasury',
    command: 'simulate',
    inputNativeCROSS: amount,
    policy: cfg,
    deployableCROSS: formatEther(deployableWei),
    plan: {
      liquidReserveCROSS: formatEther(liquidWei),
      nativeStakeCROSS: formatEther(stakeWei),
      agentTokenLpCROSS: formatEther(agentWei),
    },
  });
}

handleMain(main());
