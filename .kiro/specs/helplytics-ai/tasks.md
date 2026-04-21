# Implementation Plan: Helplytics AI

## Overview

Sequential implementation of the Helplytics AI MERN stack platform. The client (React + Vite + Tailwind) deploys to Vercel; the server (Node + Express + MongoDB) deploys to Railway/Render. Tasks build incrementally — each step integrates into the previous, with no orphaned code.

## Tasks

- [ ] 1. Project scaffolding and configuration
  - [x] 1.1 Scaffold the Express server
    - Create `server/` directory with `package.json` (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv)
    - Create `server/server.js` with Express app, CORS config, JSON body parser, and route mounts
    - Create `server/config/db.js` with Mongoose connection using `MONGODB_URI` env var
    - Create `server/.env.example` with `MONGODB_URI`, `JWT_SECRET`, `PORT`
    - _Requirements: 15.2_

  - [x] 1.2 Scaffold the React client
    - Run `npm create vite@latest client -- --template react` inside the project root
    - Install dependencies: axios, react-router-dom, react-hot-toast
    - Install and configure Tailwind CSS v3 with `tailwind.config.js` and `postcss.config.js`
    - Add teal primary color (`#0d9488`) and Inter font to `tailwind.config.js`
    - Clear boilerplate from `src/App.jsx` and `src/main.jsx`
    - _Requirements: 1.5, 13.5_

  - [x] 1.3 Create deployment config files
    - Create `client/vercel.json` with SPA rewrite rule (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`)
    - Create `server/Procfile` with `web: node server.js` for Railway/Render
    - Create root `.gitignore` covering `node_modules`, `.env`, `dist`
    - _Requirements: 15.2_

- [ ] 2. MongoDB schemas and seed data
  - [x] 2.1 Create Mongoose models
    - Implement `server/models/User.js` with the full UserSchema (name, email, password, role, skills, interests, location, trustScore, badges, solvedCount, timestamps)
    - Implement `server/models/Request.js` with RequestSchema (title, description, category, tags, urgency, status, location, owner ref, helpers refs, solvedAt, timestamps)
    - Implement `server/models/Message.js` with MessageSchema (request ref, sender ref, content, timestamps) and compound index `{ request: 1, createdAt: 1 }`
    - Implement `server/models/Notification.js` with NotificationSchema (recipient ref, type enum, message, relatedRequest ref, read, timestamps) and index `{ recipient: 1, read: 1 }`
    - _Requirements: 15.2_

  - [x] 2.2 Write the seed script
    - Create `server/seed/seed.js` with idempotent logic (check by unique field before insert)
    - Seed 10 users with varied roles, skills, interests, locations, pre-set trustScores and badges
    - Seed 30 requests spread across all 12 categories, mixed urgency, 10 marked solved with `solvedAt`
    - Seed message threads (3–5 messages each) for every solved request
    - Seed 2–3 notifications per user covering all 4 notification types (match, status, request, reputation)
    - Add `"seed": "node seed/seed.js"` script to `server/package.json`
    - _Requirements: 15.1, 15.4_

  - [ ]* 2.3 Write property test for seed idempotency
    - **Property 38: Seed script is idempotent — running it N times produces the same record counts as running it once**
    - **Validates: Requirements 15.4**

- [ ] 3. Backend auth middleware and JWT utilities
  - [x] 3.1 Implement JWT auth middleware
    - Create `server/middleware/auth.js` that reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, attaches `req.user` (userId), and returns `401` on missing/invalid/expired token
    - _Requirements: 13.4_

  - [x] 3.2 Implement auth routes
    - Create `server/routes/auth.js` with `POST /register` (hash password with bcrypt, create User, return `{ token, user }`) and `POST /login` (compare password, return `{ token, user }`)
    - JWT signed with 7-day expiry
    - Return `409` on duplicate email, `400` on missing fields
    - Mount at `/api/auth` in `server.js`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 14.1_

  - [ ]* 3.3 Write property test for new user Trust Score initialization
    - **Property 36: Every new user is initialized with Trust Score of 0**
    - **Validates: Requirements 14.1**

- [ ] 4. Backend API routes
  - [x] 4.1 Implement user routes
    - Create `server/routes/users.js` with:
      - `GET /me` — return current user (auth required)
      - `PUT /me` — update name, skills, interests, location (auth required)
      - `GET /leaderboard` — top 20 helpers sorted by trustScore desc (auth required)
      - `GET /stats` — aggregate total users, resolved requests, active helpers (public)
    - Mount at `/api/users` in `server.js`
    - _Requirements: 9.1, 12.1, 12.4, 1.4_

  - [x] 4.2 Implement request routes
    - Create `server/routes/requests.js` with:
      - `GET /` — list requests with query filters (category, urgency, skills, location, page=1, limit=20), populate owner name
      - `POST /` — create request, auth required
      - `GET /recent` — 5 most recent requests sorted by createdAt desc, auth required
      - `GET /:id` — single request detail, populate owner and helpers names
      - `PUT /:id/help` — add current user to helpers array (auth required)
      - `PUT /:id/solve` — owner-only: set status=solved, increment helper trustScores (+5) and solvedCounts, recalculate badges, increment owner trustScore (+2), create notifications for all helpers and owner
    - Mount at `/api/requests` in `server.js`
    - _Requirements: 5.1, 5.3, 6.7, 7.3, 7.4, 7.5, 14.2, 14.3_

  - [ ]* 4.3 Write property test for Trust Score increments on solve
    - **Property 15: Marking a request solved increments each helper's Trust Score by exactly 5**
    - **Property 16: Marking a request solved increments the owner's Trust Score by exactly 2**
    - **Validates: Requirements 7.5, 14.2, 14.3**

  - [ ]* 4.4 Write property test for badge assignment thresholds
    - **Property 22: Badge assignment always matches milestone thresholds**
    - **Validates: Requirements 9.3**

  - [x] 4.5 Implement message routes
    - Create `server/routes/messages.js` with:
      - `GET /threads` — all threads for current user (requests where user is owner or helper), return last message preview
      - `GET /:requestId` — full message history sorted by createdAt asc
      - `POST /:requestId` — send message; verify sender is owner or helper of the request; create message; return saved message
    - Mount at `/api/messages` in `server.js`
    - _Requirements: 8.1, 8.2, 8.3, 8.6_

  - [x] 4.6 Implement notification routes
    - Create `server/routes/notifications.js` with:
      - `GET /` — all notifications for current user sorted by createdAt desc
      - `PUT /read-all` — set read=true on all user's notifications
      - `GET /unread-count` — count of notifications where read=false
    - Mount at `/api/notifications` in `server.js`
    - _Requirements: 11.1, 11.5, 11.6_

- [ ] 5. Checkpoint — backend complete
  - Start the server with `node server.js` and verify all routes respond correctly using a REST client (curl or Postman). Run the seed script and confirm record counts. Ask the user if questions arise.

- [ ] 6. Client-side foundation: API service, Auth context, routing
  - [x] 6.1 Create the Axios API service
    - Create `client/src/services/api.js` with an Axios instance pointing to `VITE_API_URL`
    - Add request interceptor to attach `Authorization: Bearer <token>` from localStorage
    - Add response interceptor to catch `401` responses, clear localStorage, and redirect to `/auth`
    - Export typed functions for every API endpoint (auth, users, requests, messages, notifications)
    - _Requirements: 2.3, 13.4_

  - [x] 6.2 Implement AuthContext and useAuth hook
    - Create `client/src/context/AuthContext.jsx` with `AuthProvider` that reads token and user from localStorage on mount, exposes `user`, `token`, `login(data)`, `logout()` functions
    - Create `client/src/hooks/useAuth.js` that consumes AuthContext
    - _Requirements: 2.3, 2.7, 15.3_

  - [x] 6.3 Set up React Router and ProtectedRoute
    - Create `client/src/components/auth/ProtectedRoute.jsx` that reads AuthContext and redirects to `/auth` if unauthenticated
    - Wire all 12 page routes in `client/src/App.jsx` with `BrowserRouter`, public routes (Landing `/`, Auth `/auth`) and protected routes wrapped in `ProtectedRoute`
    - _Requirements: 13.4_

  - [ ]* 6.4 Write property test for unauthenticated route redirect
    - **Property 35: Unauthenticated access to any protected route always redirects to /auth**
    - **Validates: Requirements 13.4**

- [ ] 7. Shared UI components
  - [x] 7.1 Implement layout components
    - Create `client/src/components/layout/PageWrapper.jsx` — wraps children with `bg-gradient-to-br from-stone-50 to-teal-50`, consistent padding and max-width container
    - Create `client/src/components/layout/HeaderBanner.jsx` — dark charcoal/green banner strip with brand name
    - Create `client/src/components/layout/Navbar.jsx` — renders HeaderBanner, authenticated nav links (Dashboard, Explore, Create Request, AI Center, Leaderboard, Messages, Notifications, Profile), highlights active link via `useLocation()`, shows unread notification count badge fetched from `/api/notifications/unread-count`
    - _Requirements: 1.2, 13.1, 13.2, 13.3_

  - [ ]* 7.2 Write property test for active navbar link
    - **Property 34: Exactly one navbar link is active for any given route**
    - **Validates: Requirements 13.3**

  - [x] 7.3 Implement UI primitive components
    - Create `client/src/components/ui/UrgencyBadge.jsx` — color-coded pill: High=red, Medium=amber, Low=green; props: `{ level }`
    - Create `client/src/components/ui/TrustScoreBar.jsx` — numeric value + teal progress bar scaled to 100; props: `{ score }`
    - Create `client/src/components/ui/SkillChip.jsx` — dismissible or static chip; props: `{ label, onDismiss? }`
    - Create `client/src/components/ui/Badge.jsx` — achievement badge with icon and label; props: `{ type }`
    - Create `client/src/components/ui/RequestCard.jsx` — displays title, category, UrgencyBadge, skill tags (SkillChip), location, time since creation; props: `{ request, onClick }`
    - _Requirements: 5.5, 9.2_

  - [ ]* 7.4 Write property test for RequestCard required fields
    - **Property 7: Request card always renders all required fields**
    - **Validates: Requirements 5.5**

  - [ ]* 7.5 Write property test for TrustScoreBar percentage
    - **Property 33: Trust Score progress bar percentage always equals the score value**
    - **Validates: Requirements 12.6_

  - [x] 7.6 Create utility helpers
    - Create `client/src/utils/trustScore.js` with badge threshold helpers and score formatting
    - Create `client/src/hooks/useDebounce.js` with a generic debounce hook (default 500ms)
    - _Requirements: 9.3, 6.2_

- [ ] 8. Client-side AI Engine
  - [x] 8.1 Implement the AI Engine module
    - Create `client/src/engine/aiEngine.js` with the full CATEGORIES list and CATEGORY_KEYWORDS, URGENCY_KEYWORDS taxonomies
    - Implement `suggestCategory(text)` — keyword match against CATEGORY_KEYWORDS, return best-matching CATEGORIES entry, fallback to 'Other'
    - Implement `suggestTags(text)` — extract up to 5 keyword matches from description
    - Implement `detectUrgency(text)` — match against URGENCY_KEYWORDS, return 'High' | 'Medium' | 'Low', default 'Low'
    - Implement `generateSummary(description)` — split into sentences, return first 3 joined
    - Implement `suggestSkills(existingSkills)` — return taxonomy skills not already in existingSkills array
    - Implement `generateInsights(userActivity, communityStats)` — return array of at least 2 non-empty insight strings
    - Implement `rewriteDescription(description)` — return improved version using predefined rewrite templates
    - Implement `computeTrendPulse(requests)` — count category/tag frequencies, return top 5 each sorted desc
    - Implement `getUrgencyWatch(requests)` — filter open+High urgency, sort by createdAt asc
    - Implement `matchMentors(helpers, userInterests)` — filter helpers with skill overlap, sort by trustScore desc, return top 10
    - Implement `recommendRequests(requests, userSkills)` — filter requests with tag/skill overlap, return up to 5
    - Wrap all functions in try/catch with empty-array/empty-string fallbacks
    - _Requirements: 3.2, 6.2, 6.3, 6.4, 6.6, 7.2, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 8.2 Write property tests for AI Engine functions
    - **Property 9: AI category suggestion always returns a valid taxonomy category**
    - **Property 10: AI tag suggestions always returns 0–5 tags**
    - **Property 11: AI urgency detection always returns a valid urgency level**
    - **Property 12: AI rewrite always returns a non-empty string**
    - **Property 14: AI summary never exceeds 3 sentences**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.6, 7.2**

  - [ ]* 8.3 Write property tests for AI Center engine functions
    - **Property 23: Trend Pulse returns at most 5 items sorted by frequency descending**
    - **Property 24: Urgency Watch returns only open High-urgency requests in ascending date order**
    - **Property 25: Mentor Pool returns at most 10 helpers with skill overlap, sorted by Trust Score**
    - **Property 26: Request Recommendations returns at most 5 requests with skill overlap**
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

  - [ ]* 8.4 Write property tests for AI skill suggestions
    - **Property 3: AI skill suggestions are always valid taxonomy entries**
    - **Validates: Requirements 3.2**

  - [ ]* 8.5 Write property test for Dashboard AI insights
    - **Property 5: Dashboard AI insights always returns at least 2 messages**
    - **Validates: Requirements 4.4**

- [ ] 9. Checkpoint — AI Engine and shared components complete
  - Verify AI Engine functions return correct types for sample inputs. Confirm Navbar renders with active link highlighting and unread badge. Ask the user if questions arise.

- [ ] 10. Landing and Auth pages
  - [x] 10.1 Implement Landing page
    - Create `client/src/pages/Landing.jsx` wrapped in PageWrapper
    - Hero section with headline, subheadline, and primary CTA button navigating to `/auth`
    - Platform overview section (3 feature cards)
    - Community stats section fetching from `GET /api/users/stats` (total users, resolved, active helpers)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 10.2 Implement Auth page
    - Create `client/src/pages/Auth.jsx` with tab-switched Login/Signup forms
    - Signup form: name, email, password, role radio (Need Help / Can Help / Both); on success store token+user in AuthContext and redirect to `/onboarding`
    - Login form: email, password; on success store token+user in AuthContext and redirect to `/dashboard`
    - Inline validation errors for missing fields, invalid credentials, duplicate email
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 10.3 Write property test for signup form validation
    - **Property 1: Signup form rejects any missing required field**
    - **Validates: Requirements 2.2**

  - [ ]* 10.4 Write property test for invalid login rejection
    - **Property 2: Invalid login credentials always produce an error message**
    - **Validates: Requirements 2.4**

- [x] 11. Onboarding page
  - Create `client/src/pages/Onboarding.jsx` wrapped in PageWrapper
  - Form fields: display name, skills (SkillChip input with add/dismiss), interests (same), location
  - On skills/interests input change, call `aiEngine.suggestSkills()` and display results as selectable SkillChip suggestions
  - On submit: call `PUT /api/users/me`, then redirect to `/dashboard`; on skip: redirect to `/dashboard` directly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 12. Dashboard page
  - Create `client/src/pages/Dashboard.jsx` wrapped in PageWrapper
  - Fetch current user (`GET /api/users/me`) for stats cards (requests created, helped, trustScore)
  - Fetch recent requests (`GET /api/requests/recent`) and render as RequestCard list
  - Call `aiEngine.generateInsights(userActivity, communityStats)` and display 2+ insight messages in AI insights panel
  - Quick action buttons: "Create Request" → `/create-request`, "Explore Feed" → `/explore`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 12.1 Write property test for recent requests ordering
    - **Property 4: Recent requests panel always shows the 5 most recent in descending order**
    - **Validates: Requirements 4.3**

- [x] 13. Explore page
  - Create `client/src/pages/Explore.jsx` wrapped in PageWrapper
  - Fetch requests from `GET /api/requests` with query params built from active filter state (category, urgency, skills, location, page)
  - Render filter controls (dropdowns/inputs) for category, urgency, skills, location; "Clear Filters" button resets all filters and refetches
  - Render RequestCard grid; clicking a card navigates to `/requests/:id`
  - Implement pagination controls (prev/next) with 20 requests per page
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 13.1 Write property test for Explore filter correctness
    - **Property 6: Explore filters show only matching requests, and clearing restores the full list**
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 13.2 Write property test for pagination limit
    - **Property 8: Pagination never exceeds 20 requests per page**
    - **Validates: Requirements 5.7**

- [x] 14. Create Request page
  - Create `client/src/pages/CreateRequest.jsx` wrapped in PageWrapper
  - Form fields: title, description (textarea), tags (SkillChip input), category (select), urgency (radio)
  - Wire `useDebounce(description, 500)` → on debounced change call `aiEngine.suggestCategory`, `aiEngine.suggestTags`, `aiEngine.detectUrgency` in parallel; display results as dismissible suggestion chips
  - "Rewrite Suggestion" button calls `aiEngine.rewriteDescription(description)` and shows result as dismissible suggestion
  - Inline validation: show errors for missing title, description, category, urgency before submit
  - On valid submit: `POST /api/requests`, redirect to `/requests/:newId`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 14.1 Write property test for create request form validation
    - **Property 13: Create request form rejects any missing required field**
    - **Validates: Requirements 6.8**

- [x] 15. Request Detail page
  - Create `client/src/pages/RequestDetail.jsx` wrapped in PageWrapper
  - Fetch request by id (`GET /api/requests/:id`), display full title, description, category, UrgencyBadge, tags, requester name, location, createdAt
  - AI Summary card: call `aiEngine.generateSummary(description)` and display result
  - Helpers list: render names of users in `request.helpers`
  - "I Can Help" button (visible to non-owners on open requests): call `PUT /api/requests/:id/help`, update helpers list in local state
  - "Mark as Solved" button (visible only to request owner on open requests): call `PUT /api/requests/:id/solve`, update status in local state, show solved badge
  - Read-only state when `request.status === 'solved'`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 16. Messages page
  - Create `client/src/pages/Messages.jsx` wrapped in PageWrapper
  - Left panel: fetch threads (`GET /api/messages/threads`), render list with request title and last message preview; clicking a thread sets active thread
  - Right panel: fetch message history (`GET /api/messages/:requestId`) for active thread, render messages sorted chronologically (oldest first) with sender name, content, timestamp
  - Send message form at bottom: textarea + send button; validate non-empty/non-whitespace before submit; call `POST /api/messages/:requestId`, append new message to local state
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 16.1 Write property test for message thread ordering
    - **Property 17: Message thread is always displayed in chronological order**
    - **Validates: Requirements 8.2**

  - [ ]* 16.2 Write property test for empty message rejection
    - **Property 19: Empty or whitespace-only messages are always rejected**
    - **Validates: Requirements 8.5**

  - [ ]* 16.3 Write property test for message rendering fields
    - **Property 18: Message rendering always includes sender name, content, and timestamp**
    - **Validates: Requirements 8.4**

- [x] 17. Leaderboard page
  - Create `client/src/pages/Leaderboard.jsx` wrapped in PageWrapper
  - Fetch top 20 helpers (`GET /api/users/leaderboard`)
  - Render each entry as a card: rank number, name, TrustScoreBar, Badge components for earned badges
  - Highlight the current user's entry with a distinct teal border/background if they appear in the list
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 17.1 Write property test for leaderboard ordering and limit
    - **Property 20: Leaderboard always shows at most 20 helpers in descending Trust Score order**
    - **Validates: Requirements 9.1**

  - [ ]* 17.2 Write property test for leaderboard card fields
    - **Property 21: Leaderboard card always renders all required fields**
    - **Validates: Requirements 9.2**

- [x] 18. AI Center page
  - Create `client/src/pages/AICenter.jsx` wrapped in PageWrapper
  - Fetch all requests and users on mount; pass to AI Engine functions
  - Trend Pulse section: call `aiEngine.computeTrendPulse(requests)`, display top 5 categories and tags as chips
  - Urgency Watch section: call `aiEngine.getUrgencyWatch(requests)`, render as RequestCard list
  - Mentor Pool section: call `aiEngine.matchMentors(helpers, currentUser.interests)`, render mentor cards with name, skills, TrustScoreBar
  - Request Recommendations section: call `aiEngine.recommendRequests(requests, currentUser.skills)`, render as RequestCard list
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 19. Notifications page
  - Create `client/src/pages/Notifications.jsx` wrapped in PageWrapper
  - Fetch notifications on mount (`GET /api/notifications`), display in descending createdAt order
  - Render each notification with type-specific icon, message text, relative timestamp (e.g. "2 hours ago")
  - On mount, call `PUT /api/notifications/read-all` to mark all as read; update Navbar unread badge to 0
  - Clicking a notification navigates to the relevant page (Request Detail, Leaderboard, or Profile)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 19.1 Write property test for notification feed ordering
    - **Property 27: Notification feed is always displayed in chronological order**
    - **Validates: Requirements 11.1**

  - [ ]* 19.2 Write property test for notification rendering fields
    - **Property 28: Notification rendering always includes type icon, message, and relative timestamp**
    - **Validates: Requirements 11.3**

  - [ ]* 19.3 Write property test for unread badge count
    - **Property 29: Unread notification badge count always equals the number of unread notifications**
    - **Validates: Requirements 11.5**

  - [ ]* 19.4 Write property test for mark-all-read on visit
    - **Property 30: Visiting the Notifications Page marks all notifications as read**
    - **Validates: Requirements 11.6**

- [x] 20. Profile page
  - Create `client/src/pages/Profile.jsx` wrapped in PageWrapper
  - Display user info: name, role, location, skills (SkillChip), interests (SkillChip), TrustScoreBar, Badge components
  - Contribution history: fetch requests where user is owner or in helpers array; render two lists (created, helped)
  - "Edit Profile" button toggles an inline edit form pre-populated with current name, skills, interests, location
  - On edit submit: validate name is non-empty/non-whitespace; call `PUT /api/users/me`; update displayed profile
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 20.1 Write property test for edit profile pre-population
    - **Property 31: Edit profile form is always pre-populated with current profile values**
    - **Validates: Requirements 12.3**

  - [ ]* 20.2 Write property test for empty name rejection
    - **Property 32: Edit profile form rejects empty or whitespace-only name**
    - **Validates: Requirements 12.5**

- [-] 21. Trust Score consistency across pages
  - Verify that Dashboard stats card, Profile TrustScoreBar, and Leaderboard entry all read from the same `user.trustScore` field returned by the API — no local overrides or stale state
  - _Requirements: 14.4, 14.5_

  - [ ]* 21.1 Write property test for Trust Score consistency
    - **Property 37: Trust Score is consistent across Dashboard, Profile, and Leaderboard**
    - **Validates: Requirements 14.5**

- [ ] 22. Final checkpoint — full integration
  - Run the seed script, start the server, and start the client dev server
  - Walk through the full user flow: register → onboard → create request → explore → help → solve → check leaderboard → check notifications → check AI Center
  - Ensure all tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations per property
- Tag format for property tests: `// Feature: helplytics-ai, Property {N}: {property_text}`
- The AI Engine is pure client-side — no external API calls, zero latency
- Deployment: `client/` → Vercel (set `VITE_API_URL` env var), `server/` → Railway or Render (set `MONGODB_URI`, `JWT_SECRET`, `PORT`)
