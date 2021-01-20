import { User } from './entity/User';
import { sign } from 'jsonwebtoken';
import { hash } from 'bcryptjs';

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_SECRET!, {
    expiresIn: '5m',
  });
};

export const createRefreshToken = async (accessToken: string) => {
  return await hash(accessToken, 12);
};
