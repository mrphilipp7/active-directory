# active-directory
Inspired by https://www.npmjs.com/package/activedirectory, this package helps to bring a modern, simple, typescript first approach towards ineracting with active directory.

```bash
npm i @mrphilipp7/active-directory
```

As of now, the package only supports authentication. Additional functionality will be added in future releases.

### Start up
Create a new instance of the ActiveDirectory class

```typescript
const config = {
  url: 'ldap://localhost:389',
  baseDN: 'dc=example,dc=org',
  username: 'cn=admin,dc=example,dc=org',
  password: 'admin',
};
const instance = new ActiveDirectory(config);
```

### User authentication
Like I said above, being inspired by https://www.npmjs.com/package/activedirectory I kept the same functionality of the original packages authentication function.
```typescript
const username = 'john.doe'; 
await instance.authenticate({
  username: `uid=${username},ou=users,dc=example,dc=org`,
  password: 'password',
})
```
However the package now includes a more indepth search option to include filters.
```typescript
const result = await instance.authenticate({
  username: 'john.doe',
  password: 'password',
  user: {
    searchBase: 'ou=users,dc=example,dc=org',
    searchFilter: '(uid={{username}})',
  },
});
```
The class also has a small utility function to help you format names when applying them for authentication.
```typescript
instance.formatDomainUser('test-user', 'TEST-DOMAIN') // will create 'TEST-DOMAIN\\test-user' 
```

⚠️ This is an early version with limited functionality. 
More features coming soon!
