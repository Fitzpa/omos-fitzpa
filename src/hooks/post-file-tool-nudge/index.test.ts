import { describe, expect, test } from 'bun:test';

import { PHASE_REMINDER_TEXT } from '../../config/constants';
import { createPostFileToolNudgeHook } from './index';

function createOutput(output = 'real content') {
  return {
    title: 'Read',
    output,
    metadata: {},
  };
}

function countReminderInOutput(output: string | unknown): number {
  if (typeof output !== 'string') return 0;
  return output.split(PHASE_REMINDER_TEXT).length - 1;
}

describe('post-file-tool-nudge hook', () => {
  test('appends delegation reminder to tool output', async () => {
    const hook = createPostFileToolNudgeHook();
    const output = createOutput();

    await hook['tool.execute.after']({ tool: 'Read', sessionID: 's1' }, output);

    expect(output.output).toContain(PHASE_REMINDER_TEXT);
    expect(output.output).toContain('<internal_reminder>');
    expect(output.output).toContain('</internal_reminder>');
  });

  test('does not duplicate reminder in same tool output', async () => {
    const hook = createPostFileToolNudgeHook();
    const output = createOutput();

    await hook['tool.execute.after']({ tool: 'read', sessionID: 's1' }, output);
    await hook['tool.execute.after']({ tool: 'read', sessionID: 's1' }, output);

    expect(countReminderInOutput(output.output)).toBe(1);
  });

  test('deduplicates multiple Read/Write calls in same session', async () => {
    const hook = createPostFileToolNudgeHook();
    const output1 = createOutput('content 1');
    const output2 = createOutput('content 2');
    const output3 = createOutput('content 3');

    await hook['tool.execute.after'](
      { tool: 'read', sessionID: 's1' },
      output1,
    );
    await hook['tool.execute.after'](
      { tool: 'write', sessionID: 's1' },
      output2,
    );
    await hook['tool.execute.after'](
      { tool: 'Read', sessionID: 's1' },
      output3,
    );

    expect(output1.output).toContain(PHASE_REMINDER_TEXT);
    expect(output2.output).toContain(PHASE_REMINDER_TEXT);
    expect(output3.output).toContain(PHASE_REMINDER_TEXT);
  });

  test('ignores non-file tools', async () => {
    const hook = createPostFileToolNudgeHook();
    const output = createOutput('ok');

    await hook['tool.execute.after']({ tool: 'bash', sessionID: 's1' }, output);

    expect(output.output).toBe('ok');
    expect(output.output).not.toContain(PHASE_REMINDER_TEXT);
  });

  test('skips injection when shouldInject returns false', async () => {
    const hook = createPostFileToolNudgeHook({ shouldInject: () => false });
    const output = createOutput();

    await hook['tool.execute.after']({ tool: 'read', sessionID: 's1' }, output);

    expect(output.output).toBe('real content');
    expect(output.output).not.toContain(PHASE_REMINDER_TEXT);
  });

  test('ignores Read/Write without sessionID', async () => {
    const hook = createPostFileToolNudgeHook();
    const output = createOutput();

    await hook['tool.execute.after']({ tool: 'read' }, output);

    expect(output.output).toBe('real content');
    expect(output.output).not.toContain(PHASE_REMINDER_TEXT);
  });

  test('ignores non-string tool output', async () => {
    const hook = createPostFileToolNudgeHook();
    const output = { title: 'Read', output: { ok: true }, metadata: {} };

    await hook['tool.execute.after']({ tool: 'read', sessionID: 's1' }, output);

    expect(output.output).toEqual({ ok: true });
  });
});
