import Koa from "koa";
import http from "http";
import { Server } from 'socket.io';
import errorHandler from "./middleware/errorHandler.js";
import router from "./api/todos/todos.routes.js";
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import db from './config/dataBase.js';
import { Model } from 'objection';

const app = new Koa();
const port = 3000;

Model.knex(db);

const server = http.createServer(app.callback());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

app.context.io = io;

app.use(cors());
app.use(bodyParser());
app.use(errorHandler);
app.use(router.routes());

server.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});

