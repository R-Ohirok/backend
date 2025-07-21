import { gql } from 'apollo-server-koa';

const typeDefs = gql`
  scalar EmailAddress

  type User {
    id: ID!
    email: EmailAddress!
    workspaceId: Int
  }

  type Workspace {
    id: ID!
    name: String!
  }

  type ToDo {
    id: ID!
    title: String!
    isCompleted: Boolean!
    workspaceId: Int!
  }

  type ToDoPage {
    pagesCount: Int!
    todos: [ToDo!]!
  }

  type AuthPayload {
    accessToken: String!
    expiresAt: Int!
    workspaceId: Int
  }

  type Query {
    verifyEmail(email: EmailAddress!): EmailAddress
    refresh: AuthPayload
    allWorkspaces: [Workspace!]!
    todos(status: String, title: String, limit: Int, offset: Int): ToDoPage!
  }

  type Mutation {
    register(email: EmailAddress!, password: String!): String
    login(email: EmailAddress!, password: String!): AuthPayload
    logout: String

    createWorkspace(name: String!): AuthPayload
    joinWorkspace(workspace_id: Int!): AuthPayload

    createTodo(id: ID!, title: String!, is_completed: Boolean!): ToDo!
    updateTodo(id: ID!, title: String, is_completed: Boolean): ToDo!
    deleteTodo(id: ID!): Boolean!
  }
`;

export default typeDefs;