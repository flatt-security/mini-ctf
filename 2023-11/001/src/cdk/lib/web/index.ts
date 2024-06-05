import { Construct } from "constructs";
import {
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  Duration,
} from "aws-cdk-lib";
import {
  DistributionProps,
  BehaviorOptions,
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  ViewerProtocolPolicy,
  Distribution,
  ErrorResponse,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket, BucketEncryption, BucketProps } from "aws-cdk-lib/aws-s3";

export interface WebStackProps extends StackProps {}

export class WebStack extends Stack {
  private prefix: string;
  private oai: OriginAccessIdentity;
  private bucket: Bucket;
  private s3origin: S3Origin;
  private distribution: Distribution;
  constructor(scope: Construct, prefix: string, props: WebStackProps) {
    super(scope, `${prefix}-stack`, props);
    this.prefix = prefix;
    this.createDistribution();
    this.output();
  }

  get Distribution(): Distribution {
    return this.distribution;
  }

  get Bucket(): Bucket {
    return this.bucket;
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
    };
  }

  private createS3Bucket() {
    this.bucket = new Bucket(
      this,
      `${this.prefix}-web-host-bucket`,
      this.bucketProps,
    );
  }

  private createS3Origin() {
    if (!this.bucket) {
      this.createS3Bucket();
    }
    if (!this.oai) {
      this.createOai();
    }
    this.s3origin = new S3Origin(this.bucket, {
      originAccessIdentity: this.oai,
    });
  }

  private get errorResponses(): ErrorResponse[] {
    return [
      {
        ttl: Duration.seconds(300),
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
      {
        ttl: Duration.seconds(300),
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
    ];
  }

  private get defaultBehavireOptions(): BehaviorOptions {
    if (!this.s3origin) {
      this.createS3Origin();
    }
    return {
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      cachedMethods: CachedMethods.CACHE_GET_HEAD,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      origin: this.s3origin,
      edgeLambdas: [],
    };
  }

  private get distributionProps(): DistributionProps {
    const componetId = `${
      this.prefix.charAt(0).toUpperCase() + this.prefix.slice(1)
    }Distribution`;
    return {
      comment: `Distribution for S3 Bucket # ${componetId}`,
      defaultRootObject: "index.html",
      errorResponses: this.errorResponses,
      defaultBehavior: this.defaultBehavireOptions,
    };
  }

  private createDistribution(): Distribution {
    this.distribution = new Distribution(
      this,
      `${this.prefix}-distribution`,
      this.distributionProps,
    );
    return this.distribution;
  }

  private output() {
    new CfnOutput(this, `${this.prefix}-distribution-domain-name`, {
      description: "Distribution Domain Name",
      exportName: `${this.prefix}-distribution-domain-name`,
      value: this.distribution.distributionDomainName,
    });
    new CfnOutput(this, `${this.prefix}-bucket-name`, {
      description: "Bucket Name",
      exportName: `${this.prefix}-bucket-name`,
      value: this.bucket.bucketName,
    });
  }
}
