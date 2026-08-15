import { run } from "./exec.mjs";

/**
 * @param {string} [cwd]
 */
export async function getLatestTag(cwd) {
  const result = await run("git", ["describe", "--tags", "--abbrev=0"], {
    cwd,
    allowFail: true,
  });
  if (!result.ok) {
    return null;
  }
  return result.stdout || null;
}

/**
 * @param {string} [cwd]
 */
export async function isWorkingTreeClean(cwd) {
  const result = await run("git", ["status", "--porcelain"], { cwd });
  return result.stdout.length === 0;
}

/**
 * @param {string} [cwd]
 */
export async function getCurrentBranch(cwd) {
  const result = await run("git", ["branch", "--show-current"], { cwd });
  return result.stdout;
}

/**
 * @param {string} fromRef
 * @param {string} [cwd]
 */
export async function getCommitsSince(fromRef, cwd) {
  const range = fromRef ? `${fromRef}..HEAD` : "HEAD";
  const result = await run(
    "git",
    ["log", range, "--pretty=format:%s|||%h|||%an"],
    { cwd },
  );
  if (!result.stdout) {
    return [];
  }
  return result.stdout.split("\n").map((line) => {
    const [subject, hash, author] = line.split("|||");
    return { subject, hash, author };
  });
}

/**
 * @param {string} tag
 * @param {string} message
 * @param {string} [cwd]
 */
export async function createTag(tag, message, cwd) {
  await run("git", ["tag", "-a", tag, "-m", message], { cwd });
}

/**
 * @param {string} [cwd]
 */
export async function pushTags(cwd) {
  await run("git", ["push", "--follow-tags"], { cwd });
}
