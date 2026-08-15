#!/usr/bin/env node

import { runCli } from "../lib/cli.mjs";

try {
  await runCli(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`shipkit: ${message}`);
  process.exit(1);
}
