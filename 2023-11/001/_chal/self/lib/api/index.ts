import * as path from "path";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import {
  RestApi,
  RestApiProps,
  StageOptions,
  Cors,
  CorsOptions,
  MethodLoggingLevel,
  EndpointType,
  LogGroupLogDestination,
  AccessLogFormat,
  LambdaIntegration,
  TokenAuthorizer,
  IdentitySource,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export interface ApiStackProps extends StackProps {
  origin: string;
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
}
export class ApiStack extends Stack {
  private prefix: string;
  private api: RestApi;
  private loggroup: LogGroup;
  private frontendOrigin: string;
  private origins: string[];
  private userPoolId: string;
  private userPoolClientId: string;
  constructor(scope: Construct, prefix: string, props: ApiStackProps) {
    super(scope, `${prefix}-stack`, props);
    this.prefix = prefix;
    this.userPoolId = props.userPoolId;
    this.userPoolClientId = props.userPoolClientId;
    this.loggroup = new LogGroup(this, `${prefix}-api-gw-access-log-group`, {
      logGroupName: `/aws/apigateway/${prefix}-api-gw-access-log-group`,
      retention: 7,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.frontendOrigin = props.origin;
    this.origins = [props.origin];
    if (props.stage === "dev") {
      this.origins.push("http://localhost:4173");
      this.origins.push("http://localhost:5173");
    }
    this.api = new RestApi(this, `${prefix}-api`, this.apiProps);
    this.route();
    this.output();
  }

  private get deployOptions(): StageOptions {
    return {
      stageName: "v1",
      loggingLevel: MethodLoggingLevel.INFO,
      tracingEnabled: true,
      dataTraceEnabled: true,
      metricsEnabled: true,
      accessLogDestination: new LogGroupLogDestination(this.loggroup),
      accessLogFormat: AccessLogFormat.clf(),
    };
  }

  private get corsPreflightOptions(): CorsOptions {
    return {
      allowOrigins: this.origins,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: Cors.DEFAULT_HEADERS,
      statusCode: 200,
    };
  }

  private get apiProps(): RestApiProps {
    return {
      restApiName: `${this.prefix}-api`,
      endpointTypes: [EndpointType.REGIONAL],
      deployOptions: this.deployOptions,
      defaultCorsPreflightOptions: this.corsPreflightOptions,
      minimumCompressionSize: 1024,
      deploy: true,
      cloudWatchRole: false,
    };
  }
  private createTokenAuthorizer() {
    const authorizer = this.createLambdaFunction(
      `${this.prefix}-authorizer-function`,
      "authorizer.ts",
    );
    authorizer.addEnvironment("COGNITO_USER_POOL_ID", this.userPoolId);
    authorizer.addEnvironment(
      "COGNITO_USER_POOL_CLIENT_ID",
      this.userPoolClientId,
    );
    return new TokenAuthorizer(this, `${this.prefix}-token-authorizer`, {
      handler: authorizer,
      identitySource: IdentitySource.header("Authorization"),
      authorizerName: `${this.prefix}-token-authorizer`,
    });
  }

  private createFlagLambdaIntegration() {
    const awsLambdaFunction = this.createLambdaFunction(
      `${this.prefix}-flag`,
      "flag.ts",
    );
    awsLambdaFunction.addEnvironment("FLAG", process.env.FLAG as string);
    awsLambdaFunction.addEnvironment("STAGE", process.env.STAGE as string);
    awsLambdaFunction.addEnvironment("ORIGIN", this.frontendOrigin);
    const lambdaIntegration = new LambdaIntegration(awsLambdaFunction);
    return {
      lambdaFunction: awsLambdaFunction,
      integration: lambdaIntegration,
    };
  }

  private route() {
    const { integration } = this.createFlagLambdaIntegration();
    const root = this.api.root;
    root.addResource("flag").addMethod("GET", integration, {
      authorizer: this.createTokenAuthorizer(),
    });
  }

  /**
   * @param name
   * @param functionFilePath string functionsの配下にあるファイル名
   * @description
   * functions配下にあるファイルをLambda関数として作成します。
   * 作成したLambda関数を返却します。
   *
   * 例: createLambdaFunction("flag", "flag.ts")
   *
   */
  private createLambdaFunction(name: string, functionFilePath: string) {
    return new NodejsFunction(this, name, {
      functionName: name,
      entry: path.join(__dirname, "functions", functionFilePath),
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2018",
      },
    });
  }

  private output(): void {
    new CfnOutput(this, `${this.prefix}-api-id`, {
      exportName: `ApiId`,
      description: "API ID",
      value: this.api.restApiId,
    });
    new CfnOutput(this, `${this.prefix}-api-url`, {
      exportName: `ApiUrl`,
      description: "API URL",
      value: this.api.url,
    });
  }
}
