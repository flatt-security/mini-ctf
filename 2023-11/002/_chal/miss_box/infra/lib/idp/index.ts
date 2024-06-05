import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  UserPoolProps,
  AccountRecovery,
  Mfa,
  StringAttribute,
  ClientAttributes,
} from "aws-cdk-lib/aws-cognito";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

export interface IdpStackProps extends StackProps {}
/**
 * @description
 * IdpStackは、Cognito User Poolおよび、それに付随するClientを作成します。
 * また、Cognito User Poolの作成時に、トリガー用のLambdaを作成し設定します。
 * トリガー用のLambdaは、functionsディレクトリに配置されています。
 *
 * Stack名は${prefix}-stackとなります。
 *
 * @example
 * const app = new cdk.App();
 * const idp = new IdpStack(app, "idp", {
 *  env: {
 *   region: "ap-northeast-1",
 *  },
 * });
 * @param scope Construct
 * @param prefix string型のprefixで、Stack名やリソースのPrefixに使用します。
 * @param props IdpStackProps
 * @constructor
 */
export class IdpStack extends Stack {
  private id: string;
  private idp: UserPool;
  private client: UserPoolClient;
  // key is UserPoolOperation.operationName
  private triggers: {
    [key: string]: NodejsFunction;
  };

  constructor(scope: Construct, prefix: string, props: IdpStackProps) {
    super(scope, `${prefix}-stack`, props);
    this.id = `${prefix}`;
    this.idp = this.createUserPool();
    this.triggers = {};
    this.client = this.createUserPoolClient();
    this.Output();
  }

  private get UserPoolProps(): UserPoolProps {
    return {
      userPoolName: this.id,
      selfSignUpEnabled: false,
      signInCaseSensitive: false,
      removalPolicy: RemovalPolicy.DESTROY,
      signInAliases: {
        username: true,
      },
      autoVerify: {
        email: false,
      },
      accountRecovery: AccountRecovery.NONE,
      mfa: Mfa.OFF,
      customAttributes: {
        tenant: new StringAttribute(),
      },
    };
  }

  private createUserPool() {
    return new UserPool(this, this.id, this.UserPoolProps);
  }

  get UserPoolClient() {
    return this.client;
  }

  get UserPool() {
    if (this.idp === undefined) {
      this.idp = this.createUserPool();
    }
    return this.idp;
  }

  private createUserPoolClient() {
    return this.idp.addClient(`${this.id}-client`, {
      userPoolClientName: `${this.id}-client`,
      authFlows: {
        adminUserPassword: false,
        custom: false,
        userPassword: true,
        userSrp: false,
      },
      // Clientの読み込み属性を設定
      readAttributes: new ClientAttributes()
        .withStandardAttributes({
          email: true,
        })
        .withCustomAttributes("tenant"),
    });
  }

  Output() {
    new CfnOutput(this, `${this.id}-user-pool-id`, {
      exportName: `UserPoolId`,
      description: "User Pool ID",
      value: this.UserPool.userPoolId,
    });
    new CfnOutput(this, `${this.id}-user-pool-client-id`, {
      exportName: `UserPoolClientId`,
      description: "User Pool Client ID",
      value: this.UserPoolClient.userPoolClientId,
    });
  }
}
