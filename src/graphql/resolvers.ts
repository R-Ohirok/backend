import { IResolvers } from '@graphql-tools/utils';
import { EmailAddressResolver } from 'graphql-scalars';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../config/models/User.js';
import Workspace from '../config/models/Workspace.js';
import ToDo from '../config/models/ToDo.js';
import TokenBlacklist from '../config/models/TokenBlacklist.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

const resolvers: IResolvers = {
  EmailAddress: EmailAddressResolver, 
  ToDo: {
    isCompleted: (parent) => parent.is_completed,
    workspaceId: (parent) => parent.workspace_id,
  },
  User: {
    workspaceId: (parent) => parent.workspace_id,
  },
  AuthPayload: {
    workspaceId: (parent) => parent.workspace_id,
  },

  Query: {
    verifyEmail: async (_parent, { email }) => {
      const user = await User.query().findOne({ email });
      if (!user) throw new Error('No user with this email');
      return email;
    },

    refresh: async (_parent, _args, { ctx }) => {
      const token = ctx.cookies.get('refreshToken');
      if (!token) throw new Error('No refresh token');

      const isBlacklisted = !!(await TokenBlacklist.query().findOne({ token }));
      if (isBlacklisted) throw new Error('Token is blacklisted');

      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
      const { id, email, workspace_id } = payload;

      const newRefreshToken = generateRefreshToken({ id, email, workspace_id });
      ctx.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60 * 1000,
      });

      await TokenBlacklist.query().insert({
        token,
        expires_at: payload.exp * 1000,
      });

      const accessToken = generateAccessToken({ id, email, workspace_id });
      const expiresAt = JSON.parse(atob(accessToken.split('.')[1])).exp;

      return { accessToken, expiresAt, workspace_id };
    },

    allWorkspaces: async () => {      
      return Workspace.query().select('id', 'name').orderBy('id');
    },

    todos: async (_parent, args, { user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user?.workspace_id) throw new Error('Select a workspace');

      const { status, title, limit = 5, offset = 0 } = args;
      
      let query = ToDo.query().where('workspace_id', user.workspace_id);
      
      if (status) {
        query = query.where('is_completed', status === 'Completed');
      }
      
      if (title) {
        query = query.where('title', 'ilike', `%${title}%`);
      }
      
      const totalCount = await query.resultSize();
      const pagesCount = Math.ceil(totalCount / limit);

      const todos = await query.limit(limit).offset(offset).orderBy('id');
      
      return { pagesCount, todos };
    },
  },

  Mutation: {
    register: async (_parent, { email, password }) => {
      const existingUser = await User.query().findOne({ email });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.query().insert({ email, password: hashedPassword });

      return 'User registered';
    },

    login: async (_parent, { email, password }, { ctx }) => {
      const user = await User.query().findOne({ email });
      if (!user) throw new Error('Invalid email or password');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error('Invalid password');

      const payload = { id: user.id, email: user.email, workspace_id: user.workspace_id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      ctx.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60 * 1000,
      });

      const expiresAt = JSON.parse(atob(accessToken.split('.')[1])).exp;

      return { accessToken, expiresAt, workspace_id: user.workspace_id };
    },

    logout: async (_parent, _args, { ctx }) => {
      const refreshToken = ctx.cookies.get('refreshToken');
      if (!refreshToken) throw new Error('Refresh token not found');

      const expiresAt = JSON.parse(atob(refreshToken.split('.')[1])).exp;

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

      return 'Logged out';
    },

    createWorkspace: async (_parent, { name }, { ctx, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const existingWorkspace = await Workspace.query().findOne({ name });
      if (existingWorkspace) throw new Error('Workspace already exists');

      const workspace = await Workspace.query().insert({ name });

      await User.query().findById(user.id).patch({ workspace_id: workspace.id });

      const payload = { id: user.id, email: user.email, workspace_id: workspace.id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      ctx.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60 * 1000,
      });

      const expiresAt = JSON.parse(atob(accessToken.split('.')[1])).exp;

      return { accessToken, expiresAt, workspace_id: workspace.id };
    },

    joinWorkspace: async (_parent, { workspace_id }, { ctx, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const workspace = await Workspace.query().findById(workspace_id);
      if (!workspace) throw new Error('Workspace not found');

      await User.query().findById(user.id).patch({ workspace_id: workspace.id });

      const payload = { id: user.id, email: user.email, workspace_id: workspace.id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      ctx.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60 * 1000,
      });

      const expiresAt = JSON.parse(atob(accessToken.split('.')[1])).exp;

      return { accessToken, expiresAt, workspace_id: workspace.id };
    },

    createTodo: async (_parent, { id, title, is_completed }, { ctx, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user?.workspace_id) throw new Error('Select a workspace');

      const todo = await ToDo.query().insert({
        id,
        title,
        is_completed,
        workspace_id: user.workspace_id,
      });

      ctx.io.emit('todo-created', todo);
      return todo;
    },

    updateTodo: async (_parent, { id, title, is_completed }, { ctx, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!user?.workspace_id) throw new Error('Select a workspace');

      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (is_completed !== undefined) updateData.is_completed = is_completed;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      const updatedTodo = await ToDo.query().patchAndFetchById(id, updateData);
      if (!updatedTodo) throw new Error('ToDo not found');

      ctx.io.emit('todo-updated', updatedTodo);
      return updatedTodo;
    },

    deleteTodo: async (_parent, { id }, { ctx, user }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user?.workspace_id) throw new Error('Select a workspace');

      const deletedCount = await ToDo.query().deleteById(id);

      if (deletedCount > 0) {
        ctx.io.emit('todo-deleted', id);
        return true;
      }

      return false;
    },
  },
};

export default resolvers;