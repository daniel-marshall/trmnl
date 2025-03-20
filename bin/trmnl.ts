#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TrmnlPipelineStack } from '../lib/trmnl-pipeline';

const app = new cdk.App();
new TrmnlPipelineStack(app, 'TrmnlPipelineStack', {
  env: { account: '794038246157', region: 'us-east-1' },
});
