import jwt from 'jsonwebtoken';
import type { Context } from 'koa';

export const getUserFromContext = (ctx: Context) => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch {
    return null;
  }
};