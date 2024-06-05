#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { IdpStack } from "../lib/idp";
import { ApiStack } from "../lib/api";
import { WebStack } from "../lib/web";
import { WebDeployStack } from "../lib/web/deploy";

const app = new cdk.App();
const web = new WebStack(app, "web", {
  env: {
    region: "ap-northeast-1",
  },
});
const idp = new IdpStack(app, "idp", {
  env: {
    region: "ap-northeast-1",
  },
});

const api = new ApiStack(app, "api", {
  env: {
    region: "ap-northeast-1",
  },
  origin: `https://${web.Distribution.distributionDomainName}`,
  stage: (process.env.STAGE as string) || "dev",
  userPoolId: idp.UserPool.userPoolId,
  userPoolClientId: idp.UserPoolClient.userPoolClientId,
});

api.addDependency(idp);
api.addDependency(web);

const webDeploy = new WebDeployStack(app, "web-deploy", {
  env: {
    region: "ap-northeast-1",
  },
  bucket: web.Bucket,
});

webDeploy.addDependency(web);
