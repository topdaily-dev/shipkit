import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildChangelogSection,
  formatReleaseNotes,
  prependChangelog,
} from "./changelog.mjs";
import { run } from "./exec.mjs";
import {
  createTag,
  getCommitsSince,
  getLatestTag,
  pushTags,
} from "./git.mjs";
import { preflightPassed, runPreflight } from "./preflight.mjs";
import {
  bumpVersion,
  readPackageJson,
  writePackageJson,
} from "./package-json.mjs";

/**
 * @param {string} cwd
 * @param {{ bump?: "patch" | "minor" | "major"; version?: string; allowDirty?: boolean; skipTests?: boolean; noTag?: boolean; dryRun?: boolean }} opts
 */
export async function runRelease(cwd, opts = {}) {
  const preflight = await runPreflight(cwd, {
    allowDirty: opts.allowDirty,
    skipTests: opts.skipTests,
    requireGh: !opts.dryRun,
  });
  if (!preflightPassed(preflight)) {
    throw new Error("Preflight checks failed. Run `shipkit preflight` for details.");
  }

  const pkg = await readPackageJson(cwd);
  if (!pkg.version) {
    throw new Error("package.json is missing version");
  }

  const bump = opts.bump ?? "patch";
  const nextVersion = opts.version ?? bumpVersion(bump, pkg.version);
  const tag = `v${nextVersion}`;
  const latestTag = await getLatestTag(cwd);
  const commits = await getCommitsSince(latestTag ?? "", cwd);
  const section = buildChangelogSection(commits);
  const date = new Date().toISOString().slice(0, 10);
  const releaseNotes = formatReleaseNotes(nextVersion, section || "- Release", date);

  if (opts.dryRun) {
    return {
      dryRun: true,
      currentVersion: pkg.version,
      nextVersion,
      tag,
      releaseNotes,
      commits: commits.length,
    };
  }

  pkg.version = nextVersion;
  await writePackageJson(cwd, pkg);

  const changelogPath = join(cwd, "CHANGELOG.md");
  let changelog = "# Changelog\n\n## [Unreleased]\n\n";
  try {
    changelog = await readFile(changelogPath, "utf8");
  } catch {
    // create on first release
  }
  await writeFile(changelogPath, prependChangelog(changelog, releaseNotes), "utf8");

  await run("git", ["add", "package.json", "CHANGELOG.md"], { cwd });
  await run("git", ["commit", "-m", `chore: release ${tag}`], { cwd });

  if (!opts.noTag) {
    await createTag(tag, `Release ${tag}`, cwd);
    await pushTags(cwd);
  }

  await run(
    "gh",
    ["release", "create", tag, "--title", tag, "--notes", releaseNotes],
    { cwd },
  );

  return {
    dryRun: false,
    currentVersion: pkg.version,
    nextVersion,
    tag,
    releaseNotes,
    commits: commits.length,
  };
}

/**
 * @param {string} cwd
 * @param {{ dryRun?: boolean; skipTests?: boolean }} opts
 */
export async function runPublish(cwd, opts = {}) {
  const preflight = await runPreflight(cwd, {
    skipTests: opts.skipTests,
    requireGh: false,
  });
  const publishChecks = preflight.filter((check) => check.name !== "CHANGELOG.md");
  if (!publishChecks.every((check) => check.ok)) {
    throw new Error("Preflight checks failed. Run `shipkit preflight` for details.");
  }

  if (opts.dryRun !== false) {
    await run("npm", ["publish", "--dry-run"], { cwd });
    return { dryRun: true };
  }

  await run("npm", ["publish"], { cwd });
  return { dryRun: false };
}
