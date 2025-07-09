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
  private _url: string; // The url of the ldap server
  private _baseDN: string; // Base container where all LDAP queries originate from. (i.e. dc=domain,dc=com)
  private _username: string; // Username the administrative username or dn of the user for retrieving user & group information.
  private _password: string; // Password of the user

  constructor(config: ActiveDirectoryConstructor) {
    ActiveDirectoryContructorSchema.parse(config);
    this._url = config.url;
    this._baseDN = config.baseDN;
    this._username = config.username;
    this._password = config.password;
  }

  /* private variable getters */
  get url(): string {
    return this._url;
  }

  get baseDN(): string {
    return this._baseDN;
  }

  get username(): string {
    return this._username;
  }

  get password(): string {
    return this._password;
  }

  public async testConnection(): Promise<boolean> {
    const client = new Client({ url: this.url });

    try {
      await client.bind(this._username, this._password); // bind as admin
      return true;
    } catch (error) {
      throw new Error(`LDAP bind failed: ${(error as Error).message}`);
    } finally {
      await client.unbind();
    }
  }

  /*
      This function supports it's legacy use. https://www.npmjs.com/package/activedirectory
      It also provides overwrite controls for a more in-depth way of handling authentication. 
  */
  public async authenticate({
    username,
    password,
    user,
  }: AuthenticateUserProps): Promise<boolean> {
    AuthenticateUserSchema.parse({ username, password });

    const client = new Client({
      url: this.url,
    });

    try {
      if (user) {
        const userDn = await this._resolveUserDn(client, username, user);

        await client.bind(userDn, password);
      } else {
        await client.bind(username, password);
      }

      return true;
    } catch (err) {
      throw new Error(`Authentication failed: ${(err as Error).message}`);
    } finally {
      await client.unbind();
    }
  }

  private async _resolveUserDn(
    client: Client,
    username: string,
    user: {
      searchBase: string;
      searchFilter: string;
    }
  ): Promise<string> {
    const { searchBase, searchFilter } = user;
    const filter = searchFilter.replace('{{username}}', username);

    const { searchEntries } = await client.search(searchBase, {
      scope: 'sub',
      filter,
    });

    if (!searchEntries.length) {
      throw new Error(`User "${username}" not found`);
    }

    const first = searchEntries[0] as Record<string, any>;

    if (!first.dn) throw new Error('User entry missing DN');

    return first.dn;
  }

  // util helper functions
  formatDomainUser(username: string, domain: string) {
    // If username already has a domain prefix, return as is
    if (username.includes('\\')) return username;
    return `${domain}\\${username}`;
  }
}
