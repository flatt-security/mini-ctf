import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerEvent,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayRequestAuthorizerEvent,
  Context,
} from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
const policy = (
  sid: string,
  effect: string,
  methodArn: string,
  context: { [key: string]: string } = {},
) => {
  return {
    principalId: "*",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: sid,
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
    context: context,
  };
};

export const allowPolicy = (methodArn: string, context: any) => {
  return policy("AllowAll", "Allow", methodArn, context);
};
export const denyPolicy = (methodArn: string, message: string) => {
  return policy("DenyAll: " + message, "Deny", methodArn);
};

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID as string,
  tokenUse: "id",
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID as string,
});

const tokenAuthorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  const authorizationTokenHeader = event.authorizationToken;
  if (!authorizationTokenHeader) {
    return denyPolicy(event.methodArn, "");
  }

  const [type, token] = authorizationTokenHeader.split(" ");
  if (type !== "Bearer") {
    return denyPolicy(event.methodArn, "");
  }

  try {
    const payload = await verifier.verify(token);
    if (!payload) {
      return denyPolicy(event.methodArn, "");
    }
    return allowPolicy(event.methodArn, {
      tenant: payload["custom:tenant"],
    });
  } catch (error) {
    console.log(error);
    return denyPolicy(event.methodArn, "");
  }
};

const requestAuthorizer = async (event: APIGatewayRequestAuthorizerEvent) => {
  return denyPolicy(event.methodArn, "");
};

export const handler: APIGatewayAuthorizerHandler = (
  event: APIGatewayAuthorizerEvent,
  context: Context,
) => {
  if (event.type === "TOKEN") {
    return tokenAuthorizer(event as APIGatewayTokenAuthorizerEvent);
  }
  return requestAuthorizer(event as APIGatewayRequestAuthorizerEvent);
};
