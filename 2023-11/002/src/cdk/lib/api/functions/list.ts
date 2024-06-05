import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { responsesTemprate } from "./const";
import {
  S3Client,
  ListObjectsCommand,
  ListObjectsCommandInput,
} from "@aws-sdk/client-s3";
import path = require("path");

const client = new S3Client({
  region: "ap-northeast-1",
});

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // Lambda Authorizer で設定した context から tenant を取得
  const tenant = event.requestContext.authorizer?.tenant;
  if (!tenant) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  const params: ListObjectsCommandInput = {
    Bucket: process.env.BUCKET_NAME || "",
    Prefix: `${tenant}/`,
  };
  const { Contents } = await client.send(new ListObjectsCommand(params));
  if (!Contents) {
    return responsesTemprate[200](JSON.stringify([]));
  }
  const files = Contents.map((content) => path.basename(content.Key || ""));
  return responsesTemprate[200](JSON.stringify(files));
};
