import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { Model } from 'objection';
import db from './config/dataBase.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import errorHandler from './middleware/errorHandler.js';
import { getUserFromContext } from './middleware/authGraphql.js';

const app = new Koa();
const port = 3000;

Model.knex(db);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => {
    const user = getUserFromContext(ctx);
    ctx.state.user = user;
    return { ctx, user };
  },
});
await apolloServer.start();


const server = http.createServer(app.callback());

const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

app.context.io = io;

app.use(cors({
  origin: 'http://localhost:5173',
  // origin: '*',
  credentials: true,
}));
app.use(bodyParser());
app.use(errorHandler);

apolloServer.applyMiddleware({
  app,
  cors: {
    origin: 'http://localhost:5173',
    // origin: '*',
    credentials: true,
  },
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}${apolloServer.graphqlPath}`);
});