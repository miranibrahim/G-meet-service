import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { google, calendar_v3 } from "googleapis"
import { getGoogleOAuthClient } from "../../config/google.config"
import { CreateEventDto } from "./dto/create-event.dto"
import { UpdateEventDto } from "./dto/update-event.dto"
import { IGoogleMeetEvent, IListEventsResult, IDeleteResult } from "./interfaces"

@Injectable()
export class GoogleMeetService {
  private get calendar() {
    return google.calendar({ version: "v3", auth: getGoogleOAuthClient() })
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private extractMeetLink(data: calendar_v3.Schema$Event): string | null {
    return (
      data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === "video"
      )?.uri ?? null
    )
  }

  private mapEventToResponse(data: calendar_v3.Schema$Event): IGoogleMeetEvent {
    const meetLink = this.extractMeetLink(data)

    return {
      eventId: data.id!,
      meetLink: meetLink ?? "",
      title: data.summary ?? "Untitled",
      description: data.description ?? undefined,
      startTime: data.start?.dateTime ?? "",
      endTime: data.end?.dateTime ?? "",
      eventLink: data.htmlLink ?? "",
    }
  }

  private buildEndTime(startTime: Date, durationInMinutes: number): Date {
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + durationInMinutes)
    return endTime
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  async createEvent(dto: CreateEventDto): Promise<IGoogleMeetEvent> {
    const startTime = new Date(dto.startTime)
    const endTime = this.buildEndTime(startTime, dto.durationInMinutes ?? 60)
    const timeZone = dto.timeZone ?? "UTC"

    const event: calendar_v3.Schema$Event = {
      summary: dto.title,
      description: dto.description,
      start: { dateTime: startTime.toISOString(), timeZone },
      end: { dateTime: endTime.toISOString(), timeZone },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: event,
      })

      const meetLink = this.extractMeetLink(response.data)

      if (!meetLink) throw new InternalServerErrorException("Google Meet link was not generated")
      if (!response.data.id) throw new InternalServerErrorException("Event ID was not returned")

      return this.mapEventToResponse(response.data)
    } catch (error: any) {
      if (error instanceof InternalServerErrorException) throw error
      throw new InternalServerErrorException(`Failed to create event: ${error.message}`)
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  async updateEvent(eventId: string, dto: UpdateEventDto): Promise<IGoogleMeetEvent> {
    // Fetch existing event first to preserve duration if not provided
    const existing = await this.getEvent(eventId)

    const startTime = dto.startTime ? new Date(dto.startTime) : new Date(existing.startTime)
    const durationInMinutes = dto.durationInMinutes ?? this.getDurationInMinutes(existing)
    const endTime = this.buildEndTime(startTime, durationInMinutes)
    const timeZone = dto.timeZone ?? "UTC"

    const patch: calendar_v3.Schema$Event = {
      start: { dateTime: startTime.toISOString(), timeZone },
      end: { dateTime: endTime.toISOString(), timeZone },
    }

    if (dto.title) patch.summary = dto.title
    if (dto.description !== undefined) patch.description = dto.description

    try {
      const response = await this.calendar.events.patch({
        calendarId: "primary",
        eventId,
        conferenceDataVersion: 1,
        requestBody: patch,
      })

      if (!response.data.id) throw new InternalServerErrorException("Event ID was not returned")

      return this.mapEventToResponse(response.data)
    } catch (error: any) {
      if (error.code === 404) throw new NotFoundException(`Event ${eventId} not found`)
      if (error instanceof InternalServerErrorException) throw error
      throw new InternalServerErrorException(`Failed to update event: ${error.message}`)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async deleteEvent(eventId: string): Promise<IDeleteResult> {
    if (!eventId) throw new NotFoundException("Event ID is required")

    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId,
      })

      return {
        success: true,
        eventId,
        message: "Event deleted successfully",
      }
    } catch (error: any) {
      if (error.code === 404) throw new NotFoundException(`Event ${eventId} not found`)
      throw new InternalServerErrorException(`Failed to delete event: ${error.message}`)
    }
  }

  // ── Get Single ─────────────────────────────────────────────────────────────

  async getEvent(eventId: string): Promise<IGoogleMeetEvent> {
    try {
      const response = await this.calendar.events.get({
        calendarId: "primary",
        eventId,
      })

      return this.mapEventToResponse(response.data)
    } catch (error: any) {
      if (error.code === 404) throw new NotFoundException(`Event ${eventId} not found`)
      throw new InternalServerErrorException(`Failed to get event: ${error.message}`)
    }
  }

  // ── List by Date ───────────────────────────────────────────────────────────

  async listEventsByDate(date: string): Promise<IListEventsResult> {
    const dayStart = new Date(`${date}T00:00:00.000Z`)
    const dayEnd = new Date(`${date}T23:59:59.999Z`)

    try {
      const response = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      })

      const items = response.data.items ?? []

      // Only return events that have a Meet link
      const meetEvents = items
        .filter((item) => this.extractMeetLink(item) !== null)
        .map((item) => this.mapEventToResponse(item))

      return {
        events: meetEvents,
        date,
        total: meetEvents.length,
      }
    } catch (error: any) {
      throw new InternalServerErrorException(`Failed to list events: ${error.message}`)
    }
  }

  // ── Private Util ───────────────────────────────────────────────────────────

  private getDurationInMinutes(event: IGoogleMeetEvent): number {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    return Math.round((end.getTime() - start.getTime()) / 60000)
  }
}
