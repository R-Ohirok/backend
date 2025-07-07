import type { Context } from 'koa';
import { z } from 'zod';
import User from '../../config/models/User.js';
import bcrypt from 'bcrypt';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const VerifyEmailSchema = z.object({
  email: z.string().email(),
});

const LoginSchema = z.object({
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

export const verifyEmail = async (ctx: Context) => {
  console.log('check');
  const parsed = VerifyEmailSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid email' };

    return;
  }

  const { email } = parsed.data;

  const user = await User.query().findOne({ email });

  if (!user) {
    ctx.status = 401;
    ctx.body = { message: 'there is no user with this email in the database' };

    return;
  }

  ctx.status = 200;
}

export const login = async (ctx: Context) => {
  const parsed = LoginSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };

    return;
  }

  const { email, password } = parsed.data;

  const user = await User.query().findOne({ email });

  if (!user) {
    ctx.status = 401;
    ctx.body = { message: 'Invalid email or password' };

    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    ctx.status = 401;
    ctx.body = { message: 'Invalid password' };
    return;
  }

  ctx.status = 200;
};