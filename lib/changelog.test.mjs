import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildChangelogSection,
  classifyCommit,
  formatReleaseNotes,
  prependChangelog,
} from "./changelog.mjs";
import { flagBool, flagString, parseFlags } from "./flags.mjs";
import { bumpVersion } from "./package-json.mjs";
import { preflightPassed } from "./preflight.mjs";

describe("classifyCommit", () => {
  it("classifies conventional commits", () => {
    assert.equal(classifyCommit("feat: add release command"), "feat");
    assert.equal(classifyCommit("fix(cli): handle dry run"), "fix");
  });

  it("groups unknown commits as other", () => {
    assert.equal(classifyCommit("Release version 1.0"), "other");
  });
});

describe("buildChangelogSection", () => {
  it("groups commits by type", () => {
    const section = buildChangelogSection([
      { subject: "feat: add ship command", hash: "abc1234", author: "dev" },
      { subject: "fix: handle empty changelog", hash: "def5678", author: "dev" },
    ]);
    assert.match(section, /### Added/);
    assert.match(section, /### Fixed/);
    assert.match(section, /abc1234/);
  });
});

describe("formatReleaseNotes", () => {
  it("formats versioned release block", () => {
    const notes = formatReleaseNotes("1.2.3", "- feat: launch", "2026-08-10");
    assert.match(notes, /## \[1\.2\.3\] - 2026-08-10/);
  });
});

describe("prependChangelog", () => {
  it("inserts release after Unreleased header", () => {
    const updated = prependChangelog(
      "# Changelog\n\n## [Unreleased]\n\n### Added\n- wip\n",
      "## [1.0.0] - 2026-08-10\n\n- feat: launch",
    );
    assert.match(updated, /## \[Unreleased\][\s\S]*## \[1\.0\.0\]/);
  });
});

describe("bumpVersion", () => {
  it("bumps patch, minor, and major", () => {
    assert.equal(bumpVersion("patch", "1.2.3"), "1.2.4");
    assert.equal(bumpVersion("minor", "1.2.3"), "1.3.0");
    assert.equal(bumpVersion("major", "1.2.3"), "2.0.0");
  });
});

describe("parseFlags", () => {
  it("parses boolean and string flags", () => {
    const parsed = parseFlags(["release", "--minor", "--dry-run"]);
    assert.equal(parsed.positional[0], "release");
    assert.equal(flagBool(parsed.options, "minor"), true);
    assert.equal(flagBool(parsed.options, "dry-run"), true);
    assert.equal(flagString(parsed.options, "version"), undefined);
  });
});

describe("preflightPassed", () => {
  it("allows missing changelog", () => {
    const passed = preflightPassed([
      { name: "git", ok: true, detail: "" },
      { name: "CHANGELOG.md", ok: false, detail: "missing" },
    ]);
    assert.equal(passed, true);
  });
});
