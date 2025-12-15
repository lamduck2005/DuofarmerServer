# DuoFarmer Server

NestJS REST API server for interacting with Duolingo API to farm gems, XP, and maintain streaks.

## Technologies

- **Framework**: NestJS (v11+)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Validation**: class-validator, class-transformer
- **JWT**: jsonwebtoken

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```bash
TEST_JWT=your_jwt_token_here
```

Copy `.env.example` to `.env` and fill in your JWT token for testing.

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

Server runs at `http://localhost:3000`

## API Endpoints

### 1. GET /users/me

**Purpose**: Get user information from Duolingo API

**Request**:
```json
{
  "jwt": "string"
}
```

**Response Success (200)**: Returns user object (type: `UserInfo`)

**Response Error (400/403/500)**:
```json
{
  "statusCode": number,
  "message": "string"
}
```

---

### 2. POST /farming/gem

**Purpose**: Farm gems from Duolingo (30 gems per request)

**Request**:
```json
{
  "jwt": "your_jwt_token",
  "times": 1
}
```

**Parameters**:
- `jwt` (required): JWT token
- `times` (optional): Number of times to farm (1-10). Default: 1 (single mode)

**Response Success - Single Mode (201)** (when `times` is not provided or `times = 1`):
```json
{
  "success": true,
  "message": "Gem farmed successfully"
}
```

**Response Success - Batch Mode (201)** (when `times > 1`):
```json
{
  "totalTimes": 5,
  "successCount": 4,
  "failedCount": 1,
  "results": [
    {
      "index": 1,
      "success": true,
      "data": {
        "success": true,
        "message": "Gem farmed successfully"
      }
    },
    {
      "index": 2,
      "success": true,
      "data": {
        "success": true,
        "message": "Gem farmed successfully"
      }
    },
    {
      "index": 3,
      "success": false,
      "error": "Duolingo API error: 403 - Forbidden"
    },
    {
      "index": 4,
      "success": true,
      "data": {
        "success": true,
        "message": "Gem farmed successfully"
      }
    },
    {
      "index": 5,
      "success": true,
      "data": {
        "success": true,
        "message": "Gem farmed successfully"
      }
    }
  ]
}
```

**Response Error (400/403/500)**:
```json
{
  "statusCode": 403,
  "message": "Duolingo API error: 403 - Forbidden"
}
```

**Note**: 
- Batch mode executes requests with 100ms delay between each request to avoid rate limiting
- Uses `Promise.allSettled` - continues even if some requests fail
- Maximum `times` value is 10

---

### 3. POST /farming/xp/session

**Purpose**: Farm XP through session practice. Creates a session and updates it to gain XP.

**Request**:
```json
{
  "jwt": "your_jwt_token",
  "amount": 10,
  "times": 1
}
```

**Parameters**:
- `jwt` (required): JWT token
- `amount` (required): XP amount to farm
- `times` (optional): Number of times to farm (1-10). Default: 1 (single mode)

**Valid amounts**: `10`, `20`, `40`, `50`, `110`

**Response Success - Single Mode (201)** (when `times` is not provided or `times = 1`):
```json
{
  "success": true,
  "xpGained": 10,
  "message": "Session farmed successfully. XP gained: 10"
}
```

**Response Success - Batch Mode (201)** (when `times > 1`):
```json
{
  "totalTimes": 3,
  "successCount": 3,
  "failedCount": 0,
  "results": [
    {
      "index": 1,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 10,
        "message": "Session farmed successfully. XP gained: 10"
      }
    },
    {
      "index": 2,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 10,
        "message": "Session farmed successfully. XP gained: 10"
      }
    },
    {
      "index": 3,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 10,
        "message": "Session farmed successfully. XP gained: 10"
      }
    }
  ]
}
```

**Response Error (400/403/500)**:
```json
{
  "statusCode": 400,
  "message": "Invalid amount. Valid amounts are: 10, 20, 40, 50, 110"
}
```

**Note**: 
- Amount `110` requires skillId from currentCourse. Returns 400 error if skillId is not found.
- Batch mode executes requests with 100ms delay between each request
- Maximum `times` value is 10

---

### 4. POST /farming/xp/story

**Purpose**: Farm XP through story completion. Completes a story to gain XP.

**Request**:
```json
{
  "jwt": "your_jwt_token",
  "amount": 50,
  "times": 1
}
```

**Parameters**:
- `jwt` (required): JWT token
- `amount` (required): XP amount to farm
- `times` (optional): Number of times to farm (1-10). Default: 1 (single mode)

**Valid amounts**: `50`, `100`, `200`, `300`, `400`, `499`

**Response Success - Single Mode (201)** (when `times` is not provided or `times = 1`):
```json
{
  "success": true,
  "xpGained": 50,
  "message": "Story farmed successfully. XP gained: 50"
}
```

