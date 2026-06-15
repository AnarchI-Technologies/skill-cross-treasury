import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(here, '..');
const repoDir = resolve(skillDir, '..', '..');

export function crossSkillsRoot() {
  return process.env.CROSS_SKILLS_ROOT
    ? resolve(process.env.CROSS_SKILLS_ROOT)
    : resolve(repoDir, '..');
}

export function siblingSkill(name) {
  const root = crossSkillsRoot();
  const path = join(root, `skill-${name}`, 'skills', name);
  return {
    name,
    path,
    exists: existsSync(path),
  };
}

export function siblingReport() {
  return [
    siblingSkill('cross-stake'),
    siblingSkill('cross-forge'),
    siblingSkill('cross-dex-trade'),
    siblingSkill('cross-rewards'),
  ];
}

export function runNode(script, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: dirname(script),
      env: { ...process.env, ...(options.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(`child command failed (${code}): ${script}`);
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
        return;
      }
      resolvePromise({ stdout, stderr });
    });
  });
}
