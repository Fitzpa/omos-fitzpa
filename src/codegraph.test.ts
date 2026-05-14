import { describe, expect, test } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  agentAllowsCodeGraph,
  hasCodeGraphIndex,
  hasCodeGraphMcp,
} from './codegraph';

function tempProject(): string {
  return join(
    tmpdir(),
    `omos-codegraph-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
}

describe('CodeGraph guidance helpers', () => {
  test('detects .codegraph/codegraph.db', () => {
    const dir = tempProject();
    mkdirSync(join(dir, '.codegraph'), { recursive: true });
    writeFileSync(join(dir, '.codegraph', 'codegraph.db'), '');

    expect(hasCodeGraphIndex(dir)).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  test('returns false when only .codegraph directory exists', () => {
    const dir = tempProject();
    mkdirSync(join(dir, '.codegraph'), { recursive: true });

    expect(hasCodeGraphIndex(dir)).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  test('detects codegraph in merged MCP config', () => {
    expect(hasCodeGraphMcp({ codegraph: {}, websearch: {} })).toBe(true);
    expect(hasCodeGraphMcp({ websearch: {} })).toBe(false);
  });

  test('respects wildcard and exclusion MCP lists', () => {
    const allMcps = ['websearch', 'context7', 'codegraph'];

    expect(agentAllowsCodeGraph(['*'], allMcps)).toBe(true);
    expect(agentAllowsCodeGraph(['*', '!codegraph'], allMcps)).toBe(false);
    expect(agentAllowsCodeGraph(['codegraph'], allMcps)).toBe(true);
    expect(agentAllowsCodeGraph(['websearch'], allMcps)).toBe(false);
    expect(agentAllowsCodeGraph([], allMcps)).toBe(false);
  });
});
