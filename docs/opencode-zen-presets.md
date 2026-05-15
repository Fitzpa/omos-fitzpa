# OpenCode Zen Presets

The installer includes three generated presets for OpenCode Zen subscribers:
`zen-max`, `zen-balanced`, and `zen-low`.

Use one during install:

```bash
bunx omos-fitzpa@latest install --preset=zen-balanced
```

Or switch at runtime:

```text
/preset zen-balanced
```

## Preset Intent

| Preset | Intent |
|--------|--------|
| `zen-max` | Strongest generated Zen setup without `gpt-5.4-pro`, `gpt-5.5-pro`, or `claude-opus-4-7` |
| `zen-balanced` | Efficient paid models: GLM-5.1, GPT-5.4 Mini, Kimi K2.6, GPT-5.3 Codex, Gemini 3 Flash, MiniMax, and Claude Haiku |
| `zen-low` | Cheap paid primaries with free models late in fallback chains to reduce rate-limit risk |

The presets use array-form `model` values for fallback chains. At runtime, the
first entry is the primary model, while later entries are available to the
plugin's fallback resolution.

## Generated Presets

| Agent | `zen-max` primary | `zen-balanced` primary | `zen-low` primary |
|-------|-------------------|------------------------|-------------------|
| Orchestrator | `opencode/gpt-5.5` (`high`) | `opencode/glm-5.1` (`medium`) | `opencode/gemini-3-flash` (`low`) |
| Oracle | `opencode/claude-opus-4-6` (`max`) | `opencode/gpt-5.3-codex` (`high`) | `opencode/gpt-5.4-mini` (`medium`) |
| Council | `opencode/gemini-3.1-pro` (`high`) | `opencode/glm-5.1` (`high`) | `opencode/gemini-3-flash` (`medium`) |
| Librarian | `opencode/claude-sonnet-4-6` | `opencode/minimax-m2.7` | `opencode/minimax-m2.5` |
| Explorer | `opencode/claude-sonnet-4-6` | `opencode/minimax-m2.7` | `opencode/minimax-m2.5` |
| Designer | `opencode/gemini-3.1-pro` (`medium`) | `opencode/kimi-k2.6` (`medium`) | `opencode/gemini-3-flash` (`medium`) |
| Fixer | `opencode/gpt-5.3-codex` (`high`) | `opencode/gpt-5.4-mini` (`medium`) | `opencode/gpt-5.4-nano` (`low`) |
| Reviewer | `opencode/claude-sonnet-4-6` (`high`) | `opencode/gpt-5.3-codex` (`medium`) | `opencode/gpt-5.4-mini` (`low`) |
| Simplifier | `opencode/gpt-5.4` (`high`) | `opencode/gpt-5.4-mini` (`medium`) | `opencode/gpt-5.4-nano` (`low`) |
| Observer | `opencode/gemini-3.1-pro` | `opencode/kimi-k2.6` | `opencode/gemini-3-flash` |

For runtime switching details, see [Preset Switching](preset-switching.md).
