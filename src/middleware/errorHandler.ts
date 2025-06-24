import type { Context, Next } from 'koa';

const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    const error = err as { status?: number; message?: string };

    ctx.status = error.status ?? 500;
    ctx.body = { message: error.message ?? 'Internal Server Error' };
    ctx.app.emit('error', err, ctx);
  }
};

export default errorHandler;