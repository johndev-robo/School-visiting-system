# Parent-Child Relationship & Smart Visiting Hours System

## Overview
This system ensures that parents can **ONLY request visits for their own registered children** and automatically applies visiting hour rules based on the visit purpose (occasion). This creates a **secure, intelligent, and flexible** visiting framework.

---

## 🔒 Security Features

### 1. Parent-Child Relationship Enforcement
- Parents cannot see or request visits for students not linked to them
- Each student has a list of authorized guardians (parents, grandparents, aunts, uncles, etc.)
- Primary guardian designation for emergency contacts
- Soft-delete capability to deactivate guardians without losing history

### 2. Custodial Rights Verification
- At security checkpoints, the system verifies parent-student relationship
- Prevents unauthorized access to campus
- Integrates with behavior scoring system (banned parents are denied entry)

### 3. Visit Occasion-Based Rules
Different visiting purposes have different time windows:
- **Academic Visit**: 9:30 AM - 10:15 AM (Break time, teacher present)
- **Medication Drop-off**: 12:00 PM - 1:00 PM  
- **Lunch Supervision**: 12:00 PM - 1:00 PM
- **Leisure Visit**: 2:00 PM - 6:00 PM (Afternoon)
- **Emergency**: Anytime (7:00 AM - 7:00 PM)

---

## 📋 Setup Instructions

### Step 1: Run Database Migration
Execute the migration file to create parent-child relationship tables:

```bash
mysql -u root -p boarding_school_visiting < backend/db/migrations_parent_child_security.sql
```

This creates:
- `student_guardians` - Links students to authorized guardians
- `visiting_hour_policies` - Defines rules for each visit occasion
- Updates `visits` and `visit_requests` tables with new fields

### Step 2: Link Parents to Students (Admin Setup)

**Option A: Via API**
```bash
POST /api/security/guardians/link
Content-Type: application/json

{
  "studentId": 1,
  "guardianId": 5,
  "relationship": "Parent",
  "isPrimary": true
}
```

**Option B: Via Admin Dashboard**
1. Go to Admin > Student Management
2. Select a student
3. Click "Add Guardian"
4. Search for parent by email
5. Select relationship type
6. Mark as primary if needed

### Step 3: Verify Setup
Test that parents can only see their own children:
1. Parent logs in
2. Go to "Request a Visit"
3. Only their registered children should appear in dropdown

---

## 🕐 Smart Visiting Hours System

### How It Works

**Step 1: Parent selects occasion**
```
Purpose: "Academic Visit"
↓
System looks up policy
```

**Step 2: System validates date**
```
Academic Visit policy: Only Monday-Friday
Selected Date: Saturday ❌
→ Display: "Academic visits not allowed on Saturday"
```

**Step 3: System recommends times**
```
Occasion: "Academic Visit"
Date: Monday, March 27
↓
Policy allows: 9:30 AM - 10:15 AM
↓
Show recommended slots: 9:30, 9:45, 10:00
```

**Step 4: Parent selects time**
```
Start: 9:30 AM
End: 10:00 AM
Duration: 30 minutes ✓ (within 45-min max)
↓
APPROVED
```

---

## 📊 Visiting Hour Policies

### Default Policies

#### 1. Academic Visit (Teacher Meeting)
```
When: Monday-Friday only
Time: 9:30 AM - 10:15 AM (morning break)
Duration: Max 45 minutes
Teacher: PRESENT (required)
Advance Notice: 48 hours
Weekly Limit: 2 visits
```

#### 2. Medication Drop-off
```
When: Monday-Friday
Time: 12:00 PM - 1:00 PM (lunch time)
Duration: Max 30 minutes
Teacher: Not required
Advance Notice: 4 hours
Weekly Limit: Unlimited
```

#### 3. Lunch Supervision
```
When: Monday-Friday
Time: 12:00 PM - 1:00 PM
Duration: Max 45 minutes
Teacher: Not required
Advance Notice: 24 hours
Weekly Limit: 5 visits
```

