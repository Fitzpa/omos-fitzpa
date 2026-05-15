# MCP Servers

Built-in Model Context Protocol (MCP) servers ship with `omos-fitzpa` and give
agents access to external tools: web search, library documentation, and code
search.

---

## Built-in MCPs

| MCP | Purpose | Endpoint |
|-----|---------|----------|
| `websearch` | Real-time web search via Exa AI | `https://mcp.exa.ai/mcp` |
| `context7` | Official library documentation (up-to-date) | `https://mcp.context7.com/mcp` |
| `grep_app` | GitHub code search via grep.app | `https://mcp.grep.app` |

---

## Custom CodeGraph MCP

`omos-fitzpa` does not bundle a CodeGraph MCP server, but it recognizes a custom
OpenCode MCP named `codegraph`.

When both conditions are true, OMOS automatically adds CodeGraph guidance to
eligible agents:

- the current project contains `.codegraph/codegraph.db`
- the merged OpenCode MCP config contains a server named `codegraph`

The guidance is advisory. Agents are steered to use `codegraph_search`,
`codegraph_files`, `codegraph_callers`, `codegraph_callees`,
`codegraph_impact`, and `codegraph_explore` before broad `rg`, `find`, or `ls`
discovery. Bash remains appropriate for tests, builds, git, exact file
operations, and fallback when the index is stale or incomplete.

Recommended access:

```jsonc
{
  "presets": {
    "my-preset": {
      "orchestrator": { "mcps": ["*", "!context7"] },
      "explorer": { "mcps": ["codegraph"] },
      "fixer": { "mcps": ["codegraph"] },
      "reviewer": { "mcps": ["codegraph"] },
      "simplifier": { "mcps": ["codegraph"] },
      "oracle": { "mcps": ["codegraph"] }
    }
  }
}
```

Wildcard rules apply to custom MCPs too. For example, an orchestrator configured
with `["*", "!context7"]` can use `codegraph` when OpenCode has that MCP
configured.

---

## Default Permissions Per Agent

| Agent | Default MCPs |
|-------|-------------|
| `orchestrator` | `*`, `!context7` |
| `librarian` | `websearch`, `context7`, `grep_app` |
| `designer` | none |
| `oracle` | none |
| `explorer` | none |
| `fixer` | none |
| `reviewer` | none |
| `simplifier` | none |
| `council` | none |
| `councillor` | none |

---

## Configuring MCP Access

Control which MCPs each agent can use via the `mcps` array in your preset config (`~/.config/opencode/oh-my-opencode-slim.json` or `.jsonc`):

| Syntax | Meaning |
|--------|---------|
| `["*"]` | All MCPs |
| `["*", "!context7"]` | All MCPs except `context7` |
| `["websearch", "context7"]` | Only listed MCPs |
| `[]` | No MCPs |
| `["!*"]` | Deny all MCPs |

**Rules:**
- `*` expands to all available MCPs
- `!item` excludes a specific MCP
- Conflicts (e.g. `["a", "!a"]`) → deny wins

**Example:**

```json
{
  "presets": {
    "my-preset": {
      "orchestrator": {
        "mcps": ["*", "!context7"]
      },
      "librarian": {
        "mcps": ["websearch", "context7", "grep_app"]
      },
      "oracle": {
        "mcps": ["*", "!websearch"]
      },
      "fixer": {
        "mcps": []
      }
    }
  }
}
```

---

## Disabling MCPs Globally

To disable specific MCPs for all agents regardless of preset, add them to `disabled_mcps` at the root of your config:

```json
{
  "disabled_mcps": ["websearch"]
}
```

This is useful when you want to cut external network calls entirely (e.g. air-gapped environments or cost control).
