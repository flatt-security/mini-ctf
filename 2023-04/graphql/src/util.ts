import { GraphQLError } from "graphql";
import { makeResponse } from "graphql-http";
import { Context } from "hono";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function log(c: Context, message: Record<string, any> | string) {
  const globalLogFields: Record<string, string> = {};

  if (typeof c.req !== "undefined") {
    const traceHeader = c.req.header("X-Cloud-Trace-Context");
    if (traceHeader && process.env.GOOGLE_PROJECT_ID) {
      const [trace] = traceHeader.split("/");
      globalLogFields[
        "logging.googleapis.com/trace"
      ] = `projects/${process.env.GOOGLE_PROJECT_ID}/traces/${trace}`;
    }
  }

  console.log(
    JSON.stringify({
      severity: "INFO",
      message,
      ...globalLogFields,
    })
  );
}

export async function readJsonResponse(res: Response) {
  if (res.body === null) {
    return null;
  }
  const stream = res.body.getReader();
  const dec = new TextDecoder();
  let body = "";
  while (true) {
    const res = await stream.read();
    body += dec.decode(res.value);
    if (res.done) {
      break;
    }
  }
  return JSON.parse(body);
}

export function flagError(
  message: string,
  extensions: { [key: string]: string | undefined }
) {
  return new GraphQLError(
    message,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    extensions
  );
}

export function flagErrorResponse(
  message: string,
  extensions: { [key: string]: string | undefined }
) {
  return new Response(
    ...makeResponse(flagError(message, extensions), "application/json")
  );
}
