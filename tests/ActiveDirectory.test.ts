import { expect, describe, it } from 'vitest';
import { ZodError } from 'zod';

import { ActiveDirectory } from '../src/core/ActiveDirectory';

/*
 --- zod error format ---
[
    {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: ['password'],
    message: 'required',
    },
]
*/

describe("Creating 'ActiveDirectory' instance", () => {
  it('should create a new instance', () => {
    const config = {
      url: 'testUrl',
      baseDN: 'testBaseDN',
      username: 'testUsername',
      password: 'testPassword',
    };
    const instance = new ActiveDirectory(config);
    expect(instance).toBeInstanceOf(ActiveDirectory);
    expect(instance.url === 'testUrl');
    expect(instance.baseDN === 'testBaseDN');
    expect(instance.username === 'testUsername');
    expect(instance.password === 'testPassword');
  });

  it('should throw error when url is missing', () => {
    const config = {
      baseDN: 'testBaseDN',
      username: 'testUsername',
      password: 'testPassword',
    };
    try {
      new ActiveDirectory(config as any);
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.errors[0].message).toBe('Required');
      } else throw err;
    }
  });

  it('should throw error when baseDN is missing', () => {
    const config = {
      url: 'testUrl',
      username: 'testUsername',
      password: 'testPassword',
    };

    try {
      new ActiveDirectory(config as any);
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.errors[0].message).toBe('Required');
      } else throw err;
    }
  });

  it('should throw error when username is missing', () => {
    const config = {
      url: 'testUrl',
      baseDN: 'testDN',
      password: 'testPassword',
    };
    try {
      new ActiveDirectory(config as any);
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.errors[0].message).toBe('Required');
      } else throw err;
    }
  });

  it('should throw error when password is missing', () => {
    const config = {
      url: 'testUrl',
      baseDN: 'testDN',
      username: 'testUsername',
    };
    try {
      new ActiveDirectory(config as any);
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError);
        expect(err.errors[0].message).toBe('Required');
      } else throw err;
    }
  });
});
