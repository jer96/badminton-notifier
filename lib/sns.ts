import { SNSClient, PublishCommand } from "@aws-sdk/client-sns"

const client = new SNSClient({ region: "us-east-1" })

export const sendAppointmentNotification = async (message: string) => {
    const params = {
        Message: message,
        TopicArn: process.env.APPOINTMENT_NOTIFIER_SNS_TOPIC,
    }
    try {
        await client.send(new PublishCommand(params))
    } catch (error) {
        console.log("failed sending notification", error)
    }
}
