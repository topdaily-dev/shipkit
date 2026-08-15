import { access } from "node:fs/promises";
import { join } from "node:path";

import { commandExists, run } from "./exec.mjs";
import { getCurrentBranch, isWorkingTreeClean } from "./git.mjs";
import { readPackageJson } from "./package-json.mjs";

/**
 * @typedef {{ name: string; ok: boolean; detail: string }} CheckResult
 */

/**
 * @param {string} cwd
 * @param {{ allowDirty?: boolean; skipTests?: boolean; requireGh?: boolean }} opts
 */
export async function runPreflight(cwd, opts = {}) {
  /** @type {CheckResult[]} */
  const results = [];

  const gitOk = await commandExists("git");
  results.push({
    name: "git",
    ok: gitOk,
    detail: gitOk ? "git found" : "git not installed",
  });

  if (gitOk) {
    const clean = await isWorkingTreeClean(cwd);
    const dirtyAllowed = opts.allowDirty === true;
    results.push({
      name: "working tree",
      ok: clean || dirtyAllowed,
      detail: clean
        ? "working tree clean"
        : dirtyAllowed
          ? "working tree dirty (allowed)"
          : "working tree has uncommitted changes",
    });

    const branch = await getCurrentBranch(cwd);
    results.push({
      name: "branch",
      ok: branch.length > 0,
      detail: branch ? `on branch ${branch}` : "detached HEAD",
    });
  }

  let pkg;
  try {
    pkg = await readPackageJson(cwd);
    results.push({
      name: "package.json",
      ok: true,
      detail: `${pkg.name ?? "unnamed"}@${pkg.version ?? "0.0.0"}`,
    });
  } catch {
    results.push({
      name: "package.json",
      ok: false,
      detail: "package.json not found",
    });
  }

  if (!opts.skipTests && pkg?.scripts?.test) {
    const test = await run("npm", ["test"], { cwd, allowFail: true });
    results.push({
      name: "npm test",
      ok: test.ok,
      detail: test.ok ? "tests passed" : "tests failed",
    });
  }

  if (opts.requireGh) {
    const ghOk = await commandExists("gh");
    results.push({
      name: "gh",
      ok: ghOk,
      detail: ghOk ? "GitHub CLI found" : "gh not installed (required for release)",
    });
  }

  try {
    await access(join(cwd, "CHANGELOG.md"));
    results.push({
      name: "CHANGELOG.md",
      ok: true,
      detail: "found",
    });
  } catch {
    results.push({
      name: "CHANGELOG.md",
      ok: false,
      detail: "missing (will be created on release)",
    });
  }

  return results;
}

/**
 * @param {CheckResult[]} results
 */
export function formatPreflightReport(results) {
  const lines = results.map((result) => {
    const icon = result.ok ? "ok" : "FAIL";
    return `[${icon}] ${result.name}: ${result.detail}`;
  });
  return lines.join("\n");
}

/**
 * @param {CheckResult[]} results
 */
export function preflightPassed(results) {
  return results.every((result) => {
    if (result.name === "CHANGELOG.md" && !result.ok) {
      return true;
    }
    return result.ok;
  });
}
