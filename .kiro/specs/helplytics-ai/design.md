# Design Document: Helplytics AI

## Overview

Helplytics AI is a community support platform built on the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS. It connects people who need help (Seekers) with those who can provide it (Helpers), enhanced by a client-side AI Engine for categorization, tag suggestions, urgency detection, and community insights.

The platform supports three user roles — Seeker, Helper, and Both — and features a Trust Score system, leaderboard with badges, in-app notifications, and an AI Center. All AI features run entirely client-side using keyword matching against predefined taxonomies; no external AI API is required.

### Key Design Principles

- **Client-side AI**: All AI features (categorization, tag suggestions, urgency detection, summaries, insights) run in the browser using keyword matching — zero latency, zero API cost.
- **JWT Auth with localStorage**: Stateless authentication; token and user ID stored in localStorage.
- **Seed-first development**: A comprehensive seed script enables full feature demonstration without manual data entry.
- **Design system consistency**: Every page shares the dark charcoal/green header banner, soft gradient background, white card sections, and teal (#0d9488) accent.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  React Pages │  │  AI Engine   │  │  Auth Context │  │
│  │  (12 pages)  │  │  (client-side│  │  (JWT/local   │  │
│  │              │  │   keyword)   │  │   Storage)    │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │ REST API calls (Axios)                         │
└─────────┼───────────────────────────────────────────────┘
          │ HTTP/JSON
┌─────────▼───────────────────────────────────────────────┐
│                  Node.js / Express API                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Auth Routes │  │ Request/Msg  │  │  User/Notif   │  │
│  │  (JWT issue) │  │  Routes      │  │  Routes       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         └─────────────────┼──────────────────┘           │
│                    Mongoose ODM                          │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      MongoDB                             │
│   Users │ Requests │ Messages │ Notifications            │
└─────────────────────────────────────────────────────────┘
```

### Project Folder Structure

```
helplytics-ai/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Shared/reusable components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── PageWrapper.jsx  # gradient bg + card layout
│   │   │   │   └── HeaderBanner.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── TrustScoreBar.jsx
│   │   │   │   ├── RequestCard.jsx
│   │   │   │   ├── SkillChip.jsx
│   │   │   │   └── UrgencyBadge.jsx
│   │   │   └── auth/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── CreateRequest.jsx
│   │   │   ├── RequestDetail.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── AICenter.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT + localStorage state
│   │   ├── engine/
│   │   │   └── aiEngine.js          # Client-side AI module
│   │   ├── hooks/
│   │   │   ├── useDebounce.js
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + all API calls
│   │   ├── utils/
│   │   │   └── trustScore.js        # Trust score helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                          # Express backend
    ├── models/
    │   ├── User.js
    │   ├── Request.js
    │   ├── Message.js
    │   └── Notification.js
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   ├── requests.js
    │   ├── messages.js
    │   └── notifications.js
    ├── middleware/
    │   └── auth.js                  # JWT verification middleware
    ├── seed/
    │   └── seed.js                  # Idempotent seed script
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── server.js
    └── package.json
```

---

## Components and Interfaces

### React Component Architecture

#### Layout Components

**`Navbar.jsx`**
- Renders the dark charcoal/green header banner with brand name
- Shows authenticated nav links: Dashboard, Explore, Create Request, AI Center, Leaderboard, Messages, Notifications, Profile
- Highlights active link via `useLocation()`
- Shows unread notification count badge on Notifications link
- Props: none (reads from AuthContext)

**`PageWrapper.jsx`**
- Wraps every page with the soft gradient background (`bg-gradient-to-br from-stone-50 to-teal-50`)
- Provides consistent padding and max-width container
- Props: `{ children }`

**`ProtectedRoute.jsx`**
- Reads auth state from AuthContext
- Redirects unauthenticated users to `/auth`
- Props: `{ children }`

#### UI Components

**`RequestCard.jsx`**
- Displays title, category, urgency badge, skill tags, location, time since creation
- Props: `{ request, onClick }`

**`UrgencyBadge.jsx`**
- Color-coded pill: High (red), Medium (amber), Low (green)
- Props: `{ level: 'High' | 'Medium' | 'Low' }`

**`TrustScoreBar.jsx`**
- Numeric value + teal progress bar scaled to 100
- Props: `{ score: number }`

**`SkillChip.jsx`**
- Dismissible or static chip for skills/tags
- Props: `{ label, onDismiss? }`

**`Badge.jsx`**
- Visual achievement badge with icon and label
- Props: `{ type: 'first-helper' | 'rising-star' | 'community-champion' | 'legend' }`

#### Page Components

**`Landing.jsx`** — Hero, platform overview, CTA, community stats (from seed data via API)

**`Auth.jsx`** — Tab-switched Login/Signup forms; role selection on signup; JWT stored to localStorage on success

**`Onboarding.jsx`** — Display name, skills (chip input), interests, location; AI Engine suggests additional skills/interests as selectable chips

**`Dashboard.jsx`** — Stats cards (requests created, helped, trust score); recent 5 requests; AI insight messages; quick action buttons

**`Explore.jsx`** — Filterable request list (category, urgency, skills, location); paginated 20/page; RequestCard grid

**`CreateRequest.jsx`** — Title, description, tags, category, urgency inputs; AI Engine debounced suggestions on description change; rewrite suggestion button

**`RequestDetail.jsx`** — Full request view; AI summary card; helper list; "I Can Help" / "Mark as Solved" actions

**`Messages.jsx`** — Thread list (left panel) + message history (right panel); send message form

**`Leaderboard.jsx`** — Top 20 helpers ranked by trust score; badges; highlight current user

**`AICenter.jsx`** — Four sections: Trend Pulse, Urgency Watch, Mentor Pool, Request Recommendations

**`Notifications.jsx`** — Chronological notification feed; mark-all-read on visit; click-through navigation

**`Profile.jsx`** — User info display + edit form; contribution history; trust score bar; badges

### REST API Interface

All authenticated routes require `Authorization: Bearer <token>` header.

#### Auth Routes (`/api/auth`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Create account, return JWT | No |
| POST | `/api/auth/login` | Validate credentials, return JWT | No |

#### User Routes (`/api/users`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/users/me` | Get current user profile | Yes |
| PUT | `/api/users/me` | Update profile (name, skills, interests, location) | Yes |
| GET | `/api/users/leaderboard` | Top 20 helpers by trust score | Yes |
| GET | `/api/users/stats` | Community stats (total users, resolved, active helpers) | No |

#### Request Routes (`/api/requests`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/requests` | List requests (supports query filters: category, urgency, skills, location, page) | Yes |
| POST | `/api/requests` | Create new request | Yes |
| GET | `/api/requests/:id` | Get single request detail | Yes |
| PUT | `/api/requests/:id/help` | Express interest ("I Can Help") | Yes |
| PUT | `/api/requests/:id/solve` | Mark request as solved (owner only) | Yes |
| GET | `/api/requests/recent` | 5 most recent requests for dashboard | Yes |

#### Message Routes (`/api/messages`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/messages/threads` | List all threads for current user | Yes |
| GET | `/api/messages/:requestId` | Get message history for a request thread | Yes |
| POST | `/api/messages/:requestId` | Send a message in a thread | Yes |

#### Notification Routes (`/api/notifications`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/notifications` | Get all notifications for current user | Yes |
| PUT | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| GET | `/api/notifications/unread-count` | Get unread count for navbar badge | Yes |

---

## Data Models

### User Schema

```javascript
// server/models/User.js
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },          // bcrypt hashed
  role: {
    type: String,
    enum: ['seeker', 'helper', 'both'],
    required: true
  },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  location: { type: String, trim: true, default: '' },
  trustScore: { type: Number, default: 0, min: 0 },
  badges: [{
    type: String,
    enum: ['first-helper', 'rising-star', 'community-champion', 'legend']
  }],
  solvedCount: { type: Number, default: 0 },           // requests helped & solved
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

### Request Schema

```javascript
// server/models/Request.js
const RequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  urgency: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'solved'],
    default: 'open'
  },
  location: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  solvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

