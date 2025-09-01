#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

function log(msg) {
  process.stdout.write(msg + '\n');
}

function fail(msg) {
  process.stderr.write(msg + '\n');
  process.exit(1);
}

function getCurrentVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

(function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const typeArg = args.find(a => ['patch','minor','major','prerelease'].includes(a));
  const bumpType = typeArg || process.env.TYPE || 'patch';
  if (!['patch','minor','major','prerelease'].includes(bumpType)) {
    fail(`Type de version invalide: ${bumpType}. Utiliser patch|minor|major|prerelease.`);
  }

  // Git checks
  const status = run('git status --porcelain').trim();
  if (status && !dryRun) fail('Le working tree contient des changements non commités. Commit/sta sh avant release.');

  let branch = 'HEAD';
  try {
    branch = run('git rev-parse --abbrev-ref HEAD').trim();
  } catch {}

  const remote = run('git remote get-url origin').trim();
  const current = getCurrentVersion();

  log(`Release ${bumpType} depuis ${current} (branch: ${branch}, remote: ${remote})${dryRun ? ' [dry-run]' : ''}`);

  const cmds = [
    `npm version ${bumpType} -m "chore(release): %s"`,
    `git push origin ${branch}`,
    'git push origin --tags'
  ];

  if (dryRun) {
    log('Commandes qui seraient exécutées:');
    cmds.forEach(c => log('  ' + c));
    process.exit(0);
  }

  try {
    cmds.forEach(c => {
      log('> ' + c);
      const out = run(c);
      if (out && out.trim()) log(out.trim());
    });
    const newVer = run("node -p \"require('./package.json').version\"").trim();
    log(`Succès: version ${newVer} poussée avec son tag v${newVer}.`);
  } catch (e) {
    fail('Echec de la release: ' + (e.stderr?.toString() || e.message));
  }
})();

