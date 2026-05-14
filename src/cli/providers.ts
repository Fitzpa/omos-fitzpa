import { DEFAULT_AGENT_MCPS } from '../config/agent-mcps';
import { CUSTOM_SKILLS } from './custom-skills';
import { RECOMMENDED_SKILLS } from './skills';
import type { InstallConfig } from './types';

const SCHEMA_URL =
  'https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json';

export const GENERATED_PRESETS = [
  'openai',
  'opencode-go',
  'zen-max',
  'zen-balanced',
  'zen-low',
] as const;

// Model mappings by provider/preset.
export const MODEL_MAPPINGS = {
  openai: {
    orchestrator: { model: 'openai/gpt-5.5' },
    oracle: { model: 'openai/gpt-5.5', variant: 'high' },
    librarian: { model: 'openai/gpt-5.4-mini', variant: 'low' },
    explorer: { model: 'openai/gpt-5.4-mini', variant: 'low' },
    designer: { model: 'openai/gpt-5.4-mini', variant: 'medium' },
    fixer: { model: 'openai/gpt-5.4-mini', variant: 'low' },
    reviewer: { model: 'openai/gpt-5.4-mini', variant: 'low' },
    simplifier: { model: 'openai/gpt-5.4-mini', variant: 'low' },
  },
  kimi: {
    orchestrator: { model: 'kimi-for-coding/k2p5' },
    oracle: { model: 'kimi-for-coding/k2p5', variant: 'high' },
    librarian: { model: 'kimi-for-coding/k2p5', variant: 'low' },
    explorer: { model: 'kimi-for-coding/k2p5', variant: 'low' },
    designer: { model: 'kimi-for-coding/k2p5', variant: 'medium' },
    fixer: { model: 'kimi-for-coding/k2p5', variant: 'low' },
    reviewer: { model: 'kimi-for-coding/k2p5', variant: 'low' },
    simplifier: { model: 'kimi-for-coding/k2p5', variant: 'low' },
  },
  copilot: {
    orchestrator: { model: 'github-copilot/claude-opus-4.6' },
    oracle: { model: 'github-copilot/claude-opus-4.6', variant: 'high' },
    librarian: { model: 'github-copilot/grok-code-fast-1', variant: 'low' },
    explorer: { model: 'github-copilot/grok-code-fast-1', variant: 'low' },
    designer: {
      model: 'github-copilot/gemini-3.1-pro-preview',
      variant: 'medium',
    },
    fixer: { model: 'github-copilot/claude-sonnet-4.6', variant: 'low' },
    reviewer: { model: 'github-copilot/claude-sonnet-4.6', variant: 'low' },
    simplifier: { model: 'github-copilot/claude-sonnet-4.6', variant: 'low' },
  },
  'zai-plan': {
    orchestrator: { model: 'zai-coding-plan/glm-5' },
    oracle: { model: 'zai-coding-plan/glm-5', variant: 'high' },
    librarian: { model: 'zai-coding-plan/glm-5', variant: 'low' },
    explorer: { model: 'zai-coding-plan/glm-5', variant: 'low' },
    designer: { model: 'zai-coding-plan/glm-5', variant: 'medium' },
    fixer: { model: 'zai-coding-plan/glm-5', variant: 'low' },
    reviewer: { model: 'zai-coding-plan/glm-5', variant: 'low' },
    simplifier: { model: 'zai-coding-plan/glm-5', variant: 'low' },
  },
  'opencode-go': {
    orchestrator: { model: 'opencode-go/glm-5.1' },
    oracle: { model: 'opencode-go/deepseek-v4-pro', variant: 'max' },
    council: { model: 'opencode-go/deepseek-v4-pro', variant: 'high' },
    librarian: { model: 'opencode-go/minimax-m2.7' },
    explorer: { model: 'opencode-go/minimax-m2.7' },
    designer: { model: 'opencode-go/kimi-k2.6', variant: 'medium' },
    fixer: { model: 'opencode-go/deepseek-v4-flash', variant: 'high' },
    reviewer: { model: 'opencode-go/deepseek-v4-flash', variant: 'high' },
    simplifier: { model: 'opencode-go/deepseek-v4-flash', variant: 'high' },
    observer: { model: 'opencode-go/kimi-k2.6' },
  },
  'zen-max': {
    orchestrator: {
      model: [
        { id: 'opencode/gpt-5.5', variant: 'high' },
        { id: 'opencode/claude-opus-4-6', variant: 'high' },
        { id: 'opencode/gemini-3.1-pro', variant: 'high' },
        { id: 'opencode/gpt-5.4', variant: 'high' },
      ],
    },
    oracle: {
      model: [
        { id: 'opencode/claude-opus-4-6', variant: 'max' },
        { id: 'opencode/gpt-5.5', variant: 'high' },
        { id: 'opencode/gemini-3.1-pro', variant: 'high' },
        { id: 'opencode/claude-sonnet-4-6', variant: 'high' },
      ],
    },
    council: {
      model: [
        { id: 'opencode/gemini-3.1-pro', variant: 'high' },
        { id: 'opencode/gpt-5.5', variant: 'high' },
        { id: 'opencode/claude-sonnet-4-6', variant: 'high' },
      ],
    },
    librarian: {
      model: [
        'opencode/claude-sonnet-4-6',
        'opencode/gpt-5.4',
        'opencode/kimi-k2.6',
      ],
    },
    explorer: {
      model: [
        'opencode/claude-sonnet-4-6',
        'opencode/gpt-5.4',
        'opencode/minimax-m2.7',
      ],
    },
    designer: {
      model: [
        { id: 'opencode/gemini-3.1-pro', variant: 'medium' },
        { id: 'opencode/claude-sonnet-4-6', variant: 'medium' },
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
      ],
    },
    fixer: {
      model: [
        { id: 'opencode/gpt-5.3-codex', variant: 'high' },
        { id: 'opencode/claude-sonnet-4-6', variant: 'high' },
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
      ],
    },
    reviewer: {
      model: [
        { id: 'opencode/claude-sonnet-4-6', variant: 'high' },
        { id: 'opencode/gpt-5.5', variant: 'high' },
        { id: 'opencode/gemini-3.1-pro', variant: 'high' },
      ],
    },
    simplifier: {
      model: [
        { id: 'opencode/gpt-5.4', variant: 'high' },
        { id: 'opencode/claude-sonnet-4-6', variant: 'high' },
        { id: 'opencode/gpt-5.3-codex', variant: 'high' },
      ],
    },
    observer: {
      model: ['opencode/gemini-3.1-pro', 'opencode/kimi-k2.6'],
    },
  },
  'zen-balanced': {
    orchestrator: {
      model: [
        { id: 'opencode/glm-5.1', variant: 'medium' },
        { id: 'opencode/gpt-5.3-codex', variant: 'medium' },
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
        { id: 'opencode/gpt-5.4-mini', variant: 'medium' },
      ],
    },
    oracle: {
      model: [
        { id: 'opencode/gpt-5.3-codex', variant: 'high' },
        { id: 'opencode/glm-5.1', variant: 'high' },
        { id: 'opencode/kimi-k2.6', variant: 'high' },
        { id: 'opencode/claude-haiku-4-5', variant: 'high' },
      ],
    },
    council: {
      model: [
        { id: 'opencode/glm-5.1', variant: 'high' },
        { id: 'opencode/kimi-k2.6', variant: 'high' },
        { id: 'opencode/gpt-5.3-codex', variant: 'high' },
      ],
    },
    librarian: {
      model: [
        'opencode/minimax-m2.7',
        'opencode/gemini-3-flash',
        'opencode/minimax-m2.5',
      ],
    },
    explorer: {
      model: [
        'opencode/minimax-m2.7',
        'opencode/gemini-3-flash',
        'opencode/claude-haiku-4-5',
      ],
    },
    designer: {
      model: [
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
        { id: 'opencode/gemini-3-flash', variant: 'medium' },
        { id: 'opencode/gpt-5.4-mini', variant: 'medium' },
      ],
    },
    fixer: {
      model: [
        { id: 'opencode/gpt-5.4-mini', variant: 'medium' },
        { id: 'opencode/gpt-5.3-codex', variant: 'medium' },
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
      ],
    },
    reviewer: {
      model: [
        { id: 'opencode/gpt-5.3-codex', variant: 'medium' },
        { id: 'opencode/glm-5.1', variant: 'medium' },
        { id: 'opencode/claude-haiku-4-5', variant: 'medium' },
      ],
    },
    simplifier: {
      model: [
        { id: 'opencode/gpt-5.4-mini', variant: 'medium' },
        { id: 'opencode/minimax-m2.7', variant: 'medium' },
        { id: 'opencode/kimi-k2.6', variant: 'medium' },
      ],
    },
    observer: {
      model: ['opencode/kimi-k2.6', 'opencode/gemini-3-flash'],
    },
  },
  'zen-low': {
    orchestrator: {
      model: [
        { id: 'opencode/gemini-3-flash', variant: 'low' },
        { id: 'opencode/gpt-5.4-nano', variant: 'low' },
        'opencode/qwen3.5-plus',
        'opencode/deepseek-v4-flash-free',
      ],
    },
    oracle: {
      model: [
        { id: 'opencode/gpt-5.4-mini', variant: 'medium' },
        { id: 'opencode/glm-5', variant: 'medium' },
        'opencode/qwen3.6-plus',
        'opencode/nemotron-3-super-free',
      ],
    },
    council: {
      model: [
        { id: 'opencode/gemini-3-flash', variant: 'medium' },
        'opencode/qwen3.5-plus',
        'opencode/trinity-large-preview-free',
      ],
    },
    librarian: {
      model: [
        'opencode/minimax-m2.5',
        'opencode/gemini-3-flash',
        'opencode/ring-2.6-1t-free',
      ],
    },
    explorer: {
      model: [
        'opencode/minimax-m2.5',
        'opencode/gemini-3-flash',
        'opencode/minimax-m2.5-free',
      ],
    },
    designer: {
      model: [
        { id: 'opencode/gemini-3-flash', variant: 'medium' },
        { id: 'opencode/kimi-k2.5', variant: 'medium' },
        'opencode/trinity-large-preview-free',
      ],
    },
    fixer: {
      model: [
        { id: 'opencode/gpt-5.4-nano', variant: 'low' },
        { id: 'opencode/gpt-5-nano', variant: 'low' },
        'opencode/deepseek-v4-flash-free',
      ],
    },
    reviewer: {
      model: [
        { id: 'opencode/gpt-5.4-mini', variant: 'low' },
        'opencode/qwen3.6-plus',
        'opencode/nemotron-3-super-free',
      ],
    },
    simplifier: {
      model: [
        { id: 'opencode/gpt-5.4-nano', variant: 'low' },
        'opencode/minimax-m2.5',
        'opencode/deepseek-v4-flash-free',
      ],
    },
    observer: {
      model: [
        'opencode/gemini-3-flash',
        'opencode/kimi-k2.5',
        'opencode/trinity-large-preview-free',
      ],
    },
  },
} as const;

