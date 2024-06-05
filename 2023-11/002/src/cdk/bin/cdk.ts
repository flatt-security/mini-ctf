#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WebStack } from "../lib/web";
import { WebDeployStack } from "../lib/web/deploy";
import { IdpStack } from "../lib/idp";
import { ApiStack } from "../lib/api";
import { ContainerStack } from "../lib/container";

const name = "missbox";

const app = new cdk.App();

const containerStack = new ContainerStack(app, `${name}-container`, {
  env: {
    region: "ap-northeast-1",
  },
});

const idpStack = new IdpStack(app, `${name}-idp`, {
  env: {
    region: "ap-northeast-1",
  },
});

const webStack = new WebStack(app, `${name}-web`, {
  env: {
    region: "ap-northeast-1",
  },
});
const deployStack = new WebDeployStack(app, `${name}-web-deploy`, {
  env: {
    region: "ap-northeast-1",
  },
  bucket: webStack.Bucket,
});

const apiStack = new ApiStack(app, `${name}-api`, {
  env: {
    region: "ap-northeast-1",
  },
  domain: webStack.Distribution.distributionDomainName,
  origin: `https://${webStack.Distribution.distributionDomainName}`,
  stage: "dev",
  bucket: webStack.Bucket,
  userPool: idpStack.UserPool,
  userPoolClientId: idpStack.UserPoolClient.userPoolClientId,
  repository: containerStack.Repository,
});

deployStack.addDependency(webStack);

apiStack.addDependency(idpStack);
apiStack.addDependency(webStack);
apiStack.addDependency(containerStack);
