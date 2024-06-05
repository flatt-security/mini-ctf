import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { responsesTemprate } from "./const";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

interface Body {
  name: string;
  contentType: string;
  size: number;
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
    console.log("Header Error");
    console.log(event.headers);
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  const body: Body = JSON.parse(event.body || "{}");
  if (!body.name || !body.contentType || !body.size) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  const tenant = event.requestContext.authorizer?.tenant;

  if (!tenant) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  // 拡張子のチェック (画像のみ許可)
  const ext = body.name.split(".").pop();
  if (!ext || !["jpg", "jpeg", "png", "gif"].includes(ext)) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  // ファイルサイズのチェック (10MB まで)
  if (body.size > 10 * 1024 * 1024) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  // contentType のチェック (画像のみ許可)
  if (
    !body.contentType ||
    !["image/jpeg", "image/png", "image/gif"].includes(body.contentType)
  ) {
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }

  const params: PutObjectCommandInput = {
    Bucket: process.env.BUCKET_NAME || "",
    Key: `${tenant}/${randomUUID()}.${ext}`,
    ContentLength: body.size,
  };
  const command = new PutObjectCommand(params);

  const url = await getSignedUrl(client, command, {
    expiresIn: 60 * 60,
  });

  return responsesTemprate[200](JSON.stringify({ url }));
};
