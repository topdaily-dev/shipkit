/** @typedef {{ subject: string; hash: string; author: string }} Commit */

/**
 * @param {string} subject
 */
export function classifyCommit(subject) {
  const match = /^(\w+)(?:\(.+?\))?!?:\s+/i.exec(subject);
  if (!match) {
    return "other";
  }
  const type = match[1].toLowerCase();
  if (["feat", "fix", "docs", "chore", "refactor", "test", "perf", "ci", "build"].includes(type)) {
    return type;
  }
  return "other";
}

/**
 * @param {Commit[]} commits
 */
export function buildChangelogSection(commits) {
  /** @type {Record<string, string[]>} */
  const groups = {
    feat: [],
    fix: [],
    docs: [],
    perf: [],
    refactor: [],
    test: [],
    ci: [],
    build: [],
    chore: [],
    other: [],
  };

  for (const commit of commits) {
    const type = classifyCommit(commit.subject);
    const line = `- ${commit.subject} (${commit.hash})`;
    groups[type].push(line);
  }

  const labels = {
    feat: "Added",
    fix: "Fixed",
    docs: "Documentation",
    perf: "Performance",
    refactor: "Changed",
    test: "Tests",
    ci: "CI",
    build: "Build",
    chore: "Chore",
    other: "Other",
  };

  const lines = [];
  for (const [type, label] of Object.entries(labels)) {
    const items = groups[type];
    if (items.length === 0) {
      continue;
    }
    lines.push(`### ${label}`, "", ...items, "");
  }

  return lines.join("\n").trim();
}

/**
 * @param {string} version
 * @param {string} section
 * @param {string} date
 */
export function formatReleaseNotes(version, section, date) {
  return `## [${version}] - ${date}\n\n${section}`;
}

/**
 * @param {string} existing
 * @param {string} releaseBlock
 */
export function prependChangelog(existing, releaseBlock) {
  const unreleasedHeader = "## [Unreleased]";
  if (existing.includes(unreleasedHeader)) {
    const parts = existing.split(unreleasedHeader);
    const tail = parts[1] ?? "";
    return `${parts[0]}${unreleasedHeader}\n\n${releaseBlock}\n${tail}`.replace(/\n{3,}/g, "\n\n");
  }
  return `${releaseBlock}\n\n${existing}`.trimEnd() + "\n";
}
