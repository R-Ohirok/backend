import { Context, Next } from "koa";
import jwt from 'jsonwebtoken';

const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { message: 'Unauthorized' };
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    ctx.state.user = decoded;
    
    await next();
  } catch {
    ctx.status = 401;
    ctx.body = { message: 'Invalid or expired token' };
  }
};

export default authMiddleware;