export type PresetName = keyof typeof MODEL_MAPPINGS;
export type GeneratedPresetName = (typeof GENERATED_PRESETS)[number];

export function isPresetName(value: string): value is PresetName {
  return Object.hasOwn(MODEL_MAPPINGS, value);
}

export function getPresetNames(): PresetName[] {
  return Object.keys(MODEL_MAPPINGS) as PresetName[];
}

export function isGeneratedPresetName(
  value: string,
): value is GeneratedPresetName {
  return GENERATED_PRESETS.includes(value as GeneratedPresetName);
}

export function getGeneratedPresetNames(): GeneratedPresetName[] {
  return [...GENERATED_PRESETS];
}

export function generateLiteConfig(
  installConfig: InstallConfig,
): Record<string, unknown> {
  const preset = installConfig.preset ?? 'openai';
  if (!isGeneratedPresetName(preset)) {
    throw new Error(
      `Unsupported preset "${preset}". Available generated presets: ${getGeneratedPresetNames().join(', ')}`,
    );
  }

  const config: Record<string, unknown> = {
    $schema: SCHEMA_URL,
    preset,
    presets: {},
  };

  if (preset === 'opencode-go') {
    config.disabled_agents = [];
  }

  const createAgentConfig = (
    agentName: string,
    modelInfo: {
      model: string | Array<string | { id: string; variant?: string }>;
      variant?: string;
    },
  ) => {
    const isOrchestrator = agentName === 'orchestrator';

    const skills = isOrchestrator
      ? ['*']
      : [
          ...RECOMMENDED_SKILLS.filter(
            (s) =>
              s.allowedAgents.includes('*') ||
              s.allowedAgents.includes(agentName),
          ).map((s) => s.skillName),
          ...CUSTOM_SKILLS.filter(
            (s) =>
              s.allowedAgents.includes('*') ||
              s.allowedAgents.includes(agentName),
          ).map((s) => s.name),
        ];

    if (agentName === 'designer' && !skills.includes('agent-browser')) {
      skills.push('agent-browser');
    }

    return {
      model: modelInfo.model,
      variant: modelInfo.variant,
      skills,
      mcps:
        DEFAULT_AGENT_MCPS[agentName as keyof typeof DEFAULT_AGENT_MCPS] ?? [],
    };
  };

  const buildPreset = (mappingName: PresetName) => {
    const mapping = MODEL_MAPPINGS[mappingName];
    return Object.fromEntries(
      Object.entries(mapping).map(([agentName, modelInfo]) => [
        agentName,
        createAgentConfig(agentName, modelInfo),
      ]),
    );
  };

  const presets = config.presets as Record<string, unknown>;
  for (const presetName of GENERATED_PRESETS) {
    presets[presetName] = buildPreset(presetName);
  }

  if (installConfig.hasTmux) {
    config.tmux = {
      enabled: true,
      layout: 'main-vertical',
      main_pane_size: 60,
    };
  }

  return config;
}
