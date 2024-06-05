import { Construct } from "constructs";
import { Stack, StackProps, RemovalPolicy, Aws } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { DockerImageName, ECRDeployment } from "cdk-ecr-deployment";
import { join } from "path";
export interface ContainerStackProps extends StackProps {}

export class ContainerStack extends Stack {
  private prefix: string;
  private repository: Repository;
  private conatainerName: string;
  constructor(scope: Construct, id: string, props: ContainerStackProps) {
    super(scope, `${id}-stack`, props);
    this.prefix = id;
    this.repository = new Repository(this, `${this.prefix}-report-repository`, {
      repositoryName: `${this.prefix}-report-repository`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const dockerImageAsset = new DockerImageAsset(
      this,
      `${this.prefix}-report-image`,
      {
        directory: join(__dirname, "container", "report"),
      },
    );

    new ECRDeployment(this, `${this.prefix}-report-deployment`, {
      src: new DockerImageName(dockerImageAsset.imageUri),
      dest: new DockerImageName(
        `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${this.repository.repositoryName}:latest`,
      ),
    });

    this.conatainerName = `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${this.repository.repositoryName}:latest`;
  }

  get Repository(): Repository {
    return this.repository;
  }
}
