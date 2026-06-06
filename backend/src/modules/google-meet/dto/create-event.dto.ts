import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsDateString()
  @IsNotEmpty()
  startTime: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  durationInMinutes?: number = 60

  @IsOptional()
  @IsString()
  timeZone?: string = "UTC"
}
