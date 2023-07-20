import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import {
  createComplexityRule,
  fieldExtensionsEstimator,
  simpleEstimator,
} from "graphql-query-complexity";
import { Hono } from "hono";
import "reflect-metadata";
import { depthLimit } from "./graphql-depth-limit.js";
import { schema } from "./graphql.js";
import { createHandler } from "./middleware.js";
import {
  flagError,
  flagErrorResponse,
  log,
  readJsonResponse,
  sleep,
} from "./util.js";
import { querySizeLimit, validatePaginationArgument } from "./validator.js";

const QUERY_SIZE_LIMIT = 1700;
const DEPTH_LIMIT = 2;
const PAGINATION_MAX_VALUE = 10;
const COMPLEXITY_LIMIT = 100;
const DOS_TIMEOUT_MS = 1000;

const app = new Hono();

app.use("/graphql", async (c, next) => {
  await next();

  const res = await readJsonResponse(c.res);
  if (res) {
    if (res.errors) {
      for (const error of res.errors) {
        if (error.extensions?.flag2 !== undefined && res.errors.length !== 1) {
          error.extensions.flag2 = "REDACTED";
        }
      }
    }
    c.res = c.json(res);
  }
});

app.use("/graphql", async (c, next) => {
  const start = performance.now();
  await Promise.race([next(), sleep(DOS_TIMEOUT_MS)]);
  const end = performance.now();

  const executionTime = end - start;
  if (executionTime >= DOS_TIMEOUT_MS) {
    log(c, "got flag3");
    c.res = flagErrorResponse("DoS detected", { flag3: process.env.FLAG3 });
  }

  c.res.headers.append("X-Debug-Executing-Time", String(executionTime));
});

app.use("/graphql", async (c, next) => {
  const originalRes = flagErrorResponse("GraphQL server is smashed", {
    flag4: process.env.FLAG4,
  });
  c.res = originalRes;

  await next();

  if (c.res === originalRes) {
    log(c, "got flag4");
  }
});

app.use(
  "/graphql",
  createHandler({
    schema,
    validationRules: async (req, args, specifiedRules) => {
      return [
        ...specifiedRules,

        querySizeLimit(QUERY_SIZE_LIMIT),
        depthLimit(DEPTH_LIMIT),
        validatePaginationArgument({
          maximumValue: PAGINATION_MAX_VALUE,
          variableValues: args.variableValues,
        }),
        createComplexityRule({
          maximumComplexity: COMPLEXITY_LIMIT,
          variables: args.variableValues ?? undefined,
          onComplete(complexity) {
            req.context.c.res.headers.append(
              "X-Debug-Complexity",
              String(complexity)
            );
          },
          createError() {
            log(req.context.c, "got flag2");
            return flagError("Complex query detected", {
              flag2: process.env.FLAG2,
            });
          },
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        }),
      ];
    },
  })
);

app.use("/", serveStatic({ path: "./static" }));

serve({
  fetch: app.fetch,
  port: process.env.PORT !== undefined ? Number(process.env.PORT) : 3000,
});
