import * as path from "path";
import {
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  Duration,
  Aws,
} from "aws-cdk-lib";
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
  AwsIntegration,
  PassthroughBehavior,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  PolicyStatement,
  Effect,
  ServicePrincipal,
  Role,
} from "aws-cdk-lib/aws-iam";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Repository } from "aws-cdk-lib/aws-ecr";

export interface ApiStackProps extends StackProps {
  domain: string;
  origin: string;
  stage: string;
  bucket: Bucket;
  userPool: UserPool;
  userPoolClientId: string;
  repository: Repository;
}
export class ApiStack extends Stack {
  private domain: string;
  private prefix: string;
  private api: RestApi;
  private loggroup: LogGroup;
  private frontendOrigin: string;
  private origin: string;
  private origins: string[];
  private userPool: UserPool;
  private bucket: Bucket;
  private userPoolId: string;
  private userPoolClientId: string;
  private reportQueue: Queue;
  private repository: Repository;
  constructor(scope: Construct, prefix: string, props: ApiStackProps) {
    super(scope, `${prefix}-stack`, props);
    this.repository = props.repository;
    this.domain = props.domain;
    this.origin = props.origin;
    this.prefix = prefix;
    this.userPool = props.userPool;
    this.bucket = props.bucket;
    this.userPoolId = props.userPool.userPoolId;
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
      deploy: true,
      cloudWatchRole: false,
    };
  }
  private createDockerImageLambda() {
    const role = new Role(this, `${this.prefix}-report-lambda-role`, {
      roleName: `${this.prefix}-report-lambda-role`,
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    // CloudWatch Logsへの書き込み権限を付与
    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["logs:CreateLogGroup", "logs:CreateLogStream"],
        resources: [
          `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/${this.prefix}-report-function:*`,
        ],
      }),
    );

    return new DockerImageFunction(this, `${this.prefix}-report-function`, {
      role,
      functionName: `${this.prefix}-report-function`,
      code: DockerImageCode.fromEcr(this.repository),
      memorySize: 512,
      timeout: Duration.seconds(10),
      logRetention: 7,
      environment: {
        FLAG: process.env.FLAG as string,
        ALLOWED_URL: this.origin,
        DOMAIN: this.domain,
      },
    });
  }

  private createReportEventLambda() {
    const reportEventLambda = this.createDockerImageLambda();
    reportEventLambda.addEventSource(new SqsEventSource(this.reportQueue));
    return reportEventLambda;
  }

  private createSQS() {
    this.reportQueue = new Queue(this, `${this.prefix}-report-queue`, {
      queueName: `${this.prefix}-report-queue`,
      retentionPeriod: Duration.days(7),
      removalPolicy: RemovalPolicy.DESTROY,
      receiveMessageWaitTime: Duration.seconds(20),
    });
  }

  /**
   * @param name
   * @param functionFilePath string functionsの配下にあるファイル名
   * @description
   * functions配下にあるファイルをLambda関数として作成します。
   * 作成したLambda関数を返却します。
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
      resultsCacheTtl: Duration.seconds(0),
    });
  }

  private createLambdaIntegration(name: string, functionFilePath: string) {
    const lambda = this.createLambdaFunction(name, functionFilePath);
    lambda.addEnvironment("ORIGIN", this.frontendOrigin);
    // Deploy時の環境変数は"prod"です
    lambda.addEnvironment("STAGE", process.env.STAGE as string);
    return {
      function: lambda,
      integration: new LambdaIntegration(lambda),
    };
  }

  /**
   * POST - /v1/signup Userの作成 / 認証はCognitoで行う
   * POST - /v1/box/signed-url/put S3へのPUT用の署名付きURLを返却する
   * POST - /v1/box/signed-url/get S3へのGET用の署名付きURLを返却する
   * POST - /v1/box/signed-url/delete S3へのDELETE用の署名付きURLを返却する
   * GET - /v1/box/list テナントに属するS3のオブジェクト一覧を返却する
   * POST - /v1/report 異常が発生したサービスページを管理者に通知する SQSにメッセージを送信する
   */
  private route() {
    const root = this.api.root;
    const tokenAuthorizer = this.createTokenAuthorizer();
    // POST - /v1/signup Userの作成 / 認証はCognitoで行う
    const signup = root.addResource("signup");
    const { function: signUpLambda, integration: signUpLambdaIntegration } =
      this.createLambdaIntegration(`${this.prefix}-signup`, "signUp.ts");
    this.userPool.grant(signUpLambda, "cognito-idp:AdminCreateUser");
    signUpLambda.addEnvironment("USER_POOL_ID", this.userPoolId);
    signup.addMethod("POST", signUpLambdaIntegration);

    const box = root.addResource("box");
    const boxSignedUrl = box.addResource("signed-url");
    // POST - /v1/box/signed-url/put S3へのPUT用の署名付きURLを返却する
    const boxSignedUrlPut = boxSignedUrl.addResource("put");
    const {
      function: signedUrlPutLambda,
      integration: signedUrlPutLambdaIntegration,
    } = this.createLambdaIntegration(
      `${this.prefix}-signed-url-put`,
      "signedUrlPut.ts",
    );
    signedUrlPutLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["s3:PutObject"],
        resources: [
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.js`,
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.css`,
          `arn:aws:s3:::${this.bucket.bucketName}/index.html`,
          `arn:aws:s3:::${this.bucket.bucketName}/*.svg`,
        ],
      }),
    );
    this.bucket.grantWrite(signedUrlPutLambda);
    signedUrlPutLambda.addEnvironment("BUCKET_NAME", this.bucket.bucketName);
    boxSignedUrlPut.addMethod("POST", signedUrlPutLambdaIntegration, {
      authorizer: tokenAuthorizer,
    });

    // POST - /v1/box/signed-url/get S3へのGET用の署名付きURLを返却する
    const boxSignedUrlGet = boxSignedUrl.addResource("get");
    const {
      function: signedUrlGetLambda,
      integration: signedUrlGetLambdaIntegration,
    } = this.createLambdaIntegration(
      `${this.prefix}-signed-url-get`,
      "signedUrlGet.ts",
    );
    signedUrlGetLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["s3:GetObject"],
        resources: [
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.js`,
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.css`,
          `arn:aws:s3:::${this.bucket.bucketName}/index.html`,
          `arn:aws:s3:::${this.bucket.bucketName}/*.svg`,
        ],
      }),
    );
    this.bucket.grantRead(signedUrlGetLambda);
    signedUrlGetLambda.addEnvironment("BUCKET_NAME", this.bucket.bucketName);
    boxSignedUrlGet.addMethod("POST", signedUrlGetLambdaIntegration, {
      authorizer: tokenAuthorizer,
    });

    // POST - /v1/box/signed-url/delete S3へのDELETE用の署名付きURLを返却する
    const boxSignedUrlDelete = boxSignedUrl.addResource("delete");
    const {
      function: signedUrlDeleteLambda,
      integration: signedUrlDeleteLambdaIntegration,
    } = this.createLambdaIntegration(
      `${this.prefix}-signed-url-delete`,
      "signedUrlDelete.ts",
    );
    signedUrlDeleteLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["s3:DeleteObject"],
        resources: [
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.js`,
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*.css`,
          `arn:aws:s3:::${this.bucket.bucketName}/index.html`,
          `arn:aws:s3:::${this.bucket.bucketName}/*.svg`,
        ],
      }),
    );
    this.bucket.grantDelete(signedUrlDeleteLambda);
    signedUrlDeleteLambda.addEnvironment("BUCKET_NAME", this.bucket.bucketName);
    boxSignedUrlDelete.addMethod("POST", signedUrlDeleteLambdaIntegration, {
      authorizer: tokenAuthorizer,
    });

    // GET - /v1/box/list テナントに属するS3のオブジェクト一覧を返却する
    const boxList = box.addResource("list");
    const { function: boxListLambda, integration: boxListLambdaIntegration } =
      this.createLambdaIntegration(`${this.prefix}-list`, "list.ts");
    boxListLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        actions: ["s3:ListBucket"],
        resources: [
          `arn:aws:s3:::${this.bucket.bucketName}/assets/*`,
          `arn:aws:s3:::${this.bucket.bucketName}/index.html`,
          `arn:aws:s3:::${this.bucket.bucketName}/*.svg`,
        ],
      }),
    );
    this.bucket.grantRead(boxListLambda);
    boxListLambda.addEnvironment("BUCKET_NAME", this.bucket.bucketName);
    boxList.addMethod("GET", boxListLambdaIntegration, {
      authorizer: tokenAuthorizer,
    });

    // POST - /v1/report 異常が発生したサービスページを管理者に通知する SQSにメッセージを送信する
    const report = root.addResource("report");
    this.createSQS();
    const role = new Role(this, `${this.prefix}-report-role`, {
      roleName: `${this.prefix}-report-role`,
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    this.reportQueue.grantSendMessages(role);
    const sqsServiceIntegration = new AwsIntegration({
      service: "sqs",
      path: `${Aws.ACCOUNT_ID}/${this.reportQueue.queueName}`,
      integrationHttpMethod: "POST",
      options: {
        credentialsRole: role,
        requestParameters: {
          "integration.request.header.Content-Type": `'application/x-www-form-urlencoded'`,
        },
        requestTemplates: {
          "application/json": `Action=SendMessage&MessageBody=$util.urlEncode($input.path('$.url'))`,
        },
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `{"message": "report thank you"}`,
            },
          },
        ],
      },
    });
    report.addMethod("POST", sqsServiceIntegration, {
      methodResponses: [
        {
          statusCode: "200",
        },
      ],
    });
    this.createReportEventLambda();
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
