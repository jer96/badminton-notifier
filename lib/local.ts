import { constructPrompt } from "./bedrock.js"
import { DEFAULT_GET_APPOINTMENTS_REQUEST } from "./constants.js"
import { getAppointments } from "./shuttler-stack.badminton.js"

import { CheckTimesResponse, GetAppointments } from "./types.js"
import { writeFile } from "fs"

const writeDataToFile = (filename: string, data: Object) => {
    const jsonData = JSON.stringify(data, null, 2)
    writeFile(filename, jsonData, "utf8", (err) => {
        if (err) {
            console.error("An error occurred:", err)
            return
        }
        console.log("File has been saved.")
    })
}

export const handler = async (event: GetAppointments) => {
    const appointments: CheckTimesResponse[] = await getAppointments(
        event.daysIntoFuture,
        event.dateFilter,
        event.locations
    )
    const prompt = constructPrompt({
        appointments: appointments,
    })
    console.log(prompt)
    writeDataToFile("times.json", appointments)
}

handler(DEFAULT_GET_APPOINTMENTS_REQUEST)
