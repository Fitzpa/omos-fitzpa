/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { generateLiteConfig, MODEL_MAPPINGS } from './providers';

describe('providers', () => {
  test('MODEL_MAPPINGS includes supported providers', () => {
    const keys = Object.keys(MODEL_MAPPINGS);
    expect(keys.sort()).toEqual([
      'copilot',
      'kimi',
      'openai',
      'opencode-go',
      'zai-plan',
      'zen-balanced',
      'zen-low',
      'zen-max',
    ]);
  });

  test('generateLiteConfig defaults to openai and includes generated presets', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    expect(config.$schema).toBe(
      'https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json',
    );
    expect(config.preset).toBe('openai');
    expect(config.disabled_agents).toBeUndefined();
    expect((config.presets as any)['opencode-go']).toBeDefined();
    expect((config.presets as any)['opencode-go'].observer.model).toBe(
      'opencode-go/kimi-k2.6',
    );
    expect((config.presets as any)['zen-max']).toBeDefined();
    expect((config.presets as any)['zen-balanced']).toBeDefined();
    expect((config.presets as any)['zen-low']).toBeDefined();
    const agents = (config.presets as any).openai;
    expect(agents).toBeDefined();
    expect(agents.orchestrator.model).toBe('openai/gpt-5.5');
    expect(agents.orchestrator.variant).toBeUndefined();
    expect(agents.fixer.model).toBe('openai/gpt-5.4-mini');
    expect(agents.fixer.variant).toBe('low');
  });

  test('generateLiteConfig uses correct OpenAI models', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const agents = (config.presets as any).openai;
    expect(agents.orchestrator.model).toBe(
      MODEL_MAPPINGS.openai.orchestrator.model,
    );
    expect(agents.oracle.model).toBe('openai/gpt-5.5');
    expect(agents.oracle.variant).toBe('high');
    expect(agents.librarian.model).toBe('openai/gpt-5.4-mini');
    expect(agents.librarian.variant).toBe('low');
    expect(agents.explorer.model).toBe('openai/gpt-5.4-mini');
    expect(agents.explorer.variant).toBe('low');
    expect(agents.designer.model).toBe('openai/gpt-5.4-mini');
    expect(agents.designer.variant).toBe('medium');
  });

  test('generateLiteConfig can set opencode-go as active preset', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      preset: 'opencode-go',
      reset: false,
    });

    expect(config.preset).toBe('opencode-go');
    expect(config.disabled_agents).toEqual([]);
    expect((config.presets as any).openai).toBeDefined();
    const agents = (config.presets as any)['opencode-go'];
    expect(agents).toBeDefined();
    expect(agents.orchestrator.model).toBe('opencode-go/glm-5.1');
    expect(agents.oracle.model).toBe('opencode-go/deepseek-v4-pro');
    expect(agents.oracle.variant).toBe('max');
    expect(agents.council.model).toBe('opencode-go/deepseek-v4-pro');
    expect(agents.council.variant).toBe('high');
    expect(agents.librarian.model).toBe('opencode-go/minimax-m2.7');
    expect(agents.explorer.model).toBe('opencode-go/minimax-m2.7');
    expect(agents.designer.model).toBe('opencode-go/kimi-k2.6');
    expect(agents.fixer.model).toBe('opencode-go/deepseek-v4-flash');
    expect(agents.fixer.variant).toBe('high');
    expect(agents.observer.model).toBe('opencode-go/kimi-k2.6');
  });

  test('generateLiteConfig can set Zen presets as active presets', () => {
    for (const preset of ['zen-max', 'zen-balanced', 'zen-low']) {
      const config = generateLiteConfig({
        hasTmux: false,
        installSkills: false,
        installCustomSkills: false,
        preset,
        reset: false,
      });

      expect(config.preset).toBe(preset);
      expect((config.presets as any)[preset]).toBeDefined();
    }
  });

  test('Zen max preset avoids excluded top-tier models', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const blockedModels = new Set([
      'opencode/gpt-5.4-pro',
      'opencode/gpt-5.5-pro',
      'opencode/claude-opus-4-7',
    ]);
    const preset = (config.presets as any)['zen-max'];

    for (const agentConfig of Object.values(preset) as any[]) {
      const model = agentConfig.model;
      const modelIds = Array.isArray(model)
        ? model.map((entry) => (typeof entry === 'string' ? entry : entry.id))
        : [model];

      for (const modelId of modelIds) {
        expect(blockedModels.has(modelId)).toBe(false);
      }
    }
  });

  test('Zen balanced preset uses the requested efficient model pool', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const allowedModels = new Set([
      'opencode/glm-5.1',
      'opencode/gpt-5.4-mini',
      'opencode/kimi-k2.6',
      'opencode/gpt-5.3-codex',
      'opencode/gemini-3-flash',
      'opencode/minimax-m2.5',
      'opencode/minimax-m2.7',
      'opencode/claude-haiku-4-5',
    ]);
    const preset = (config.presets as any)['zen-balanced'];

    for (const agentConfig of Object.values(preset) as any[]) {
      const model = agentConfig.model;
      const modelIds = Array.isArray(model)
        ? model.map((entry) => (typeof entry === 'string' ? entry : entry.id))
        : [model];

      for (const modelId of modelIds) {
        expect(allowedModels.has(modelId)).toBe(true);
      }
    }
  });

  test('Zen low preset includes paid primaries before free fallbacks', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const preset = (config.presets as any)['zen-low'];

    expect(preset.orchestrator.model[0]).toEqual({
      id: 'opencode/gemini-3-flash',
      variant: 'low',
    });
    expect(preset.orchestrator.model).toContain(
      'opencode/deepseek-v4-flash-free',
    );
    expect(preset.explorer.model[0]).toBe('opencode/minimax-m2.5');
    expect(preset.explorer.model).toContain('opencode/minimax-m2.5-free');
  });

  test('generateLiteConfig rejects unsupported preset', () => {
    expect(() =>
      generateLiteConfig({
        hasTmux: false,
        installSkills: false,
        installCustomSkills: false,
        preset: 'not-real',
        reset: false,
      }),
    ).toThrow('Unsupported preset "not-real"');
  });

  test('generateLiteConfig rejects non-generated model mappings as active presets', () => {
    expect(() =>
      generateLiteConfig({
        hasTmux: false,
        installSkills: false,
        installCustomSkills: false,
        preset: 'kimi',
        reset: false,
      }),
    ).toThrow('Unsupported preset "kimi"');
  });

  test('generateLiteConfig rejects inherited property names as presets', () => {
    expect(() =>
      generateLiteConfig({
        hasTmux: false,
        installSkills: false,
        installCustomSkills: false,
        preset: 'toString',
        reset: false,
      }),
    ).toThrow('Unsupported preset "toString"');
  });

  test('generateLiteConfig enables tmux when requested', () => {
    const config = generateLiteConfig({
      hasTmux: true,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    expect(config.tmux).toBeDefined();
    expect((config.tmux as any).enabled).toBe(true);
    expect((config.tmux as any).layout).toBe('main-vertical');
  });

  test('generateLiteConfig includes default skills', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: true,
      installCustomSkills: false,
      reset: false,
    });

    const agents = (config.presets as any).openai;
    // Orchestrator should always have '*'
    expect(agents.orchestrator.skills).toEqual(['*']);

    // Oracle should have bundled simplify
    expect(agents.oracle.skills).toContain('simplify');

    // Orchestrator should implicitly cover bundled codemap via '*'
    expect(agents.orchestrator.skills).toContain('*');

    // Designer should have 'agent-browser'
    expect(agents.designer.skills).toContain('agent-browser');

    // Explorer should have no bundled skills by default
    expect(agents.explorer.skills).toEqual([]);

    // Fixer should have no bundled skills by default
    expect(agents.fixer.skills).toEqual([]);
  });

  test('generateLiteConfig includes mcps field', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const agents = (config.presets as any).openai;
    expect(agents.orchestrator.mcps).toBeDefined();
    expect(Array.isArray(agents.orchestrator.mcps)).toBe(true);
    expect(agents.librarian.mcps).toBeDefined();
    expect(Array.isArray(agents.librarian.mcps)).toBe(true);
  });

  test('generateLiteConfig openai includes correct mcps', () => {
    const config = generateLiteConfig({
      hasTmux: false,
      installSkills: false,
      installCustomSkills: false,
      reset: false,
    });

    const agents = (config.presets as any).openai;
    expect(agents.orchestrator.mcps).toEqual(['*', '!context7']);
    expect(agents.librarian.mcps).toContain('websearch');
    expect(agents.librarian.mcps).toContain('context7');
    expect(agents.librarian.mcps).toContain('grep_app');
    expect(agents.designer.mcps).toEqual([]);
  });
});
