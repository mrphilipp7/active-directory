export interface ActiveDirectoryConstructor {
  url: string;
  baseDN: string;
  username: string;
  password: string;
}

export interface AuthenticateUserProps {
  username: string;
  password: string;
}