### Message Schema

```javascript
// server/models/Message.js
const MessageSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for efficient thread retrieval
MessageSchema.index({ request: 1, createdAt: 1 });
```

### Notification Schema

```javascript
// server/models/Notification.js
const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['match', 'status', 'request', 'reputation'],
    required: true
  },
  message: { type: String, required: true },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast unread count queries
NotificationSchema.index({ recipient: 1, read: 1 });
```

---

## AI Engine Design

The AI Engine (`client/src/engine/aiEngine.js`) is a pure client-side module with no external API dependencies. All logic uses keyword matching against predefined taxonomies.

### Taxonomy

```javascript
// Predefined category taxonomy
const CATEGORIES = [
  'Technology', 'Health & Wellness', 'Education', 'Finance',
  'Legal', 'Career', 'Mental Health', 'Home & DIY',
  'Creative Arts', 'Community', 'Relationships', 'Other'
];

// Category → keyword mapping
const CATEGORY_KEYWORDS = {
  'Technology': ['code', 'bug', 'software', 'app', 'website', 'api', 'database', 'server', 'react', 'javascript', 'python', 'css', 'html', 'git', 'deploy'],
  'Health & Wellness': ['health', 'doctor', 'pain', 'symptom', 'diet', 'exercise', 'fitness', 'medical', 'hospital', 'nutrition'],
  'Education': ['study', 'learn', 'course', 'exam', 'school', 'university', 'tutor', 'homework', 'assignment', 'degree'],
  'Finance': ['money', 'budget', 'invest', 'loan', 'tax', 'salary', 'debt', 'savings', 'bank', 'financial'],
  'Legal': ['law', 'legal', 'contract', 'rights', 'court', 'lawyer', 'dispute', 'regulation', 'compliance'],
  'Career': ['job', 'resume', 'interview', 'career', 'work', 'hire', 'promotion', 'linkedin', 'portfolio'],
  'Mental Health': ['anxiety', 'stress', 'depression', 'therapy', 'mental', 'burnout', 'overwhelmed', 'counseling'],
  'Home & DIY': ['repair', 'plumbing', 'electrical', 'furniture', 'renovation', 'garden', 'cleaning', 'home'],
  'Creative Arts': ['design', 'art', 'music', 'writing', 'photography', 'video', 'creative', 'illustration'],
  'Community': ['volunteer', 'event', 'neighborhood', 'local', 'community', 'charity', 'nonprofit'],
  'Relationships': ['relationship', 'family', 'friend', 'communication', 'conflict', 'dating', 'marriage'],
};

// Urgency keyword mapping
const URGENCY_KEYWORDS = {
  High: ['urgent', 'asap', 'emergency', 'critical', 'immediately', 'deadline', 'crisis', 'help now', 'right now'],
  Medium: ['soon', 'this week', 'need help', 'struggling', 'important', 'moderate'],
  Low: ['whenever', 'no rush', 'eventually', 'low priority', 'casual', 'curious']
};
```

