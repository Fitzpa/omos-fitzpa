import { describe, expect, test } from 'bun:test';

import {
  ApplyPatchError,
  createApplyPatchBlockedError,
  createApplyPatchInternalError,
  createApplyPatchValidationError,
  createApplyPatchVerificationError,
  ensureApplyPatchError,
  getApplyPatchErrorDetails,
  getErrorMessage,
  isApplyPatchBlockedError,
  isApplyPatchError,
  isApplyPatchInternalError,
  isApplyPatchValidationError,
  isApplyPatchVerificationError,
} from './errors';

describe('apply-patch/errors', () => {
  test('classifies apply patch errors by kind', () => {
    const blocked = createApplyPatchBlockedError('outside');
    const validation = createApplyPatchValidationError('bad');
    const verification = createApplyPatchVerificationError('mismatch');
    const internal = createApplyPatchInternalError('boom');

    expect(isApplyPatchError(blocked)).toBe(true);
    expect(isApplyPatchBlockedError(blocked)).toBe(true);
    expect(isApplyPatchValidationError(validation)).toBe(true);
    expect(isApplyPatchVerificationError(verification)).toBe(true);
    expect(isApplyPatchInternalError(internal)).toBe(true);
    expect(isApplyPatchBlockedError(new Error('x'))).toBe(false);
  });

  test('returns details only for apply patch errors', () => {
    const error = new ApplyPatchError('validation', 'malformed_patch', 'bad');

    expect(getApplyPatchErrorDetails(error)).toEqual({
      kind: 'validation',
      code: 'malformed_patch',
      message: 'apply_patch validation failed: bad',
    });
    expect(getApplyPatchErrorDetails('bad')).toBeUndefined();
  });

  test('ensureApplyPatchError preserves known errors and wraps unknown values', () => {
    const known = createApplyPatchBlockedError('no');
    expect(ensureApplyPatchError(known, 'context')).toBe(known);

    const wrapped = ensureApplyPatchError('raw failure', 'context');
    expect(wrapped.kind).toBe('internal');
    expect(wrapped.message).toContain('context: raw failure');
    expect(getErrorMessage(new Error('real'))).toBe('real');
  });
});
