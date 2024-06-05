import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

export interface WebDeployStackProps extends StackProps {
  bucket: IBucket;
}

export class WebDeployStack extends Stack {
  private prefix: string;
  private bucket: IBucket;
  constructor(scope: Construct, prefix: string, props: WebDeployStackProps) {
    super(scope, `${prefix}-stack`, props);
    this.prefix = prefix;
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
