import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  UserPoolProps,
  AccountRecovery,
  UserPoolOperation,
  Mfa,
  StringAttribute,
  ClientAttributes,
} from "aws-cdk-lib/aws-cognito";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { Policy, Role } from "aws-cdk-lib/aws-iam";

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
    this.addTrigger = {
      operation: UserPoolOperation.PRE_SIGN_UP,
    };
    this.client = this.createUserPoolClient();
    this.Output();
  }

  private get UserPoolProps(): UserPoolProps {
    return {
      userPoolName: this.id,
      selfSignUpEnabled: true,
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
        role: new StringAttribute(),
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
        .withCustomAttributes("role"),
    });
  }

  /**
   * @param operation
   * @param nodeJsFunctionProps
   * @returns NodejsFunction
   * @description
   * トリガー用のLambdaを作成します。
   * Lambda関数の名前は、${prefix}-${operation.operationName}-triggerとなります。
   * Lambda関数のエントリーポイントは、functionsディレクトリに配置されているファイルとなります。
   * エントリーポイントのファイル名は、${operation.operationName}.tsとなります。
   * また、operation.operationNameは、キャメルケースになるので、ファイル名はケースに合わせ記述してください。
   */
  private createTrigger(
    operation: UserPoolOperation,
    nodeJsFunctionProps?: NodejsFunctionProps,
  ) {
    const operationNameKebabCase = operation.operationName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase();
    return new NodejsFunction(
      this,
      `${this.id}-${operationNameKebabCase}-trigger`,
      {
        functionName: `${this.id}-${operationNameKebabCase}-trigger`,
        entry: join(__dirname, `./functions/${operation.operationName}.ts`),
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2018",
        },
        ...nodeJsFunctionProps,
      },
    );
  }

  GetTrigger(operation: UserPoolOperation) {
    return this.triggers[operation.operationName];
  }
  /**
   * @param props
   * @param props.operation UserPoolOperation
   * @param props.nodeJsFunctionProps NodejsFunctionProps
   * @param props.policy Policy
   * @description
   * トリガー用のLambdaを作成し、Cognito User Poolに設定します。
   * また、Lambdaにポリシーをアタッチをすることが可能です。
   */
  private set addTrigger(props: {
    operation: UserPoolOperation;
    nodeJsFunctionProps?: NodejsFunctionProps;
    policy?: Policy;
  }) {
    const { operation, nodeJsFunctionProps, policy } = props;
    this.triggers[operation.operationName] = this.createTrigger(
      operation,
      nodeJsFunctionProps,
    );
    if (policy) {
      this.triggers[operation.operationName].role?.attachInlinePolicy(policy);
    }
    this.UserPool.addTrigger(operation, this.triggers[operation.operationName]);
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
