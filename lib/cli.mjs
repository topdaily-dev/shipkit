import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildChangelogSection,
  formatReleaseNotes,
} from "./changelog.mjs";
import { getCommitsSince, getLatestTag } from "./git.mjs";
import {
  formatPreflightReport,
  preflightPassed,
  runPreflight,
} from "./preflight.mjs";
import { readPackageJson } from "./package-json.mjs";
import { runPublish, runRelease } from "./release.mjs";
import { flagBool, flagString, parseFlags } from "./flags.mjs";

const HELP = `shipkit — safe OSS release workflow

Usage:
  shipkit preflight [--allow-dirty] [--skip-tests]
  shipkit changelog [--since TAG]
  shipkit release [--patch|--minor|--major] [--version X.Y.Z] [--dry-run] [--allow-dirty] [--skip-tests]
  shipkit publish [--dry-run] [--yes]
  shipkit ship [--patch|--minor|--major] [--version X.Y.Z] [--allow-dirty] [--skip-tests]

Commands:
  preflight   Run release readiness checks
  changelog   Preview changelog from commits since last tag
  release     Bump version, update CHANGELOG, tag, and create GitHub release
  publish     npm publish (dry-run by default)
  ship        release + publish in one flow

Examples:
  shipkit preflight
  shipkit release --minor --dry-run
  shipkit release --patch
  shipkit publish --yes
  shipkit ship --minor --yes
`;

/**
 * @param {string[]} argv
 */
export async function runCli(argv) {
  const [command, ...rest] = argv;
  const cwd = process.cwd();

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  const { options } = parseFlags(rest);

  switch (command) {
    case "preflight": {
      const results = await runPreflight(cwd, {
        allowDirty: flagBool(options, "allow-dirty"),
        skipTests: flagBool(options, "skip-tests"),
        requireGh: false,
      });
      console.log(formatPreflightReport(results));
      if (!preflightPassed(results)) {
        throw new Error("Preflight failed");
      }
      return;
    }
    case "changelog": {
      const since = flagString(options, "since") ?? (await getLatestTag(cwd));
      const commits = await getCommitsSince(since ?? "", cwd);
      const pkg = await readPackageJson(cwd);
      const section = buildChangelogSection(commits);
      const version = pkg.version ?? "0.0.0";
      const date = new Date().toISOString().slice(0, 10);
      console.log(formatReleaseNotes(version, section || "- No commits", date));
      return;
    }
    case "release": {
      const bump = resolveBump(options);
      const result = await runRelease(cwd, {
        bump,
        version: flagString(options, "version"),
        allowDirty: flagBool(options, "allow-dirty"),
        skipTests: flagBool(options, "skip-tests"),
        dryRun: flagBool(options, "dry-run"),
      });
      printReleaseResult(result);
      return;
    }
    case "publish": {
      const dryRun = !flagBool(options, "yes");
      const result = await runPublish(cwd, { dryRun });
      console.log(result.dryRun ? "npm publish dry-run complete" : "Published to npm");
      return;
    }
    case "ship": {
      const bump = resolveBump(options);
      const release = await runRelease(cwd, {
        bump,
        version: flagString(options, "version"),
        allowDirty: flagBool(options, "allow-dirty"),
        skipTests: flagBool(options, "skip-tests"),
        dryRun: false,
      });
      printReleaseResult(release);
      if (!flagBool(options, "yes")) {
        console.log("\nRun `shipkit publish --yes` to publish to npm.");
        return;
      }
      await runPublish(cwd, { dryRun: false, skipTests: true });
      console.log("Published to npm");
      return;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

/**
 * @param {Record<string, string | boolean>} options
 */
function resolveBump(options) {
  if (flagBool(options, "major")) {
    return "major";
  }
  if (flagBool(options, "minor")) {
    return "minor";
  }
  return "patch";
}

/**
 * @param {{ dryRun: boolean; currentVersion?: string; nextVersion: string; tag: string; releaseNotes: string; commits: number }} result
 */
function printReleaseResult(result) {
  if (result.dryRun) {
    console.log(`Dry run: ${result.currentVersion} -> ${result.nextVersion} (${result.tag})`);
    console.log(`Commits: ${result.commits}`);
    console.log("\n" + result.releaseNotes);
    return;
  }
  console.log(`Released ${result.tag} (${result.commits} commits)`);
}
