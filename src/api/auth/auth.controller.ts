import type { Context } from 'koa';
import { z } from 'zod';
import User from '../../config/models/User.js';
import bcrypt from 'bcrypt';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const register = async (ctx: Context) => {
  const parsed = RegisterSchema.safeParse(ctx.request.body);


  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { email, password } = parsed.data;

  const existingUser = await User.query().findOne({ email });

  if (existingUser) {
    ctx.status = 409;
    ctx.body = { message: 'User already exists' };
    return;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await User.query().insert({
    email,
    password: hashedPassword,
  });

  ctx.status = 200;
};