**Response Success - Batch Mode (201)** (when `times > 1`):
```json
{
  "totalTimes": 3,
  "successCount": 3,
  "failedCount": 0,
  "results": [
    {
      "index": 1,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 50,
        "message": "Story farmed successfully. XP gained: 50"
      }
    },
    {
      "index": 2,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 50,
        "message": "Story farmed successfully. XP gained: 50"
      }
    },
    {
      "index": 3,
      "success": true,
      "data": {
        "success": true,
        "xpGained": 50,
        "message": "Story farmed successfully. XP gained: 50"
      }
    }
  ]
}
```

**Response Error (400/403/500)**:
```json
{
  "statusCode": 400,
  "message": "Invalid amount. Valid amounts are: 50, 100, 200, 300, 400, 499"
}
```

**Note**: 
- Story farming only works with English course (fromLanguage = "en").
- Batch mode executes requests with 100ms delay between each request
- Maximum `times` value is 10

---

### 5. POST /farming/streak/farm

**Purpose**: Farm streak once using a backdated session (adds at least 1 streak day)

**Request**:
```json
{
  "jwt": "your_jwt_token"
}
```

**Response Success (200/201)**:
```json
{
  "success": true,
  "message": "Streak farmed successfully"
}
```

**Response Error (400/403/500)**:
```json
{
  "statusCode": 403,
  "message": "Duolingo API error: 403 - Forbidden"
}
```

**Note**:
- Backdates one session to increment streak:
  - Prefer `streakData.currentStreak.startDate - 1 day`
  - Else, backdate `streak` (number) days from now
  - Else, backdate 1 day from now

---

### 6. POST /farming/streak/maintain

**Purpose**: Maintain streak by completing a story (same as story 50 XP with empty config)

**Request**:
```json
{
  "jwt": "your_jwt_token"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Streak maintained successfully"
}
```

**Response Error (400/403/500)**:
```json
{
  "statusCode": 403,
  "message": "Duolingo API error: 403 - Forbidden"
}
```

---

## Error Codes

- **400 Bad Request**: Invalid JWT format, invalid amount, or missing required fields
- **403 Forbidden**: Duolingo API rejected the request (invalid or expired JWT)
- **404 Not Found**: User info not found
- **500 Internal Server Error**: Server error or network error
- **502 Bad Gateway**: Duolingo API returned an error (status code from Duolingo is preserved)

## JWT Token

JWT token must be obtained from browser when logged into Duolingo. Token must be provided in request body for all endpoints. Use my userscript for get jwt quick [https://greasyfork.org/vi/scripts/528621-duolingo-duofarmer](https://greasyfork.org/vi/scripts/528621-duolingo-duofarmer)

## CORS

Server has CORS enabled to allow client calls from browser.

## Testing

E2E tests are split by domain for faster runs:
- `test/users.e2e-spec.ts` – GET /users/me
- `test/gem.e2e-spec.ts` – POST /farming/gem
- `test/xp-session.e2e-spec.ts` – POST /farming/xp/session
- `test/xp-story.e2e-spec.ts` – POST /farming/xp/story
- `test/streak.e2e-spec.ts` – POST /farming/streak/farm (single) and /farming/streak/maintain
- `test/batch.e2e-spec.ts` – Batch tests for gem/session/story

**Run tests**:
```bash
# Run all e2e tests
npm run test:e2e

# Run specific suite
npm run test:e2e -- test/users.e2e-spec.ts
npm run test:e2e -- test/gem.e2e-spec.ts
npm run test:e2e -- test/xp-session.e2e-spec.ts
npm run test:e2e -- test/xp-story.e2e-spec.ts
npm run test:e2e -- test/streak.e2e-spec.ts
npm run test:e2e -- test/batch.e2e-spec.ts
```

**Test JWT**: Set `TEST_JWT` in `.env` file. Tests will use this JWT token for all API calls.

## Batch Farming

Batch mode is supported for:
- `/farming/gem`
- `/farming/xp/session`
- `/farming/xp/story`

Use the `times` parameter (1-10) to run multiple times in one request.

**How it works**:
- If `times` is not provided or `times = 1`: Executes in single mode (returns single response)
- If `times > 1`: Executes in batch mode (returns batch response with results array)
- Batch requests are executed with 100ms delay between each request to avoid rate limiting
- Uses `Promise.allSettled` - continues execution even if some requests fail
- Each result in the batch response includes `index`, `success`, and either `data` (if successful) or `error` (if failed)

**Example**: To farm 150 gems (5 × 30 gems), send:
```json
{
  "jwt": "your_jwt_token",
  "times": 5
}
```

## Notes

- No database required
- JWT is sent in request body, no authentication middleware needed
- Config mapping is hardcoded in FarmingService
- SkillId for XP 110 is extracted from userInfo.currentCourse
- All response messages are in English
- Status codes from Duolingo API are preserved (403 → 403, not converted to 502)
- Batch farming uses sequential execution with delay to prevent rate limiting
