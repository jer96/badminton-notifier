import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"
import { CheckTimesResponse } from "./types"
import Handlebars = require("handlebars")

export const PROMPT: string = `
Generate a comprehensive message that presents all available badminton appointment options to customers. Group the appointments by location name.

You will receive a list of appointments in the following format:

<AppointmentList>
{{#each appointments}}
    Location: {{locationName}} (This is the name of the facility or building where the courts are located)
    Court: {{courtName}} (This is the specific court number or name within the location)
    Date: {{formattedDate}}
    Duration: {{duration}}

{{/each}}
</AppointmentList>

For each appointment, include the following information:

1. The location name (the name of the facility or building where the courts are located)
2. The specific court name
3. The start time and duration of the appointment (derived from the formattedDate and duration fields)

Preserve the order and completeness of the provided appointment list, ensuring that no data is lost or omitted from the original <AppointmentList></AppointmentList> XML tags.

Present the appointments grouped by location name, following this format:

[Location Name 1]:
[Court Name]: [Start Time] on [Date]
[Court Name]: [Start Time] on [Date]
...

[Location Name 2]:
[Court Name]: [Start Time] on [Date]
[Court Name]: [Start Time] on [Date]
...

Use a friendly and informative tone when presenting the options.

Your response should strictly contain only the generated message without any greeting or salutation.
`

export const PROMPT_TEMPLATE = Handlebars.compile(PROMPT)

export interface AppointmentPromptProps {
    appointments: CheckTimesResponse[]
}

export const constructPrompt = (props: AppointmentPromptProps) => {
    return PROMPT_TEMPLATE(props)
}

export const invokeModel = async (
    prompt: string,
    modelId: string = "anthropic.claude-3-haiku-20240307-v1:0"
) => {
    const client = new BedrockRuntimeClient({ region: "us-east-1" })

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100000,
        messages: [
            {
                role: "user",
                content: [{ type: "text", text: prompt }],
            },
        ],
    }

    // Invoke Claude with the payload and wait for the response.
    const command = new InvokeModelCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId,
    })
    const apiResponse = await client.send(command)

    // Decode and return the response(s)
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body)
    return JSON.parse(decodedResponseBody).content[0].text
}
