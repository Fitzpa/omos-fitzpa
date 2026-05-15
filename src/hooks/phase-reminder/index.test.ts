import { describe, expect, test } from 'bun:test';
import { SLIM_INTERNAL_INITIATOR_MARKER } from '../../utils';
import { createPhaseReminderHook, PHASE_REMINDER } from './index';

describe('createPhaseReminderHook', () => {
  test('appends reminder for orchestrator sessions', async () => {
    const hook = createPhaseReminderHook();
    const output = {
      messages: [
        {
          info: { role: 'user', agent: 'orchestrator' },
          parts: [{ type: 'text', text: 'hello' }],
        },
      ],
    };

    await hook['experimental.chat.messages.transform']({}, output);

    expect(output.messages[0].parts[0].text).toBe(
      `hello\n\n---\n\n${PHASE_REMINDER}`,
    );
  });

  test('skips non-orchestrator sessions', async () => {
    const hook = createPhaseReminderHook();
    const output = {
      messages: [
        {
          info: { role: 'user', agent: 'explorer' },
          parts: [{ type: 'text', text: 'hello' }],
        },
      ],
    };

    await hook['experimental.chat.messages.transform']({}, output);

    expect(output.messages[0].parts[0].text).toBe('hello');
  });

  test('does not mutate internal notification turns', async () => {
    const hook = createPhaseReminderHook();
    const text = `[Background task "x" completed]\n${SLIM_INTERNAL_INITIATOR_MARKER}`;
    const output = {
      messages: [
        {
          info: { role: 'user' },
          parts: [{ type: 'text', text }],
        },
      ],
    };

    await hook['experimental.chat.messages.transform']({}, output);

    expect(output.messages[0].parts[0].text).toBe(text);
    expect(output.messages[0].parts[0].text).not.toContain(PHASE_REMINDER);
  });

  test('does not append duplicate reminder', async () => {
    const hook = createPhaseReminderHook();
    const text = `hello\n\n---\n\n${PHASE_REMINDER}`;
    const output = {
      messages: [
        {
          info: { role: 'user', agent: 'orchestrator' },
          parts: [{ type: 'text', text }],
        },
      ],
    };

    await hook['experimental.chat.messages.transform']({}, output);

    expect(output.messages[0].parts[0].text).toBe(text);
  });

  test('skips empty message lists, assistant-only turns, and textless users', async () => {
    const hook = createPhaseReminderHook();
    const empty = { messages: [] };
    await hook['experimental.chat.messages.transform']({}, empty);
    expect(empty.messages).toEqual([]);

    const assistantOnly = {
      messages: [{ info: { role: 'assistant' }, parts: [{ type: 'text' }] }],
    };
    await hook['experimental.chat.messages.transform']({}, assistantOnly);
    expect(assistantOnly.messages[0].parts[0].text).toBeUndefined();

    const textlessUser = {
      messages: [{ info: { role: 'user' }, parts: [{ type: 'image' }] }],
    };
    await hook['experimental.chat.messages.transform']({}, textlessUser);
    expect(textlessUser.messages[0].parts).toEqual([{ type: 'image' }]);
  });
});
