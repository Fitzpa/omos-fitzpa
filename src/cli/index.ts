#!/usr/bin/env bun
import { doctor, parseDoctorArgs } from './doctor';
import { install } from './install';
import { getGeneratedPresetNames, isGeneratedPresetName } from './providers';
import type { BooleanArg, InstallArgs } from './types';

function parseArgs(args: string[]): InstallArgs {
  const result: InstallArgs = {
    tui: true,
    skills: 'yes',
  };

  for (const arg of args) {
    if (arg === '--no-tui') {
      result.tui = false;
    } else if (arg.startsWith('--skills=')) {
      result.skills = arg.split('=')[1] as BooleanArg;
    } else if (arg.startsWith('--preset=')) {
      const preset = arg.split('=')[1];
      if (!isGeneratedPresetName(preset)) {
        console.error(
          `Unsupported preset: ${preset}. Available presets: ${getGeneratedPresetNames().join(', ')}`,
        );
        process.exit(1);
      }
      result.preset = preset;
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--reset') {
      result.reset = true;
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
oh-my-opencode-slim installer

Usage:
  bunx omos-fitzpa install [OPTIONS]
  bunx omos-fitzpa doctor [OPTIONS]

Options:
  --skills=yes|no        Install recommended and bundled skills (default: yes)
  --preset=<name>        Active generated config preset (default: openai)
  --no-tui               Non-interactive mode
  --dry-run              Simulate install without writing files
  --reset                Force overwrite of existing configuration
  -h, --help             Show this help message

Doctor options:
  --json                 Print diagnostics as JSON

Available presets: ${getGeneratedPresetNames().join(', ')}

The installer generates OpenAI, OpenCode Go, and OpenCode Zen presets by default.
OpenAI is active unless --preset selects another generated preset.
For the full config reference, see docs/configuration.md.

Examples:
  bunx omos-fitzpa install
  bunx omos-fitzpa install --no-tui --skills=yes
  bunx omos-fitzpa install --preset=opencode-go
  bunx omos-fitzpa install --preset=zen-balanced
  bunx omos-fitzpa install --reset
  bunx omos-fitzpa doctor
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'install') {
    const hasSubcommand = args[0] === 'install';
    const installArgs = parseArgs(args.slice(hasSubcommand ? 1 : 0));
    const exitCode = await install(installArgs);
    process.exit(exitCode);
  } else if (args[0] === 'doctor') {
    const doctorArgs = parseDoctorArgs(args.slice(1));
    const exitCode = await doctor(doctorArgs);
    process.exit(exitCode);
  } else if (args[0] === '-h' || args[0] === '--help') {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown command: ${args[0]}`);
    console.error('Run with --help for usage information');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
