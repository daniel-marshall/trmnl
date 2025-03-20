import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Repository } from 'aws-cdk-lib/aws-ecr';

export interface Props extends cdk.StackProps {
  ecrRepo: Repository,
  ecrImageDigestParameterId: string,
}

export class TrmnlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const ecrDigest = new cdk.CfnParameter(this, props.ecrImageDigestParameterId, {
      type: 'String',
    });
    ecrDigest.overrideLogicalId(props.ecrImageDigestParameterId);
    const activityLambdaFunc = new lambda.Function(this, 'ActivityFunction', {
      runtime: lambda.Runtime.FROM_IMAGE,
      handler: lambda.Handler.FROM_IMAGE,
      code: lambda.Code.fromEcrImage(props.ecrRepo, { tagOrDigest: `sha256:${ecrDigest.valueAsString}` }),
      timeout: cdk.Duration.seconds(30),
      environment: {
        LAMBDA_HANDLER_KEY: "ACTIVITY"
      }
    });

    const activityLambdaUrl = activityLambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    });

    const listsLambdaFunc = new lambda.Function(this, 'ListFunction', {
      runtime: lambda.Runtime.FROM_IMAGE,
      handler: lambda.Handler.FROM_IMAGE,
      code: lambda.Code.fromEcrImage(props.ecrRepo, { tagOrDigest: `sha256:${ecrDigest.valueAsString}` }),
      timeout: cdk.Duration.seconds(30),
      environment: {
        LAMBDA_HANDLER_KEY: "LISTS"
      }
    });

    const listsLambdaUrl = listsLambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    });
  }
}
