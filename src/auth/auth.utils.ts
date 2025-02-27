import * as bcrypt from 'bcrypt';
import { AuthToken } from './dto/auth-token.dto';

export function createFullToken(
  accessToken: string,
  refreshToken: string,
): AuthToken {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
  };
}

export async function encodePassword(rawPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(rawPassword, salt);
}

export async function comparePasswords(
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  const res = await bcrypt.compare(rawPassword, hashedPassword);
  return res;
}
