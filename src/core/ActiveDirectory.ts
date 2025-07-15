import { Client } from 'ldapts';

import type {
  ActiveDirectoryConstructor,
  AuthenticateUserProps,
} from '../types/ad';

import {
  ActiveDirectoryContructorSchema,
  AuthenticateUserSchema,
} from './schemas';

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

  /* --- function provides a quick test to see if client is binding --- */
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
        // in-depth control over authentication
        await client.bind(this._username, this._password);
        const searchFilter = this._createFilter(user.searchFilter, username);

        const searchEntries = await this._searchEntries(
          client,
          searchFilter,
          user.searchBase
        );

        if (searchEntries.length === 0) throw new Error('User not found');
        const { dn } = searchEntries[0];
        await client.bind(dn, password);

        return true;
      } else {
        // legacy authentication
        await client.bind(username, password);
        return true;
      }
    } catch (err) {
      throw new Error(`Authentication failed: ${(err as Error).message}`);
    } finally {
      await client.unbind();
    }
  }

  /* --- utility functions for in-depth authentication --- */
  private _createFilter(userFilter: string, username: string) {
    return userFilter.replace('{{username}}', username);
  }

  private async _searchEntries(client: Client, filter: string, base: string) {
    const { searchEntries } = await client.search(base, {
      scope: 'sub',
      filter,
    });
    return searchEntries;
  }

  /* --- utility function for formatting user when authentication --- */
  public formatDomainUser(username: string, domain: string) {
    // If username already has a domain prefix, return as is
    if (username.includes('\\')) return username;
    return `${domain}\\${username}`;
  }
}
