export interface GetAppointments {
    daysIntoFuture: number
    dateFilter: DateFilter
    locations: BadmintonLocation[]
}

export interface BadmintonLocation {
    name: string
    courts: Court[]
    appointmentTypes: AppointmentType[]
}

export interface Court {
    id: number
    name: string
}

export interface AppointmentType {
    duration: number
    id: number
}

export interface TimeFilter {
    startHour?: number
    endHour?: number
    dayOfWeek: string
    enabled: boolean
}

export interface DateFilter {
    weekFilter: TimeFilter[]
}

export interface DateTime {
    appointmentTypeId: number
    calendarId: number
    datetime: string
    quantity: number
}

export interface CheckTimesRequest {
    datetimes: DateTime[]
    owner: string
}

export interface CheckTimesResponse {
    datetime: string
    appointmentTypeId: number
    calendarId: number
    quantity: number
    valid: boolean
    error?: string
    message?: string
    formattedDate?: string
    locationName?: string
    courtName?: string
    duration?: number
}
