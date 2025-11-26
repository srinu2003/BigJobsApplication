# Role Hierarchy Guide

**Project:** Big Job Application  
**Version:** 1.0  
**Last Updated:** 24-11-2025  
**Owner:** Srinivas Rao T

---

## Role Hierarchy Structure

```
CEO
├── HR_Director
│   └── HR_Manager
│       └── HR_Team
├── Engineering_Director
│   └── Engineering_Manager
│       └── Engineering_Team_Lead
│           └── Engineering_Team
├── Sales_Director
│   └── Sales_Manager
│       └── Sales_Team
├── Marketing_Director
│   └── Marketing_Manager
│       └── Marketing_Team
└── Operations_Director
    └── Operations_Manager
        └── Operations_Team
```

---

## Role Definitions

### Executive Level

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| CEO | `CEO` | Chief Executive Officer - Top management with org-wide visibility | N/A |

### HR Department

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| HR Director | `HR_Director` | Oversees all HR and recruitment activities | CEO |
| HR Manager | `HR_Manager` | Manages recruitment operations and HR processes | HR Director |
| HR Team | `HR_Team` | HR coordinators and talent acquisition specialists | HR Manager |

### Engineering Department

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| Engineering Director | `Engineering_Director` | Head of Engineering Department | CEO |
| Engineering Manager | `Engineering_Manager` | Manages engineering teams and technical recruitment | Engineering Director |
| Engineering Team Lead | `Engineering_Team_Lead` | Senior technical leads who may act as hiring managers | Engineering Manager |
| Engineering Team | `Engineering_Team` | Developers and engineers who may serve as panel interviewers | Engineering Team Lead |

### Sales Department

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| Sales Director | `Sales_Director` | Head of Sales Department | CEO |
| Sales Manager | `Sales_Manager` | Manages sales teams and sales recruitment | Sales Director |
| Sales Team | `Sales_Team` | Sales representatives and account executives | Sales Manager |

### Marketing Department

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| Marketing Director | `Marketing_Director` | Head of Marketing Department | CEO |
| Marketing Manager | `Marketing_Manager` | Manages marketing teams and campaigns | Marketing Director |
| Marketing Team | `Marketing_Team` | Marketing specialists and coordinators | Marketing Manager |

### Operations Department

| Role | API Name | Description | Reports To |
|------|----------|-------------|------------|
| Operations Director | `Operations_Director` | Head of Operations Department | CEO |
| Operations Manager | `Operations_Manager` | Manages operations teams and processes | Operations Director |
| Operations Team | `Operations_Team` | Operations specialists and coordinators | Operations Manager |

---

## Role Assignment Guidelines

### How to Assign Roles to Users

1. **Navigate to Setup → Users → Users**
2. **Click on the user** you want to assign a role to
3. **Click Edit**
4. **Select the appropriate Role** from the dropdown
5. **Click Save**

### Role Assignment Matrix

| User Type | Recommended Role | Example |
|-----------|-----------------|---------|
| HR Leadership | HR Director | VP of Human Resources |
| HR Manager | HR Manager | HR Manager, Talent Acquisition Manager |
| HR Coordinators | HR Team | Recruiter, HR Coordinator, TA Specialist |
| Engineering Leadership | Engineering Director | VP of Engineering, CTO |
| Engineering Managers | Engineering Manager | Engineering Manager, Technical Manager |
| Sr. Tech Leads | Engineering Team Lead | Sr. Technical Lead, Team Lead |
| Developers | Engineering Team | Software Engineer, Sr. Developer |
| Sales Leadership | Sales Director | VP of Sales, Head of Sales |
| Sales Managers | Sales Manager | Sales Manager, Regional Manager |
| Sales Reps | Sales Team | Account Executive, Sales Representative |
| Marketing Leadership | Marketing Director | CMO, VP of Marketing |
| Marketing Managers | Marketing Manager | Marketing Manager, Digital Marketing Manager |
| Marketing Staff | Marketing Team | Marketing Specialist, Content Manager |
| Operations Leadership | Operations Director | COO, VP of Operations |
| Operations Managers | Operations Manager | Operations Manager |
| Operations Staff | Operations Team | Operations Coordinator, Analyst |

---

## Role Hierarchy Benefits for Recruitment

### 1. Visibility Through Hierarchy

When "Grant Access Using Hierarchies" is enabled:
- **Directors** can see all positions/candidates managed by their department
- **Managers** can see positions owned by their team leads
- **Team Leads** can see positions they own

### 2. Reporting Structure

Roles enable:
- Dashboard filters by department
- Reports showing "My Team's Recruitment Activities"
- Department-wide recruitment metrics

### 3. Sharing Rules Based on Roles

Examples:
- Share all Engineering positions with Engineering Director (Read)
- Share HR-owned positions with all Department Directors (Read)
- Share candidate reviews with Hiring Manager's role hierarchy

---

## Deployment Instructions

### Deploy Roles to Salesforce

**Using Salesforce CLI:**

```powershell
# Deploy all roles
sfdx force:source:deploy -p force-app/main/default/roles -u <your-org-alias>

# Or deploy to default org
sfdx force:source:deploy -p force-app/main/default/roles
```

