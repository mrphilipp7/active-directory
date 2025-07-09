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

describe('ActiveDirectory methods', () => {
  // test connection method
  describe('test connection', () => {
    describe('docker test', () => {
      it('should fail', async () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: '', // incorrect password
        };
        const instance = new ActiveDirectory(config);
        await expect(instance.testConnection()).rejects.toThrowError(
          'LDAP bind failed'
        );
      });
      it('should pass', async () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: 'admin',
        };
        const instance = new ActiveDirectory(config);
        expect(await instance.testConnection()).toBe(true);
      });
    });
  });

  // legacy function
  describe('test authentication ', () => {
    describe('docker test', () => {
      it('should pass', async () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: 'admin',
        };
        const instance = new ActiveDirectory(config);
        expect(
          await instance.authenticate({
            username: 'uid=john.doe,ou=users,dc=example,dc=org',
            password: 'password',
          })
        ).toBe(true);
      });

      it('should fail with wrong password', async () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: 'admin',
        };
        const instance = new ActiveDirectory(config);
        await expect(
          instance.authenticate({
            username: 'uid=john.doe,ou=users,dc=example,dc=org',
            password: 'wrong password',
          })
        ).rejects.toThrowError('Authentication failed');
      });

      it('should fail with wrong DN', async () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: 'admin',
        };
        const instance = new ActiveDirectory(config);
        await expect(
          instance.authenticate({
            username: 'uid=non-existent,ou=users,dc=example,dc=org',
            password: 'wrong password',
          })
        ).rejects.toThrowError('Authentication failed');
      });

      it('authenticates user via search filter', async () => {
        const instance = new ActiveDirectory({
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: 'admin',
        });

        const result = await instance.authenticate({
          username: 'john.doe',
          password: 'cGFzc3dvcmQ=',
          user: {
            searchBase: 'dc=example,dc=org',
            searchFilter: '(uid={{username}})',
          },
        });

        expect(result).toBe(true);
      });
    });
  });

  describe('utils', () => {
    describe('format domain user', () => {
      it('combine user info to single string', () => {
        const config = {
          url: 'ldap://localhost:389',
          baseDN: 'dc=example,dc=org',
          username: 'cn=admin,dc=example,dc=org',
          password: '', // incorrect password
        };
        const instance = new ActiveDirectory(config);
        expect(instance.formatDomainUser('test-user', 'TEST-DOMAIN')).toBe(
          'TEST-DOMAIN\\test-user'
        );
      });
    });
  });
});
