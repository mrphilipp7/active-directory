import z from 'zod';

export const ActiveDirectoryContructorSchema = z.object({
  url: z.string(),
  baseDN: z.string(),
  username: z.string(),
  password: z.string(),
});

export const AuthenticateUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
