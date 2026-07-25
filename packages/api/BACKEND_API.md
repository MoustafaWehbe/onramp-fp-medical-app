# Backend API Reference — `@starter-kit/api`

Complete profile of the Express API in `packages/api`. Source of truth: route handlers, Zod schemas, and services (not the stale `openapi.yaml`).

**Base URL (dev):** `http://localhost:3000`  
**API prefix:** `/api`  
**Auth:** Cookie-based JWT (`credentials: "include"`). Tokens are **not** returned in JSON bodies.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Authentication & cookies](#2-authentication--cookies)
3. [Shared types & conventions](#3-shared-types--conventions)
4. [Error responses](#4-error-responses)
5. [System endpoints](#5-system-endpoints)
6. [Auth — `/api/auth`](#6-auth--apiauth)
7. [Catalog clinics — `/api/clinics`](#7-catalog-clinics--apiclinics)
8. [Catalog doctors — `/api/doctors`](#8-catalog-doctors--apidoctors)
9. [Catalog medications — `/api/medications`](#9-catalog-medications--apimedications)
10. [Catalog symptoms — `/api/catalog`](#10-catalog-symptoms--apicatalog)
11. [Catalog conditions — `/api/conditions`](#11-catalog-conditions--apiconditions)
12. [Profile doctors — `/api/profile/doctors`](#12-profile-doctors--apiprofiledoctors)
13. [Profile conditions — `/api/profile/conditions`](#13-profile-conditions--apiprofileconditions)
14. [Profile medications — `/api/profile/medications`](#14-profile-medications--apiprofilemedications)
15. [Profile symptoms — `/api/profile/symptoms`](#15-profile-symptoms--apiprofilesymptoms)
16. [Profile clinics — `/api/profile/clinics`](#16-profile-clinics--apiprofileclinics)
17. [Daily entries — `/api/profile/daily-entries`](#17-daily-entries--apiprofiledaily-entries)
18. [Environment & scripts](#18-environment--scripts)
19. [Endpoint index](#19-endpoint-index)

---

## 1. Architecture overview

### Tech stack

| Layer | Technology |
|--------|------------|
| Runtime | Node.js + TypeScript (`tsx` / `tsc`) |
| HTTP | Express 4 |
| ORM / DB | Sequelize 6 + PostgreSQL |
| Validation | Zod (`validate` middleware) |
| Auth | Cookie JWT via `@starter-kit/shared` |
| Security | helmet, cors, cookie-parser, express-rate-limit |
| Docs UI | swagger-ui-express + `openapi.yaml` (stale vs live routes) |

### Entry points

| File | Role |
|------|------|
| `server.ts` | Loads monorepo root `.env`, `initializeDatabase()`, listens on `PORT` |
| `app.ts` | Middleware stack, mounts `/api`, health, Swagger, error handler |

### Request pipeline (`app.ts`)

1. `helmet()`
2. `cors({ origin: CORS_ORIGIN ?? "http://localhost:5173", credentials: true })`
3. `cookieParser()`
4. `express.json({ limit: "1mb" })` + `urlencoded`
5. `morgan("dev")` (skipped when `NODE_ENV === "test"`)
6. `rateLimiter` on `/api/` — **100 requests / 15 minutes**
7. `app.use("/api", router)`
8. `GET /api/openapi.yaml`, `GET /api/docs`
9. `GET /health` (outside `/api`, not rate-limited)
10. `errorHandler` (last)

### Route mounts

| Mount | Router |
|-------|--------|
| `/api/auth` | `auth.routes.ts` |
| `/api/clinics` | `clinic.routes.ts` (JWT) |
| `/api/doctors` | `doctor.routes.ts` (JWT) |
| `/api/medications` | `medication.routes.ts` (JWT) |
| `/api/catalog` | `symptom.routes.ts` (JWT) → `/symptoms` |
| `/api/conditions` | `conditions.routes.ts` (JWT) |
| `/api/profile/*` | `profile/index.ts` (JWT on all) |

### Domain model (high level)

```
Auth:        User → Session → RefreshToken
Catalogs:    Clinic, Doctor, Medication, SymptomCatalog, ConditionCatalog
Profile:     UserClinic, UserDoctor, UserMedication, UserSymptom, UserCondition, ConditionSymptom
Daily log:   DailyEntry → EntrySymptom | EntryCondition | EntryMedication | EntryDoctorVisit
Unused HTTP: AiReport, BullMQ/Redis, OpenAI, S3 libs (present, not routed)
```

**Delete semantics**

- Profile links (doctors, conditions, medications, symptoms, clinics): **soft delete** → `{ id, active: false }`
- Condition–symptom links: **hard delete**
- Daily entries: **hard delete**

### Layering

```
routes → controllers → services → Sequelize models (@starter-kit/shared)
                ↘ schemas (Zod) via validate middleware
```

---

## 2. Authentication & cookies

| Cookie | Path | Max-Age | Notes |
|--------|------|---------|--------|
| `accessToken` | `/api` | 15 minutes | Required for authenticated routes |
| `refreshToken` | `/api/auth/refresh` | 7 days | Only sent to refresh endpoint |

Flags: `httpOnly`, `sameSite: "lax"`, `secure` when `NODE_ENV === "production"`.

`authenticate` reads `req.cookies.accessToken`, verifies JWT, sets:

```ts
req.user = { userId: string; email: string; role: string; sessionId: string }
```

`authorize(...roles)` exists but is **not mounted** on any route.

Auth endpoints also use `authRateLimiter` — **10 requests / 15 minutes**.

**Frontend fetch:** always use `credentials: "include"`.

---

## 3. Shared types & conventions

### Enums

```ts
type ConditionStatus = "active" | "inactive" | "resolved";

type DosageMeasurement =
  | "mg"
  | "g"
  | "ml"
  | "mcg"
  | "tablet"
  | "capsule"
  | "drop"
  | "unit";

type UserRole = "admin" | "user";
```

### Pagination query (most list endpoints)

```ts
interface PaginationQuery {
  currentPage?: number; // int ≥ 1, default 1
  pageSize?: number;    // int 1–100, default 10
  search?: string;      // trim, max 255 (when supported)
}
```

### Success wrappers

```ts
interface DataResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface SoftDeleteResponse {
  data: { id: string; active: false };
}
```

**Exception:** online-search endpoints return a **raw** `string[]` or `string | null` (no `{ data }` wrapper).

### UUID params

All `:id` path params are UUIDs unless noted.

---

## 4. Error responses

```ts
interface ErrorResponse {
  error: string;
  stack?: string; // only when NODE_ENV === "development"
}

interface ValidationErrorResponse {
  error: "Validation failed";
  errors: Array<{ field: string; message: string }>;
}
```

| Status | Typical cause |
|--------|----------------|
| 401 | Missing/invalid JWT or credentials |
| 403 | Insufficient permissions (`authorize`, unused) |
| 404 | Resource not found |
| 409 | Unique / already-linked conflict |
| 422 | Zod validation failed |
| 429 | Rate limit |
| 502 | External API failure |
| 500 | Unexpected / non-operational |

**Rate limit bodies**

```json
{ "error": "Too many requests, please try again later." }
```

```json
{ "error": "Too many authentication attempts, please try again later." }
```

---

## 5. System endpoints

### `GET /health`

**Auth:** Public

**Response `200`**

```json
{
  "status": "ok",
  "timestamp": "2026-07-23T16:00:00.000Z"
}
```

### `GET /api/openapi.yaml`

Serves the static OpenAPI file (may be out of date vs live routes).

### `GET /api/docs`

Swagger UI for that OpenAPI file.

---

## 6. Auth — `/api/auth`

### `POST /api/auth/register`

**Auth:** Public + auth rate limit  
**Does not set cookies** — client must login after register.

```ts
interface RegisterRequest {
  email: string;    // valid email
  password: string; // ≥8 chars, ≥1 uppercase, ≥1 digit
  name: string;     // 2–100 chars
}
```

**Example request**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1",
  "name": "Jane Doe"
}
```

**Response `201`**

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "user"
  }
}
```

**Errors:** `409` `{ "error": "Email already in use" }` · `422` validation · `429` auth rate limit

---

### `POST /api/auth/login`

**Auth:** Public + auth rate limit  
**Sets** `accessToken` + `refreshToken` cookies.

```ts
interface LoginRequest {
  email: string;
  password: string; // min 1
}
```

**Example request**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response `200`**

```json
{
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "jane@example.com",
      "name": "Jane Doe",
      "role": "user"
    }
  }
}
```

**Errors:** `401` `{ "error": "Invalid credentials" }`

---

### `POST /api/auth/refresh`

**Auth:** `refreshToken` cookie (path `/api/auth/refresh`)  
**Body:** none

```ts
// No JSON body — uses cookie only
type RefreshRequest = void;
```

**Response `200`** (rotates both cookies)

```json
{
  "data": {
    "message": "Token refreshed"
  }
}
```

**Errors:** `401` missing / invalid / session not found · `404` `{ "error": "User not found" }`

---

### `POST /api/auth/logout`

**Auth:** Cookie JWT  
**Body:** none · clears cookies · revokes session refresh tokens

**Response `200`**

```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### `GET /api/auth/me`

**Auth:** Cookie JWT

**Response `200`**

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2026-07-01T10:00:00.000Z"
  }
}
```

```ts
interface AuthMeResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string; // ISO datetime
}
```

**Errors:** `404` `{ "error": "User not found" }`

---

## 7. Catalog clinics — `/api/clinics`

All routes require Cookie JWT. Unique constraint: `name` + `phone`.

### Shared entity

```ts
interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}
```

### `GET /api/clinics`

```ts
interface ListClinicsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`**

```json
{
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "City Medical Center",
      "address": "123 Main St",
      "phone": "+1-555-0100",
      "createdAt": "2026-07-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

---

### `POST /api/clinics`

```ts
interface CreateClinicRequest {
  name: string;    // 1–255
  address: string; // 1–5000
  phone: string;   // 1–50
}
```

**Example request**

```json
{
  "name": "City Medical Center",
  "address": "123 Main St",
  "phone": "+1-555-0100"
}
```

**Response `201`:** `{ "data": { /* Clinic */ } }`  
**Errors:** `409` `{ "error": "Clinic already exists" }`

---

## 8. Catalog doctors — `/api/doctors`

All routes require Cookie JWT. Unique constraint: `phone`.

```ts
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}
```

### `GET /api/doctors`

```ts
interface ListDoctorsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** paginated list of `{ id, name, specialty, phone, createdAt }`

---

### `POST /api/doctors`

```ts
interface CreateDoctorRequest {
  name: string;      // 1–255
  specialty: string; // 1–255
  phone: string;     // 1–50
}
```

**Example request**

```json
{
  "name": "Dr. Sarah Chen",
  "specialty": "Cardiology",
  "phone": "+1-555-0200"
}
```

**Response `201`:** `{ "data": { /* Doctor */ } }`  
**Errors:** `409` `{ "error": "Doctor already exists" }`

---

## 9. Catalog medications — `/api/medications`

All routes require Cookie JWT. Unique: `name` + `strength`.

```ts
interface Medication {
  id: string;
  name: string;
  strength: string | null;
  category: string | null;
  createdAt: string;
  updatedAt?: string;
}
```

### `GET /api/medications/search-online`

External OpenFDA name search. Returns **raw array**.

```ts
interface SearchMedicationsOnlineQuery {
  search: string; // required, 1–255
}
```

**Response `200`**

```json
["Aspirin", "Aspirin 81 MG", "Aspirin Delayed Release"]
```

**Errors:** `502` `{ "error": "Failed to search medications" }`

---

### `GET /api/medications/category-online`

```ts
interface LookupMedicationCategoryOnlineQuery {
  name: string; // required, 1–255
}
```

**Response `200`** (raw JSON value, not wrapped)

```json
"analgesic"
```

or `null` if unknown.

**Errors:** `502` `{ "error": "Failed to lookup medication category" }`

---

### `GET /api/medications`

```ts
interface ListMedicationsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** paginated `{ id, name, strength, category, createdAt }[]`

---

### `GET /api/medications/:id`

```ts
interface MedicationIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* Medication */ } }`  
**Errors:** `404` `{ "error": "Medication not found" }`

---

### `POST /api/medications`

```ts
interface CreateMedicationRequest {
  name: string;      // 1–255
  strength?: string; // max 100
  category?: string; // max 100
}
```

**Example request**

```json
{
  "name": "Metformin",
  "strength": "500mg",
  "category": "antidiabetic"
}
```

**Response `201`:** `{ "data": { /* Medication */ } }`  
**Errors:** `409` `{ "error": "Medication already exists" }`

---

## 10. Catalog symptoms — `/api/catalog`

All routes require Cookie JWT. Symptom catalog lives under `/api/catalog/symptoms`.

```ts
interface SymptomCatalog {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  updatedAt?: string;
}
```

### `GET /api/catalog/symptoms/search-online`

BioPortal / SNOMED. Returns **raw array**. Extra `rateLimiter`. If `BIOPORTAL_API_KEY` is missing, returns `[]`.

```ts
interface SearchSymptomsOnlineQuery {
  search: string; // required, 1–255
}
```

**Response `200`**

```json
["Headache", "Migraine", "Tension-type headache"]
```

**Errors:** `502` `{ "error": "Failed to search symptoms" }`

---

### `GET /api/catalog/symptoms`

```ts
interface ListSymptomsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** paginated `{ id, name, category, createdAt }[]`

---

### `POST /api/catalog/symptoms`

```ts
interface CreateSymptomRequest {
  name: string;      // 1–255 (trimmed)
  category?: string; // max 100
}
```

**Example request**

```json
{
  "name": "Fatigue",
  "category": "general"
}
```

**Response `201`:** `{ "data": { /* SymptomCatalog */ } }`  
**Errors:** `409` `{ "error": "Symptom already exists" }`

---

## 11. Catalog conditions — `/api/conditions`

All routes require Cookie JWT.

```ts
interface ConditionCatalog {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}
```

### `GET /api/conditions`

```ts
interface ListConditionsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** paginated `{ id, name, createdAt }[]`

---

### `GET /api/conditions/search-online`

NLM Clinical Tables. Returns **raw array**. Extra `rateLimiter`.

```ts
interface SearchConditionsOnlineQuery {
  search: string; // required, 1–255
}
```

**Response `200`**

```json
["Type 2 diabetes mellitus", "Diabetes mellitus"]
```

**Errors:** `502` `{ "error": "External conditions API unavailable" }`

---

### `GET /api/conditions/:id`

```ts
interface ConditionIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* ConditionCatalog */ } }`  
**Errors:** `404` `{ "error": "Condition not found" }`

---

### `POST /api/conditions`

```ts
interface CreateConditionRequest {
  name: string; // 1–255 (case-insensitive uniqueness)
}
```

**Example request**

```json
{
  "name": "Hypertension"
}
```

**Response `201`:** `{ "data": { /* ConditionCatalog */ } }`  
**Errors:** `409` `{ "error": "Condition already exists" }`

---

## 12. Profile doctors — `/api/profile/doctors`

All profile routes require Cookie JWT (applied at `/api/profile`).

```ts
interface UserDoctor {
  id: string;
  userId: string;
  doctorId: string;
  userClinicId: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
  };
  userClinic?: {
    id: string;
    clinicId: string;
    notes: string | null;
  } | null;
}
```

### `GET /api/profile/doctors`

```ts
interface ListUserDoctorsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string; // searches doctor name, specialty, phone
}
```

**Response `200`:** `PaginatedResponse<UserDoctor>`

---

### `POST /api/profile/doctors`

```ts
interface CreateUserDoctorRequest {
  doctorId: string;              // uuid
  userClinicId?: string | null;  // uuid of owned UserClinic
  notes?: string | null;         // max 5000
}
```

**Example request**

```json
{
  "doctorId": "22222222-2222-2222-2222-222222222222",
  "userClinicId": "33333333-3333-3333-3333-333333333333",
  "notes": "Primary cardiologist"
}
```

**Response `201`:** `{ "data": { /* UserDoctor */ } }`  
**Errors:** `404` Doctor / User clinic not found · `409` `"Doctor already linked to profile"`

---

### `GET /api/profile/doctors/:id`

```ts
interface UserDoctorIdParams {
  id: string; // uuid — user-doctor link id
}
```

**Response `200`:** `{ "data": { /* UserDoctor */ } }`  
**Errors:** `404` `{ "error": "User doctor not found" }`

---

### `PATCH /api/profile/doctors/:id`

```ts
interface UpdateUserDoctorRequest {
  userClinicId?: string | null;
  notes?: string | null;
  // at least one field required
}
```

**Response `200`:** `{ "data": { /* UserDoctor */ } }`

---

### `DELETE /api/profile/doctors/:id`

Soft-delete.

**Response `200`**

```json
{
  "data": {
    "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "active": false
  }
}
```

---

## 13. Profile conditions — `/api/profile/conditions`

```ts
interface UserCondition {
  id: string;
  userId: string;
  conditionId: string;
  description: string | null;
  diagnosedDate: string | null; // YYYY-MM-DD
  status: ConditionStatus;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  condition: {
    id: string;
    name: string;
  };
}
```

### `GET /api/profile/conditions`

```ts
interface ListUserConditionsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string; // condition name
}
```

**Response `200`:** `PaginatedResponse<UserCondition>`

---

### `POST /api/profile/conditions`

```ts
interface CreateUserConditionRequest {
  conditionId: string;                 // uuid
  description?: string | null;         // max 5000
  diagnosedDate?: string | null;       // YYYY-MM-DD, not future
  status?: ConditionStatus;            // DB default "active"
  notes?: string | null;               // max 5000
}
```

**Example request**

```json
{
  "conditionId": "44444444-4444-4444-4444-444444444444",
  "description": "Diagnosed during annual checkup",
  "diagnosedDate": "2024-03-15",
  "status": "active",
  "notes": "Managed with lifestyle changes"
}
```

**Response `201`:** `{ "data": { /* UserCondition */ } }`  
**Errors:** `404` `"Condition not found"` · `409` `"Condition already linked to profile"`

---

### `GET /api/profile/conditions/symptoms`

Lists all condition–symptom links for the current user (across conditions).

```ts
interface ListConditionSymptomsQuery {
  currentPage?: number;
  pageSize?: number;
}
```

**Response `200`:** paginated `ConditionSymptom` rows with nested `userCondition` + `userSymptom.catalog`

```ts
interface ConditionSymptom {
  id: string;
  userConditionId: string;
  userSymptomId: string;
  createdAt: string;
  updatedAt: string;
  userCondition: {
    id: string;
    userId: string;
    conditionId: string;
    status: ConditionStatus;
    active: boolean;
    condition: { id: string; name: string };
  };
  userSymptom: {
    id: string;
    userId: string;
    catalogId: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    catalog: { id: string; name: string; category: string | null };
  };
}
```

---

### `GET /api/profile/conditions/:id/symptoms`

Same pagination query; scoped to one user-condition.

---

### `POST /api/profile/conditions/:id/symptoms`

```ts
interface LinkConditionSymptomRequest {
  userSymptomId: string; // uuid
}

interface LinkConditionSymptomParams {
  id: string; // user-condition uuid
}
```

**Example request**

```json
{
  "userSymptomId": "55555555-5555-5555-5555-555555555555"
}
```

**Response `201`:** `{ "data": { /* ConditionSymptom + includes */ } }`  
**Errors:** `409` `"Symptom already linked to condition"`

---

### `DELETE /api/profile/conditions/:id/symptoms/:userSymptomId`

Hard-delete link.

```ts
interface UnlinkConditionSymptomParams {
  id: string;            // user-condition uuid
  userSymptomId: string; // uuid
}
```

**Response `200`**

```json
{
  "data": {
    "message": "Unlinked"
  }
}
```

**Errors:** `404` `"Condition symptom link not found"`

---

### `GET /api/profile/conditions/:id`

**Response `200`:** `{ "data": { /* UserCondition */ } }`

---

### `PATCH /api/profile/conditions/:id`

```ts
interface UpdateUserConditionRequest {
  description?: string | null;
  diagnosedDate?: string | null; // YYYY-MM-DD, not future
  status?: ConditionStatus;
  notes?: string | null;
  // at least one field required
}
```

**Response `200`:** `{ "data": { /* UserCondition */ } }`

---

### `DELETE /api/profile/conditions/:id`

Soft-delete → `{ "data": { "id": "...", "active": false } }`

---

## 14. Profile medications — `/api/profile/medications`

```ts
interface UserMedication {
  id: string;
  userId: string;
  medicationId: string;
  dosage: number | null;
  dosageMeasurement: DosageMeasurement | null;
  frequency: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  medication: {
    id: string;
    name: string;
    strength: string | null;
    category: string | null;
  };
}
```

### `GET /api/profile/medications`

```ts
interface ListUserMedicationsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** `PaginatedResponse<UserMedication>`

---

### `POST /api/profile/medications`

```ts
interface CreateUserMedicationRequest {
  medicationId: string; // uuid
  dosage?: number | null; // > 0 if set
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null; // max 100
  notes?: string | null;     // max 5000
  // dosage + dosageMeasurement must both be set, both null, or both omitted
}
```

**Example request**

```json
{
  "medicationId": "66666666-6666-6666-6666-666666666666",
  "dosage": 500,
  "dosageMeasurement": "mg",
  "frequency": "twice daily",
  "notes": "Take with food"
}
```

**Response `201`:** `{ "data": { /* UserMedication */ } }`  
**Errors:** `404` medication not found · `409` `"Medication already linked to profile"` · `422` dosage pairing

---

### `GET /api/profile/medications/:id`

```ts
interface UserMedicationIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* UserMedication */ } }`

---

### `PATCH /api/profile/medications/:id`

```ts
interface UpdateUserMedicationRequest {
  dosage?: number | null;
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null;
  notes?: string | null;
  // at least one field required
  // same dosage pairing rule as create
}
```

**Response `200`:** `{ "data": { /* UserMedication */ } }`

---

### `DELETE /api/profile/medications/:id`

Soft-delete → `{ "data": { "id": "...", "active": false } }`

---

## 15. Profile symptoms — `/api/profile/symptoms`

No PATCH route.

```ts
interface UserSymptom {
  id: string;
  userId: string;
  catalogId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  catalog: {
    id: string;
    name: string;
    category: string | null;
  };
}
```

### `GET /api/profile/symptoms`

```ts
interface ListUserSymptomsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** `PaginatedResponse<UserSymptom>`

---

### `POST /api/profile/symptoms`

```ts
interface CreateUserSymptomRequest {
  catalogId: string; // uuid of SymptomCatalog
}
```

**Example request**

```json
{
  "catalogId": "77777777-7777-7777-7777-777777777777"
}
```

**Response `201`:** `{ "data": { /* UserSymptom */ } }`  
**Errors:** `404` `"Symptom catalog entry not found"` · `409` `"Symptom already linked to profile"`

---

### `GET /api/profile/symptoms/:id`

```ts
interface UserSymptomIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* UserSymptom */ } }`

---

### `DELETE /api/profile/symptoms/:id`

Soft-delete → `{ "data": { "id": "...", "active": false } }`

---

## 16. Profile clinics — `/api/profile/clinics`

```ts
interface UserClinic {
  id: string;
  userId: string;
  clinicId: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  clinic: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}
```

### `GET /api/profile/clinics`

```ts
interface ListUserClinicsQuery {
  currentPage?: number;
  pageSize?: number;
  search?: string;
}
```

**Response `200`:** `PaginatedResponse<UserClinic>`

---

### `POST /api/profile/clinics`

```ts
interface CreateUserClinicRequest {
  clinicId: string;        // uuid
  notes?: string | null;   // max 5000
}
```

**Example request**

```json
{
  "clinicId": "88888888-8888-8888-8888-888888888888",
  "notes": "Preferred location for labs"
}
```

**Response `201`:** `{ "data": { /* UserClinic */ } }`  
**Errors:** `404` clinic not found · `409` already linked

---

### `GET /api/profile/clinics/:id`

```ts
interface UserClinicIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* UserClinic */ } }`

---

### `PATCH /api/profile/clinics/:id`

```ts
interface UpdateUserClinicRequest {
  notes: string | null; // required (must be present; may be null)
}
```

**Example request**

```json
{
  "notes": "Updated notes"
}
```

**Response `200`:** `{ "data": { /* UserClinic */ } }`

---

### `DELETE /api/profile/clinics/:id`

Soft-delete → `{ "data": { "id": "...", "active": false } }`

---

## 17. Daily entries — `/api/profile/daily-entries`

One entry per user per calendar day. Nested child arrays on create/update; on **PATCH**, providing a child array **replaces** that relation (destroy + re-insert).

### Entity graph

```ts
interface DailyEntry {
  id: string;
  userId: string;
  entryDate: string; // YYYY-MM-DD
  moodRating: number | null; // 1–5
  sleepHours: number | null; // 0–24
  journalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  symptoms: EntrySymptom[];
  conditions: EntryCondition[];
  medications: EntryMedication[];
  doctorVisits: EntryDoctorVisit[];
}

interface EntrySymptom {
  id: string;
  entryId: string;
  userSymptomId: string;
  severity: number | null; // 1–10
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userSymptom: {
    id: string;
    catalogId: string;
    active: boolean;
    catalog: { id: string; name: string; category: string | null };
  };
}

interface EntryCondition {
  id: string;
  entryId: string;
  userConditionId: string;
  status: ConditionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userCondition: {
    id: string;
    conditionId: string;
    status: ConditionStatus;
    active: boolean;
    condition: { id: string; name: string };
  };
}

interface EntryMedication {
  id: string;
  entryId: string;
  userMedicationId: string;
  quantity: number; // ≥1, default 1
  unit: string;
  taken: boolean; // default false
  takenAt: string | null; // ISO datetime with offset
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userMedication: {
    id: string;
    medicationId: string;
    dosage: number | null;
    dosageMeasurement: DosageMeasurement | null;
    active: boolean;
    medication: { id: string; name: string; strength: string | null };
  };
}

interface EntryDoctorVisit {
  id: string;
  entryId: string;
  userDoctorId: string;
  userClinicId: string | null;
  summary: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userDoctor: {
    id: string;
    doctorId: string;
    active: boolean;
    doctor: { id: string; name: string; specialty: string };
  };
  userClinic?: {
    id: string;
    clinicId: string;
    active: boolean;
    clinic: { id: string; name: string; address: string };
  } | null;
}
```

### Nested request item types

```ts
interface EntrySymptomItem {
  userSymptomId: string;
  severity?: number | null; // int 1–10
  notes?: string | null;    // max 5000
}

interface EntryConditionItem {
  userConditionId: string;
  status?: ConditionStatus;
  notes?: string | null;
}

interface EntryMedicationItem {
  userMedicationId: string;
  quantity?: number; // int ≥1
  unit: string;      // required, 1–50
  taken?: boolean;
  takenAt?: string | null; // ISO datetime with offset, e.g. "2026-07-23T08:30:00.000Z"
  notes?: string | null;
}

interface EntryDoctorVisitItem {
  userDoctorId: string;
  userClinicId?: string | null;
  summary?: string | null; // max 5000
  notes?: string | null;
}
```

---

### `GET /api/profile/daily-entries`

```ts
interface ListDailyEntriesQuery {
  currentPage?: number;
  pageSize?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD; fromDate ≤ toDate when both set
}
```

**Response `200`:** `PaginatedResponse<DailyEntry>` (full includes)

---

### `POST /api/profile/daily-entries`

```ts
interface CreateDailyEntryRequest {
  entryDate: string; // YYYY-MM-DD, not future (server-local calendar)
  moodRating?: number | null;   // int 1–5
  sleepHours?: number | null;   // 0–24
  journalNotes?: string | null; // max 10000
  symptoms?: EntrySymptomItem[];
  conditions?: EntryConditionItem[];
  medications?: EntryMedicationItem[];
  doctorVisits?: EntryDoctorVisitItem[];
}
```

**Example request**

```json
{
  "entryDate": "2026-07-23",
  "moodRating": 4,
  "sleepHours": 7.5,
  "journalNotes": "Felt better after morning walk.",
  "symptoms": [
    {
      "userSymptomId": "55555555-5555-5555-5555-555555555555",
      "severity": 3,
      "notes": "Mild"
    }
  ],
  "conditions": [
    {
      "userConditionId": "99999999-9999-9999-9999-999999999999",
      "status": "active"
    }
  ],
  "medications": [
    {
      "userMedicationId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "quantity": 1,
      "unit": "tablet",
      "taken": true,
      "takenAt": "2026-07-23T08:30:00.000Z"
    }
  ],
  "doctorVisits": [
    {
      "userDoctorId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "userClinicId": "33333333-3333-3333-3333-333333333333",
      "summary": "Follow-up visit",
      "notes": "Blood pressure stable"
    }
  ]
}
```

**Response `201`:** `{ "data": { /* DailyEntry with children */ } }`

**Example response (abbreviated)**

```json
{
  "data": {
    "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "entryDate": "2026-07-23",
    "moodRating": 4,
    "sleepHours": 7.5,
    "journalNotes": "Felt better after morning walk.",
    "createdAt": "2026-07-23T16:00:00.000Z",
    "updatedAt": "2026-07-23T16:00:00.000Z",
    "symptoms": [
      {
        "id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
        "entryId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
        "userSymptomId": "55555555-5555-5555-5555-555555555555",
        "severity": 3,
        "notes": "Mild",
        "userSymptom": {
          "id": "55555555-5555-5555-5555-555555555555",
          "catalogId": "77777777-7777-7777-7777-777777777777",
          "active": true,
          "catalog": {
            "id": "77777777-7777-7777-7777-777777777777",
            "name": "Fatigue",
            "category": "general"
          }
        }
      }
    ],
    "conditions": [],
    "medications": [],
    "doctorVisits": []
  }
}
```

**Errors:**  
`404` User symptom/condition/medication/doctor/clinic not found  
`409` `"Daily entry already exists for this date"` or duplicate child for this entry

---

### `GET /api/profile/daily-entries/:id`

```ts
interface DailyEntryIdParams {
  id: string; // uuid
}
```

**Response `200`:** `{ "data": { /* DailyEntry */ } }`  
**Errors:** `404` not found / not owned

---

### `PATCH /api/profile/daily-entries/:id`

```ts
interface UpdateDailyEntryRequest {
  entryDate?: string; // YYYY-MM-DD, not future
  moodRating?: number | null;
  sleepHours?: number | null;
  journalNotes?: string | null;
  symptoms?: EntrySymptomItem[];       // replaces all if provided
  conditions?: EntryConditionItem[];   // replaces all if provided
  medications?: EntryMedicationItem[]; // replaces all if provided
  doctorVisits?: EntryDoctorVisitItem[]; // replaces all if provided
  // at least one top-level field required
}
```

**Example request**

```json
{
  "moodRating": 5,
  "symptoms": [
    {
      "userSymptomId": "55555555-5555-5555-5555-555555555555",
      "severity": 1
    }
  ]
}
```

**Response `200`:** `{ "data": { /* DailyEntry */ } }`

---

### `DELETE /api/profile/daily-entries/:id`

Hard delete.

**Response `200`**

```json
{
  "data": {
    "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
    "message": "Deleted"
  }
}
```

---

## 18. Environment & scripts

Env is loaded from the monorepo root `.env` (relative to `packages/api`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | Postgres connection |
| `PORT` | No (default `3000`) | Listen port |
| `NODE_ENV` | No | logging, cookie `secure`, error stack |
| `CORS_ORIGIN` | No (default `http://localhost:5173`) | CORS origin |
| `JWT_SECRET` | Prod yes | Access tokens |
| `JWT_REFRESH_SECRET` | Prod yes | Refresh tokens |
| `JWT_EXPIRES_IN` | No (`15m`) | Access TTL |
| `JWT_REFRESH_EXPIRES_IN` | No (`7d`) | Refresh TTL |
| `BIOPORTAL_API_KEY` | For symptom online search | Missing → empty `[]` |
| `REDIS_URL` | Optional | Queue (not HTTP) |
| `OPENAI_API_KEY` | Optional | AI client (not HTTP) |
| `S3_*` / `AWS_*` | Optional | Storage (not HTTP) |

**Scripts** (`packages/api/package.json`)

```bash
npm run dev          # tsx watch server.ts
npm run build        # tsc
npm run start        # node dist/server.js
npm test             # jest
npm run db:migrate   # sequelize-cli migrate
npm run db:seed      # sequelize-cli seed
```

---

## 19. Endpoint index

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Public |
| GET | `/api/openapi.yaml` | Public |
| GET | `/api/docs` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Refresh cookie |
| POST | `/api/auth/logout` | JWT |
| GET | `/api/auth/me` | JWT |
| GET | `/api/clinics` | JWT |
| POST | `/api/clinics` | JWT |
| GET | `/api/doctors` | JWT |
| POST | `/api/doctors` | JWT |
| GET | `/api/medications/search-online` | JWT |
| GET | `/api/medications/category-online` | JWT |
| GET | `/api/medications` | JWT |
| GET | `/api/medications/:id` | JWT |
| POST | `/api/medications` | JWT |
| GET | `/api/catalog/symptoms/search-online` | JWT |
| GET | `/api/catalog/symptoms` | JWT |
| POST | `/api/catalog/symptoms` | JWT |
| GET | `/api/conditions` | JWT |
| GET | `/api/conditions/search-online` | JWT |
| GET | `/api/conditions/:id` | JWT |
| POST | `/api/conditions` | JWT |
| GET | `/api/profile/doctors` | JWT |
| POST | `/api/profile/doctors` | JWT |
| GET | `/api/profile/doctors/:id` | JWT |
| PATCH | `/api/profile/doctors/:id` | JWT |
| DELETE | `/api/profile/doctors/:id` | JWT |
| GET | `/api/profile/conditions` | JWT |
| POST | `/api/profile/conditions` | JWT |
| GET | `/api/profile/conditions/symptoms` | JWT |
| GET | `/api/profile/conditions/:id/symptoms` | JWT |
| POST | `/api/profile/conditions/:id/symptoms` | JWT |
| DELETE | `/api/profile/conditions/:id/symptoms/:userSymptomId` | JWT |
| GET | `/api/profile/conditions/:id` | JWT |
| PATCH | `/api/profile/conditions/:id` | JWT |
| DELETE | `/api/profile/conditions/:id` | JWT |
| GET | `/api/profile/medications` | JWT |
| POST | `/api/profile/medications` | JWT |
| GET | `/api/profile/medications/:id` | JWT |
| PATCH | `/api/profile/medications/:id` | JWT |
| DELETE | `/api/profile/medications/:id` | JWT |
| GET | `/api/profile/symptoms` | JWT |
| POST | `/api/profile/symptoms` | JWT |
| GET | `/api/profile/symptoms/:id` | JWT |
| DELETE | `/api/profile/symptoms/:id` | JWT |
| GET | `/api/profile/clinics` | JWT |
| POST | `/api/profile/clinics` | JWT |
| GET | `/api/profile/clinics/:id` | JWT |
| PATCH | `/api/profile/clinics/:id` | JWT |
| DELETE | `/api/profile/clinics/:id` | JWT |
| GET | `/api/profile/daily-entries` | JWT |
| POST | `/api/profile/daily-entries` | JWT |
| GET | `/api/profile/daily-entries/:id` | JWT |
| PATCH | `/api/profile/daily-entries/:id` | JWT |
| DELETE | `/api/profile/daily-entries/:id` | JWT |

**Total:** 57 endpoints (including health / docs / openapi).

---

## Notes for consumers

1. Prefer this file over `openapi.yaml` until OpenAPI is regenerated from live routes.
2. Always send cookies (`credentials: "include"`); never expect tokens in JSON.
3. Online-search endpoints return raw JSON arrays/values, not `{ data }`.
4. Profile deletes are soft; daily entries and condition–symptom links are hard.
5. Role-based admin routes are not implemented in Express despite older OpenAPI stubs.
6. Typical client flow: register → login → create catalog items (or reuse) → link to profile → create daily entries.
