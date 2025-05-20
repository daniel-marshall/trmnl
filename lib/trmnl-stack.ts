import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as events from 'aws-cdk-lib/aws_events';
import * as targets from 'aws-cdk-lib/aws_events_targets';
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

    const keeeyLambda = lambda.Function.fromFunctionArn(
      this,
      'KeeeyFunction',
      'arn:aws:lambda:us-east-1:794038246157:function:Alpha-Keeey-Function76856677-Z18n4i9g9yb8'
    );

    const activityLambdaFunc = new lambda.Function(this, 'ActivityFunction', {
      runtime: lambda.Runtime.FROM_IMAGE,
      handler: lambda.Handler.FROM_IMAGE,
      code: lambda.Code.fromEcrImage(props.ecrRepo, { tagOrDigest: `sha256:${ecrDigest.valueAsString}` }),
      timeout: cdk.Duration.minutes(1),
      environment: {
        LAMBDA_HANDLER_KEY: "ACTIVITY",
        LAMBDA_NAME: keeeyLambda.functionName,
        TRMNL_WEBHOOK_URL: "https://usetrmnl.com/api/custom_plugins/3acd1c9d-4b9b-47f8-ab95-6222ba8f99b9"
      }
    });

    const activityLambdaUrl = activityLambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    });

    const listsLambdaFunc = new lambda.Function(this, 'ListFunction', {
      runtime: lambda.Runtime.FROM_IMAGE,
      handler: lambda.Handler.FROM_IMAGE,
      code: lambda.Code.fromEcrImage(props.ecrRepo, { tagOrDigest: `sha256:${ecrDigest.valueAsString}` }),
      timeout: cdk.Duration.minutes(1),
      environment: {
        LAMBDA_HANDLER_KEY: "LISTS",
        LAMBDA_NAME: keeeyLambda.functionName,
        TRMNL_WEBHOOK_URL: "https://usetrmnl.com/api/custom_plugins/e8d8f5f6-362e-4ae7-bab7-e417074ef690"
      }
    });

    const listsLambdaUrl = listsLambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    });

    keeeyLambda.grantInvoke(activityLambdaFunc);
    keeeyLambda.grantInvoke(listsLambdaFunc);

    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
    });

    rule.addTarget(new targets.LambdaFunction(activityLambdaFunc, {
      retryAttempts: 2,
    }));

    rule.addTarget(new targets.LambdaFunction(listsLambdaFunc, {
      retryAttempts: 2,
    }));
  }
}
