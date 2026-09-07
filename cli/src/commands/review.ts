import ora from "ora";
import chalk from "chalk";
import { spawnDiff, chunkDiff } from "../git.js";
import { postReview } from "../api.js";
import type { ReviewResponse } from "../types.js";

export async function reviewCommand(options: {
  agents?: string;
  backend?: string;
}): Promise<void> {
  const agents = options.agents
    ? options.agents.split(",").map((a) => a.trim())
    : ["syntax", "security", "performance", "style"];

  const spinner = ora("Capturing git diff...").start();

  try {
    const rawDiff = await spawnDiff();
    if (!rawDiff) {
      spinner.warn("No uncommitted changes found.");
      return;
    }

    spinner.text = "Chunking diff...";
    const chunks = chunkDiff(rawDiff);
    spinner.info(`Found ${chunks.length} chunk(s) across files`);

    spinner.text = `Running AI review (${agents.join(", ")})...`;
    const result: ReviewResponse = await postReview(
      { diff_chunks: chunks, agents },
      options.backend
    );

    spinner.succeed("Review complete!\n");
    renderResults(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    spinner.fail(`Review failed: ${message}`);
    process.exit(1);
  }
}

function renderResults(result: ReviewResponse): void {
  const { tech_debt_score, finding_counts, findings } = result;

  const scoreColor =
    tech_debt_score >= 80
      ? chalk.green
      : tech_debt_score >= 50
        ? chalk.yellow
        : chalk.red;

  console.log(scoreColor.bold(`\n  Tech Debt Score: ${tech_debt_score}/100\n`));

  console.log(
    `  ${chalk.red(`HIGH: ${finding_counts.high}`)}  ${chalk.yellow(`MEDIUM: ${finding_counts.medium}`)}  ${chalk.blue(`LOW: ${finding_counts.low}`)}`
  );
  console.log(`  Review ID: ${result.review_id}\n`);

  if (findings.length === 0) {
    console.log(chalk.green("  No issues found. Great work!\n"));
    return;
  }

  console.log(chalk.bold("  Findings:\n"));
  for (const f of findings) {
    const sevColor =
      f.severity === "HIGH"
        ? chalk.red
        : f.severity === "MEDIUM"
          ? chalk.yellow
          : chalk.blue;

    console.log(`  ${sevColor.bold(f.severity)} ${chalk.dim(`${f.file_path}:${f.line}`)}`);
    console.log(`    ${chalk.bold(f.title)}`);
    console.log(`    ${f.description}`);
    console.log(`    ${chalk.cyan(`Suggestion: ${f.suggestion}`)}\n`);
  }
}
