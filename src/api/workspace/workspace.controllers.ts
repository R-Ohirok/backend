import type { Context } from 'koa';
import { z } from 'zod';
import Workspace from '../../config/models/Workspace.js';
import User from '../../config/models/User.js';

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
  userId: z.number().int().positive(),
});
const AddUserToWorkspaceSchema = z.object({
  workspaceId: z.number().int().positive(),
  userId: z.number().int().positive(),
});
const RemoveUserFromWorkspaceSchema = z.object({
  workspaceId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const createWorkspace = async (ctx: Context) => {
  const parsed = CreateWorkspaceSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { name, userId } = parsed.data;

  const user = await User.query().findById(userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: 'User not found' };
    return;
  }

  try {
    const workspace: Workspace = await Workspace.query().insert({
      name,
    });

    await workspace.$relatedQuery('users').relate(userId);

    ctx.status = 201;
    ctx.body = { workspace };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to create workspace' };
  }
};

export const addUserToWorkspace = async (ctx: Context) => {
  const parsed = AddUserToWorkspaceSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { workspaceId, userId } = parsed.data;
  const workspace = await Workspace.query().findById(workspaceId);

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
    const existing = await Workspace.query()
      .findById(workspaceId)
      .withGraphFetched('users')
      .modifyGraph('users', builder => builder.where('users.id', userId));

    if (existing && existing.users && existing.users.length > 0) {
      ctx.status = 409;
      ctx.body = { message: 'User already in workspace' };
      return;
    }

    await workspace.$relatedQuery('users').relate(userId);

    ctx.status = 200;
    ctx.body = { message: 'User added to workspace' };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to add user to workspace' };
  }
};

export const removeUserFromWorkspace = async (ctx: Context) => {
  const parsed = RemoveUserFromWorkspaceSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid data' };
    return;
  }

  const { workspaceId, userId } = parsed.data;

  const workspace = await Workspace.query().findById(workspaceId);
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
    const isRelated = await Workspace.query()
      .findById(workspaceId)
      .withGraphFetched('users')
      .modifyGraph('users', builder => builder.where('users.id', userId));

    if (isRelated && isRelated.users && isRelated.users.length === 0) {
      ctx.status = 404;
      ctx.body = { message: 'User is not a member of the workspace' };
      return;
    }

    await workspace.$relatedQuery('users').unrelate().where('user_id', userId);

    ctx.status = 200;
    ctx.body = { message: 'User removed from workspace' };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to remove user from workspace' };
  }
};