### AI Engine Functions

```javascript
// Suggest category from description text
suggestCategory(text: string): string

// Suggest up to 5 tags from description text
suggestTags(text: string): string[]

// Detect urgency level from description text
detectUrgency(text: string): 'High' | 'Medium' | 'Low'

// Generate a 2-3 sentence summary of a request description
generateSummary(description: string): string

// Suggest additional skills/interests during onboarding
suggestSkills(existingSkills: string[]): string[]

// Generate 2 insight messages for the dashboard
generateInsights(userActivity: object, communityStats: object): string[]

// Generate a rewrite suggestion for a request description
rewriteDescription(description: string): string

// Compute trend pulse: top 5 categories/tags from requests array
computeTrendPulse(requests: Request[]): { categories: string[], tags: string[] }

// Filter high-urgency open requests for urgency watch
getUrgencyWatch(requests: Request[]): Request[]

// Match mentor pool: top 10 helpers whose skills overlap user interests
matchMentors(helpers: User[], userInterests: string[]): User[]

// Recommend requests matching user skills
recommendRequests(requests: Request[], userSkills: string[]): Request[]
```

### Debounce Strategy

The `CreateRequest.jsx` page uses a 500ms debounce on the description field via `useDebounce.js`. On each debounced change, three AI Engine calls fire in parallel: `suggestCategory`, `suggestTags`, and `detectUrgency`. Results are displayed as dismissible inline suggestion chips.

---

## Trust Score Calculation Logic

Trust Score is calculated server-side and persisted in MongoDB. The calculation is event-driven, not periodic.

### Scoring Events

| Event | Points | Who Receives |
|-------|--------|--------------|
| Request the user helped is marked Solved | +5 | Helper |
| Request the user created is marked Solved | +2 | Seeker/Owner |

### Badge Thresholds (based on `solvedCount` — requests helped and solved)

| Badge | Threshold |
|-------|-----------|
| First Helper | 1 solved request helped |
| Rising Star | 10 solved requests helped |
| Community Champion | 50 solved requests helped |
| Legend | 100 solved requests helped |

### Server-Side Logic (on `PUT /api/requests/:id/solve`)

