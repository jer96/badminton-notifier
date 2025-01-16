import {
    TIME_ZONE,
    MINUTE_START_TIMES,
    CHECK_TIMES_URL,
    CHECK_TIMES_REQUESTS,
} from "./constants.js"
import { sendAppointmentNotification } from "./sns.js"
import {
    DateFilter,
    TimeFilter,
    DateTime,
    CheckTimesRequest,
    CheckTimesResponse,
    BadmintonLocation,
    Court,
    AppointmentType,
    GetAppointments,
} from "./types.js"
import axios from "axios"
import moment = require("moment-timezone")
import Handlebars = require("handlebars")

const getDateTimesForLocations = (
    isoDatesTimes: string[],
    locations: BadmintonLocation[]
): Map<BadmintonLocation, DateTime[]> => {
    let dateTimeMap = new Map<BadmintonLocation, DateTime[]>();

    locations.forEach((location) => {
        let locationDateTimes: DateTime[] = [];

        isoDatesTimes.forEach((dateTime: string) => {
            location.courts.forEach((court: Court) => {
                const calendarId = court.id;
                location.appointmentTypes.forEach((appointment) => {
                    const typeId = appointment.id;
                    const dateTimeRequest: DateTime = {
                        datetime: dateTime,
                        appointmentTypeId: typeId,
                        calendarId: calendarId,
                        quantity: 1,
                    };
                    locationDateTimes.push(dateTimeRequest);
                });
            });
        });

        dateTimeMap.set(location, locationDateTimes);
    });

    return dateTimeMap;
};

const getTimeFilter = (
    currentDay: number,
    dateFilter: DateFilter
): TimeFilter | undefined => {
    const numToDay: string[] = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ]
    const weekday: string = numToDay[currentDay]
    return dateFilter.weekFilter.find(
        (timeFilter: TimeFilter | undefined) =>
            timeFilter !== undefined &&
            // @ts-ignore: 7006
            timeFilter.dayOfWeek.toLowerCase() === weekday
    )
}

const getLocalizedFutureDates = (
    daysIntoFuture: number,
    dateFilter: DateFilter
): string[] => {
    const dateTimes: string[] = []
    // const today = new Date()
    const today = moment()
    for (let i = 0; i <= daysIntoFuture; i++) {
        const futureDate = moment(today).tz(TIME_ZONE)
        futureDate.add(i, "days")
        const day = futureDate.day()
        const timeFilter: TimeFilter | undefined = getTimeFilter(
            day,
            dateFilter
        )
        if (timeFilter !== undefined && timeFilter.enabled) {
            const minHour =
                timeFilter.startHour !== undefined &&
                    timeFilter.startHour !== null
                    ? timeFilter.startHour
                    : 0
            const maxHour =
                timeFilter.endHour !== undefined && timeFilter.endHour !== null
                    ? timeFilter.endHour
                    : 23
            const diff = maxHour - minHour
            for (let hour = 0; hour <= diff; hour++) {
                MINUTE_START_TIMES.forEach((minute) => {
                    const formattedIsoDate = futureDate
                        .hour(minHour + hour)
                        .minute(minute)
                        .second(0)
                        .millisecond(0)
                        .format()
                    dateTimes.push(formattedIsoDate)
                })
            }
        }
    }
    return dateTimes
}

const createCheckTimesPayloads = (
    dateTimes: DateTime[],
    owner: string
): CheckTimesRequest[] => {
    const totalDateTimes = dateTimes.length
    const maxPerRequest = Math.ceil(totalDateTimes / CHECK_TIMES_REQUESTS)
    const requests = []

    for (let i = 0; i < totalDateTimes; i += maxPerRequest) {
        const slice = dateTimes.slice(i, i + maxPerRequest)
        const checkTimesRequest: CheckTimesRequest = {
            datetimes: slice,
            owner: owner
        }
        requests.push(checkTimesRequest)
    }

    return requests
}

const submitCheckTimesPayloads = async (
    payloads: CheckTimesRequest[],
    locations: BadmintonLocation[]
) => {
    const requests = payloads.map((payload) =>
        axios.post<CheckTimesResponse[]>(CHECK_TIMES_URL, payload)
    )
    let availableTimes: CheckTimesResponse[] = []
    const results = await Promise.allSettled(requests)
    results.forEach((result, _) => {
        if (result.status === "fulfilled") {
            const checkTimesResponse: CheckTimesResponse[] = result.value.data
            const currentAvailableTimes = checkTimesResponse
                .filter((res: CheckTimesResponse) => res.valid === true)
                .map((res: CheckTimesResponse) => {
                    const formattedDate = new Date(res.datetime).toLocaleString(
                        "en-US",
                        {
                            timeZone: TIME_ZONE,
                            month: "short",
                            day: "2-digit",
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )
                    res.formattedDate = formattedDate
                    const location: BadmintonLocation | undefined =
                        locations.find(
                            (location: BadmintonLocation) =>
                                location.appointmentTypes.find(
                                    (appointmentType: AppointmentType) =>
                                        appointmentType.id ===
                                        res.appointmentTypeId
                                ) !== undefined
                        )
                    if (location !== undefined) {
                        res.locationName = location.name
                        // @ts-ignore: 2432
                        res.courtName = location.courts.find(
                            (court: Court) => court.id === res.calendarId
                        ).name
                        // @ts-ignore: 2432
                        res.duration = location.appointmentTypes.find(
                            (appointmentType: AppointmentType) =>
                                appointmentType.id === res.appointmentTypeId
                        ).duration
                    }
                    return res
                })
            availableTimes.push(...currentAvailableTimes)
        } else {
            console.error(`Error with request`, result.reason)
        }
    })

    return availableTimes
}

export const getAppointments = async (
    daysIntoFuture: number,
    dateFilter: DateFilter,
    locations: BadmintonLocation[]
): Promise<CheckTimesResponse[]> => {
    const dates = getLocalizedFutureDates(daysIntoFuture, dateFilter);
    const dateTimeMap = getDateTimesForLocations(dates, locations);

    let allAvailableTimes: CheckTimesResponse[] = [];

    // Process each location's dateTimes separately
    for (const [location, dateTimes] of dateTimeMap) {
        const payloads = createCheckTimesPayloads(dateTimes, location.owner);
        const availableTimes = await submitCheckTimesPayloads(payloads, [location]);
        allAvailableTimes.push(...availableTimes);
    }

    return allAvailableTimes;
};


export const formatStaticResponse = (
    appointments: CheckTimesResponse[]
): string => {
    const response: string = `
{{#each appointments}}
    Location: {{locationName}}
    Court: {{courtName}}
    Date: {{formattedDate}}
    Duration: {{duration}}

{{/each}}
`
    const template = Handlebars.compile(response)
    return template({ appointments: appointments })
}

// @ts-ignore: 7006
export const handler = async (event: GetAppointments) => {
    const appointments: CheckTimesResponse[] = await getAppointments(
        event.daysIntoFuture,
        event.dateFilter,
        event.locations
    )
    if (appointments.length > 0) {
        const response = formatStaticResponse(appointments)
        await sendAppointmentNotification(response)
        return response
    } else {
        return ""
    }
}
