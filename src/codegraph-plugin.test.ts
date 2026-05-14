import { describe, expect, mock, test } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import OhMyOpenCodeLite from './index';

function createProject(hasIndex = true): string {
  const dir = join(
    tmpdir(),
    `omos-codegraph-plugin-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,
  );
  if (hasIndex) {
    mkdirSync(join(dir, '.codegraph'), { recursive: true });
    writeFileSync(join(dir, '.codegraph', 'codegraph.db'), '');
  } else {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createContext(directory: string) {
  return {
    directory,
    client: {
      app: { log: mock(async () => ({})) },
      session: {
        create: mock(async () => ({})),
        messages: mock(async () => ({})),
        prompt: mock(async () => ({})),
        abort: mock(async () => ({})),
      },
    },
  } as any;
}

describe('CodeGraph plugin hooks', () => {
  test('system transform injects CodeGraph guidance when index and MCP are available', async () => {
    const dir = createProject();
    const plugin = await OhMyOpenCodeLite(createContext(dir));
    const opencodeConfig: Record<string, unknown> = {
      mcp: { codegraph: {} },
      agent: {
        explorer: { mcps: ['codegraph'] },
      },
    };

    await plugin.config?.(opencodeConfig);
    await plugin['chat.message']?.(
      { sessionID: 's1', agent: 'explorer' },
      { message: { agent: 'explorer' } },
    );
    const output = { system: ['Base system'] };

    await plugin['experimental.chat.system.transform']?.(
      { sessionID: 's1' },
      output,
    );

    expect(output.system).toHaveLength(1);
    expect(output.system[0]).toContain('CodeGraph is available');
    expect(output.system[0]).toContain('Base system');

    rmSync(dir, { recursive: true, force: true });
  });

  test('system transform does not duplicate CodeGraph guidance', async () => {
    const dir = createProject();
    const plugin = await OhMyOpenCodeLite(createContext(dir));
    const opencodeConfig: Record<string, unknown> = {
      mcp: { codegraph: {} },
      agent: { explorer: { mcps: ['codegraph'] } },
    };
    await plugin.config?.(opencodeConfig);
    await plugin['chat.message']?.(
      { sessionID: 's1', agent: 'explorer' },
      { message: { agent: 'explorer' } },
    );
    const output = { system: ['Base system'] };

    await plugin['experimental.chat.system.transform']?.(
      { sessionID: 's1' },
      output,
    );
    await plugin['experimental.chat.system.transform']?.(
      { sessionID: 's1' },
      output,
    );

    expect(output.system[0].match(/CodeGraph is available/g)).toHaveLength(1);

    rmSync(dir, { recursive: true, force: true });
  });

  test('system transform skips agents without CodeGraph MCP permission', async () => {
    const dir = createProject();
    const plugin = await OhMyOpenCodeLite(createContext(dir));
    const opencodeConfig: Record<string, unknown> = {
      mcp: { codegraph: {} },
      agent: { explorer: { mcps: [] } },
    };
    await plugin.config?.(opencodeConfig);
    await plugin['chat.message']?.(
      { sessionID: 's1', agent: 'explorer' },
      { message: { agent: 'explorer' } },
    );
    const output = { system: ['Base system'] };

    await plugin['experimental.chat.system.transform']?.(
      { sessionID: 's1' },
      output,
    );

    expect(output.system[0]).not.toContain('CodeGraph is available');

    rmSync(dir, { recursive: true, force: true });
  });

  test('bash tool definition is amended only when CodeGraph is available', async () => {
    const indexedDir = createProject();
    const indexedPlugin = await OhMyOpenCodeLite(createContext(indexedDir));
    await indexedPlugin.config?.({ mcp: { codegraph: {} } });
    const amended = { description: 'Run shell commands.' };

    await indexedPlugin['tool.definition']?.(
      { toolID: 'bash' },
      amended as any,
    );

    expect(amended.description).toContain('codegraph_search');

    const plainDir = createProject(false);
    const plainPlugin = await OhMyOpenCodeLite(createContext(plainDir));
    await plainPlugin.config?.({ mcp: { codegraph: {} } });
    const unchanged = { description: 'Run shell commands.' };

    await plainPlugin['tool.definition']?.(
      { toolID: 'bash' },
      unchanged as any,
    );

    expect(unchanged.description).toBe('Run shell commands.');

    rmSync(indexedDir, { recursive: true, force: true });
    rmSync(plainDir, { recursive: true, force: true });
  });
});
