import { describe, expect, mock, test } from 'bun:test';
import {
  createDelegationAutomationHook,
  registerDelegationCommands,
} from './delegation-automation';

function createCtx() {
  return {
    client: {
      session: {
        promptAsync: mock(async () => {}),
      },
    },
  } as any;
}

describe('delegation commands', () => {
  test('creates command map when absent', () => {
    const opencodeConfig: Record<string, unknown> = {};

    registerDelegationCommands(opencodeConfig);

    expect(opencodeConfig.command).toBeDefined();
  });

  test('registers review and simplify commands without overwriting user commands', () => {
    const opencodeConfig: Record<string, unknown> = {
      command: {
        'review-changes': { template: 'user template' },
      },
    };

    registerDelegationCommands(opencodeConfig);

    const commands = opencodeConfig.command as Record<string, any>;
    expect(commands['review-changes'].template).toBe('user template');
    expect(commands['simplify-changes']).toBeDefined();
    expect(commands['simplify-changes'].template).toContain('@simplifier');
  });
});

describe('delegation automation', () => {
  test('is disabled by default', async () => {
    const ctx = createCtx();
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: false,
      postEditSimplify: false,
      mainSessionOnly: true,
      getSessionAgent: () => 'orchestrator',
    });

    hook.handleToolExecuteAfter({ tool: 'write', sessionID: 's1' });
    await hook.handleEvent({
      event: {
        type: 'session.status',
        properties: { sessionID: 's1', status: { type: 'idle' } },
      },
    });

    expect(ctx.client.session.promptAsync).not.toHaveBeenCalled();
  });

  test('prompts on idle after tracked write activity', async () => {
    const ctx = createCtx();
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: true,
      postEditSimplify: false,
      mainSessionOnly: true,
      getSessionAgent: () => 'orchestrator',
    });

    hook.handleToolExecuteAfter({ tool: 'edit', sessionID: 's1' });
    await hook.handleEvent({
      event: {
        type: 'session.status',
        properties: { sessionID: 's1', status: { type: 'idle' } },
      },
    });

    expect(ctx.client.session.promptAsync).toHaveBeenCalledTimes(1);
    const call = ctx.client.session.promptAsync.mock.calls[0]?.[0];
    expect(call.path.id).toBe('s1');
    expect(call.body.parts[0].text).toContain('/review-changes');
    expect(call.body.parts[0].text).not.toContain('/simplify-changes');
  });

  test('respects mainSessionOnly', async () => {
    const ctx = createCtx();
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: true,
      postEditSimplify: true,
      mainSessionOnly: true,
      getSessionAgent: () => 'fixer',
    });

    hook.handleToolExecuteAfter({ tool: 'write', sessionID: 's1' });
    await hook.handleEvent({
      event: {
        type: 'session.status',
        properties: { sessionID: 's1', status: { type: 'idle' } },
      },
    });

    expect(ctx.client.session.promptAsync).not.toHaveBeenCalled();
  });

  test('requires getSessionAgent for mainSessionOnly', () => {
    const ctx = createCtx();

    expect(() =>
      createDelegationAutomationHook(ctx, {
        postEditReview: true,
        postEditSimplify: false,
        mainSessionOnly: true,
      }),
    ).toThrow('mainSessionOnly requires getSessionAgent to be provided');
  });

  test('ignores idle events without tracked writes', async () => {
    const ctx = createCtx();
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: true,
      postEditSimplify: true,
      mainSessionOnly: false,
    });

    await hook.handleEvent({
      event: {
        type: 'session.idle',
        properties: { sessionID: 's1' },
      },
    });

    expect(ctx.client.session.promptAsync).not.toHaveBeenCalled();
  });

  test('clears tracked write activity when session is deleted', async () => {
    const ctx = createCtx();
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: true,
      postEditSimplify: true,
      mainSessionOnly: false,
    });

    hook.handleToolExecuteAfter({ tool: 'write', sessionID: 's1' });
    await hook.handleEvent({
      event: {
        type: 'session.deleted',
        properties: { sessionID: 's1' },
      },
    });
    await hook.handleEvent({
      event: {
        type: 'session.idle',
        properties: { sessionID: 's1' },
      },
    });

    expect(ctx.client.session.promptAsync).not.toHaveBeenCalled();
  });

  test('logs and swallows prompt failures', async () => {
    const ctx = {
      client: {
        session: {
          promptAsync: mock(async () => {
            throw new Error('prompt failed');
          }),
        },
      },
    } as any;
    const hook = createDelegationAutomationHook(ctx, {
      postEditReview: true,
      postEditSimplify: true,
      mainSessionOnly: false,
    });

    hook.handleToolExecuteAfter({ tool: 'apply_patch', sessionID: 's1' });
    await hook.handleEvent({
      event: {
        type: 'session.idle',
        properties: { sessionID: 's1' },
      },
    });

    expect(ctx.client.session.promptAsync).toHaveBeenCalledTimes(1);
  });
});
