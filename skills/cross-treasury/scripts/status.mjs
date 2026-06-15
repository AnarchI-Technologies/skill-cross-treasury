#!/usr/bin/env node
import { addressFromEnvOrArg, explorerAddress, nativeSnapshot } from './_chain.mjs';
import { policy } from './_config.mjs';
import { out, handleMain } from './_json.mjs';
import { siblingReport } from './_sibling.mjs';

async function main() {
  const address = addressFromEnvOrArg(process.argv[2]);
  const snap = await nativeSnapshot(address);
  out({
    ok: true,
    skill: 'cross-treasury',
    command: 'status',
    address,
    explorer: explorerAddress(address),
    chainId: snap.chainId,
    blockNumber: snap.blockNumber,
    balances: {
      nativeCROSS: snap.nativeCROSS,
      nativeWei: snap.nativeWei.toString(),
    },
    policy: policy(),
    siblingSkills: siblingReport(),
  });
}

handleMain(main());