```
1. Verify caller is request owner
2. Set request.status = 'solved', request.solvedAt = now
3. For each userId in request.helpers:
   a. user.trustScore += 5
   b. user.solvedCount += 1
   c. Recalculate badges based on new solvedCount
   d. Save user
   e. Create Notification(type='status', recipient=userId)
4. request.owner.trustScore += 2
5. Save owner
6. Create Notification(type='reputation', recipient=owner)
```

---

## Auth Flow

```
Signup:
  POST /api/auth/register → { token, user }
  → Store token + user._id in localStorage
  → Redirect to /onboarding

Login:
  POST /api/auth/login → { token, user }
  → Store token + user._id in localStorage
  → Redirect to /dashboard

Logout:
  → Clear localStorage
  → Redirect to /

Protected Routes:
  → ProtectedRoute reads AuthContext
  → AuthContext reads localStorage on mount
  → If no token → redirect to /auth
  → Axios interceptor attaches Bearer token to all requests

Token Expiry:
  → JWT signed with 7d expiry
  → On 401 response → clear localStorage → redirect to /auth
```

---

## Seed Data Strategy

The seed script (`server/seed/seed.js`) is idempotent — it checks for existing records by unique fields before inserting.

### Seed Contents

- **10 Users**: Mix of seeker, helper, and both roles; varied skills, interests, locations; pre-set trust scores and badges
- **30 Requests**: Spread across all 12 categories; mix of High/Medium/Low urgency; 10 marked as solved; varied creation dates spanning 30 days
- **Message threads**: At least 1 thread per solved request (3–5 messages each)
- **Notifications**: 2–3 notifications per user covering all 4 notification types

### Idempotency Strategy

```javascript
// Check by unique field before insert
const existing = await User.findOne({ email: seedUser.email });
if (!existing) await User.create(seedUser);
```

---

## Error Handling

### Client-Side

- **API errors**: Axios interceptor catches non-2xx responses; displays toast/inline error messages
- **401 Unauthorized**: Clears localStorage, redirects to `/auth`
- **Form validation**: React state-based inline validation before API call; no submission on empty required fields
- **AI Engine errors**: All AI Engine functions are wrapped in try/catch; fallback to empty suggestions on failure

### Server-Side

- **Validation**: Express route handlers validate required fields; return `400` with field-level error messages
- **Auth errors**: JWT middleware returns `401` on missing/invalid/expired token
- **Not found**: Return `404` with descriptive message
- **Ownership checks**: `403` when non-owner attempts owner-only actions (e.g., Mark as Solved)
- **Duplicate email**: Mongoose unique index violation caught and returned as `409`
- **Unhandled errors**: Global Express error handler returns `500` with generic message

---

## Testing Strategy

### Unit Tests

Focus on specific examples, edge cases, and error conditions:

- AI Engine functions: category suggestion, tag extraction, urgency detection, summary generation
- Trust Score calculation: correct point increments, badge threshold transitions
- Form validation: empty fields, whitespace-only inputs, duplicate email detection
- Auth utilities: JWT generation, token parsing, localStorage read/write

### Property-Based Tests

