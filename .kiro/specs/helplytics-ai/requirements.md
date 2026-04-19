# Requirements Document

## Introduction

Helplytics AI is a community support platform built on the MERN stack (React.js, Node.js, Express, MongoDB, Tailwind CSS). It connects people who need help with those who can provide it, enhanced by AI-powered features for categorization, tag suggestions, urgency detection, and insights. The platform features a dark charcoal/green header banner, white card-based content, a top navbar, soft gradient backgrounds (light beige/mint), and a teal primary color (#0d9488), inspired by a premium Linear/Stripe aesthetic.

The platform supports three user roles: **Seeker** (Need Help), **Helper** (Can Help), and **Both**. It includes a Trust Score system, leaderboard with badges, a notification system, and an AI Center for community insights.

---

## Glossary

- **Platform**: The Helplytics AI web application
- **User**: Any authenticated person using the Platform
- **Seeker**: A User who has registered with the "Need Help" role
- **Helper**: A User who has registered with the "Can Help" role
- **Both_User**: A User who has registered with the "Both" role, acting as Seeker and Helper
- **Request**: A help request created by a Seeker or Both_User
- **AI_Engine**: The client-side keyword-based AI module responsible for categorization, tag suggestions, urgency detection, and summaries
- **Trust_Score**: A numeric score (0–100) calculated from a User's contributions, solved requests, and reputation
- **Badge**: A visual achievement awarded to a Helper based on activity milestones
- **Notification**: An in-app alert delivered to a User about status changes, matches, or reputation updates
- **Leaderboard**: A ranked list of top Helpers sorted by Trust_Score
- **AI_Center**: A dedicated page displaying AI-generated community insights, trends, urgency watch, mentor pool, and request recommendations
- **Session**: A user authentication state persisted via localStorage
- **Seed_Data**: Pre-populated dummy data used for demonstration purposes

---

## Requirements

### Requirement 1: Landing Page

**User Story:** As a visitor, I want to see a compelling landing page, so that I understand the platform's value and am motivated to sign up.

#### Acceptance Criteria

1. THE Platform SHALL render a Landing Page containing a hero section, platform overview section, call-to-action (CTA) section, and community stats section.
2. THE Platform SHALL display a dark charcoal/green header banner at the top of the Landing Page containing the Helplytics AI brand name and navigation links.
3. WHEN a visitor clicks the primary CTA button, THE Platform SHALL navigate the visitor to the Auth Page.
4. THE Platform SHALL display community stats including total users, total requests resolved, and active helpers using Seed_Data values.
5. THE Platform SHALL render the Landing Page with a soft gradient background using light beige and mint tones, white card-based content sections, and teal (#0d9488) as the primary accent color.
6. THE Platform SHALL use Inter-style typography throughout the Landing Page.

---

### Requirement 2: Authentication Page

**User Story:** As a visitor, I want to register or log in with a role selection, so that I can access the platform as a Seeker, Helper, or Both.

#### Acceptance Criteria

1. THE Platform SHALL render an Auth Page containing both a Login form and a Signup form, switchable via tab selection.
2. WHEN a visitor submits the Signup form, THE Platform SHALL require a name, email, password, and role selection (Need Help / Can Help / Both).
3. WHEN a visitor submits the Login form with valid credentials, THE Platform SHALL store the authenticated User's session in localStorage and redirect the User to the Dashboard.
4. IF a visitor submits the Login form with invalid credentials, THEN THE Platform SHALL display an inline error message without navigating away from the Auth Page.
5. IF a visitor submits the Signup form with an already-registered email, THEN THE Platform SHALL display an inline error message indicating the email is already in use.
6. THE Platform SHALL map the "Need Help" role selection to the Seeker role, "Can Help" to the Helper role, and "Both" to the Both_User role upon account creation.
7. WHEN a User logs out, THE Platform SHALL clear the Session from localStorage and redirect the User to the Landing Page.

---

### Requirement 3: Onboarding Page

**User Story:** As a newly registered User, I want to complete an onboarding flow, so that the platform can personalize my experience with relevant suggestions.

#### Acceptance Criteria

1. THE Platform SHALL render an Onboarding Page after successful Signup, collecting the User's display name, skills (multi-select or free-text tags), interests, and location.
2. WHEN a User enters skills or interests during onboarding, THE AI_Engine SHALL suggest additional relevant skills and interests based on keyword matching against a predefined taxonomy.
3. THE Platform SHALL display AI suggestions as selectable chips that the User can accept or dismiss.
4. WHEN a User completes and submits the Onboarding Page, THE Platform SHALL save the profile data to MongoDB and redirect the User to the Dashboard.
5. IF a User skips the Onboarding Page, THEN THE Platform SHALL redirect the User to the Dashboard with default empty profile fields.

---

### Requirement 4: Dashboard

**User Story:** As an authenticated User, I want a dashboard overview, so that I can quickly see my activity, recent requests, and AI insights at a glance.

#### Acceptance Criteria

1. THE Platform SHALL render a Dashboard containing stats cards, a recent requests panel, an AI insights panel, and a quick actions panel.
2. THE Platform SHALL display stats cards showing the User's total requests created, total requests helped, and current Trust_Score.
3. THE Platform SHALL display the five most recent Requests in the recent requests panel, ordered by creation date descending.
4. THE AI_Engine SHALL generate at least two AI insight messages for the Dashboard based on the User's activity and community Seed_Data trends.
5. THE Platform SHALL render quick action buttons on the Dashboard for "Create Request" and "Explore Feed", each navigating to the respective page.
6. THE Platform SHALL display the Dashboard with the dark charcoal/green header banner, top navbar, and white card-based layout consistent with the platform's design system.

---

### Requirement 5: Explore / Feed Page

**User Story:** As a Helper or Both_User, I want to browse and filter help requests, so that I can find requests that match my skills and availability.

#### Acceptance Criteria

1. THE Platform SHALL render an Explore Page displaying a filterable list of Requests sourced from MongoDB (including Seed_Data).
2. THE Platform SHALL provide filter controls for category, urgency level (High / Medium / Low), required skills, and location.
3. WHEN a User applies one or more filters, THE Platform SHALL update the displayed Request list to show only Requests matching all selected filter criteria.
4. WHEN a User clears all filters, THE Platform SHALL display the full unfiltered list of Requests.
5. THE Platform SHALL display each Request in the list as a card showing the title, category, urgency badge, required skills tags, location, and time since creation.
6. WHEN a User clicks a Request card, THE Platform SHALL navigate the User to the Request Detail page for that Request.
7. THE Platform SHALL support pagination or infinite scroll, displaying a maximum of 20 Requests per page load.

---

### Requirement 6: Create Request Page

**User Story:** As a Seeker or Both_User, I want to create a help request with AI assistance, so that my request is well-categorized and easy for Helpers to find.

#### Acceptance Criteria

1. THE Platform SHALL render a Create Request Page containing input fields for title, description, tags, category, and urgency level.
2. WHEN a User enters or modifies the description field, THE AI_Engine SHALL analyze the description text using keyword matching and suggest a category within 500ms of the User stopping input.
3. WHEN a User enters or modifies the description field, THE AI_Engine SHALL suggest up to five relevant tags based on keyword extraction within 500ms of the User stopping input.
4. WHEN a User enters or modifies the description field, THE AI_Engine SHALL detect and display an urgency level (High, Medium, or Low) based on urgency-related keywords within 500ms of the User stopping input.
5. THE Platform SHALL display AI-suggested category, tags, and urgency as dismissible inline suggestions that the User can accept with a single click.
6. WHERE a User requests a rewrite suggestion, THE AI_Engine SHALL generate an improved version of the description using predefined rewrite templates and display it as a dismissible suggestion.
7. WHEN a User submits the Create Request form with all required fields completed, THE Platform SHALL save the Request to MongoDB and redirect the User to the Request Detail page for the newly created Request.
8. IF a User submits the Create Request form with missing required fields, THEN THE Platform SHALL display inline validation errors for each missing field without navigating away.

---

### Requirement 7: Request Detail Page

**User Story:** As a User, I want to view the full details of a help request, so that I can understand the need and decide whether to help or mark it as solved.

#### Acceptance Criteria

1. THE Platform SHALL render a Request Detail Page displaying the full title, description, category, urgency badge, tags, requester name, location, and creation timestamp.
2. THE AI_Engine SHALL generate a concise summary (maximum 3 sentences) of the Request description and display it in a dedicated AI Summary card on the Request Detail Page.
3. THE Platform SHALL display a list of Helpers who have expressed interest in the Request via the "I Can Help" action.
4. WHEN a Helper or Both_User clicks "I Can Help", THE Platform SHALL add the User to the Request's helper list and update the display without a full page reload.
5. WHEN the Request owner clicks "Mark as Solved", THE Platform SHALL update the Request status to "Solved" in MongoDB, increment the Trust_Score of all listed Helpers by a fixed value of 5 points, and display a solved status badge on the Request.
6. IF a User who is not the Request owner attempts to click "Mark as Solved", THEN THE Platform SHALL disable or hide the "Mark as Solved" button for that User.
7. WHILE a Request status is "Solved", THE Platform SHALL display the Request as read-only with no further "I Can Help" actions available.

---

### Requirement 8: Messages / Interaction Page

**User Story:** As a Helper or Seeker, I want to send and receive messages related to a help request, so that we can coordinate effectively.

#### Acceptance Criteria

1. THE Platform SHALL render a Messages Page displaying a list of active message threads, each associated with a specific Request.
2. WHEN a User selects a message thread, THE Platform SHALL display the full message history for that thread in chronological order.
3. WHEN a User submits a new message in a thread, THE Platform SHALL save the message to MongoDB and display it in the thread immediately without a full page reload.
4. THE Platform SHALL display each message with the sender's name, message content, and timestamp.
5. IF a User attempts to send an empty message, THEN THE Platform SHALL prevent submission and display an inline validation message.
6. THE Platform SHALL restrict message thread access so that only the Request owner and listed Helpers for that Request can view and send messages in the associated thread.

---

### Requirement 9: Leaderboard Page

**User Story:** As a User, I want to see a leaderboard of top Helpers, so that I can recognize community contributors and be motivated to contribute.

#### Acceptance Criteria

1. THE Platform SHALL render a Leaderboard Page displaying the top 20 Helpers ranked by Trust_Score in descending order.
2. THE Platform SHALL display each Leaderboard entry as a card showing the Helper's rank number, name, Trust_Score, earned Badges, and a visual trust score progress bar.
3. THE Platform SHALL award Badges to Helpers based on milestone thresholds: "First Helper" at 1 solved request, "Rising Star" at 10 solved requests, "Community Champion" at 50 solved requests, and "Legend" at 100 solved requests.
4. WHEN a User's Trust_Score changes, THE Platform SHALL update the Leaderboard ranking on the next page load to reflect the new order.
5. THE Platform SHALL highlight the currently authenticated User's Leaderboard entry with a distinct visual style if the User appears in the top 20.

---

### Requirement 10: AI Center Page

**User Story:** As a User, I want to access AI-generated community insights, so that I can understand trends, urgent needs, and find mentors.

#### Acceptance Criteria

1. THE Platform SHALL render an AI Center Page containing four sections: Trend Pulse, Urgency Watch, Mentor Pool, and Request Recommendations.
2. THE AI_Engine SHALL populate the Trend Pulse section with the top 5 most frequently occurring categories and tags across all Requests in the last 30 days using Seed_Data.
3. THE AI_Engine SHALL populate the Urgency Watch section with all currently open Requests flagged as High urgency, sorted by creation date ascending (oldest first).
4. THE AI_Engine SHALL populate the Mentor Pool section with the top 10 Helpers by Trust_Score who have skills matching the authenticated User's interests.
5. THE AI_Engine SHALL populate the Request Recommendations section with up to 5 Requests whose required skills overlap with the authenticated User's listed skills.
6. THE Platform SHALL refresh AI Center data on each page load.

---

### Requirement 11: Notifications Page

**User Story:** As a User, I want to receive and view notifications, so that I stay informed about activity relevant to my requests and reputation.

#### Acceptance Criteria

1. THE Platform SHALL render a Notifications Page displaying a chronological feed of Notifications for the authenticated User.
2. THE Platform SHALL generate Notifications for the following events: a Helper expressing interest in the User's Request (match notification), a Request the User helped being marked as solved (status notification), a new Request matching the User's skills being created (request notification), and a Trust_Score change (reputation notification).
3. THE Platform SHALL display each Notification with an icon indicating its type, a descriptive message, and a relative timestamp (e.g., "2 hours ago").
4. WHEN a User clicks a Notification, THE Platform SHALL navigate the User to the relevant page (Request Detail, Leaderboard, or Profile) associated with that Notification.
5. THE Platform SHALL display an unread Notification count badge on the Notifications navbar link when the User has unread Notifications.
6. WHEN a User visits the Notifications Page, THE Platform SHALL mark all displayed Notifications as read and remove the unread count badge.

---

### Requirement 12: Profile Page

**User Story:** As a User, I want to view and edit my profile, so that I can manage my identity, skills, and track my contributions on the platform.

#### Acceptance Criteria

1. THE Platform SHALL render a Profile Page displaying the User's name, role, location, skills, interests, Trust_Score, earned Badges, and contribution history.
2. THE Platform SHALL display the User's contribution history as a list of Requests the User created and Requests the User helped resolve.
3. WHEN a User clicks "Edit Profile", THE Platform SHALL render an editable form pre-populated with the User's current name, skills, interests, and location.
4. WHEN a User submits the Edit Profile form with valid data, THE Platform SHALL save the updated profile to MongoDB and display the updated Profile Page.
5. IF a User submits the Edit Profile form with an empty name field, THEN THE Platform SHALL display an inline validation error and prevent submission.
6. THE Platform SHALL display the Trust_Score as both a numeric value and a visual progress bar scaled to 100.

---

### Requirement 13: Navigation and Layout

**User Story:** As a User, I want consistent navigation across all pages, so that I can move between sections of the platform without confusion.

#### Acceptance Criteria

1. THE Platform SHALL render a top navbar on every authenticated page containing links to: Dashboard, Explore, Create Request, AI Center, Leaderboard, Messages, Notifications, and Profile.
2. THE Platform SHALL display the dark charcoal/green header banner consistently across all pages as part of the top navbar.
3. THE Platform SHALL highlight the active navbar link corresponding to the current page.
4. WHEN a User is not authenticated, THE Platform SHALL restrict access to all pages except the Landing Page and Auth Page, redirecting unauthenticated requests to the Auth Page.
5. THE Platform SHALL render all pages with a soft gradient background using light beige and mint tones, white card-based content sections, teal (#0d9488) primary accent color, and Inter-style typography.

---

### Requirement 14: Trust Score System

**User Story:** As a Helper, I want my contributions to be tracked and rewarded with a Trust Score, so that my reputation reflects my community impact.

#### Acceptance Criteria

1. THE Platform SHALL initialize every new User's Trust_Score to 0 upon account creation.
2. WHEN a Request the User helped is marked as Solved, THE Platform SHALL increment the User's Trust_Score by 5 points.
3. WHEN a User creates a Request that is subsequently marked as Solved, THE Platform SHALL increment the User's Trust_Score by 2 points.
4. THE Platform SHALL recalculate and persist the Trust_Score in MongoDB after each qualifying event.
5. THE Platform SHALL display the current Trust_Score on the Dashboard, Profile Page, and Leaderboard.

---

### Requirement 15: Seed Data and Persistence

**User Story:** As a developer or demo user, I want the platform to be pre-populated with realistic dummy data, so that all features are demonstrable without manual data entry.

#### Acceptance Criteria

1. THE Platform SHALL include a seed script that populates MongoDB with at least 10 User accounts, 30 Requests across varied categories and urgency levels, message threads, and Notification records.
2. THE Platform SHALL use MongoDB for all persistent data storage including Users, Requests, Messages, Notifications, and Trust_Score records.
3. THE Platform SHALL use localStorage exclusively for Session management (storing the authenticated User's ID and token).
4. WHEN the seed script is executed, THE Platform SHALL not duplicate existing seed records if the script is run more than once (idempotent seeding).
