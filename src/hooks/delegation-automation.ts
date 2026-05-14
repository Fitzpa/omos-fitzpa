import type { PluginInput } from '@opencode-ai/plugin';
import type { DelegationAutomationConfig } from '../config';
import { createInternalAgentTextPart } from '../utils';
import { log } from '../utils/logger';

export const REVIEW_CHANGES_COMMAND = 'review-changes';
export const SIMPLIFY_CHANGES_COMMAND = 'simplify-changes';

const WORKING_TREE_CONTEXT = `Gather working tree context first:
- git status --short
- git diff --staged
- git diff
- git ls-files --others --exclude-standard`;

export const REVIEW_CHANGES_TEMPLATE = `${WORKING_TREE_CONTEXT}

Then ask @reviewer to review only those changes. Include staged diff,
unstaged diff, and untracked file contents or summaries as relevant.

USER FOCUS:
$ARGUMENTS`;

export const SIMPLIFY_CHANGES_TEMPLATE = `${WORKING_TREE_CONTEXT}

Then ask @simplifier to simplify only those changed or untracked files while
strictly preserving behavior.

USER FOCUS:
$ARGUMENTS`;

function ensureCommandMap(
  opencodeConfig: Record<string, unknown>,
): Record<string, unknown> {
  if (!opencodeConfig.command) {
    opencodeConfig.command = {};
  }
  return opencodeConfig.command as Record<string, unknown>;
}

export function registerDelegationCommands(
  opencodeConfig: Record<string, unknown>,
): void {
  const command = ensureCommandMap(opencodeConfig);

  if (!command[REVIEW_CHANGES_COMMAND]) {
    command[REVIEW_CHANGES_COMMAND] = {
      description:
        'Review staged, unstaged, and untracked working tree changes',
      template: REVIEW_CHANGES_TEMPLATE,
    };
  }

  if (!command[SIMPLIFY_CHANGES_COMMAND]) {
    command[SIMPLIFY_CHANGES_COMMAND] = {
      description:
        'Simplify staged, unstaged, and untracked working tree changes',
      template: SIMPLIFY_CHANGES_TEMPLATE,
    };
  }
}

function isWriteTool(tool: string): boolean {
  const normalized = tool.toLowerCase();
  return (
    normalized === 'write' ||
    normalized === 'edit' ||
    normalized === 'apply_patch' ||
    normalized === 'patch'
  );
}

function isIdleEvent(input: {
  event: { type: string; properties?: { status?: { type?: string } } };
}): boolean {
  return (
    input.event.type === 'session.idle' ||
    (input.event.type === 'session.status' &&
      input.event.properties?.status?.type === 'idle')
  );
}

export function createDelegationAutomationHook(
  ctx: PluginInput,
  options: DelegationAutomationConfig & {
    getSessionAgent?: (sessionID: string) => string | undefined;
  },
) {
  if (options.mainSessionOnly && !options.getSessionAgent) {
    throw new Error('mainSessionOnly requires getSessionAgent to be provided');
  }

  const dirtySessions = new Set<string>();

  function isEnabled(): boolean {
    return Boolean(options.postEditReview || options.postEditSimplify);
  }

  return {
    handleToolExecuteAfter(input: { tool: string; sessionID?: string }): void {
      if (!isEnabled() || !input.sessionID || !isWriteTool(input.tool)) {
        return;
      }
      dirtySessions.add(input.sessionID);
    },

    async handleEvent(input: {
      event: {
        type: string;
        properties?: { sessionID?: string; status?: { type?: string } };
      };
    }): Promise<void> {
      const sessionID = input.event.properties?.sessionID;
      if (!isEnabled() || !sessionID || !isIdleEvent(input)) {
        return;
      }
      if (!dirtySessions.delete(sessionID)) {
        return;
      }
      if (
        options.mainSessionOnly &&
        options.getSessionAgent?.(sessionID) !== 'orchestrator'
      ) {
        return;
      }

      const commands = [
        options.postEditReview ? '/review-changes' : undefined,
        options.postEditSimplify ? '/simplify-changes' : undefined,
      ].filter((command): command is string => Boolean(command));

      if (commands.length === 0) {
        return;
      }

      try {
        await ctx.client.session.promptAsync({
          path: { id: sessionID },
          body: {
            parts: [
              createInternalAgentTextPart(
                `Run the following post-edit automation now:\n${commands.join(
                  '\n',
                )}`,
              ),
            ],
          },
        });
      } catch (error) {
        log('[plugin] delegation automation prompt failed', {
          sessionID,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  };
}

export type DelegationAutomationHook = ReturnType<
  typeof createDelegationAutomationHook
>;
