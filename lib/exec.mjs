import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string; allowFail?: boolean }} [opts]
 */
export async function run(command, args = [], opts = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd: opts.cwd,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    if (opts.allowFail && error && typeof error === "object" && "stdout" in error) {
      const err = /** @type {{ stdout?: string; stderr?: string; code?: number }} */ (error);
      return {
        ok: false,
        stdout: (err.stdout ?? "").trim(),
        stderr: (err.stderr ?? "").trim(),
        code: err.code,
      };
    }
    throw error;
  }
}

/**
 * @param {string} command
 */
export async function commandExists(command) {
  const checker = process.platform === "win32" ? "where" : "which";
  const result = await run(checker, [command], { allowFail: true });
  return result.ok;
}
