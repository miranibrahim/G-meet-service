import { IsDateString, IsNotEmpty } from "class-validator"

export class ListEventsDto {
  @IsDateString()
  @IsNotEmpty()
  date: string  // format: YYYY-MM-DD
}