#### 4. Leisure Visit (Social Time)
```
When: Saturday-Sunday only
Time: 2:00 PM - 6:00 PM (afternoon)
Duration: Max 120 minutes (2 hours)
Teacher: Not required
Advance Notice: 24 hours
Weekly Limit: 2 visits
```

#### 5. Emergency Visit
```
When: Any day, any time
Time: 7:00 AM - 7:00 PM
Duration: Max 120 minutes
Teacher: Not required
Advance Notice: 0 hours (immediate)
Weekly Limit: Unlimited
```

### Customizing Policies

Admin can update policies via API:
```bash
PUT /api/security/policies/1
{
  "occasion": "Leisure Visit",
  "startTime": "14:00:00",
  "endTime": "18:00:00",
  "maxDuration": 120,
  "allowedDays": "Saturday,Sunday",
  "requiresAdvanceNotice": 24
}
```

---

## 🛡️ Security Checkpoint (Gate Entry)

When parent arrives with QR code:

```
Security Officer scans QR
↓
System retrieves visit details
↓
System verifies:
  ✓ Parent is registered for this student
  ✓ Visit date/time matches approved request
  ✓ Parent behavior status is not "Banned"
  ✓ If "Supervised", alert raised
↓
If all checks pass:
  ✓ ALLOW ENTRY
  ✓ Log check-in time
↓
If issues:
  ❌ DENY ENTRY + reason
```

### Check-In/Check-Out API
```bash
# Check in
POST /api/visits/check-in
{ "visitId": 123 }

# Check out
POST /api/visits/check-out
{ "visitId": 123 }
```

---

## 👨‍👩‍👧 Managing Student-Guardian Relationships

### View Guardians for a Student
```bash
GET /api/security/students/1/guardians

Response:
[
  {
    "id": 1,
    "student_id": 1,
    "guardian_id": 5,
    "relationship": "Parent",
    "is_primary": true,
    "name": "John Doe",
    "email": "john@parent.com",
    "phone": "254700123456"
  },
  {
    "id": 2,
    "student_id": 1,
    "guardian_id": 6,
    "relationship": "Grandparent",
    "is_primary": false,
    "name": "Jane Doe",
    "email": "jane@grandparent.com"
  }
]
```

### View Students for a Guardian
```bash
GET /api/security/guardians/5/students

Response:
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "class": "10A",
    "relationship": "Parent",
    "is_primary": true
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "class": "9B",
    "relationship": "Parent",
    "is_primary": true
  }
]
```

### Remove Guardian Link
```bash
DELETE /api/security/guardians/1

# Soft-deletes the relationship (keeps history)
```

---

## 📱 Parent Mobile Experience

### Step-by-Step Visit Request

1. **Login** → Parent dashboard
2. **Click "Request Visit"** → Smart form loads
3. **Select Child** → Only their 2 students appear
4. **Select Purpose** → Shows policy rules in real-time
   - "Want to meet teacher?" → Shows 9:30 AM break slot
   - "Drop medicine?" → Shows 12 PM lunch slot
   - "Afternoon visit?" → Shows 2-6 PM Saturday/Sunday slots
5. **Select Date** → System validates against policy
   - Instantly shows which day-types are allowed
6. **See Time Recommendations** → Clickable suggested slots
   - Click "2:00 PM" → Auto-fills start time
7. **Set Duration** → System calculates and validates
   - "If > max duration, shows warning"
8. **Submit** → System validates all rules
   - "Request approved immediately" or "Denied: [reason]"

---

## 📊 Admin Dashboard Features

### Security Admin Console
Access: `/admin/security`

**Tabs:**
1. **Student-Guardian Relationships**
   - View all links
   - Add/remove guardians
   - Set primary contact

2. **Visiting Policies**
   - View all policies
   - Edit time windows
   - Set advance notice requirements
   - Configure weekly limits

3. **Visit Requests**
   - View pending/approved/rejected
   - Manual approval/denial
   - Override rules if needed

4. **Security Checkpoint**
   - Real-time check-in/out log
   - Behavior status alerts
   - Visitor duration monitoring

