import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"
import { Topic } from "aws-cdk-lib/aws-sns"
import { Rule, RuleTargetInput, Schedule } from "aws-cdk-lib/aws-events"
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets"
import {
    DEFAULT_GET_APPOINTMENTS_REQUEST,
    FLUSHING_GET_APPOINTMENTS_REQUEST,
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

        const flushingLambdaTarget = new LambdaFunction(schedulerLambda, {
            event: RuleTargetInput.fromObject(
                FLUSHING_GET_APPOINTMENTS_REQUEST
            ),
        })

        const twelvePmRule = new Rule(this, "12pmDailyScheduleRule", {
            schedule: Schedule.cron({
                minute: "0",
                hour: "16",
                month: "*",
                weekDay: "MON-SUN",
                year: "*",
            }),
            targets: [lambdaTarget],
        })

        const sixPmRule = new Rule(this, "6pmDailyScheduleRule", {
            schedule: Schedule.cron({
                minute: "30",
                hour: "22",
                month: "*",
                weekDay: "MON-SUN",
                year: "*",
            }),
            targets: [lambdaTarget],
        })

        const hourlyFlushingRule = new Rule(this, "HourlyFlushingRule", {
            schedule: Schedule.cron({
                minute: "0",
                hour: "9-23", // This will run from 7 AM to 11 PM
                month: "*",
                weekDay: "MON-SUN",
                year: "*",
            }),
            targets: [flushingLambdaTarget],
        })
    }
}