Universal properties verified across many generated inputs (see Correctness Properties section below).

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/TypeScript PBT library)

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: helplytics-ai, Property {N}: {property_text}`

### Integration Tests

- API endpoint smoke tests: auth register/login, request CRUD, message send
- MongoDB connection and seed script idempotency
- JWT middleware: valid token passes, invalid token returns 401


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Signup form rejects any missing required field

*For any* signup form submission missing one or more of the required fields (name, email, password, role), the system SHALL reject the submission and display an inline validation error for each missing field, leaving the user on the Auth Page.

**Validates: Requirements 2.2**

---

### Property 2: Invalid login credentials always produce an error message

*For any* email/password pair that does not match a registered user, the login attempt SHALL be rejected with an inline error message and no navigation shall occur.

**Validates: Requirements 2.4**

---

### Property 3: AI skill suggestions are always valid taxonomy entries

*For any* set of input skills provided during onboarding, all AI-suggested additional skills SHALL be drawn exclusively from the predefined skill taxonomy and SHALL NOT duplicate any skill already in the user's input set.

**Validates: Requirements 3.2**

---

### Property 4: Recent requests panel always shows the 5 most recent in descending order

*For any* collection of requests in the database, the Dashboard recent requests panel SHALL display exactly the 5 most recently created requests, ordered by creation date descending (newest first).

**Validates: Requirements 4.3**

---

### Property 5: Dashboard AI insights always returns at least 2 messages

*For any* user activity object and community stats object passed to the AI Engine's `generateInsights` function, the function SHALL return an array containing at least 2 non-empty insight strings.

**Validates: Requirements 4.4**

---

### Property 6: Explore filters show only matching requests, and clearing restores the full list

*For any* collection of requests and any combination of active filters (category, urgency, skills, location), all displayed requests SHALL satisfy every active filter criterion simultaneously. Furthermore, clearing all filters SHALL restore the complete unfiltered list of requests.

**Validates: Requirements 5.3, 5.4**

---

### Property 7: Request card always renders all required fields

*For any* request object, the rendered RequestCard component SHALL display the title, category, urgency badge, required skills tags, location, and time since creation.

**Validates: Requirements 5.5**

---

### Property 8: Pagination never exceeds 20 requests per page

*For any* collection of requests of any size, each page of the Explore feed SHALL contain at most 20 request cards.

**Validates: Requirements 5.7**

---

### Property 9: AI category suggestion always returns a valid taxonomy category

*For any* non-empty description string, the AI Engine's `suggestCategory` function SHALL return a string that is a member of the predefined CATEGORIES list.

**Validates: Requirements 6.2**

---

### Property 10: AI tag suggestions always returns 0–5 tags

*For any* description string, the AI Engine's `suggestTags` function SHALL return an array of length between 0 and 5 (inclusive).

**Validates: Requirements 6.3**

---

### Property 11: AI urgency detection always returns a valid urgency level

*For any* description string, the AI Engine's `detectUrgency` function SHALL return exactly one of the three valid values: 'High', 'Medium', or 'Low'.

**Validates: Requirements 6.4**

---

### Property 12: AI rewrite always returns a non-empty string

*For any* non-empty description string, the AI Engine's `rewriteDescription` function SHALL return a non-empty string.

**Validates: Requirements 6.6**

---

### Property 13: Create request form rejects any missing required field

*For any* create request form submission missing one or more required fields (title, description, category, urgency), the system SHALL display an inline validation error for each missing field without navigating away.

**Validates: Requirements 6.8**

---

### Property 14: AI summary never exceeds 3 sentences

*For any* request description string, the AI Engine's `generateSummary` function SHALL return a string containing at most 3 sentences.

**Validates: Requirements 7.2**

---

### Property 15: Marking a request solved increments each helper's Trust Score by exactly 5

*For any* open request with any number of listed helpers, when the request is marked as solved, each helper's Trust Score SHALL increase by exactly 5 points — no more, no less.

**Validates: Requirements 7.5, 14.2**

---

### Property 16: Marking a request solved increments the owner's Trust Score by exactly 2

*For any* open request, when the request is marked as solved, the request owner's Trust Score SHALL increase by exactly 2 points.

**Validates: Requirements 14.3**

---

### Property 17: Message thread is always displayed in chronological order

*For any* set of messages in a thread with any combination of timestamps, the displayed message history SHALL be ordered by creation timestamp ascending (oldest message first).

**Validates: Requirements 8.2**

---

### Property 18: Message rendering always includes sender name, content, and timestamp

*For any* message object, the rendered message component SHALL display the sender's name, the message content, and the message timestamp.

**Validates: Requirements 8.4**

---

### Property 19: Empty or whitespace-only messages are always rejected

*For any* string composed entirely of whitespace characters (including the empty string), attempting to send it as a message SHALL be rejected with an inline validation message and the message SHALL NOT be saved.

**Validates: Requirements 8.5**

---

### Property 20: Leaderboard always shows at most 20 helpers in descending Trust Score order

*For any* collection of helper users with any trust score values, the leaderboard SHALL display at most 20 entries, ordered by Trust Score descending (highest first).

**Validates: Requirements 9.1**

---

### Property 21: Leaderboard card always renders all required fields

*For any* helper user object, the rendered leaderboard card SHALL display the rank number, name, Trust Score, earned badges, and a trust score progress bar.

**Validates: Requirements 9.2**

---

### Property 22: Badge assignment always matches milestone thresholds

*For any* helper with a given `solvedCount`, the set of awarded badges SHALL be exactly the set of badges whose thresholds are less than or equal to `solvedCount` (First Helper ≥ 1, Rising Star ≥ 10, Community Champion ≥ 50, Legend ≥ 100).

**Validates: Requirements 9.3**

---

### Property 23: Trend Pulse returns at most 5 items sorted by frequency descending

*For any* collection of requests with any distribution of categories and tags, the AI Engine's `computeTrendPulse` function SHALL return at most 5 categories and at most 5 tags, each list sorted by frequency of occurrence descending.

**Validates: Requirements 10.2**

---

### Property 24: Urgency Watch returns only open High-urgency requests in ascending date order

*For any* collection of requests with any combination of status and urgency values, the AI Engine's `getUrgencyWatch` function SHALL return only requests where status is 'open' AND urgency is 'High', sorted by creation date ascending (oldest first).

**Validates: Requirements 10.3**

---

### Property 25: Mentor Pool returns at most 10 helpers with skill overlap, sorted by Trust Score

*For any* collection of helper users and any set of user interests, the AI Engine's `matchMentors` function SHALL return at most 10 helpers, all of whom have at least one skill overlapping with the user's interests, sorted by Trust Score descending.

**Validates: Requirements 10.4**

---

### Property 26: Request Recommendations returns at most 5 requests with skill overlap

*For any* collection of requests and any set of user skills, the AI Engine's `recommendRequests` function SHALL return at most 5 requests, all of which have at least one required skill overlapping with the user's skills.

**Validates: Requirements 10.5**

---

### Property 27: Notification feed is always displayed in chronological order

*For any* set of notifications with any combination of timestamps, the Notifications Page SHALL display them ordered by creation timestamp descending (newest first).

**Validates: Requirements 11.1**

---

### Property 28: Notification rendering always includes type icon, message, and relative timestamp

*For any* notification object of any type (match, status, request, reputation), the rendered notification component SHALL display a type-specific icon, a descriptive message string, and a relative timestamp.

**Validates: Requirements 11.3**

---

### Property 29: Unread notification badge count always equals the number of unread notifications

*For any* set of notifications with any combination of read/unread states, the unread count badge displayed on the navbar SHALL equal the exact count of notifications where `read` is false.

**Validates: Requirements 11.5**

---

### Property 30: Visiting the Notifications Page marks all notifications as read

*For any* set of notifications with any combination of read/unread states, after the user visits the Notifications Page, all notifications SHALL have `read` set to true and the unread count badge SHALL be removed.

**Validates: Requirements 11.6**

---

### Property 31: Edit profile form is always pre-populated with current profile values

*For any* user profile with any combination of name, skills, interests, and location values, opening the Edit Profile form SHALL pre-populate every field with the user's current stored values.

**Validates: Requirements 12.3**

---

### Property 32: Edit profile form rejects empty or whitespace-only name

*For any* string composed entirely of whitespace characters (including the empty string) submitted as the name field in the Edit Profile form, the system SHALL display an inline validation error and prevent submission.

**Validates: Requirements 12.5**

---

### Property 33: Trust Score progress bar percentage always equals the score value

*For any* Trust Score value in the range [0, 100], the TrustScoreBar component SHALL render a progress bar whose fill percentage equals the numeric score value.

**Validates: Requirements 12.6**

---

### Property 34: Exactly one navbar link is active for any given route

*For any* authenticated route path, the Navbar component SHALL apply the active highlight style to exactly one navigation link — the one corresponding to the current route — and no other links.

**Validates: Requirements 13.3**

---

### Property 35: Unauthenticated access to any protected route always redirects to /auth

*For any* protected route path (Dashboard, Explore, Create Request, AI Center, Leaderboard, Messages, Notifications, Profile), an unauthenticated access attempt SHALL redirect to the Auth Page (/auth) without rendering the protected page content.

**Validates: Requirements 13.4**

---

### Property 36: Every new user is initialized with Trust Score of 0

*For any* valid user registration payload (any name, email, password, role combination), the newly created user record SHALL have a `trustScore` of exactly 0.

**Validates: Requirements 14.1**

---

### Property 37: Trust Score is consistent across Dashboard, Profile, and Leaderboard

*For any* user with any Trust Score value, the same numeric Trust Score value SHALL be displayed on the Dashboard stats card, the Profile Page, and the Leaderboard entry for that user.

**Validates: Requirements 14.5**

---

### Property 38: Seed script is idempotent — running it N times produces the same record counts as running it once

*For any* number of seed script executions greater than or equal to 1, the total count of seed records in each MongoDB collection (Users, Requests, Messages, Notifications) SHALL be identical to the count after the first execution.

**Validates: Requirements 15.4**
