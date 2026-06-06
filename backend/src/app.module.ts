import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { validateEnv } from "./config/env.validation"
import { GoogleMeetModule } from "./modules/google-meet/google-meet.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    GoogleMeetModule,
  ],
})
export class AppModule {}
