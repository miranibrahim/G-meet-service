import { IsNotEmpty, IsString, IsOptional, validateSync } from "class-validator"
import { plainToInstance } from "class-transformer"

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string

  @IsString()
  @IsNotEmpty()
  GOOGLE_REFRESH_TOKEN: string

  @IsString()
  @IsOptional()
  GOOGLE_REDIRECT_URI: string

  @IsOptional()
  PORT: number
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.toString()}`)
  }

  return validatedConfig
}
