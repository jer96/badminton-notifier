#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { ShuttlerStack } from "../lib/shuttler-stack"

const app = new cdk.App()
new ShuttlerStack(app, "ShuttlerStack", {
    env: { account: "730335277230", region: "us-east-1" },
})
