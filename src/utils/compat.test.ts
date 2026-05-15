/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crossSpawn, crossWrite, isBun } from './compat';

describe('compat utilities', () => {
  test('isBun reflects the Bun runtime', () => {
    expect(isBun).toBe(true);
  });

  test('crossSpawn collects stdout and stderr', async () => {
    const result = crossSpawn([
      process.execPath,
      '-e',
      "console.log('out'); console.error('err')",
    ]);

    await expect(result.exited).resolves.toBe(0);
    await expect(result.stdout()).resolves.toBe('out\n');
    await expect(result.stderr()).resolves.toBe('err\n');
    expect(result.exitCode).toBe(0);
  });

  test('crossSpawn supports ignored streams and kill passthrough', async () => {
    const result = crossSpawn(
      [process.execPath, '-e', 'setTimeout(() => {}, 1000)'],
      {
        stdout: 'ignore',
        stderr: 'ignore',
        stdin: 'ignore',
      },
    );

    await expect(result.stdout()).resolves.toBe('');
    await expect(result.stderr()).resolves.toBe('');
    expect(result.kill()).toBe(true);
    await result.exited;
  });

  test('crossWrite writes string data', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'compat-test-'));
    const file = join(dir, 'file.txt');

    await crossWrite(file, 'hello');

    expect(readFileSync(file, 'utf8')).toBe('hello');
    rmSync(dir, { recursive: true, force: true });
  });
});
