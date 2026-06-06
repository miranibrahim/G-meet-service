import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { GoogleMeetService } from "./google-meet.service"
import { CreateEventDto } from "./dto/create-event.dto"
import { UpdateEventDto } from "./dto/update-event.dto"
import { ListEventsDto } from "./dto/list-events.dto"

@Controller("meet")
export class GoogleMeetController {
  constructor(private readonly googleMeetService: GoogleMeetService) {}

  // POST /meet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@Body() dto: CreateEventDto) {
    return this.googleMeetService.createEvent(dto)
  }

  // GET /meet/events?date=YYYY-MM-DD
  @Get("events")
  async listEvents(@Query() query: ListEventsDto) {
    return this.googleMeetService.listEventsByDate(query.date)
  }

  // GET /meet/:eventId
  @Get(":eventId")
  async getEvent(@Param("eventId") eventId: string) {
    return this.googleMeetService.getEvent(eventId)
  }

  // PATCH /meet/:eventId
  @Patch(":eventId")
  async updateEvent(
    @Param("eventId") eventId: string,
    @Body() dto: UpdateEventDto
  ) {
    return this.googleMeetService.updateEvent(eventId, dto)
  }

  // DELETE /meet/:eventId
  @Delete(":eventId")
  @HttpCode(HttpStatus.OK)
  async deleteEvent(@Param("eventId") eventId: string) {
    return this.googleMeetService.deleteEvent(eventId)
  }
}
