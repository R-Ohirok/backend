import type { Context } from 'koa';
import { z } from 'zod';
import Workspace from '../../config/models/Workspace.js';
import User from '../../config/models/User.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken.js';

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
});
const joinWorkspaceSchema = z.object({
  workspace_id: z.number().int().positive(),
});
export const getAllWorkspaces = async (ctx: Context) => {
  try {
    const workspaces = await Workspace.query().select('id', 'name').orderBy('id');;

    ctx.status = 200;
    ctx.body = workspaces;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to get workspaces' };
  }
};

export const createWorkspace = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const parsed = CreateWorkspaceSchema.safeParse(ctx.request.body);
  
  if (!Number.isInteger(userId) || userId <= 0) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid user id' };
    return;
  }

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { name } = parsed.data;

  const user = await User.query().findById(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'User not found' };
    return;
  }

  const existingWorkspace = await Workspace.query().findOne({ name });

  if (existingWorkspace) {
    ctx.status = 409;
    ctx.body = { message: 'Workspace with this name already exists' };
    return;
  }

  try {
    const workspace: Workspace = await Workspace.query().insert({
      name,
    });
    
    await User.query().findById(userId).patch({ workspace_id: workspace.id });
    
    const payload = { id: user.id, email: user.email, workspace_id: workspace.id };
    const workspace_id = workspace.id;
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

    ctx.status = 201;
    ctx.body = { accessToken, expiresAt, workspace_id };

  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to create workspace' };
  }
};

export const joinWorkspace = async (ctx: Context) => {
  const userId = Number(ctx.state.user.id);
  const parsed = joinWorkspaceSchema.safeParse(ctx.request.body);
  
  if (!Number.isInteger(userId) || userId <= 0) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid user id' };
    return;
  }

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { workspace_id } = parsed.data;
  const workspace = await Workspace.query().findById(workspace_id);

  if (!workspace) {
    ctx.status = 404;
    ctx.body = { message: 'Workspace not found' };
    return;
  }

  const user = await User.query().findById(userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'User not found' };
    return;
  }

  try {
    await User.query().findById(userId).patch({ workspace_id: workspace.id });
    
    const newWorkspace_id = workspace.id;
    const payload = { id: user.id, email: user.email, workspace_id: newWorkspace_id };
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

    ctx.status = 201;
    ctx.body = { accessToken, expiresAt, workspace_id: newWorkspace_id };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to add user to workspace' };
  }
};
