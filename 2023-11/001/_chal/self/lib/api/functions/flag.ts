import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin":
        process.env.STAGE === "dev" ? "*" : `${process.env.ORIGIN as string}`,
    },
    body: JSON.stringify({
      flag: process.env.FLAG as string,
    }),
  };
};
