import Koa from "koa";
import errorHandler from "./middleware/errorHandler.js";
import router from "./api/todos/todos.routes.js";

const app = new Koa();

const port = 3000;

app.use(errorHandler);
app.use(router.routes());

app.listen(port, () => {
  console.log(`🚀 Server is running on port http://localhost:${port}/`);
});