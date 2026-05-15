/// <reference types="bun-types" />

import { afterEach, describe, expect, test } from 'bun:test';
import { createDesignerAgent } from './agents/designer';
import { createExplorerAgent } from './agents/explorer';
import { createFixerAgent } from './agents/fixer';
import { createLibrarianAgent } from './agents/librarian';
import { createObserverAgent } from './agents/observer';
import { createOracleAgent } from './agents/oracle';
import { createReviewerAgent } from './agents/reviewer';
import { createSimplifierAgent } from './agents/simplifier';
import { getAvailableMcpNames } from './config/agent-mcps';
import {
  DEFAULT_DISABLED_AGENTS,
  getOrchestratableAgents,
} from './config/constants';
import { CouncilPresetSchema } from './config/council-schema';
import { PluginConfigSchema } from './config/schema';
import { createWebsearchConfig } from './mcp/websearch';
import { getEnv } from './utils/env';
import {
  createInternalAgentTextPart,
  hasInternalInitiatorMarker,
} from './utils/internal-initiator';

describe('coverage gaps for small pure branches', () => {
  const originalEnv = { ...process.env };
  const originalBunEnv = { ...Bun.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    for (const key of Object.keys(Bun.env)) {
      delete Bun.env[key];
    }
    Object.assign(Bun.env, originalBunEnv);
  });

  test('agent factories use custom prompts directly', () => {
    const factories = [
      createDesignerAgent,
      createExplorerAgent,
      createFixerAgent,
      createLibrarianAgent,
      createObserverAgent,
      createOracleAgent,
      createReviewerAgent,
      createSimplifierAgent,
    ];

    for (const createAgent of factories) {
      const agent = createAgent('test/model', 'custom prompt');
      expect(agent.config.prompt).toBe('custom prompt');
    }
  });

  test('agent factories append custom prompt additions', () => {
    const factories = [
      createDesignerAgent,
      createExplorerAgent,
      createFixerAgent,
      createLibrarianAgent,
      createObserverAgent,
      createOracleAgent,
      createReviewerAgent,
      createSimplifierAgent,
    ];

    for (const createAgent of factories) {
      const agent = createAgent('test/model', undefined, 'appendix');
      expect(agent.config.prompt).toContain('\n\nappendix');
    }
  });

  test('getOrchestratableAgents filters disabled agents', () => {
    expect(DEFAULT_DISABLED_AGENTS).toEqual(['observer']);
    expect(
      getOrchestratableAgents(new Set(['observer', 'council'])),
    ).not.toEqual(expect.arrayContaining(['observer', 'council']));
  });

  test('getAvailableMcpNames removes disabled built-in MCPs', () => {
    expect(
      getAvailableMcpNames({ disabled_mcps: ['websearch', 'grep_app'] }),
    ).toEqual(['context7']);
  });

  test('CouncilPresetSchema reports invalid legacy nested councillors', () => {
    const result = CouncilPresetSchema.safeParse({
      councillors: {
        bad: {
          model: '',
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      'nested under legacy "councillors" key',
    );
  });

  test('CouncilPresetSchema reports invalid top-level councillor config', () => {
    const result = CouncilPresetSchema.safeParse({
      bad: {
        model: '',
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain(
      'Invalid councillor "bad"',
    );
  });

  test('PluginConfigSchema rejects duplicate manual plan fallbacks', () => {
    const result = PluginConfigSchema.safeParse({
      manualPlan: {
        orchestrator: {
          primary: 'openai/a',
          fallback1: 'openai/a',
          fallback2: 'openai/b',
          fallback3: 'openai/c',
        },
        oracle: {
          primary: 'openai/d',
          fallback1: 'openai/e',
          fallback2: 'openai/f',
          fallback3: 'openai/g',
        },
        designer: {
          primary: 'openai/h',
          fallback1: 'openai/i',
          fallback2: 'openai/j',
          fallback3: 'openai/k',
        },
        implementer: {
          primary: 'openai/l',
          fallback1: 'openai/m',
          fallback2: 'openai/n',
          fallback3: 'openai/o',
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      'primary and fallbacks must be unique per agent',
    );
  });

  test('createWebsearchConfig supports Tavily and missing key errors', () => {
    delete process.env.TAVILY_API_KEY;
    expect(() => createWebsearchConfig({ provider: 'tavily' })).toThrow(
      'TAVILY_API_KEY',
    );

    process.env.TAVILY_API_KEY = 'secret';
    expect(createWebsearchConfig({ provider: 'tavily' })).toEqual({
      type: 'remote',
      url: 'https://mcp.tavily.com/mcp/',
      headers: {
        Authorization: 'Bearer secret',
      },
      oauth: false,
    });
  });

  test('createWebsearchConfig includes an encoded Exa key when present', () => {
    process.env.EXA_API_KEY = 'key with spaces';
    expect(createWebsearchConfig().url).toBe(
      'https://mcp.exa.ai/mcp?tools=web_search_exa&exaApiKey=key%20with%20spaces',
    );
  });

  test('getEnv falls back from Bun.env to process.env and ignores empty values', () => {
    Bun.env.COVERAGE_GAP_ENV = '';
    process.env.COVERAGE_GAP_ENV = 'from-process';
    expect(getEnv('COVERAGE_GAP_ENV')).toBe('from-process');

    Bun.env.COVERAGE_GAP_ENV = 'from-bun';
    expect(getEnv('COVERAGE_GAP_ENV')).toBe('from-bun');

    Bun.env.COVERAGE_GAP_ENV = '';
    process.env.COVERAGE_GAP_ENV = '';
    expect(getEnv('COVERAGE_GAP_ENV')).toBeUndefined();
  });

  test('internal initiator marker ignores non-record and non-text inputs', () => {
    expect(hasInternalInitiatorMarker(null)).toBe(false);
    expect(hasInternalInitiatorMarker({ type: 'image', text: 'x' })).toBe(
      false,
    );
    expect(hasInternalInitiatorMarker({ type: 'text', text: 1 })).toBe(false);
    expect(
      hasInternalInitiatorMarker(createInternalAgentTextPart('hello')),
    ).toBe(true);
  });
});
