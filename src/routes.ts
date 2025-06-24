import Router from "koa-router";

export const router = new Router();

router.get("/product", (ctx, next) => {
  ctx.body = "Hello World!";
});
