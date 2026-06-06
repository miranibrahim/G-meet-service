import { IsString, IsOptional, IsDateString, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsDateString()
  startTime?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  durationInMinutes?: number

  @IsOptional()
  @IsString()
  timeZone?: string
}
