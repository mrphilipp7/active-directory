import { Client } from 'ldapts';
import z from 'zod';

import type {
  ActiveDirectoryConstructor,
  AuthenticateUserProps,
} from '../types/ad';

const ActiveDirectoryContructorSchema = z.object({
  url: z.string(),
  baseDN: z.string(),
  username: z.string(),
  password: z.string(),
});

const AuthenticateUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export class ActiveDirectory {
  url: string; // The url of the ldap server
  baseDN: string; // Base container where all LDAP queries originate from. (i.e. dc=domain,dc=com)
  username: string; // Username the administrative username or dn of the user for retrieving user & group information.
  password: string; // Password of the user

  constructor(config: ActiveDirectoryConstructor) {
    ActiveDirectoryContructorSchema.parse(config);
    this.url = config.url;
    this.baseDN = config.baseDN;
    this.username = config.username;
    this.password = config.password;
  }

  async testConnection(): Promise<boolean> {
    const client = new Client({ url: this.url });

    try {
      await client.bind(this.username, this.password); // bind as admin
      return true;
    } catch (error) {
      throw new Error(`LDAP bind failed: ${(error as Error).message}`);
    } finally {
      await client.unbind();
    }
  }

  // legacy function for verifying login
  async authenticateRaw(username: string, password: string): Promise<boolean> {
    AuthenticateUserSchema.parse({ username, password });

    const client = new Client({ url: this.url });
    try {
      await client.bind(username, password);
      return true;
    } catch (err) {
      throw new Error(`Authentication failed: ${(err as Error).message}`);
    } finally {
      await client.unbind();
    }
  }

  /*
  async authenticateUser({
    username,
    password,
  }: AuthenticateUserProps): Promise<boolean> {
    const client = new Client({ url: this.url });
    try {
      AuthenticateUserSchema.parse({ username, password });
      
      await client.bind(this.username, this.password); // bind as admin
      
      return true;
    } catch (error) {
      throw new Error(`Authentication failed: ${(error as Error).message}`);
    } finally {
      await client.unbind();
    }
  }
  */

  // util helper functions
  formatDomainUser(username: string, domain: string) {
    // If username already has a domain prefix, return as is
    if (username.includes('\\')) return username;
    return `${domain}\\${username}`;
  }
}
