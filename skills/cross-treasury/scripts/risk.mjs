#!/usr/bin/env node
import { parseEther } from 'viem';
import { addressFromEnvOrArg, nativeSnapshot } from './_chain.mjs';
import { policy } from './_config.mjs';
import { out, handleMain } from './_json.mjs';
import { siblingReport } from './_sibling.mjs';

function gate(name, pass, detail) {
  return { name, pass, detail };
}

async function main() {
  const address = addressFromEnvOrArg(process.argv[2]);
  const cfg = policy();
  const snap = await nativeSnapshot(address);
  const siblings = siblingReport();
  const minGasWei = parseEther(String(cfg.minGasNativeCROSS));
  const maxActionWei = parseEther(String(cfg.maxActionCROSS));
  const gates = [
    gate('chain-id', snap.chainId === 612055, `observed ${snap.chainId}`),
    gate('gas-floor', snap.nativeWei >= minGasWei, `${snap.nativeCROSS} CROSS available; min ${cfg.minGasNativeCROSS}`),
    gate('stake-driver-present', siblings.find((s) => s.name === 'cross-stake')?.exists === true, 'native staking driver availability'),
    gate('forge-driver-present', siblings.find((s) => s.name === 'cross-forge')?.exists === true, 'Forge driver availability'),
    gate('dex-driver-present', siblings.find((s) => s.name === 'cross-dex-trade')?.exists === true, 'GameToken LP driver availability'),
    gate('max-action-positive', maxActionWei > 0n, `max action ${cfg.maxActionCROSS} CROSS`),
  ];
  out({
    ok: gates.every((g) => g.pass),
    skill: 'cross-treasury',
    command: 'risk',
    address,
    chainId: snap.chainId,
    blockNumber: snap.blockNumber,
    nativeCROSS: snap.nativeCROSS,
    gates,
    blocked: gates.filter((g) => !g.pass).map((g) => `${g.name}: ${g.detail}`),
  });
}

handleMain(main());
