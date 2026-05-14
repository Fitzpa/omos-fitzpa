import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseList } from './config/agent-mcps';

export const CODEGRAPH_MCP_NAME = 'codegraph';

export const CODEGRAPH_SYSTEM_GUIDANCE = `CodeGraph is available for this project. Before broad code discovery with bash, prefer targeted CodeGraph MCP tools: codegraph_search, codegraph_files, codegraph_callers, codegraph_callees, codegraph_impact, and codegraph_explore. Use bash/read tools for exact file contents, tests, builds, git, precise file operations, and fallback when CodeGraph is stale, missing, or insufficient.`;

export const CODEGRAPH_BASH_GUIDANCE = `CodeGraph is available. Before broad rg/find/ls discovery, prefer codegraph_search, codegraph_files, codegraph_callers, codegraph_callees, codegraph_impact, or codegraph_explore. Bash remains appropriate for tests, builds, git, exact file operations, and fallback when CodeGraph misses or is stale.`;

export function hasCodeGraphIndex(directory: string): boolean {
  return existsSync(join(directory, '.codegraph', 'codegraph.db'));
}

export function hasCodeGraphMcp(
  opencodeConfig?: Record<string, unknown>,
): boolean {
  return Boolean(opencodeConfig?.[CODEGRAPH_MCP_NAME]);
}

export function agentAllowsCodeGraph(
  agentMcps: string[] | undefined,
  allMcpNames: string[],
): boolean {
  if (!agentMcps) return false;
  return parseList(agentMcps, allMcpNames).includes(CODEGRAPH_MCP_NAME);
}
