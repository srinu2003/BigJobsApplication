# Security Model Documentation

**Project:** Big Job Application  
**Version:** 1.0  
**Last Updated:** 20-11-2025  
**Owner:** Srinivas Rao T

---

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Profiles](#profiles)
4. [Permission Sets](#permission-sets)
5. [Roles](#roles)
6. [Object Sharing Model](#object-sharing-model)
7. [Permission Matrices](#permission-matrices)
8. [Record Access Flow](#record-access-flow)
9. [Implementation Steps](#implementation-steps)
10. [Access Matrix Summary](#access-matrix-summary)

---

## Overview

### Purpose
This document defines the security model for the Big Job Application, covering Object-Level Security, Field-Level Security, and Record-Level Security using Salesforce's declarative security features.

### Security Layers
- **Object-Level Security** → Profiles + Permission Sets
- **Field-Level Security** → Profiles + Permission Sets  
- **Record-Level Security** → Roles + Sharing Rules + Manual Sharing

### Key Principles
- **Least Privilege:** Users receive minimum necessary permissions by default
- **Context-Based Access:** Permission Sets grant additional access based on recruitment involvement
- **Data Protection:** Sensitive PII (PAN Card, Identity Documents) visible only to authorized roles; automated fields are system-managed
- **Data Preservation:** Candidate records cannot be deleted to maintain analytics and history tracking
- **Flexible Assignment:** Employees can have multiple recruitment roles simultaneously

---

## Security Architecture

### Foundation Model
![Security Architecture Diagram](https://sf-zdocs-cdn-prod.zoominsoftware.com/tdta-access-258-0-0-production-enus/d5993fa9-e99f-47bf-bee5-41ba91f27165/access/images/data_access_all.png)

### Core Concept

> **Profiles** = WHO they are in the organization  
> **Permission Sets** = WHAT they can do in recruitment context  
> **Roles** = Department hierarchy for reporting  
> **Sharing** = WHICH records they can access

---

## Profiles

### Profile Strategy

| Profile                     | User Type           | Base Permissions                     | Purpose                                                       |
|-----------------------------|---------------------|--------------------------------------|---------------------------------------------------------------|
| **Custom: Human Resources** | HR Team             | Full CRUD on all recruitment objects | HR administrators who manage entire recruitment lifecycle     |
| **Standard User**           | All other employees | Read-only on Position__c             | Base profile for employees who MAY participate in recruitment |

---

### Profile: Custom: Human Resources

**Description:** HR administrators with full access to manage the entire recruitment lifecycle, including candidate data, positions, applications, and reviews.

**Intended Users:** HR Team, HR Managers, Talent Acquisition Leader

**Access Level:** Full Control over recruitment objects

#### Object Permissions

| Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------|------|--------|------|--------|----------|------------|
| Position__c        | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| Candidate__c       | ✓    | ✓      | ✓    |        | ✓        |            |
| Job_Application__c | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| Review__c          | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |

**Note:** Candidates cannot be deleted to preserve analytics and candidate history tracking.

#### System Permissions

- [x] View All Data
- [x] Modify All Data
- [x] Manage Users
- [x] View Setup and Configuration
- [x] Customize Application
- [x] API Enabled
- [x] View Public Reports
- [x] Run Reports
- [x] Export Reports
- [x] Create and Customize Reports
- [x] Transfer Record

#### Field-Level Security

**All Fields:** Visible and Editable (except system-managed and formula fields)

**Candidate__c:** (Full Access to All Fields)
| Field Name                  | Read | Edit             |
|-----------------------------|------|------------------|
| Salutation__c               | ✓    | ✓                |
| First_Name__c               | ✓    | ✓                |
| Last_Name__c                | ✓    | ✓                |
| Email__c                    | ✓    | ✓                |
| Phone__c                    | ✓    | ✓                |
| Mobile__c                   | ✓    | ✓                |
| Date_of_Birth__c            | ✓    | ✓                |
| LinkedIn_Profile__c         | ✓    | ✓                |
| Street_Address_1__c         | ✓    | ✓                |
| Street_Address_2__c         | ✓    | ✓                |
| City__c                     | ✓    | ✓                |
| State_Province__c           | ✓    | ✓                |
| Zip_Postal_Code__c          | ✓    | ✓                |
| Country__c                  | ✓    | ✓                |
| Years_of_Experience__c      | ✓    | ✓                |
| Highest_Education_Level__c  | ✓    | ✓                |
| Currently_Employed__c       | ✓    | ✓                |
| Current_Employer__c         | ✓    | ✓                |
| Work_Experience_Notes__c    | ✓    | ✓                |
| PAN_Card_Number__c          | ✓    | ✓                |
| Identity_Document_Number__c | ✓    | ✓                |
| Identity_Document_Type__c   | ✓    | ✓                |
| Identity_Document_Id__c     | ✓    | (System-Managed) |
| Photo_Document_Id__c        | ✓    | (System-Managed) |
| Profile_Photo__c            | ✓    | (Formula Field)  |
| Documents_Verified__c       | ✓    | ✓                |
| Reference_ID__c             | ✓    | ✓                |

**Note:** System-managed fields (`Identity_Document_Id__c`, `Photo_Document_Id__c`) are automatically populated by triggers when documents are uploaded. Formula field (`Profile_Photo__c`) is read-only by design.

**Position__c:** (Full Access to All Fields)
| Field Name              | Read | Edit            |
|-------------------------|------|-----------------|
| Name (Title)            | ✓    | ✓               |
| Job_Description__c      | ✓    | ✓               |
| Department__c           | ✓    | ✓               |
| Location__c             | ✓    | ✓               |
| Salary_Range__c         | ✓    | ✓               |
| Pay_Grade__c            | ✓    | ✓               |
| Experience_Level__c     | ✓    | ✓               |
| Status__c               | ✓    | ✓               |
| Approval_Status__c      | ✓    | ✓               |
| Hiring_Manager__c       | ✓    | ✓               |
| Number_of_Openings__c   | ✓    | ✓               |
| Filled_Openings__c      | ✓    | ✓               |
| Remaining_Openings__c   | ✓    | (Formula Field) |
| Application_Deadline__c | ✓    | ✓               |
| Education__c            | ✓    | ✓               |
| Skills_Required__c      | ✓    | ✓               |
| Notified_Owner__c       | ✓    | ✓               |

**Note:** `Remaining_Openings__c` is a formula field (Number_of_Openings - Filled_Openings) and is read-only for all users.

**Job_Application__c:** (Full Access to All Fields)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Candidate__c        | ✓    | ✓    |
| Position__c         | ✓    | ✓    |
| Application_Date__c | ✓    | ✓    |
| Status__c           | ✓    | ✓    |
| Stage__c            | ✓    | ✓    |
| Source__c           | ✓    | ✓    |
| Hiring_Decision__c  | ✓    | ✓    |
| Cover_Letter__c     | ✓    | ✓    |

**Review__c:** (Full Access to All Fields)
| Field Name         | Read | Edit |
|--------------------|------|------|
| Job_Application__c | ✓    | ✓    |
| Interviewer__c     | ✓    | ✓    |
| Interview_Stage__c | ✓    | ✓    |
| Rating__c          | ✓    | ✓    |
| Strengths__c       | ✓    | ✓    |
| Concerns__c        | ✓    | ✓    |
| Recommendation__c  | ✓    | ✓    |
| Internal_Notes__c  | ✓    | ✓    |

**Summary:** HR Profile has complete visibility and edit access to all fields across all recruitment objects, with the only restrictions being system-managed fields and formula fields which are inherently read-only.

---

### Profile: Standard User

**Description:** Base profile for all employees. Minimal recruitment access by default. Additional access granted through Permission Sets and Sharing based on recruitment involvement.

**Intended Users:** All employees (Managers, Team Leads, Developers, etc.)

**Access Level:** Read Only (Base)

Read access is set to Position__c for viewing open job positions only.

#### Object Permissions

| Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------|------|--------|------|--------|----------|------------|
| Position__c        | ✓    |        |      |        |          |            |
| Candidate__c       |      |        |      |        |          |            |
| Job_Application__c |      |        |      |        |          |            |
| Review__c          |      |        |      |        |          |            |

**Note:** Additional access granted via Permission Sets when assigned recruitment roles.

#### System Permissions

- [x] View Public Reports
- [x] Run Reports
- [ ] Export Reports
- [ ] Create and Customize Reports
- [ ] API Enabled
- [ ] View Setup and Configuration
- [ ] Modify All Data
- [ ] Transfer Record

#### Field-Level Security

**Position__c:** (Base Access - Open Positions)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Name (Title)        | ✓    |      |
| Department__c       | ✓    |      |
| Location__c         | ✓    |      |
| Status__c           | ✓    |      |
| Experience_Level__c | ✓    |      |
| Job_Description__c  | ✓    |      |

**Candidate__c, Job_Application__c, Review__c:**
- No base access (granted via Permission Sets)

---

## Permission Sets

### Permission Set Strategy

Permission Sets provide **additive access** to employees based on their recruitment involvement. They enable the same person to have different roles in different recruitment contexts.

| Permission Set         | Assigned To                            | Use Case                                         |
|------------------------|----------------------------------------|--------------------------------------------------|
| **Hiring Manager**     | Employees managing a specific position | When employee is responsible for hiring decision |
| **Panel Interviewer**  | Employees conducting interviews        | When employee evaluates candidates technically   |
| **Talent Acquisition** | Employees acting as recruiters         | When employee manages recruitment operations     |

---

### Permission Set: Hiring Manager

**API Name:** `Hiring_Manager`

**Description:** Grants additional permissions to employees who are Hiring Managers for specific positions. Allows them to edit positions, manage applications, and make hiring decisions.

**Assignment:** Automatically assigned when user is designated as Hiring Manager for a Position__c record.

#### Object Permissions

| Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------|------|--------|------|--------|----------|------------|
| Position__c        | ✓    |        | ✓    |        |          |            |
| Candidate__c       | ✓    |        |      |        |          |            |
| Job_Application__c | ✓    |        | ✓    |        |          |            |
| Review__c          | ✓    | ✓      | ✓    | ✓      |          |            |

#### Field-Level Security

**Candidate__c:** (Additional Sensitive Fields)
| Field Name                  | Read | Edit             |
|-----------------------------|------|------------------|
| First_Name__c               | ✓    |                  |
| Last_Name__c                | ✓    |                  |
| Email__c                    | ✓    |                  |
| Phone__c                    | ✓    |                  |
| Mobile__c                   | ✓    |                  |
| Date_of_Birth__c            | ✓    |                  |
| PAN_Card_Number__c          | ✓    |                  |
| Identity_Document_Number__c | ✓    |                  |
| Identity_Document_Type__c   | ✓    |                  |
| Identity_Document_Id__c     | ✓    | (System-Managed) |
| Photo_Document_Id__c        | ✓    | (System-Managed) |
| Years_of_Experience__c      | ✓    |                  |
| Highest_Education_Level__c  | ✓    |                  |
| Work_Experience_Notes__c    | ✓    |                  |
| Documents_Verified__c       | ✓    |                  |

**Note:** `Identity_Document_Id__c` and `Photo_Document_Id__c` are automatically populated when documents are uploaded via the file upload system.

**Position__c:** (All Fields)
| Field Name              | Read | Edit |
|-------------------------|------|------|
| Name (Title)            | ✓    | ✓    |
| Job_Description__c      | ✓    | ✓    |
| Department__c           | ✓    | ✓    |
| Location__c             | ✓    | ✓    |
| Salary_Range__c         | ✓    | ✓    |
| Pay_Grade__c            | ✓    | ✓    |
| Experience_Level__c     | ✓    | ✓    |
| Status__c               | ✓    | ✓    |
| Approval_Status__c      | ✓    | (Workflow-Controlled) |
| Hiring_Manager__c       | ✓    | ✓    |
| Number_of_Openings__c   | ✓    | ✓    |
| Filled_Openings__c      | ✓    | ✓    |
| Application_Deadline__c | ✓    | ✓    |
| Education__c            | ✓    | ✓    |
| Skills_Required__c      | ✓    | ✓    |
| Notified_Owner__c       | ✓    | ✓    |

**Note:** `Approval_Status__c` is controlled by approval workflow and should not be manually edited. Field is visible but not editable by Hiring Managers.

**Job_Application__c:** (All Fields)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Status__c           | ✓    | ✓    |
| Stage__c            | ✓    | ✓    |
| Hiring_Decision__c  | ✓    | ✓    |
| Source__c           | ✓    | ✓    |
| Cover_Letter__c     | ✓    | ✓    |
| Application_Date__c | ✓    |      |

**Review__c:** (All Fields - Full CRUD)
| Field Name        | Read | Edit |
|-------------------|------|------|
| Rating__c         | ✓    | ✓    |
| Recommendation__c | ✓    | ✓    |
| Strengths__c      | ✓    | ✓    |
| Concerns__c       | ✓    | ✓    |
| Internal_Notes__c | ✓    | ✓    |

---

### Permission Set: Panel Interviewer

**API Name:** `Panel_Interviewer`

**Description:** Grants read access to candidates and applications, with ability to create interview feedback. Interviewers can only view information necessary for technical evaluation.

**Assignment:** Automatically assigned when user is designated as Interviewer for a Position__c record.

#### Object Permissions

| Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------|------|--------|------|--------|----------|------------|
| Position__c        | ✓    |        |      |        |          |            |
| Candidate__c       | ✓    |        |      |        |          |            |
| Job_Application__c | ✓    |        |      |        |          |            |
| Review__c          | ✓    | ✓      | ✓    |        |          |            |

**Note:** Edit access on Review__c limited to reviews created by the user (enforced via record ownership).

#### Field-Level Security

**Candidate__c:** (Limited to Professional Information)
| Field Name                      | Read       | Edit |
|---------------------------------|------------|------|
| First_Name__c                   | ✓          |      |
| Last_Name__c                    | ✓          |      |
| Email__c                        | ✓          |      |
| Phone__c                        | ✓          |      |
| Mobile__c                       | ✓          |      |
| LinkedIn_Profile__c             | ✓          |      |
| Years_of_Experience__c          | ✓          |      |
| Highest_Education_Level__c      | ✓          |      |
| Work_Experience_Notes__c        | ✓          |      |
| Currently_Employed__c           | ✓          |      |
| Current_Employer__c             | ✓          |      |
| **PAN_Card_Number__c**          | **Hidden** |      |
| **Identity_Document_Number__c** | **Hidden** |      |
| **Identity_Document_Id__c**     | **Hidden** |      |
| **Photo_Document_Id__c**        | **Hidden** |      |

**Position__c:** (Job Requirements)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Name (Title)        | ✓    |      |
| Job_Description__c  | ✓    |      |
| Department__c       | ✓    |      |
| Location__c         | ✓    |      |
| Experience_Level__c | ✓    |      |
| Skills_Required__c  | ✓    |      |
| Education__c        | ✓    |      |

**Job_Application__c:** (Read-Only Status)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Stage__c            | ✓    |      |
| Status__c           | ✓    |      |
| Cover_Letter__c     | ✓    |      |
| Application_Date__c | ✓    |      |

**Review__c:** (Create Own Reviews)
| Field Name         | Read | Edit |
|--------------------|------|------|
| Interview_Stage__c | ✓    | ✓    |
| Rating__c          | ✓    | ✓    |
| Recommendation__c  | ✓    | ✓    |
| Strengths__c       | ✓    | ✓    |
| Concerns__c        | ✓    | ✓    |
| Internal_Notes__c  | ✓    | ✓    |
| Interviewer__c     | ✓    | ✓    |

---

### Permission Set: Talent Acquisition

**API Name:** `Talent_Acquisition`

**Description:** Grants permissions for employees acting as recruiters. Allows creating candidates, managing applications, and coordinating the recruitment process.

**Assignment:** Manually assigned to employees who handle recruitment operations (no dedicated Recruiter profile in organization).

#### Object Permissions

| Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------|------|--------|------|--------|----------|------------|
| Position__c        | ✓    | ✓      | ✓    |        |          |            |
| Candidate__c       | ✓    | ✓      | ✓    |        |          |            |
| Job_Application__c | ✓    | ✓      | ✓    |        |          |            |
| Review__c          | ✓    |        |      |        |          |            |

**Note:** Cannot create or edit Reviews (not an interviewer/evaluator role).

#### Field-Level Security

**Candidate__c:** (Full Access except restricted PII)
| Field Name                  | Read | Edit             |
|-----------------------------|------|------------------|
| First_Name__c               | ✓    | ✓                |
| Last_Name__c                | ✓    | ✓                |
| Email__c                    | ✓    | ✓                |
| Phone__c                    | ✓    | ✓                |
| Mobile__c                   | ✓    | ✓                |
| Date_of_Birth__c            | ✓    | ✓                |
| LinkedIn_Profile__c         | ✓    | ✓                |
| Years_of_Experience__c      | ✓    | ✓                |
| Highest_Education_Level__c  | ✓    | ✓                |
| Currently_Employed__c       | ✓    | ✓                |
| Current_Employer__c         | ✓    | ✓                |
| Work_Experience_Notes__c    | ✓    | ✓                |
| PAN_Card_Number__c          | ✓    | (Read-only)      |
| Identity_Document_Number__c | ✓    | (Read-only)      |
| Identity_Document_Type__c   | ✓    | (Read-only)      |
| Identity_Document_Id__c     | ✓    | (System-Managed) |
| Photo_Document_Id__c        | ✓    | (System-Managed) |

**Note:** System-managed fields are automatically populated by triggers/automation when documents are uploaded.

**Position__c:** (All Fields)
| Field Name          | Read | Edit |
|---------------------|------|------|
| All Position fields | ✓    | ✓    |

**Job_Application__c:** (All Fields)
| Field Name          | Read | Edit |
|---------------------|------|------|
| Status__c           | ✓    | ✓    |
| Stage__c            | ✓    | ✓    |
| Source__c           | ✓    | ✓    |
| Application_Date__c | ✓    | ✓    |
| Cover_Letter__c     | ✓    | ✓    |
| Hiring_Decision__c  | ✓    |      |

---

## Roles

### Role Hierarchy Purpose

Roles enable:
- **Reporting Structure:** View reports from subordinates
- **Record Access:** "Grant Access Using Hierarchies" for visibility
- **Department Management:** Department heads see their team's recruitment activities

### Role Structure

```
CEO / Management
    ├── HR Department
    │   ├── HR Manager
    │   └── HR Team Members
    ├── Engineering Department
    │   ├── Engineering Director
    │   ├── Engineering Managers
    │   └── Engineering Team
    ├── Sales Department
    │   ├── Sales Director
    │   ├── Sales Managers
    │   └── Sales Team
    ├── Marketing Department
    │   ├── Marketing Director
    │   ├── Marketing Managers
    │   └── Marketing Team
    └── [Other Departments...]
```

### Role Assignment Guidelines

| User Type               | Role Assignment                              |
|-------------------------|----------------------------------------------|
| HR Team                 | HR Department → HR Team Members              |
| Department Heads        | [Department] → [Department] Director/Manager |
| Team Leads              | [Department] → [Department] Managers         |
| Individual Contributors | [Department] → [Department] Team             |

---

## Object Sharing Model

### Organization-Wide Defaults (OWD)

| Object                 | OWD Setting          | Rationale                                         | Grant Access Using Hierarchies |
|------------------------|----------------------|---------------------------------------------------|--------------------------------|
| **Position__c**        | Private              | Only recruitment team should see position details | ✓ Enabled                      |
| **Candidate__c**       | Private              | PII protection - sensitive personal information   | ✓ Enabled                      |
| **Job_Application__c** | Private              | Confidential hiring evaluations and decisions     | ✓ Enabled                      |
| **Review__c**          | Controlled by Parent | Automatically inherits from Job_Application__c    | N/A (Master-Detail)            |

### Sharing Mechanisms

#### 1. Manual Sharing (Apex Sharing)
- **When:** User assigned as Hiring Manager or Interviewer for a position
- **Access Level:**
  - Hiring Manager → Edit access to Position and Applications
  - Interviewer → Read access to Position and Applications

#### 2. Role Hierarchy
- **Automatic:** Managers can see records owned by their subordinates
- **Use Case:** Department heads see all recruitment in their department

#### 3. Sharing Rules
- **Criteria-Based:** Share open positions with all users (read-only)
- **Owner-Based:** Share positions owned by HR with department managers

---

## Permission Matrices

### Complete Object Permissions Matrix

| Profile/Permission Set   | Object             | Read | Create | Edit | Delete | View All | Modify All |
|--------------------------|--------------------|------|--------|------|--------|----------|------------|
| **HR Profile**           | Position__c        | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| **HR Profile**           | Candidate__c       | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| **HR Profile**           | Job_Application__c | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| **HR Profile**           | Review__c          | ✓    | ✓      | ✓    | ✓      | ✓        | ✓          |
| **Standard User**        | Position__c        | ✓    |        |      |        |          |            |
| **Standard User**        | Candidate__c       |      |        |      |        |          |            |
| **Standard User**        | Job_Application__c |      |        |      |        |          |            |
| **Standard User**        | Review__c          |      |        |      |        |          |            |
| **+ Hiring Manager**     | Position__c        | ✓    |        | ✓    |        |          |            |
| **+ Hiring Manager**     | Candidate__c       | ✓    |        |      |        |          |            |
| **+ Hiring Manager**     | Job_Application__c | ✓    |        | ✓    |        |          |            |
| **+ Hiring Manager**     | Review__c          | ✓    | ✓      | ✓    | ✓      |          |            |
| **+ Panel Interviewer**  | Position__c        | ✓    |        |      |        |          |            |
| **+ Panel Interviewer**  | Candidate__c       | ✓    |        |      |        |          |            |
| **+ Panel Interviewer**  | Job_Application__c | ✓    |        |      |        |          |            |
| **+ Panel Interviewer**  | Review__c          | ✓    | ✓      | ✓*   |        |          |            |
| **+ Talent Acquisition** | Position__c        | ✓    | ✓      | ✓    |        |          |            |
| **+ Talent Acquisition** | Candidate__c       | ✓    | ✓      | ✓    |        |          |            |
| **+ Talent Acquisition** | Job_Application__c | ✓    | ✓      | ✓    |        |          |            |
| **+ Talent Acquisition** | Review__c          | ✓    |        |      |        |          |            |

*Can only edit own reviews (enforced via record ownership)

---

### Field-Level Security Matrix

#### Candidate__c - Sensitive Fields

| Field                       | HR Profile | Hiring Manager | Panel Interviewer | Talent Acquisition | Standard User |
|-----------------------------|------------|----------------|-------------------|--------------------|---------------|
| First_Name__c               | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Last_Name__c                | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Email__c                    | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Phone__c                    | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Mobile__c                   | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| PAN_Card_Number__c          | Read/Edit  | Read           | **Hidden**        | Read               | Hidden        |
| Identity_Document_Number__c | Read/Edit  | Read           | **Hidden**        | Read               | Hidden        |
| Identity_Document_Type__c   | Read/Edit  | Read           | **Hidden**        | Read               | Hidden        |
| Identity_Document_Id__c     | Read       | Read           | **Hidden**        | Read               | Hidden        |
| Photo_Document_Id__c        | Read       | Read           | **Hidden**        | Read               | Hidden        |
| Documents_Verified__c       | Read/Edit  | Read           | Hidden            | Read               | Hidden        |

**Note:** `Identity_Document_Id__c` and `Photo_Document_Id__c` are system-managed fields (auto-populated by triggers) and cannot be edited manually by any user.

#### Position__c - Key Fields

| Field                   | HR Profile | Hiring Manager | Panel Interviewer | Talent Acquisition | Standard User |
|-------------------------|------------|----------------|-------------------|--------------------|---------------|
| Name (Title)            | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Read          |
| Job_Description__c      | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Read          |
| Status__c               | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Read          |
| Experience_Level__c     | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Read          |
| Hiring_Manager__c       | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Number_of_Openings__c   | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Filled_Openings__c      | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Remaining_Openings__c   | Read       | Read           | Hidden            | Read               | Hidden        |
| Application_Deadline__c | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Salary_Range__c         | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Pay_Grade__c            | Read/Edit  | Read/Edit      | Hidden            | Read/Edit          | Hidden        |
| Approval_Status__c      | Read/Edit  | Read           | Hidden            | Read/Edit          | Hidden        |

**Note:** `Remaining_Openings__c` is a formula field (calculated as Number_of_Openings - Filled_Openings) and is read-only for all users. `Approval_Status__c` is controlled by approval workflows and is read-only for Hiring Managers.

#### Job_Application__c - Key Fields

| Field               | HR Profile | Hiring Manager | Panel Interviewer | Talent Acquisition | Standard User |
|---------------------|------------|----------------|-------------------|--------------------|---------------|
| Status__c           | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Hidden        |
| Stage__c            | Read/Edit  | Read/Edit      | Read              | Read/Edit          | Hidden        |
| Hiring_Decision__c  | Read/Edit  | Read/Edit      | Hidden            | Read               | Hidden        |
| Source__c           | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Cover_Letter__c     | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |
| Application_Date__c | Read/Edit  | Read           | Read              | Read/Edit          | Hidden        |

#### Review__c - All Fields

| Field              | HR Profile | Hiring Manager | Panel Interviewer | Talent Acquisition | Standard User |
|--------------------|------------|----------------|-------------------|--------------------|---------------|
| Interview_Stage__c | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Rating__c          | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Recommendation__c  | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Strengths__c       | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Concerns__c        | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Internal_Notes__c  | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |
| Interviewer__c     | Read/Edit  | Read/Edit      | Read/Edit         | Read               | Hidden        |

---

## Record Access Flow

### Scenario 1: New Position Created

```
Step 1: HR creates Position "Senior Java Developer"
        └─ Owner: HR User
        └─ Hiring Manager (lookup field): Rajesh (Sr. Tech Lead)

Step 2: Automatic Actions (via Flow/Apex)
        ├─ Assign "Hiring Manager" permission set to Rajesh
        ├─ Share Position record with Rajesh (Edit access)
        └─ Share Position with Rajesh's Role hierarchy (Read for reporting)

Step 3: Candidates Apply
        ├─ HR/TA creates Candidate records
        ├─ HR/TA creates Job_Application records linked to Position
        └─ Each Application automatically shared with:
            ├─ Rajesh (Edit - because Hiring Manager)
            ├─ HR Team (Edit - because View All permission)
            └─ Department head (Read - via Role hierarchy)
```

### Scenario 2: Interview Panel Assembled

```
Step 1: Rajesh adds interview panel members
        ├─ Priya (Developer) - Technical Round 1
        ├─ Amit (Sr. Developer) - Technical Round 2
        └─ Rajesh (Sr. Tech Lead) - Managerial Round

Step 2: Automatic Actions (via Flow/Apex)
        ├─ Assign "Panel Interviewer" permission set to Priya
        ├─ Assign "Panel Interviewer" permission set to Amit
        ├─ Share Position with Priya & Amit (Read access)
        └─ Share all Job_Applications with Priya & Amit (Read access)

Step 3: Interview Process
        ├─ Priya creates Review for Candidate A (Technical evaluation)
        │   └─ Review visible to: Priya (owner), Rajesh (HM), HR
        ├─ Amit creates Review for Candidate A (Technical Round 2)
        │   └─ Review visible to: Amit (owner), Rajesh (HM), HR
        └─ Rajesh creates Review for Candidate A (Managerial Round)
            └─ Review visible to: Rajesh (owner + HM), HR
```

### Scenario 3: Multiple Positions - Same User, Different Roles

```
Rajesh (Sr. Tech Lead) has two contexts:

Position A: "Senior Java Developer"
        └─ Role: Hiring Manager
        └─ Access: Edit Position, Edit Applications, Create/Edit Reviews
        └─ Permission Set: "Hiring Manager"
        └─ Sees: All candidates, applications, reviews for Position A

Position B: "DevOps Engineer" (Owned by another Hiring Manager)
        └─ Role: Panel Interviewer (Technical Round)
        └─ Access: Read Position, Read Applications, Create Reviews
        └─ Permission Set: "Panel Interviewer"
        └─ Sees: Candidates assigned for his interview, limited fields

Result: Rajesh has BOTH permission sets active simultaneously
        └─ Context determines which permissions apply to which records
```

---

## Implementation Steps

### Phase 1: Profiles ✅

- [x] Create Custom: Human Resources
- [x] Configure Standard User profile base permissions

### Phase 2: Permission Sets

- [ ] Create "Hiring Manager" permission set
  - [ ] Configure object permissions
  - [ ] Configure field-level security
  - [ ] Test assignment and access
  
- [ ] Create "Panel Interviewer" permission set
  - [ ] Configure object permissions
  - [ ] Configure field-level security (hide salary/PII)
  - [ ] Test assignment and access
  
- [ ] Create "Talent Acquisition" permission set
  - [ ] Configure object permissions
  - [ ] Configure field-level security
  - [ ] Test assignment and access

### Phase 3: Roles

- [ ] Design role hierarchy matching organization structure
- [ ] Create department roles (Engineering, Sales, HR, etc.)
- [ ] Create sub-roles (Managers, Team Leads, ICs)
- [ ] Assign roles to existing users
- [ ] Test hierarchy visibility

### Phase 4: Sharing Settings

- [ ] Set Position__c OWD to Private
- [ ] Set Candidate__c OWD to Private
- [ ] Set Job_Application__c OWD to Private
- [ ] Enable "Grant Access Using Hierarchies" for all objects
- [ ] Create sharing rule: Open Positions visible to all (Read)

### Phase 5: Automation (Optional - Manual or Flow)

- [ ] Track position team members (junction object or related list)
- [ ] Auto-assign permission sets when role assigned
- [ ] Auto-share records with team members (Apex Sharing)
- [ ] Auto-remove permission sets when role ends
- [ ] Notification to users when added to recruitment team

### Phase 6: Testing & Validation

- [ ] Test HR Profile access (full CRUD)
- [ ] Test Standard User base access (read open positions only)
- [ ] Test Hiring Manager permission set (edit access)
- [ ] Test Panel Interviewer permission set (read + review creation)
- [ ] Test Talent Acquisition permission set (candidate/application management)
- [ ] Test role hierarchy visibility
- [ ] Test multiple concurrent roles (same user)
- [ ] Validate field-level security (sensitive fields hidden)
- [ ] Test record sharing (manual shares working)

---

## Access Matrix Summary

### Complete User Access Matrix

| User Scenario                               | Base Profile  | Permission Sets        | Position Access        | Candidate Access              | Application Access     | Review Access          |
|---------------------------------------------|---------------|------------------------|------------------------|-------------------------------|------------------------|------------------------|
| **HR Team Member**                          | HR Profile    | None                   | Edit All               | Edit All                      | Edit All               | Edit All               |
| **Standard Employee (no recruitment role)** | Standard User | None                   | Read (open only)       | No access                     | No access              | No access              |
| **Employee as Hiring Manager**              | Standard User | + Hiring Manager       | Edit (shared)          | Read (shared)                 | Edit (shared)          | Create/Edit (full)     |
| **Employee as Panel Interviewer**           | Standard User | + Panel Interviewer    | Read (shared)          | Read (shared, limited fields) | Read (shared)          | Create/Edit (own only) |
| **Employee as Talent Acquisition**          | Standard User | + Talent Acquisition   | Create/Edit (assigned) | Create/Edit (assigned)        | Create/Edit (assigned) | Read (cannot create)   |
| **Employee: HM + Interviewer (multi-role)** | Standard User | + Both permission sets | Context-dependent      | Context-dependent             | Context-dependent      | Create/Edit (all)      |

---
## Example Flow (No code)

**Scenario:**

**Position:** Senior Java Developer  
**Hiring Manager:** Rajesh (Sr. Tech Lead)  
**Interviewers:** 
- Priya (Technical - Round 1)
- Amit (Technical - Round 2)
- Rajesh (Managerial Round)

### Setup in Salesforce:

#### Step 1: **Create Position Record**
- Position Name: Senior Java Developer
- Status: Open
- Hiring Manager: Rajesh (Lookup to User)

#### Step 2: **Assign Interviewers** (Custom Related List or Junction Object)
Create **Position Team Member** records:
- User: Rajesh, Role: Hiring Manager
- User: Priya, Role: Technical Interviewer, Stage: Round 1
- User: Amit, Role: Technical Interviewer, Stage: Round 2
- User: Rajesh, Role: Managerial Interviewer, Stage: Managerial Round

#### Step 3: **Automatic Actions** (via Process Builder / Flow):
1. ✅ Assign "Active Hiring Manager" permission set to Rajesh
2. ✅ Assign "Panel Interviewer" permission set to Priya & Amit
3. ✅ Share Position with:
   - Rajesh (Edit)
   - Priya (Read)
   - Amit (Read)
4. ✅ Share all Job Applications for this position with same access levels

---
## Benefits of This Security Model

### 1. Clear Separation of Concerns
- **HR Profile:** Permanent administrative access for HR team
- **Standard User Profile:** Base organizational access for all employees
- **Permission Sets:** Temporary, context-specific recruitment access

### 2. Maximum Flexibility
- Same employee can have multiple permission sets simultaneously
- Easy to add/remove roles as recruitment needs change
- No profile changes needed for role transitions
- Supports complex scenarios (HM for one position, interviewer for another)

### 3. Strong Security & Data Protection
- Least privilege by default (Standard User has minimal access)
- Sensitive data (PAN, Identity Documents) visible only when needed
- System-managed fields (Photo_Document_Id__c, Identity_Document_Id__c) are read-only for all users
- Candidate records preserved for analytics and history (no delete permission)
- Record access strictly controlled via sharing
- Field-level security prevents unauthorized data exposure

### 4. Auditability & Compliance
- Permission set assignments show who is involved in recruitment
- Clear trail of who has access to what records
- Easy to audit: "Who can see Candidate X's PAN Card?"
- Ownership and access changes logged automatically

### 5. Scalability & Maintainability
- Add new departments/roles without changing security model
- Support unlimited concurrent recruitments per employee
- Easy onboarding: assign permission set → user has access
- Centralized management: change permission set → affects all users

### 6. Organizational Alignment
- Roles mirror actual organization structure
- Department heads see their team's recruitment activities
- Natural hierarchy for reporting and visibility
- No artificial "Recruiter" profile needed

---

## Key Design Decisions

### Why Standard User Instead of Custom Employee Profile?

✅ **Leverage Salesforce Standard Profile:** Reduces maintenance overhead  
✅ **Widely Understood:** Standard User is well-documented  
✅ **Upgrade-Safe:** Less risk of conflicts with Salesforce releases  
✅ **Cost-Effective:** No need to maintain custom profile permissions  

### Why Permission Sets Over Multiple Profiles?

✅ **Flexibility:** One user can have multiple roles  
✅ **Dynamic:** Easy to assign/remove without user record changes  
✅ **Scalable:** Add new roles without profile proliferation  
✅ **Maintainable:** Change one permission set → affects all assigned users  

### Why Private OWD with Sharing?

✅ **Security First:** Explicit access grants (not implicit)  
✅ **Audit Trail:** Know exactly who has access and why  
✅ **Compliance:** GDPR/Privacy requires strict access control  
✅ **Granular Control:** Different access levels per position  

---

## Troubleshooting Guide

### Issue: User can't see Position they're assigned to

**Check:**
1. Is Position shared with user? (Sharing → Check Manual Shares)
2. Does user have appropriate permission set? (User → Permission Set Assignments)
3. Is Position__c OWD set to Private?
4. Is "Grant Access Using Hierarchies" enabled?

### Issue: User can see too much data

**Check:**
1. Does user have "View All" or "Modify All" on object?
2. Is user in role hierarchy with access?
3. Are there sharing rules granting wider access?
4. Does user have HR Profile accidentally?

### Issue: User can't create Review

**Check:**
1. Does user have Panel Interviewer or Hiring Manager permission set?
2. Is Job_Application__c record shared with user?
3. Does user have Create permission on Review__c object?
4. Check field-level security on Review fields

### Issue: Permission Set assignment fails

**Check:**
1. User license compatible with permission set?
2. Conflicting permissions with profile?
3. Governor limits reached (max assignments)?
4. Permission set includes features not enabled in org?

---

## Appendix: Reference Links

### Salesforce Documentation
- [Profiles Overview](https://help.salesforce.com/s/articleView?id=sf.admin_userprofiles.htm)
- [Permission Sets](https://help.salesforce.com/s/articleView?id=sf.perm_sets_overview.htm)
- [Sharing Architecture](https://developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/security_data_access.htm)
- [Organization-Wide Defaults](https://help.salesforce.com/s/articleView?id=sf.sharing_model_fields.htm)

### Best Practices
- [Security Best Practices](https://developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/)
- [Data Access Best Practices](https://architect.salesforce.com/design/decision-guides/sharing)

---

## Document Approval

| Date       | Version | Author         | Changes                              |
|------------|---------|----------------|--------------------------------------|
| 2025-11-20 | 1.0     | Srinivas Rao T | Initial security model documentation |

---

**Document Status:** Completed - Ready for Implementation  
**Next Review Date:** 2025-12-20  
**Owner:** Srinivas Rao T  
**Approver:** [Pending Review]

---

*This document is a living guide and should be updated as the security model evolves.*
