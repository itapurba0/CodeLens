#!/usr/bin/env node

import { Command } from "commander";
import { reviewCommand } from "./commands/review.js";

const program = new Command();

program
  .name("codelens")
  .description("CodeLens — local-first AI code review CLI")
  .version("0.1.0");

program
  .command("review")
  .description("Run AI code review on uncommitted changes")
  .option("-a, --agents <agents>", "Comma-separated agent names", "syntax,security,performance,style")
  .option("-b, --backend <url>", "Backend API URL", "http://localhost:8000/api/review")
  .action(async (opts) => {
    await reviewCommand({ agents: opts.agents, backend: opts.backend });
  });

program.parse();
