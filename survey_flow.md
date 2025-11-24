Survey Flow Documentation
Create a new documentation file SURVEY_FLOW.md that comprehensively explains how the survey system works.

Documentation Structure
1. Overview Section
Brief description of the survey system
Key components and technologies
Entry point (QR code scan)
2. Complete User Flow
Document the step-by-step flow from QR code scan to completion:

Initial page load and restaurant code validation
Survey data fetching
Start screen display
Question progression (swipe-based UI)
Answer submission with optional details (photo/text)
Contact details collection
Lottery system
Final fortune cookie screen
3. Database Tables and Operations
Document all database tables involved and what gets written:

Tables to document:

restaurants - Read: restaurant lookup by code
survey - Read: active survey for restaurant
survey_questions - Read: questions for active survey
survey_responses - Write: main response record
survey_response_answers - Write: individual answer records
survey_response_details - Write: optional photo/text details
survey-media (Storage bucket) - Write: photo uploads
For each table, document:

When it's accessed (read/write)
What data is stored
Field descriptions
Relationships to other tables
4. Data Flow Details
Answer storage structure (JSONB format)
Individual answer records vs aggregated question_answers
Media upload process and storage paths
Contact details and lottery result storage
5. Lottery System
How winners are calculated (10% random chance)
When lottery runs
What gets stored in database
6. Code References
Include references to key code sections:

Survey page component (app/survey/page.tsx)
Database operations
Storage upload logic
Implementation Details
File to create: SURVEY_FLOW.md in the root directory

Key sections to include:

Overview
User Flow (step-by-step)
Database Schema and Operations
Data Storage Patterns
Lottery System
Media Upload Process
Code References
Format: Markdown with clear sections, code blocks for examples, and table structures for database schemas.