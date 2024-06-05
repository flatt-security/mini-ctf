import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { responsesTemprate } from "./const";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { randomBytes, randomUUID } from "crypto";

interface SignUpBody {
  name: string;
}

const client = new CognitoIdentityProviderClient({
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
  const body: SignUpBody = JSON.parse(event.body || "{}");
  if (!body.name) {
    console.log("Body Error");
    console.log(event.body);
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }
  const tenantId = randomUUID();
  // 英数大文字小文字と記号を含む12文字以上のパスワードを生成
  const tmpPassword = randomBytes(32).toString("base64");
  const params: AdminCreateUserCommandInput = {
    UserPoolId: process.env.USER_POOL_ID || "",
    Username: body.name,
    TemporaryPassword: tmpPassword,
    UserAttributes: [
      {
        Name: "custom:tenant",
        Value: `tenant:${tenantId}`,
      },
    ],
  };

  const command = new AdminCreateUserCommand(params);
  try {
    await client.send(command);
  } catch (e) {
    console.log(e);
    return responsesTemprate[400](JSON.stringify({ message: "Bad Request" }));
  }

  return responsesTemprate[200](
    JSON.stringify({
      isSignUpComplete: true,
      nextStep: {
        signUpStep: "COMPLETE_AUTO_SIGN_IN",
      },
      temporaryPassword: tmpPassword,
    }),
  );
};
