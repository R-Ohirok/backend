import type { Context } from 'koa';
import { z } from 'zod';
import User from '../../config/models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from './utils/generateToken.js';
import TokenBlacklist from '../../config/models/TokenBlacklist.js';

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

  const accessToken = generateAccessToken({ email });
  const refreshToken = generateRefreshToken({ email });

  ctx.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  });

  const payloadBase64 = accessToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expiresAt = decodedPayload.exp;

    ctx.status = 200;
    ctx.body = { accessToken, expiresAt };
};

export const verifyEmail = async (ctx: Context) => {
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

  const accessToken = generateAccessToken({ email });
  const refreshToken = generateRefreshToken({ email });

  ctx.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  });

  const payloadBase64 = accessToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expiresAt = decodedPayload.exp;

    ctx.status = 200;
    ctx.body = { accessToken, expiresAt };
};

export const logout = async (ctx: Context) => {
  const refreshToken = ctx.cookies.get('refreshToken');
  
  if (!refreshToken) {
    ctx.status = 400;
    ctx.body = { message: 'Refresh token not found' };

    return;
  }
  
  try {
    const payloadBase64 = refreshToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expiresAt = decodedPayload.exp;

    await TokenBlacklist.query().insert({
      token: refreshToken,
      expires_at: expiresAt * 1000,
    });
    
    ctx.cookies.set('refreshToken', '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });
    

    ctx.status = 200;
  } catch (err) {
    console.error('Logout error:', err);
    ctx.status = 401;
    ctx.body = { message: 'Invalid refresh token' };
  }
};

export const refresh = async (ctx: Context) => {
  const token = ctx.cookies.get('refreshToken');

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: 'No refresh token' };

    return;
  }

  const isBlacklisted = !!(await TokenBlacklist.query().findOne({ token }));

  if (isBlacklisted) {
    ctx.status = 403;
    ctx.body = { message: 'Refresh token is blacklisted' };
    
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as object;
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    ctx.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000,
    });

    const payloadBase64 = accessToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const expiresAt = decodedPayload.exp;

    ctx.status = 200;
    ctx.body = { accessToken, expiresAt };
  } catch {
    ctx.status = 403;
    ctx.body = { message: 'Invalid refresh token' };
  }
};