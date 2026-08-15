import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * @param {string} cwd
 */
export async function readPackageJson(cwd) {
  const raw = await readFile(join(cwd, "package.json"), "utf8");
  return /** @type {{ name?: string; version?: string; scripts?: Record<string, string> }} */ (
    JSON.parse(raw)
  );
}

/**
 * @param {string} cwd
 * @param {{ name?: string; version?: string; scripts?: Record<string, string> }} pkg
 */
export async function writePackageJson(cwd, pkg) {
  const content = `${JSON.stringify(pkg, null, 2)}\n`;
  await writeFile(join(cwd, "package.json"), content, "utf8");
}

/**
 * @param {"patch" | "minor" | "major"} bump
 * @param {string} current
 */
export function bumpVersion(bump, current) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(current);
  if (!match) {
    throw new Error(`Invalid semver: ${current}`);
  }
  let [major, minor, patch] = match.slice(1).map(Number);
  switch (bump) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
      patch += 1;
      break;
    default: {
      const unknown = /** @type {never} */ (bump);
      throw new Error(`Unknown bump type: ${String(unknown)}`);
    }
  }
  return `${major}.${minor}.${patch}`;
}
