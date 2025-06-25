import Koa from "koa";
import errorHandler from "./middleware/errorHandler.js";
import router from "./api/todos/todos.routes.js";
import cors from '@koa/cors';

const app = new Koa();

const port = 3000;

app.use(cors());
app.use(errorHandler);
app.use(router.routes());

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});