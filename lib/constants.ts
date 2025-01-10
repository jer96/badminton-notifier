import { BadmintonLocation, DateFilter, GetAppointments } from "./types"

export const CHECK_TIMES_URL =
    "https://nybcreservation.as.me/api/scheduling/v1/availability/check-times"
export const OWNER = "6efeecae"
export const TIME_ZONE = "America/New_York"
export const MAX_DAYS = 30
export const CHECK_TIMES_REQUESTS = 25
export const MINUTE_START_TIMES = [0, 15, 30, 45]

export const DEFAULT_DATE_FILTER: DateFilter = {
    weekFilter: [
        {
            dayOfWeek: "sunday",
            startHour: 12,
            endHour: 18,
            enabled: true,
        },
        {
            dayOfWeek: "monday",
            enabled: false,
        },
        {
            dayOfWeek: "tuesday",
            enabled: false,
        },
        {
            dayOfWeek: "wednesday",
            startHour: 18,
            endHour: 20,
            enabled: true,
        },
        {
            dayOfWeek: "thursday",
            startHour: 18,
            endHour: 20,
            enabled: true,
        },
        {
            dayOfWeek: "friday",
            startHour: 18,
            endHour: 20,
            enabled: true,
        },
        {
            dayOfWeek: "saturday",
            startHour: 12,
            endHour: 18,
            enabled: true,
        },
    ],
}

export const FLUSHING: BadmintonLocation = {
    name: "NYBC Flushing",
    courts: [
        {
            id: 6015029,
            name: "Court 1",
        },
        {
            id: 5898671,
            name: "Court 2",
        },
        {
            id: 6014879,
            name: "Court 3",
        },
        {
            id: 6015043,
            name: "Court 4",
        },
        {
            id: 6015559,
            name: "Court 5",
        },
        {
            id: 6015565,
            name: "Court 6 VIP",
        },
    ],
    appointmentTypes: [
        // {
        //     duration: 45,
        //     id: 25483068,
        // },
        {
            duration: 60,
            id: 26435410,
        },
        {
            duration: 90,
            id: 26435492,
        },
        {
            duration: 105,
            id: 26463127,
        },
        {
            duration: 120,
            id: 26463135,
        },
        // {
        //     duration: 150,
        //     id: 26463186,
        // },
    ],
}

export const BROOKLYN: BadmintonLocation = {
    name: "BKBC Brooklyn",
    courts: [
        {
            id: 8510150,
            name: "Court 1 VIP",
        },
        {
            id: 8510186,
            name: "Court 2",
        },
        {
            id: 8510188,
            name: "Court 3",
        },
        {
            id: 8510202,
            name: "Court 4",
        },
        {
            id: 8510203,
            name: "Court 5",
        },
        {
            id: 8510236,
            name: "Court 6",
        },
        {
            id: 8510233,
            name: "Court 7 VIP",
        },
    ],
    appointmentTypes: [
        // {
        //     duration: 45,
        //     id: 48094909,
        // },
        // {
        //     duration: 60,
        //     id: 48095023,
        // },
        {
            duration: 90,
            id: 48095116,
        },
        {
            duration: 105,
            id: 48096009,
        },
        {
            duration: 120,
            id: 27042201,
        },
        // {
        //     duration: 150,
        //     id: 48096162,
        // },
    ],
}

export const DEFAULT_LOCATIONS: BadmintonLocation[] = [FLUSHING, BROOKLYN]

export const DEFAULT_GET_APPOINTMENTS_REQUEST: GetAppointments = {
    daysIntoFuture: MAX_DAYS,
    dateFilter: DEFAULT_DATE_FILTER,
    locations: DEFAULT_LOCATIONS,
}

export const FLUSHING_GET_APPOINTMENTS_REQUEST: GetAppointments = {
    daysIntoFuture: MAX_DAYS,
    dateFilter: DEFAULT_DATE_FILTER,
    locations: [FLUSHING],
}
