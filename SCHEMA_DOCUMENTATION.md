# BIG Jobs Recruitment Application - Custom Objects Schema Documentation

**Date:** November 19, 2025  

---

## Table of Contents

1. [Overview](#overview)
2. [Data Model Architecture](#data-model-architecture)
3. [Custom Objects](#custom-objects)
   - [Candidate](#1-candidate)
   - [Position](#2-position)
   - [Job Application](#3-job-application)
   - [Review](#4-review)
   - [ContentVersion (Custom Field)](#5-contentversion-standard-object---custom-field)
4. [Object Relationships](#object-relationships)
5. [Field Reference Tables](#field-reference-tables)
6. [Business Logic & Validation Rules](#business-logic--validation-rules)

---

## Overview

Salesforce-based applicant tracking system (ATS) managing the complete recruitment lifecycle with four custom objects: Candidate, Position, Job Application, and Review.

### Key Features
- Candidate information management with privacy compliance
- Position management with approval workflows
- Application tracking through multiple stages
- Interview feedback and rating system
- External careers portal integration

## Data Model

```
Position__c → Job_Application__c ← Candidate__c
                    ↓
                Review__c
```

### Relationship Summary
- **Position** ↔ **Job Application**: One-to-Many (Lookup)
- **Candidate** ↔ **Job Application**: One-to-Many (Lookup)
- **Job Application** ↔ **Review**: One-to-Many (Master-Detail)

---

## Custom Objects

### 1. Candidate

**API Name:** `Candidate__c`  
**Label:** Candidate  
**Plural Label:** Candidates  
**Object Purpose:** Stores information about individuals who apply for positions

#### Object Configuration
| Property                   | Value                         |
|----------------------------|-------------------------------|
| **Deployment Status**      | Deployed                      |
| **Sharing Model**          | Read/Write                    |
| **External Sharing Model** | Read/Write                    |
| **Record Name**            | Auto Number: C-{YY}{MM}{0000} |
| **Activities Enabled**     | Yes                           |
| **History Tracking**       | Yes                           |
| **Feeds Enabled**          | Yes                           |
| **Reports Enabled**        | Yes                           |
| **Search Enabled**         | Yes                           |
| **Compact Layout**         | Candidate_Compact_Layout      |

#### Fields

| Field Name               | API Name                      | Type           | Required | Unique | Description                                   |
|--------------------------|-------------------------------|----------------|----------|--------|-----------------------------------------------|
| Candidate Number         | Name                          | Auto Number    | Yes      | Yes    | Format: C-{YY}{MM}{0000}                      |
| Salutation               | `Salutation__c`               | Picklist       | No       | No     | Title/prefix (Mr., Ms., Dr., etc.)            |
| First Name               | `First_Name__c`               | Text           | Yes      | No     | Candidate's first name                        |
| Last Name                | `Last_Name__c`                | Text           | No       | No     | Candidate's last name                         |
| Date of Birth            | `Date_of_Birth__c`            | Date           | Yes      | No     | Candidate's date of birth                     |
| Email                    | `Email__c`                    | Email          | Yes      | Yes    | Primary email address (External ID)           |
| Phone                    | `Phone__c`                    | Phone          | No       | No     | Primary phone number                          |
| Mobile                   | `Mobile__c`                   | Phone          | No       | No     | Mobile phone number                           |
| LinkedIn Profile         | `LinkedIn_Profile__c`         | URL            | No       | No     | LinkedIn profile URL                          |
| Street Address 1         | `Street_Address_1__c`         | Text           | No       | No     | Primary address line                          |
| Street Address 2         | `Street_Address_2__c`         | Text           | No       | No     | Secondary address line                        |
| City                     | `City__c`                     | Text           | No       | No     | City                                          |
| State/Province           | `State_Province__c`           | Text           | No       | No     | State or province                             |
| Zip/Postal Code          | `Zip_Postal_Code__c`          | Text           | No       | No     | Zip or postal code                            |
| Country                  | `Country__c`                  | Text           | No       | No     | Country                                       |
| Years of Experience      | `Years_of_Experience__c`      | Number(2,0)    | No       | No     | Total years of work experience                |
| Highest Education Level  | `Highest_Education_Level__c`  | Picklist       | No       | No     | Highest education level                       |
| Currently Employed       | `Currently_Employed__c`       | Checkbox       | No       | No     | Employment status indicator                   |
| Current Employer         | `Current_Employer__c`         | Text           | No       | No     | Current employer name                         |
| Work Experience Notes    | `Work_Experience_Notes__c`    | Long Text Area | No       | No     | Detailed work history                         |
| Identity Document Type   | `Identity_Document_Type__c`   | Picklist       | No       | No     | Type of ID document (Aadhaar, Passport, etc.) |
| Identity Document Id     | `Identity_Document_Id__c`     | Text(18)       | No       | No     | ContentDocument ID of identity document       |
| Identity Document Number | `Identity_Document_Number__c` | Text(25)       | No       | No     | Document number of identity verification      |
| PAN Card Number          | `PAN_Card_Number__c`          | Text(10)       | No       | Yes    | Permanent Account Number (India tax ID)       |
| Photo Document Id        | `Photo_Document_Id__c`        | Text(18)       | No       | Yes    | ContentDocument ID of photo                   |
| Profile Photo            | `Profile_Photo__c`            | Formula(Text)  | No       | No     | Displays candidate's profile photo            |
| Documents Verified       | `Documents_Verified__c`       | Checkbox       | No       | No     | HR verification of all required documents     |
| Reference ID             | `Reference_ID__c`             | Text           | No       | No     | External reference identifier                 |

#### Picklist Values

**Salutation:**
- Mr.
- Ms.
- Mrs.
- Dr.
- Prof.
- Mx.

**Highest Education Level (Picklist):**
- GED/HS Diploma
- BE/B.Tech
- BA/BS
- ME/M.Tech
- MA/MS/MBA
- PG
- PhD
- Post Doc

**Identity Document Type:**
- Aadhaar Card (Default)
- Passport
- Voter ID
- Driving License

#### Field Details

**Date of Birth:**
- Required date field
- Used for age verification and compliance

**Identity Document Type:**
- Optional picklist field
- Government-issued identity document type
- Default: Aadhaar Card
- Values: Aadhaar Card, Passport, Voter ID, Driving License

**Identity Document Number:**
- Optional text field (max 25 characters)
- Document number from selected ID proof

**Identity Document Id:**
- System-managed text field (18 characters)
- Stores ContentDocument ID of uploaded identity document
- Used for document verification and retrieval
- Automatically populated when identity document is uploaded

**PAN Card Number:**
- Optional unique text field (10 characters)
- Permanent Account Number (Indian tax ID)
- Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
- Validated by validation rule (currently inactive)
- Case-insensitive unique constraint
- History tracking enabled

**Photo Document Id:**
- System-managed text field (18 characters)
- Stores ContentDocument ID of uploaded photo
- Unique constraint
- Used by Profile Photo formula field
- Automatically populated when photo is uploaded with "Photo" or "Picture" in filename

**Profile Photo:**
- Formula field displaying uploaded photo
- Formula: `IMAGE("/sfc/servlet.shepherd/document/download/" & Photo_Document_Id__c, "Profile Photo", 120, 90)`
- Shows "No Profile Photo" when no photo uploaded
- Display size: 120x90 pixels

**Documents Verified:**
- Checkbox for HR use (default: false)
- Confirms verification of PAN, ID proof, identity document, resume, photo

#### Validation Rules

**Valid PAN Card Format:**
- **Active:** No
- **Error Condition:** `NOT(REGEX(PAN_Card_Number__c, "[A-Z]{5}[0-9]{4}[A-Z]{1}"))`
- **Error Message:** "PAN Card Number must be in format: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g., ABCDE1234F)"
- **Description:** Validates that PAN Card Number follows the standard Indian tax ID format of 5 uppercase letters, followed by 4 digits, followed by 1 uppercase letter.

#### Field Sets
- **Personal_Information**: Fields for personal details
- **Address_Information**: Address-related fields

#### Key Features
- **Email as External ID**: Ensures uniqueness and enables external system integration
- **Feed Tracking**: Enabled for collaboration
- **History Tracking**: Tracks field changes for audit purposes
- **Custom Record Page**: Lightning record page for candidate records

---

### 2. Position

**API Name:** `Position__c`  
**Label:** Position  
**Plural Label:** Positions  
**Object Purpose:** Represents job openings/requisitions within the organization

#### Object Configuration
| Property                   | Value                   |
|----------------------------|-------------------------|
| **Deployment Status**      | Deployed                |
| **Sharing Model**          | Read                    |
| **External Sharing Model** | Read                    |
| **Record Name**            | Text Field: "Title"     |
| **Activities Enabled**     | Yes                     |
| **History Tracking**       | No                      |
| **Feeds Enabled**          | Yes                     |
| **Reports Enabled**        | Yes                     |
| **Search Enabled**         | Yes                     |
| **Compact Layout**         | Position_Compact_Layout |

#### Fields

| Field Name           | API Name                  | Type            | Required | Default | Description                                                  |
|----------------------|---------------------------|-----------------|----------|---------|--------------------------------------------------------------|
| Title                | Name                      | Text            | Yes      | -       | Position title/name                                          |
| Job Description      | `Job_Description__c`      | Text Area       | No       | -       | Detailed job description                                     |
| Department           | `Department__c`           | Picklist        | No       | -       | Hiring department (Global Value Set)                         |
| Location             | `Location__c`             | Picklist        | No       | -       | Job location/region                                          |
| Salary Range         | `Salary_Range__c`         | Picklist        | No       | -       | Salary range for position                                    |
| Pay Grade            | `Pay_Grade__c`            | Picklist        | No       | -       | Job grade classification                                     |
| Experience Level     | `Experience_Level__c`     | Picklist        | Yes      | -       | Experience level required for position                       |
| Hiring Manager       | `Hiring_Manager__c`       | Lookup(User)    | No       | -       | Assigned hiring manager                                      |
| Status               | `Status__c`               | Picklist        | No       | New     | Position status (New/Open/Closed)                            |
| Approval Status      | `Approval_Status__c`      | Picklist        | No       | -       | Approval workflow status                                     |
| Number of Openings   | `Number_of_Openings__c`   | Number(4,0)     | Yes      | 1       | Total positions available                                    |
| Filled Openings      | `Filled_Openings__c`      | Number(4,0)     | No       | 0       | Positions filled (system-updated)                            |
| Remaining Openings   | `Remaining_Openings__c`   | Formula(Number) | No       | -       | Calculated: Number of Openings - Filled Openings             |
| Application Deadline | `Application_Deadline__c` | Date            | Yes      | -       | Last date to accept applications                             |
| Education            | `Education__c`            | Long Text Area  | No       | -       | Required education level/qualifications                      |
| Skills Required      | `Skills_Required__c`      | Long Text Area  | No       | -       | Required skills and qualifications                           |
| Notified Owner       | `Notified_Owner__c`       | Checkbox        | No       | false   | Indicates if the owner has been notified about the position. |

#### Picklist Values

**Status:**
- New (Default)
- Open
- Closed

**Department (Global Value Set):**
- Engineering
- IT
- Finance
- Support
- Sales
- Financeee *(Inactive/Deprecated)*

**Location:**
- APAC
- EMEA
- LATAM
- US

**Salary Range:**
- 50K-75K
- 75K-90K
- 90K-120K
- 120K+

**Approval Status:**
- Pending
- Approved
- Not Approved
- Recalled

**Pay Grade:**

| Category    | Values                             |
|-------------|------------------------------------|
| Engineering | ENG-100, ENG-200, ENG-300, ENG-400 |
| Accounting  | ACT-100, ACT-200, ACT-300, ACT-400 |
| IT          | IT-100, IT-200, IT-300, IT-400     |
| Corporate   | C-100, C-200, C-300, C-400         |
| Sales       | S-100, S-200, S-300, S-400         |

**Experience Level:**
- Professional
- Entry Level
- Internship

#### Field Details

**Number of Openings:**
- Required field with default value of 1
- Maximum precision: 4 digits
- Used to define total headcount needed for this position

**Filled Openings:**
- System-generated count (default: 0)
- Tracks successfully hired candidates
- Updated by automation when candidates are hired

**Remaining Openings (Formula):**
- Calculated field: `Number_of_Openings__c - Filled_Openings__c`
- Treats blanks as zero
- Instantly shows how many more hires are needed

**Application Deadline:**
- Required date field
- Defines the final date for accepting applications
- Position considered "Closed" after this date

**Experience Level:**
- Required picklist field
- Defines the experience level expected for the position
- Values: Professional, Entry Level, Internship
- Used to filter and categorize positions based on candidate experience

#### Key Features
- **Hiring Manager Lookup**: Links to User object for assignment
- **Capacity Management**: Tracks openings (Total, Filled, Remaining) with formula field
- **Read Sharing Model**: Restricts editing but allows read access to authorized users
- **Feed Tracking**: Collaboration enabled
- **Required Fields**: Title, Number of Openings, Application Deadline, and Experience Level must be populated

---

### 3. Job Application

**API Name:** `Job_Application__c`  
**Label:** Job Application  
**Plural Label:** Job Applications  
**Object Purpose:** Junction object connecting Candidates to Positions, tracking application lifecycle

#### Object Configuration
| Property                   | Value                          |
|----------------------------|--------------------------------|
| **Deployment Status**      | Deployed                       |
| **Sharing Model**          | Read                           |
| **External Sharing Model** | Read                           |
| **Record Name**            | Auto Number: J-{YY}{MM}{0000}  |
| **Activities Enabled**     | Yes                            |
| **History Tracking**       | Yes                            |
| **Feeds Enabled**          | No                             |
| **Reports Enabled**        | Yes                            |
| **Search Enabled**         | Yes                            |
| **Compact Layout**         | Job_Application_Compact_Layout |

#### Fields

| Field Name             | API Name              | Type           | Required | Relationship | Description                           |
|------------------------|-----------------------|----------------|----------|--------------|---------------------------------------|
| Job Application Number | Name                  | Auto Number    | Yes      | -            | Format: J-{YY}{MM}{0000}              |
| Candidate              | `Candidate__c`        | Lookup         | Yes      | Candidate__c | Link to candidate record              |
| Position               | `Position__c`         | Lookup         | Yes      | Position__c  | Link to position record               |
| Application Date       | `Application_Date__c` | Date           | Yes      | -            | Date of application submission        |
| Status                 | `Status__c`           | Picklist       | No       | -            | Application status (Open/Hold/Closed) |
| Stage                  | `Stage__c`            | Picklist       | Yes      | -            | Current application stage             |
| Source                 | `Source__c`           | Picklist       | No       | -            | How candidate found position          |
| Hiring Decision        | `Hiring_Decision__c`  | Picklist       | No       | -            | Final hiring decision for candidate   |
| Cover Letter           | `Cover_Letter__c`     | Long Text Area | No       | -            | Candidate's cover letter              |

#### Relationship Details

**Candidate Relationship:**
- **Type:** Lookup
- **Relationship Name:** Job_Applications
- **Relationship Label:** Jobs Applied
- **Delete Constraint:** Restrict
- **Required:** Yes

**Position Relationship:**
- **Type:** Lookup
- **Relationship Name:** Job_Applications
- **Relationship Label:** Applications
- **Delete Constraint:** Restrict
- **Required:** Yes

#### Picklist Values

**Status:**
- Open (Default)
- Hold
- Closed

**Stage:**
1. New (Default)
2. Phone Screen
3. Schedule Interviews
4. Interviews Completed
5. Hiring decision
6. Offer Extended
7. Closed - Rejected
8. Closed - Declined
9. Closed - Position Closed
10. Closed - Accepted

**Source:**
- Job Board
- LinkedIn
- Company Website
- Employee Referral
- Other

**Hiring Decision:**
- Top Choice
- Backup
- Not Suitable Candidate
- Hiring Process Restarted

#### Validation Rules

**Application Date Cannot Be Changed:**
- **Active:** Yes
- **Error Condition:** `ISCHANGED(Application_Date__c)`
- **Error Message:** "Application Data should not be Changed."
- **Description:** Prevents modification of the Application Date field after initial submission to maintain data integrity and provide an accurate audit trail.

#### Key Features
- **History Tracking**: Tracks Status and Stage changes for application
- **Restrict Delete**: Prevents deletion of Candidate or Position with active applications
- **Multi-stage Pipeline**: 9-stage application workflow
- **Source Tracking**: Records application source for analytics
- **Custom Record Page**: Lightning record page for job application records
- **Feed Tracking**: Disabled for this object

---

### 4. Review

**API Name:** `Review__c`  
**Label:** Review  
**Plural Label:** Reviews  
**Object Purpose:** Stores interviewer feedback for job applications

#### Object Configuration
| Property                   | Value                                                                             |
|----------------------------|-----------------------------------------------------------------------------------|
| **Deployment Status**      | Deployed                                                                          |
| **Sharing Model**          | Controlled By Parent                                                              |
| **External Sharing Model** | Controlled By Parent                                                              |
| **Record Name**            | Auto Number: RV-{YY}{MM}-{0000}                                                   |
| **Activities Enabled**     | Yes                                                                               |
| **History Tracking**       | Yes                                                                               |
| **Feeds Enabled**          | No                                                                                |
| **Reports Enabled**        | Yes                                                                               |
| **Search Enabled**         | No                                                                                |
| **Description**            | Stores feedback from an interviewer for a specific interview of a Job Application |

#### Fields

| Field Name      | API Name             | Type           | Required | Description                                        |
|-----------------|----------------------|----------------|----------|----------------------------------------------------|
| Review Number   | Name                 | Auto Number    | Yes      | Format: RV-{YY}{MM}-{0000}                         |
| Job Application | `Job_Application__c` | Master-Detail  | Yes      | Parent job application                             |
| Interviewer     | `Interviewer__c`     | Lookup(User)   | No       | User who conducted interview                       |
| Interview Stage | `Interview_Stage__c` | Picklist       | No       | Stage of interview (Phone Screen, Technical, etc.) |
| Rating          | `Rating__c`          | Picklist       | Yes      | Overall candidate rating (1-5 scale)               |
| Strengths       | `Strengths__c`       | Long Text Area | No       | Candidate strengths noted                          |
| Concerns        | `Concerns__c`        | Long Text Area | No       | Concerns or weaknesses                             |
| Recommendation  | `Recommendation__c`  | Picklist       | Yes      | Hiring recommendation                              |
| Internal Notes  | `Internal_Notes__c`  | Long Text Area | No       | Private interviewer notes                          |

#### Picklist Values

**Interview Stage:**
- Phone Screen
- Technical Interview
- Hiring Manager Interview
- Final Panel

**Rating:**
- 5 - Excellent
- 4 - Good
- 3 - Average
- 2 - Below Average
- 1 - Poor

**Recommendation:**
- Strong Hire
- Hire
- No Hire
- Strong No Hire

#### Master-Detail Relationship
- **Parent Object:** Job_Application__c
- **Relationship Name:** Reviews
- **Relationship Label:** Reviews
- **Relationship Order:** 0
- **Reparentable:** No
- **Cascade Delete:** Yes (if parent is deleted)

#### Key Features
- **Master-Detail Relationship**: Inherits sharing from Job Application
- **Cascade Delete**: Automatically deleted when parent application is deleted
- **Structured Feedback**: Standardized rating and recommendation system
- **Confidential**: Search disabled, not visible in public contexts
- **History Tracking**: Enabled for audit trail

---

### 5. ContentVersion (Standard Object - Custom Field)

**API Name:** `ContentVersion`  
**Label:** Content Version  
**Object Purpose:** Salesforce standard object for managing files and documents. Custom field documented below.

#### Custom Field

| Field Name                      | API Name                            | Type      | Required | Description                                                           |
|---------------------------------|-------------------------------------|-----------|----------|-----------------------------------------------------------------------|
| Career Guest Record File Upload | `Career_Guest_Record_fileupload__c` | Text(255) | No       | Reference ID to associate guest-uploaded files with Candidate records |

**Field Details:**
- Used to link files uploaded by guest users (non-authenticated) on the careers portal
- Stores reference identifier to match uploaded documents with candidate records
- Max length: 255 characters
- Not an external ID
- Not unique

---

## Object Relationships

### 1. Position → Job Application
- **Type:** Lookup (One-to-Many)
- **Field:** `Position__c` on Job Application
- **Related List Label:** Applications
- **Delete Behavior:** Restrict (cannot delete Position with applications)

### 2. Candidate → Job Application
- **Type:** Lookup (One-to-Many)
- **Field:** `Candidate__c` on Job Application
- **Related List Label:** Jobs Applied
- **Delete Behavior:** Restrict (cannot delete Candidate with applications)

### 3. Job Application → Review
- **Type:** Master-Detail (One-to-Many)
- **Field:** `Job_Application__c` on Review
- **Related List Label:** Reviews
- **Delete Behavior:** Cascade (Reviews deleted with parent)
- **Sharing:** Reviews inherit sharing from Job Application

### 4. Position → Hiring Manager
- **Type:** Lookup (Many-to-One)
- **Field:** `Hiring_Manager__c` on Position
- **References:** User object
- **Delete Behavior:** Set Null

### 5. Review → Interviewer
- **Type:** Lookup (Many-to-One)
- **Field:** `Interviewer__c` on Review
- **References:** User object
- **Delete Behavior:** Standard (Set Null)

---

## Field Reference Tables

### Data Types Summary

| Object          | Text | Number | Email | Phone | Date | Picklist | Checkbox | Long Text Area | Text Area | URL | Lookup | Master-Detail | Formula | Auto Number |
|-----------------|------|--------|-------|-------|------|----------|----------|----------------|-----------|-----|--------|---------------|---------|-------------|
| Candidate       | 12   | 1      | 1     | 2     | 1    | 3        | 2        | 1              | 0         | 1   | 0      | 0             | 1       | 1           |
| Position        | 1    | 2      | 0     | 0     | 1    | 6        | 1        | 2              | 1         | 0   | 1      | 0             | 1       | 0           |
| Job Application | 0    | 0      | 0     | 0     | 1    | 4        | 0        | 1              | 0         | 0   | 2      | 0             | 0       | 1           |
| Review          | 0    | 0      | 0     | 0     | 0    | 3        | 0        | 3              | 0         | 0   | 1      | 1             | 0       | 1           |

### Required Fields by Object

#### Candidate (Required: 4)
- Candidate Number (Auto Number)
- First Name
- Date of Birth
- Email

#### Position (Required: 4)
- Title
- Number of Openings
- Application Deadline
- Experience Level

#### Job Application (Required: 4)
- Job Application Number (Auto Number)
- Candidate (Lookup)
- Position (Lookup)
- Stage

#### Review (Required: 4)
- Review Number (Auto Number)
- Job Application (Master-Detail)
- Rating
- Recommendation

### Unique Fields

| Object    | Field                | External ID |
|-----------|----------------------|-------------|
| Candidate | Email                | Yes         |
| Candidate | PAN Card Number      | No          |
| Candidate | Photo Document Id    | No          |
| Candidate | Identity Document Id | No          |

### Fields with History Tracking

#### Candidate
- History tracking enabled at object level
- All standard trackable fields are tracked

#### Job Application
- Status (Tracked)
- Stage (Tracked)
- History enabled at object level

#### Review
- History enabled at object level

---

## Business Logic & Validation Rules

### Validation Rules Summary

#### Candidate Object

**Valid PAN Card Format:**
- **Active:** No
- Enforces Indian tax ID format (XXXXX9999X)
- Prevents data entry errors
- Ensures data quality for government verification
- **Note:** Currently inactive but available for activation if needed

#### Job Application Object

**Application Date Cannot Be Changed:**
- Maintains data integrity of submission timestamp
- Provides accurate audit trail
- Prevents backdating or manipulation of application timeline

### Sharing and Security

#### Candidate
- **Sharing Model:** Read/Write
- **External Sharing:** Read/Write
- Users can view and edit candidates they have access to
- Full CRUD access for authorized users

#### Position
- **Sharing Model:** Read
- **External Sharing:** Read
- Read-only access for most users
- Controlled by organization hierarchy and manual sharing

#### Job Application
- **Sharing Model:** Read
- **External Sharing:** Read
- Read-only access for authorized users
- Links Candidate and Position access
- History tracking for compliance

#### Review
- **Sharing Model:** Controlled By Parent
- Inherits sharing from Job Application
- Cannot be shared independently

### Delete Constraints

#### Restrict Delete
- **Position:** Cannot be deleted if Applications exist
- **Candidate:** Cannot be deleted if Applications exist

#### Cascade Delete
- **Review:** Automatically deleted when Job Application is deleted

### Data Integrity

#### Unique Constraints
- **Candidate.Email:** Case-sensitive unique constraint, External ID
- **Candidate.PAN_Card_Number:** Case-insensitive unique constraint (10 characters)
- **Candidate.Photo_Document_Id:** Unique ContentDocument ID (system-managed)
- **Candidate.Identity_Document_Id:** Unique ContentDocument ID for identity documents (system-managed)
- Prevents duplicate candidate records by email and PAN number

#### Required Relationships
- Job Application MUST have both Candidate and Position
- Review MUST have parent Job Application

### Workflow Stages

The application follows a defined lifecycle through Stage picklist:

1. **New** → Initial application received, no recruiter assigned yet
2. **Phone Screen** → Recruiter assigned, phone screening in progress
3. **Schedule Interviews** → Coordinating interviews
4. **Technical Interview** → Technical interview scheduled or in progress
5. **Manager Interview** → Managerial interview scheduled or in progressmanager
6. **HR Interview** → HR interview scheduled or in progress
7. **Hiring decision** → Hiring decision being made
8. **Offer Extended** → Job offer made and the time for accepting it has been lengthened
9. **Closed - Rejected** → Application rejected
10. **Closed - Declined** → Candidate declined offer
11. **Closed - Position Closed** → Position filled/cancelled
12. **Closed - Accepted** → Offer accepted, hire complete

### Data Privacy Compliance

#### Candidate Privacy
- **PAN Card Number:** Required unique field for identity verification
- **Identity Document fields:** Track official identification documents
- **Documents Verified:** HR checkbox to confirm verification of all documents
- System maintains audit trail through history tracking

---

## Additional Configuration

### API Features Enabled

| Feature          | Candidate | Position | Job Application | Review |
|------------------|-----------|----------|-----------------|--------|
| Bulk API         | ✓         | ✓        | ✓               | ✓      |
| Streaming API    | ✓         | ✓        | ✓               | ✓      |
| Reports          | ✓         | ✓        | ✓               | ✓      |
| Activities       | ✓         | ✓        | ✓               | ✓      |
| History Tracking | ✓         | ✗        | ✓               | ✓      |
| Feed Tracking    | ✓         | ✓        | ✗               | ✗      |
| Search           | ✓         | ✓        | ✓               | ✗      |
| Chatter Groups   | ✓         | ✗        | ✓               | ✓      |

---

## Best Practices

### When Creating Records

1. **Candidate Records:**
   - Email must be unique - check before creating
   - PAN Card Number is optional but must be unique if provided and follow format (5 letters, 4 digits, 1 letter)
   - First Name, Date of Birth, and Email are required
   - Last Name is optional
   - Include complete contact information
   - Upload passport-sized photo with "Photo" or "Picture" in filename
   - Upload identity document and system will store ContentDocument ID
   - HR must verify all documents before final approval using Documents Verified checkbox

2. **Position Records:**
   - Assign Hiring Manager for workflow routing
   - Set Experience Level (Professional, Entry Level, or Internship)
   - Set Application Deadline to manage candidate expectations
   - Define Number of Openings for capacity tracking

3. **Job Application Records:**
   - Both Candidate and Position are required
   - Track Source for recruitment analytics
   - Progress through Stage systematically
   - Use Hiring Decision field to record final hiring determination (Top Choice, Backup, Not Suitable Candidate, Hiring Process Restarted)

4. **Review Records:**
   - Created per interview round
   - Rating and Recommendation are both required for consistency
   - Link to specific Interviewer for accountability
   - Select appropriate Interview Stage

### Data Maintenance

- **Email Changes:** Update Candidate email carefully (unique constraint)
- **PAN Card Updates:** Cannot be changed once set (unique constraint with history tracking) - validated by regex pattern
- **Identity Documents:** Track changes via history tracking for audit compliance
- **Document IDs:** System automatically populates Photo Document Id and Identity Document Id when files are uploaded
- **Document Verification:** HR must check Documents Verified after validating all uploads
- **Application Date:** Cannot be modified after submission (validation rule protects data integrity)
- **Closing Positions:** Update Status to prevent new applications
- **Application Stages:** Use consistent stage progression
- **Review Feedback:** Complete all sections including Rating and Recommendation for quality hiring decisions

---

## Appendix

### Field Naming Conventions

All custom fields follow Salesforce naming conventions:
- Suffix: `__c` for custom fields
- Format: Pascal_Case_With_Underscores

### API Names Quick Reference

| Object Label    | API Name             | Record Name Format | Prefix             |
|-----------------|----------------------|--------------------|--------------------|
| Candidate       | `Candidate__c`       | Auto Number        | C-{YY}{MM}{0000}   |
| Position        | `Position__c`        | Text (Title)       | -                  |
| Job Application | `Job_Application__c` | Auto Number        | J-{YY}{MM}{0000}   |
| Review          | `Review__c`          | Auto Number        | RV-{YY}{MM}-{0000} |

### Global Value Sets

| Global Value Set | Used By                | Description                               |
|------------------|------------------------|-------------------------------------------|
| Department       | Position.Department__c | Standardized department values across org |

### Picklist Summary by Object

| Object          | Standard Picklists                                              | Multi-Select Picklists | Global Value Sets                |
|-----------------|-----------------------------------------------------------------|------------------------|----------------------------------|
| Candidate       | 3 (Salutation, Highest Education Level, Identity Document Type) | 0                      | 0                                |
| Position        | 5 (Status, Location, Salary Range, Approval Status, Pay Grade)  | 0                      | 2 (Department, Experience Level) |
| Job Application | 4 (Status, Stage, Source, Hiring Decision)                      | 0                      | 0                                |
| Review          | 3 (Interview Stage, Rating, Recommendation)                     | 0                      | 0                                |

---

**End of Documentation**

*For questions or updates to this schema, please contact your Salesforce Administrator.*
