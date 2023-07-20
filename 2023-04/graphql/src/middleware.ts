import {
  createHandler as createRawHandler,
  HandlerOptions as RawHandlerOptions,
  OperationContext,
} from "graphql-http";
import { Context, MiddlewareHandler } from "hono";
import { log } from "./util.js";

export interface RequestContext {
  c: Context;
}

export type HandlerOptions<Context extends OperationContext> =
  RawHandlerOptions<Request, RequestContext, Context>;

export function createHandler<Context extends OperationContext = undefined>(
  options: HandlerOptions<Context>
): MiddlewareHandler {
  const isProd = process.env.NODE_ENV === "production";
  const handle = createRawHandler(options);
  return async function requestListener(c, next) {
    const requestBody = await c.req.text();
    log(c, { query: requestBody });
    try {
      const [body, init] = await handle({
        url: c.req.url,
        method: c.req.method,
        headers: c.req.headers,
        body: requestBody,
        raw: c.req.raw,
        context: { c },
      });
      c.res = new Response(body, {
        status: init.status,
        statusText: init.statusText,
        headers: init.headers,
      });
    } catch (err) {
      if (isProd) {
        c.status(500);
      } else {
        console.error(err);
        c.json(
          {
            errors: [
              err instanceof Error
                ? {
                    message: err.message,
                    stack: err.stack,
                  }
                : err,
            ],
          },
          500
        );
      }
    }
  };
}
