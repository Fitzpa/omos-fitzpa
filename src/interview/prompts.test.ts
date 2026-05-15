import { describe, expect, test } from 'bun:test';

import { buildAnswerPrompt } from './prompts';

describe('interview prompts', () => {
  test('answer prompt describes empty question context', () => {
    expect(buildAnswerPrompt([], [], 3)).toContain(
      'No current interview questions were parsed.',
    );
  });
});
