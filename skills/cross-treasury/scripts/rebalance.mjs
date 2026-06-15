#!/usr/bin/env node
import { join } from 'node:path';
import { addressFromEnvOrArg } from './_chain.mjs';
import { policy } from './_config.mjs';
import { out, handleMain, fail } from './_json.mjs';
import { buildPlan } from './plan.mjs';
import { siblingSkill, runNode } from './_sibling.mjs';

function parseFlags(argv) {
  return {
    execute: argv.includes('--execute'),
    confirm: argv.includes('--confirm'),
    dryRun: argv.includes('--dry-run') || !argv.includes('--execute'),
  };
}

async function executeAction(item) {
  if (item.kind === 'native-stake') {
    const stake = siblingSkill('cross-stake');
    if (!stake.exists) fail('missing cross-stake sibling skill');
    const script = join(stake.path, 'scripts', 'delegate.mjs');
    return runNode(script, [item.amountCROSS, '--confirm'], {
      env: {
        MAX_STAKE_NOTIONAL: process.env.MAX_STAKE_NOTIONAL || process.env.MAX_TREASURY_ACTION_CROSS || '100',
        CONFIRM_THRESHOLD: process.env.CONFIRM_THRESHOLD || process.env.CONFIRM_THRESHOLD_CROSS || '1',
      },
    });
  }
  fail(`execution not implemented for action ${item.kind}`);
}

async function main() {
  const maybeAddress = process.argv.find((arg, index) => index > 1 && !arg.startsWith('--'));
  const address = addressFromEnvOrArg(maybeAddress);
  const flags = parseFlags(process.argv.slice(2));
  const cfg = policy();
  const plan = await buildPlan(address);

  if (flags.dryRun) {
    out({ ...plan, command: 'rebalance', mode: 'dry-run', note: 'No transactions submitted.' });
    return;
  }

  const blockers = [...plan.blocked];
  if (!cfg.writesEnabled) blockers.push('CROSS_TREASURY_ENABLE_WRITES is not true');
  if (!process.env.PRIVATE_KEY) blockers.push('PRIVATE_KEY is not set');
  if (!flags.execute) blockers.push('--execute is required');
  if (!flags.confirm) blockers.push('--confirm is required');
  if (blockers.length) {
    out({ ...plan, command: 'rebalance', mode: 'blocked', blocked: blockers });
    return;
  }

  const executable = plan.actions.filter((a) => a.status === 'planned' && a.kind === 'native-stake' && Number(a.amountCROSS) > 0);
  const results = [];
  for (const item of executable) {
    const result = await executeAction(item);
    results.push({ action: item, stdout: result.stdout.trim(), stderr: result.stderr.trim() || null });
  }
  out({ ...plan, command: 'rebalance', mode: 'executed', results });
}

handleMain(main());
