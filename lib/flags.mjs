/**
 * @param {string[]} args
 */
export function parseFlags(args) {
  /** @type {Record<string, string | boolean>} */
  const options = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      positional.push(...args.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        options[key] = true;
        continue;
      }
      options[key] = next;
      i++;
      continue;
    }
    positional.push(arg);
  }

  return { options, positional };
}

/**
 * @param {Record<string, string | boolean>} options
 * @param {string} flag
 */
export function flagString(options, flag) {
  const value = options[flag];
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

/**
 * @param {Record<string, string | boolean>} options
 * @param {string} flag
 */
export function flagBool(options, flag) {
  return options[flag] === true;
}
