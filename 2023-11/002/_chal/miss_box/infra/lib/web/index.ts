import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  OriginAccessIdentity,
  ViewerProtocolPolicy,
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  HttpVersion,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  Bucket,
  BucketProps,
  BucketEncryption,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface WebStackProps extends StackProps {}

/**
 * WebStack
 * @description
 * WebStackは、Webサイトを構築するためのS3やCloudFrontのStackです。
 * 静的ファイルのデプロイは、WebDeployStackで行います。
 */
export class WebStack extends Stack {
  private prefix: string;
  private oai: OriginAccessIdentity;
  private s3Origin: S3Origin;
  private bucket: Bucket;
  private allowGetObjectBucketPolicy: PolicyStatement;
  private distribution: CloudFrontWebDistribution;

  constructor(scope: Construct, id: string, props?: WebStackProps) {
    super(scope, `${id}-stack`, props);
    this.prefix = id;
    this.createOai();
    this.createBucket();
    this.bucket.addToResourcePolicy(this.AllowGetObjectBucketPolicy);
    this.createS3Origin();
    this.createDistribution();
    this.output();
  }

  get Bucket() {
    return this.bucket;
  }

  get Distribution() {
    return this.distribution;
  }

  get OAI() {
    return this.oai;
  }

  private createOai() {
    this.oai = new OriginAccessIdentity(this, `${this.prefix}-oai`, {
      comment: `${this.prefix}-oai`,
    });
  }

  private get bucketProps(): BucketProps {
    return {
      bucketName: `${this.prefix}-web-host-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      versioned: false,
      lifecycleRules: [],
      publicReadAccess: false,
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.PUT,
            HttpMethods.POST,
            HttpMethods.DELETE,
            HttpMethods.HEAD,
          ],
          allowedOrigins: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
    };
  }
  /**
   * BucketPolicy
   * @description
   * CloudFrontからのみアクセスを許可するためのPolicyです。
   * ポリシーでは、Bucket内で取得できるObjectを制限しています。
   * 取得可能なファイルは、以下の通りです。
   * - index.html
   * - assets/*
   *
   * それ以外のファイルは、403エラーを返します。
   * 例: {tenant}/{uuid} のようなアップロードされたファイル
   */
  private get AllowGetObjectBucketPolicy(): PolicyStatement {
    if (!this.bucket) {
      this.createBucket();
    }

    if (!this.oai) {
      this.createOai();
    }

    if (this.allowGetObjectBucketPolicy) {
      return this.allowGetObjectBucketPolicy;
    }

    this.allowGetObjectBucketPolicy = new PolicyStatement({
      effect: Effect.DENY,
      actions: ["s3:GetObject"],
      resources: [
        `arn:aws:s3:::${this.bucket.bucketName}/tenant:*/*`,
        `arn:aws:s3:::${this.bucket.bucketName}/tenant:*`,
      ],
      principals: [this.oai.grantPrincipal],
    });
    return this.allowGetObjectBucketPolicy;
  }

  private createBucket() {
    this.bucket = new Bucket(this, `${this.prefix}-bucket`, this.bucketProps);
  }

  private createS3Origin() {
    if (!this.bucket) {
      this.createBucket();
    }

    this.s3Origin = new S3Origin(this.bucket);
  }

  private get distributionProps(): CloudFrontWebDistributionProps {
    if (!this.s3Origin) {
      this.createS3Origin();
    }
    const componetId = `${
      this.prefix.charAt(0).toUpperCase() + this.prefix.slice(1)
    }Distribution`;
    return {
      comment: `Distribution for S3 Bucket # ${componetId}`,
      defaultRootObject: "index.html",
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      httpVersion: HttpVersion.HTTP2,
      errorConfigurations: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/",
        },
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/",
        },
      ],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.bucket,
            originAccessIdentity: this.oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
            },
          ],
        },
      ],
    };
  }

  private createDistribution(): CloudFrontWebDistribution {
    this.distribution = new CloudFrontWebDistribution(
      this,
      `${this.prefix}-distribution`,
      this.distributionProps,
    );
    return this.distribution;
  }

  private output() {
    if (this.bucket) {
      new CfnOutput(this, "bucketName", {
        exportName: `bucketName`,
        description: "Bucket Name",
        value: this.bucket.bucketName,
      });
    }

    if (this.distribution) {
      new CfnOutput(this, "distributionDomainName", {
        exportName: `distributionDomainName`,
        description: "Distribution Domain Name",
        value: this.distribution.distributionDomainName,
      });
      new CfnOutput(this, "distributionId", {
        exportName: `distributionId`,
        description: "Distribution Id",
        value: this.distribution.distributionId,
      });
      new CfnOutput(this, "distributionUrl", {
        exportName: `distributionUrl`,
        description: "Distribution Url",
        value: `https://${this.distribution.distributionDomainName}`,
      });
    }
  }
}
