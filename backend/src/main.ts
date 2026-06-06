import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix
  app.setGlobalPrefix("api")

  // Global validation pipe — validates all DTOs automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true,         // auto-transform types (string → number, etc.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // CORS — allow frontend to call the API
  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)

  console.log(`\n🚀 Google Meet API running at http://localhost:${port}/api`)
  console.log(`   POST   /api/meet              — Create event`)
  console.log(`   GET    /api/meet/events?date= — List events by date`)
  console.log(`   GET    /api/meet/:id          — Get event`)
  console.log(`   PATCH  /api/meet/:id          — Update event`)
  console.log(`   DELETE /api/meet/:id          — Delete event\n`)
}

bootstrap()
