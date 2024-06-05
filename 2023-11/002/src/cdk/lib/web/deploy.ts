import { Stack, StackProps, Duration, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export interface WebDeployStackProps extends StackProps {
  bucket: Bucket;
}
/**
 * WebDeployStack
 * @description
 * WebDeployStackは、WebStackのS3に静的ファイルをデプロイするためのStackです。
 */
export class WebDeployStack extends Stack {
  private prefix: string;
  private bucket: Bucket;
  constructor(scope: Construct, id: string, props: WebDeployStackProps) {
    super(scope, `${id}-stack`, props);
    this.prefix = id;
    this.bucket = props.bucket;
    this.deploy();
  }

  private deploy() {
    new BucketDeployment(this, `${this.prefix}-deploy`, {
      sources: [Source.asset("/app/frontend/dist")],
      destinationBucket: this.bucket,
    });
  }
}
