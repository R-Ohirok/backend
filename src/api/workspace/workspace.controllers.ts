import type { Context } from 'koa';
import { z } from 'zod';
import Workspace from '../../config/models/Workspace.js';
import User from '../../config/models/User.js';

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1),
});
const AddUserToWorkspaceSchema = z.object({
  workspace_id: z.number().int().positive(),
});
const RemoveUserFromWorkspaceSchema = z.object({
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

export const getUserWorkspaces = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  if (!Number.isInteger(userId) || userId <= 0) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid user id' };
    return;
  }

  try {
    const user = await User.query().findById(userId).withGraphFetched('workspaces');

    if (!user) {
      ctx.status = 404;
      ctx.body = { message: 'User not found' };
      return;
    }

    const workspaces = (user.workspaces ?? []).map(ws => ({
      id: ws.id,
      name: ws.name,
    }));

    ctx.status = 200;
    ctx.body = workspaces;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to get user workspaces' };
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

    await workspace.$relatedQuery('users').relate(userId);

    ctx.status = 201;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { message: 'Failed to create workspace' };
  }
};

export const addUserToWorkspace = async (ctx: Context) => {
  const userId = Number(ctx.state.user.id);
  const parsed = AddUserToWorkspaceSchema.safeParse(ctx.request.body);
  
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
    const existing = await Workspace.query()
      .findById(workspace_id)
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
  const userId = ctx.state.user.id;
  const parsed = RemoveUserFromWorkspaceSchema.safeParse(ctx.request.body);
  
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
    const isRelated = await Workspace.query()
      .findById(workspace_id)
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