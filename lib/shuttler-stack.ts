import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"
import { Topic } from "aws-cdk-lib/aws-sns"
import { Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events"
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets"
import {
    DEFAULT_GET_APPOINTMENTS_REQUEST,
} from "./constants"

export class ShuttlerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const topic = new Topic(this, "AppointmentNotifier", {
            displayName: "Badminton Appointment Notification",
        })

        const schedulerLambda = new NodejsFunction(this, "badminton", {
            timeout: cdk.Duration.minutes(15),
            environment: {
                ["APPOINTMENT_NOTIFIER_SNS_TOPIC"]: topic.topicArn,
            },
        })
        schedulerLambda.addToRolePolicy(
            new PolicyStatement({
                actions: ["bedrock:InvokeModel", "bedrock-runtime:InvokeModel"],
                resources: ["*"],
            })
        )
        topic.grantPublish(schedulerLambda)
        const lambdaTarget = new LambdaFunction(schedulerLambda, {
            event: RuleTargetInput.fromObject(DEFAULT_GET_APPOINTMENTS_REQUEST),
        })

        const hourlyRule = new Rule(this, "HourlyRule", {
            schedule: Schedule.cron({
                minute: "0",
                hour: "14-4", // This will run from 9 AM to 11 PM EST (UTC-5)
                month: "*",
                weekDay: "MON-SUN",
                year: "*",
            }),
            targets: [lambdaTarget],
        })
    }
}