**Using VS Code (Recommended):**

1. Right-click on `force-app/main/default/roles` folder
2. Select "SFDX: Deploy Source to Org"
3. Wait for deployment to complete

**Verify Deployment:**

1. Go to Setup → Roles
2. You should see all the roles created
3. Click on any role to verify the hierarchy

---

## Role Maintenance

### Adding a New Department

1. **Create Role Files:**
   - `[Department]_Director.role-meta.xml`
   - `[Department]_Manager.role-meta.xml`
   - `[Department]_Team.role-meta.xml`

2. **Set Parent Roles:**
   - Director → CEO
   - Manager → Director
   - Team → Manager

3. **Deploy to Org**

### Modifying Hierarchy

To change the reporting structure:

1. Edit the `<parentRole>` element in the role XML file
2. Deploy the updated file
3. Verify changes in Setup → Roles

---

## Integration with Security Model

### How Roles Work with Profiles and Permission Sets

```
User: Rajesh (Sr. Tech Lead)
├── Role: Engineering_Team_Lead
├── Profile: Standard User
└── Permission Sets:
    ├── Hiring_Manager (for Position: Senior Java Dev)
    └── Panel_Interviewer (for Position: DevOps Engineer)
```

**Result:**
- **Role** determines hierarchy visibility
- **Profile** determines base object access
- **Permission Sets** determine recruitment-specific capabilities
- **Sharing** determines which specific records Rajesh can access

### Sharing Rules Using Roles

| Sharing Rule | Object | Shared With | Access Level | Purpose |
|--------------|--------|-------------|--------------|---------|
| Engineering Positions | Position__c | Engineering Director Role | Read | Directors see department positions |
| Open Positions | Position__c | All Internal Users | Read Only | Browse open positions |
| HR Owned Candidates | Candidate__c | HR Director Role | Read/Write | HR manages candidates |

---

## Best Practices

### ✅ Do's

- **Assign one role per user** based on their primary reporting structure
- **Keep hierarchy aligned** with actual organization chart
- **Use roles for reporting** and visibility, not primary access control
- **Enable "Grant Access Using Hierarchies"** for recruitment objects
- **Document role changes** when organization restructures

### ❌ Don'ts

- **Don't create roles for every job title** (use roles for hierarchy only)
- **Don't use roles as permission groups** (use permission sets instead)
- **Don't create circular hierarchies** (must be tree structure)
- **Don't change roles frequently** (impacts sharing calculations)
- **Don't skip role assignment** for users involved in recruitment

---

## Troubleshooting

### Issue: User can't see subordinate's records

**Solutions:**
1. Verify parent-child role relationship in Setup → Roles
2. Check if "Grant Access Using Hierarchies" is enabled for object
3. Ensure OWD is not "Public Read/Write" (hierarchy sharing won't apply)
4. Verify user has correct role assigned

### Issue: Too many users have visibility

**Solutions:**
1. Review role hierarchy structure
2. Check sharing rules based on roles
3. Consider making OWD more restrictive
4. Use Private sharing with explicit shares instead

### Issue: Role deployment fails

**Solutions:**
1. Check XML syntax (roles must reference existing parent roles)
2. Ensure no circular dependencies
3. Deploy parent roles before child roles
4. Verify you have "Manage Roles" permission

---

## Example User Assignments

### Sample Role Assignments

```
User: Sarah Johnson
├── Title: VP of Engineering
├── Role: Engineering_Director
├── Profile: Standard User
└── Permission Sets: None (uses hierarchy for visibility)

User: Rajesh Kumar
├── Title: Sr. Technical Lead
├── Role: Engineering_Team_Lead
├── Profile: Standard User
└── Permission Sets: Hiring_Manager (for Java Dev position)

User: Priya Sharma
├── Title: Software Engineer
├── Role: Engineering_Team
├── Profile: Standard User
└── Permission Sets: Panel_Interviewer (for Java Dev position)

User: Michael Chen
├── Title: HR Manager
├── Role: HR_Manager
├── Profile: Custom: Human Resources Profile
└── Permission Sets: None (profile grants full access)

User: Amit Patel
├── Title: Sales Manager
├── Role: Sales_Manager
├── Profile: Standard User
└── Permission Sets: Hiring_Manager (for Account Executive position)
```

---

## Next Steps

- [ ] Deploy roles to Salesforce org
- [ ] Assign roles to existing users
- [ ] Enable "Grant Access Using Hierarchies" for recruitment objects
- [ ] Create sharing rules based on roles (optional)
- [ ] Test hierarchy visibility with test users
- [ ] Document any custom department additions

---

## Related Documentation

- [Security Model Documentation](SECURITY_MODEL_DOCUMENTATION.md)
- [Profiles Documentation](PROFILES_DOCUMENTATION.md)
- [Schema Documentation](SCHEMA_DOCUMENTATION.md)

---

**Document Status:** Complete - Ready for Deployment  
**Owner:** Srinivas Rao T  
**Last Updated:** 24-11-2025
