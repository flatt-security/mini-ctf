// process.env.STAGE はLambdaの環境変数で、dev, stg, prodのいずれかが入る
// みなさんの環境では、prodになっているます。
const COMMON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin":
    process.env.STAGE === "dev" ? "*" : `${process.env.ORIGIN as string}`,
};

const response = (
  statusCode: number,
  body: string,
  headers?: Record<string, string>,
) => ({
  statusCode,
  headers: { ...COMMON_HEADERS, ...headers },
  body,
});

const response200 = (body: string, headers?: Record<string, string>) =>
  response(200, body, headers);

const response400 = (body: string, headers?: Record<string, string>) =>
  response(400, body, headers);

const response401 = (body: string, headers?: Record<string, string>) =>
  response(401, body, headers);

const response403 = (body: string, headers?: Record<string, string>) =>
  response(403, body, headers);

const response404 = (body: string, headers?: Record<string, string>) =>
  response(404, body, headers);

export const responsesTemprate = {
  200: response200,
  400: response400,
  401: response401,
  403: response403,
  404: response404,
  other: response,
};
