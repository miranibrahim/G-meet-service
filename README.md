# Google Meet Manager

Full-stack Google Meet event management — NestJS backend + Tailwind frontend.

## Features
- ✅ Create Meet events (instant or scheduled)
- ✅ Update event title, time, duration, description
- ✅ Delete events
- ✅ List all Meet events for a given date
- ✅ Copy Meet links, join directly from UI

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── config/
│   │   │   ├── google.config.ts       ← OAuth2 client singleton
│   │   │   └── env.validation.ts      ← startup env check
│   │   └── modules/google-meet/
│   │       ├── dto/
│   │       │   ├── create-event.dto.ts
│   │       │   ├── update-event.dto.ts
│   │       │   └── list-events.dto.ts
│   │       ├── google-meet.controller.ts
│   │       ├── google-meet.service.ts
│   │       ├── google-meet.module.ts
│   │       └── interfaces.ts
│   ├── .env.example
│   └── package.json
│
└── frontend/
    └── index.html
```

---

## Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your Google credentials
npm install
npm run start:dev
```

### Environment Variables (.env)

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token   # from get-refresh-token.js
PORT=3000
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meet` | Create new Meet event |
| GET | `/api/meet/events?date=YYYY-MM-DD` | List events by date |
| GET | `/api/meet/:eventId` | Get single event |
| PATCH | `/api/meet/:eventId` | Update event |
| DELETE | `/api/meet/:eventId` | Delete event |

### POST /api/meet
```json
{
  "title": "Team Standup",
  "startTime": "2025-09-01T10:00:00.000Z",
  "durationInMinutes": 60,
  "description": "Optional",
  "timeZone": "UTC"
}
```

### PATCH /api/meet/:eventId
All fields optional:
```json
{
  "title": "Updated Title",
  "startTime": "2025-09-01T11:00:00.000Z",
  "durationInMinutes": 90
}
```

---

## Frontend

Open `frontend/index.html` directly in a browser.
Make sure the backend is running on `http://localhost:3000`.
