import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { responsesTemprate } from "./const";
import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface Body {
  name: string;
}
const client = new S3Client({
  region: "ap-northeast-1",
});

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (
    !event.body ||
    !event.headers["Content-Type".toLowerCase()] ||
    !event.headers["Content-Type".toLowerCase()]?.includes("application/json")
  ) {
    return responsesTemprate[400]("Bad Request");
  }
  const body: Body = JSON.parse(event.body || "{}");
  if (!body.name) {
    return responsesTemprate[400]("Bad Request");
  }
  const tenant = event.requestContext.authorizer?.tenant;

  if (!tenant) {
    return responsesTemprate[400]("Bad Request");
  }

  const params: GetObjectCommandInput = {
    Bucket: process.env.BUCKET_NAME || "",
    Key: `${tenant}/${body.name}`,
  };
  const command = new GetObjectCommand(params);
  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 60,
  });
  return responsesTemprate[200](JSON.stringify({ signedUrl }));
};