5. **Analytics**
   - Student isolation detection (low visit frequency)
   - Visiting trends by occasion
   - Parent engagement metrics

---

## 🚨 Error Handling & Validation

### Validation Checks

When parent submits visit request:

```javascript
✓ Parent exists
✓ Student exists
✓ Parent-student relationship exists
✓ Visit date is in future
✓ Date matches occasion policy (e.g., not Sat/Sun for academic)
✓ Start time within policy window
✓ End time within policy window
✓ Duration ≤ policy max
✓ Advanced notice requirement met
✓ Weekly visit limit not exceeded
✓ Parent behavior status ≠ "Banned"
```

### Error Messages

```
❌ "You do not have permission to request visits for this student"
   → Parent-student relationship not established

❌ "Academic visits not allowed on Saturday"
   → Visit occasion conflicts with day of week

❌ "Start time must be between 9:30 am - 10:15 am"
   → Time outside policy window

❌ "Visit must be requested 48 hours in advance"
   → Insufficient notice time

❌ "Maximum visits exceeded (2 per week for Academic Visits)"
   → Weekly limit hit

❌ "You are not authorized for visits at this time"
   → Parent behavior status is "Supervised" or "Banned"
```

---

## 🔄 Integration Points

### 1. With Behavior Scoring System
```
Parent has incident → Behavior score drops
Behavior score < 75 → Status = "Supervised"
  → Visits require security supervision
Behavior score < 50 → Status = "Banned"
  → All visit requests auto-DENIED
```

### 2. With Student Information System (SIS)
```
New student enrolled → Auto-create student record
Parent registers email → Link to student via enrollment records
Guardian updates in main SIS → Sync to visiting system
```

### 3. With Notification System
```
Visit approved → Send SMS/Email to parent with QR code
Visit day reminder → "Your visit to see Alice is tomorrow 9:30 AM"
Behavior warning → "One more incident may restrict visits"
```

---

## 🧪 Testing the System

### Test Case 1: Parent Can Only Request for Own Child
```
Parent1 tries to request visit for Student2 (not theirs)
Expected: DENIED ❌
Actual: DENIED ❌
Status: ✓ PASS
```

### Test Case 2: Smart Hours Enforce Time Windows
```
Request: Academic visit on Saturday 3 PM
Expected: DENIED (Sat not allowed, wrong time)
Actual: DENIED ✓
Status: ✓ PASS
```

### Test Case 3: Advance Notice Enforced
```
Request: Academic visit today (0 hours notice)
Policy: Requires 48 hours
Expected: DENIED
Actual: DENIED ✓
Status: ✓ PASS
```

### Test Case 4: Security Checkpoint Verifies Custodial Rights
```
Parent1 tries to check-in with visit for Student2
Expected: DENIED, "Not authorized for this student"
Actual: DENIED ✓
Status: ✓ PASS
```

---

## 📞 Support & Troubleshooting

### Parent Can't See Their Child
```
1. Verify student exists in database
2. Verify student_guardians record exists
3. Check: SELECT * FROM student_guardians WHERE guardian_id = X;
4. If missing, admin must link them
```

### Visit Time Not Showing
```
1. Check if date matches policy allowed_days
2. Check if time is within policy window
3. Verify policy is_active = TRUE
```

### Parent Gets "Banned" Error
```
1. Check users table: behavior_status FOR PARENT
2. View incidents: 
   SELECT * FROM behavior_incidents WHERE guardian_id = X;
3. May need behavior appeal or manual override by admin
```

---

## 📈 Future Enhancements

1. **Multi-level Approvals** - Head of House must also approve academic visits
2. **Visitor Preferences** - Student selects which guardians can visit
3. **Offline QR Codes** - Generate QR codes that work without internet
4. **Video Visiting** - Virtual visits during lockdown
5. **Predictive Analytics** - Flag students at risk of isolation

---

**System Status:** ✅ Production Ready  
**Last Updated:** March 27, 2026  
**Version:** 1.0
