/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  CUSTOM_SKILLS,
  getCustomSkillsDir,
  installCustomSkill,
} from './custom-skills';

describe('custom skills installer', () => {
  const originalEnv = { ...process.env };
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'custom-skills-test-'));
    process.env.OPENCODE_CONFIG_DIR = join(tempDir, 'opencode');
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('getCustomSkillsDir resolves under the OpenCode config dir', () => {
    expect(getCustomSkillsDir()).toBe(join(tempDir, 'opencode', 'skills'));
  });

  test('installCustomSkill recursively copies a bundled skill', () => {
    const skill = CUSTOM_SKILLS.find((item) => item.name === 'codemap');
    expect(skill).toBeDefined();
    if (!skill) {
      throw new Error('codemap skill fixture missing');
    }

    expect(installCustomSkill(skill)).toBe(true);

    expect(existsSync(join(getCustomSkillsDir(), 'codemap', 'SKILL.md'))).toBe(
      true,
    );
    expect(
      existsSync(
        join(getCustomSkillsDir(), 'codemap', 'scripts', 'codemap.mjs'),
      ),
    ).toBe(true);
  });

  test('installCustomSkill returns false for a missing source', () => {
    expect(
      installCustomSkill({
        name: 'missing',
        description: 'missing',
        allowedAgents: [],
        sourcePath: 'src/skills/does-not-exist',
      }),
    ).toBe(false);
  });

  test('installCustomSkill returns false when copying fails', () => {
    expect(
      installCustomSkill({
        name: 'package-json',
        description: 'not a directory',
        allowedAgents: [],
        sourcePath: 'package.json',
      }),
    ).toBe(false);
  });
});
