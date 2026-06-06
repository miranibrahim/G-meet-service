export interface IGoogleMeetEvent {
  eventId: string
  meetLink: string
  title: string
  description?: string
  startTime: string
  endTime: string
  eventLink: string
}

export interface IListEventsResult {
  events: IGoogleMeetEvent[]
  date: string
  total: number
}

export interface IDeleteResult {
  success: boolean
  eventId: string
  message: string
}
