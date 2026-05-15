import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import * as childProcess from 'node:child_process';
import { getSkillPermissionsForAgent, installSkill } from './skills';

const spawnSpy = spyOn(childProcess, 'spawnSync');

afterEach(() => {
  spawnSpy.mockReset();
});

describe('skills permissions', () => {
  it('should allow all skills for orchestrator by default', () => {
    const permissions = getSkillPermissionsForAgent('orchestrator');
    expect(permissions['*']).toBe('allow');
  });

  it('should deny all skills for other agents by default', () => {
    const permissions = getSkillPermissionsForAgent('designer');
    expect(permissions['*']).toBe('deny');
  });

  it('should allow recommended skills for specific agents', () => {
    // Designer should have agent-browser allowed
    const designerPerms = getSkillPermissionsForAgent('designer');
    expect(designerPerms['agent-browser']).toBe('allow');

    // Oracle should have simplify allowed by default
    const oraclePerms = getSkillPermissionsForAgent('oracle');
    expect(oraclePerms.simplify).toBe('allow');

    const orchestratorPerms = getSkillPermissionsForAgent('orchestrator');
    expect(orchestratorPerms.clonedeps).toBe('allow');
  });

  it('should honor explicit skill list overrides', () => {
    // Override with empty list
    const emptyPerms = getSkillPermissionsForAgent('orchestrator', []);
    expect(emptyPerms['*']).toBe('deny');
    expect(Object.keys(emptyPerms).length).toBe(1);

    // Override with specific list
    const specificPerms = getSkillPermissionsForAgent('designer', [
      'my-skill',
      '!bad-skill',
    ]);
    expect(specificPerms['*']).toBe('deny');
    expect(specificPerms['my-skill']).toBe('allow');
    expect(specificPerms['bad-skill']).toBe('deny');
  });

  it('should honor wildcard in explicit list', () => {
    const wildcardPerms = getSkillPermissionsForAgent('designer', ['*']);
    expect(wildcardPerms['*']).toBe('allow');
  });

  it('installSkill runs npx and post-install commands', () => {
    spawnSpy.mockReturnValue({
      status: 0,
    } as childProcess.SpawnSyncReturns<Buffer>);

    expect(
      installSkill({
        name: 'test skill',
        repo: 'https://example.com/repo',
        skillName: 'test-skill',
        allowedAgents: ['designer'],
        description: 'test',
        postInstallCommands: ['echo done'],
      }),
    ).toBe(true);

    expect(spawnSpy).toHaveBeenCalledWith(
      'npx',
      [
        'skills',
        'add',
        'https://example.com/repo',
        '--skill',
        'test-skill',
        '-a',
        'opencode',
        '-y',
        '--global',
      ],
      { stdio: 'inherit' },
    );
    expect(spawnSpy).toHaveBeenCalledWith('echo', ['done'], {
      stdio: 'inherit',
    });
  });

  it('installSkill returns false when npx exits unsuccessfully', () => {
    spawnSpy.mockReturnValue({
      status: 1,
    } as childProcess.SpawnSyncReturns<Buffer>);

    expect(
      installSkill({
        name: 'test skill',
        repo: 'https://example.com/repo',
        skillName: 'test-skill',
        allowedAgents: ['designer'],
        description: 'test',
      }),
    ).toBe(false);
  });

  it('installSkill continues after failed post-install commands', () => {
    spawnSpy
      .mockReturnValueOnce({
        status: 0,
      } as childProcess.SpawnSyncReturns<Buffer>)
      .mockReturnValueOnce({
        status: 1,
      } as childProcess.SpawnSyncReturns<Buffer>);

    expect(
      installSkill({
        name: 'test skill',
        repo: 'https://example.com/repo',
        skillName: 'test-skill',
        allowedAgents: ['designer'],
        description: 'test',
        postInstallCommands: ['echo done'],
      }),
    ).toBe(true);
  });

  it('installSkill returns false when spawn throws', () => {
    spawnSpy.mockImplementation(() => {
      throw new Error('spawn failed');
    });

    expect(
      installSkill({
        name: 'test skill',
        repo: 'https://example.com/repo',
        skillName: 'test-skill',
        allowedAgents: ['designer'],
        description: 'test',
      }),
    ).toBe(false);
  });
});
