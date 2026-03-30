# Installation & Verification Checklist

## Pre-Installation Requirements
- [ ] Node.js v14+ installed
- [ ] MySQL Server running
- [ ] Git (optional, for version control)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```
- [ ] All packages installed successfully
- [ ] No critical errors in console

### 2. Configure Environment
```bash
cp .env.example .env
```
Update `.env` with your settings:
- [ ] DB_HOST set correctly
- [ ] DB_USER set correctly  
- [ ] DB_PASSWORD set correctly
- [ ] DB_NAME set (default: boarding_school_visiting)
- [ ] PORT configured (default: 3000)
- [ ] SESSION_SECRET changed from default
- [ ] JWT_SECRET changed from default

### 3. Create Database

Choose one method:

**Method A: Using shell**
```bash
mysql -u root -p < backend/db/schema.sql
```

**Method B: Using MySQL client**
```mysql
source backend/db/schema.sql;
```

**Method C: Copy-paste the SQL**
- [ ] Open MySQL client
- [ ] Copy entire contents of `backend/db/schema.sql`
- [ ] Paste into MySQL client
- [ ] Execute

Verification:
```mysql
USE boarding_school_visiting;
SHOW TABLES;
```
Should return:
- [ ] notifications
- [ ] students
- [ ] users
- [ ] visit_requests
- [ ] visits

### 4. Start Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

- [ ] Server starts without errors
- [ ] "MySQL Connected ✅" message appears
- [ ] "Server running at http://localhost:3000" displayed

## Functionality Verification

### 1. Navigation
- [ ] Open http://localhost:3000 in browser
- [ ] Homepage loads without errors
- [ ] Navigation bar visible
- [ ] "Home" title displayed

### 2. Authentication
- [ ] Registration page loads at /auth/register
- [ ] Login page loads at /auth/login
- [ ] Logout button appears in navbar (after login)

### 3. Login Test
- [ ] Try login with admin@school.com / admin123
- [ ] Redirects to /dashboard/admin
- [ ] User name shows in navbar
- [ ] User role shows in navbar (Admin)

### 4. Admin Dashboard
- [ ] Stats cards display (may show 0 if empty)
- [ ] Quick action links work
- [ ] Can navigate to Manage Visits
- [ ] Can navigate to Manage Students
- [ ] Can navigate to Manage Users

### 5. Database Integrity
- [ ] Create route used for visits
- [ ] Create route used for students
- [ ] Update routes function
- [ ] Delete routes function

### 6. Session Management
- [ ] Logout button works
- [ ] Redirects to home after logout
- [ ] Cannot access admin pages after logout
- [ ] Can re-login with credentials

### 7. Other Roles
Test each role:

**Parent (john@parent.com / parent123)**
- [ ] Dashboard shows parent view
- [ ] Can see visit status page
- [ ] Can request visit page loads

**Tutor (smith@school.com / tutor123)**
- [ ] Dashboard shows tutor view
- [ ] Can see all visits

**Security Officer (security@school.com / security123)**
- [ ] Dashboard shows security view
- [ ] Can see visit schedule

## Common Issues & Solutions

### Issue: MySQL Connection Error
```
Error: MySQL Connection Error
```
**Solution:**
- [ ] Check MySQL is running (`mysql -u root -p`)
- [ ] Verify credentials in .env
- [ ] Ensure database exists: `SHOW DATABASES;`

### Issue: Port 3000 Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
- [ ] Change PORT in .env (e.g., 3001)
- [ ] Or kill process: On macOS/Linux: `lsof -ti:3000 | xargs kill -9`

### Issue: Tables Not Found
```
Error: ER_NO_SUCH_TABLE
```
**Solution:**
- [ ] Run schema.sql again
- [ ] Check database name matches .env (DB_NAME)
- [ ] Verify all tables were created: `SHOW TABLES;`

### Issue: npm install fails
```
Error: npm ERR!
```
**Solution:**
- [ ] Delete node_modules and package-lock.json
- [ ] Run `npm cache clean --force`
- [ ] Run `npm install` again

### Issue: nodemon not found (npm run dev)
```
Error: command not found: nodemon
```
**Solution:**
- [ ] Install globally: `npm install -g nodemon`
- [ ] Or use: `npm install --save-dev nodemon`
- [ ] Then: `npm run dev`

## Performance Check

- [ ] Page load time < 2 seconds
- [ ] No console errors (F12)
- [ ] Login/logout responsive
- [ ] Form submissions work
- [ ] Tables display correctly

## Security Check

- [ ] Passwords are hashed (check database)
- [ ] Session expires after 2 hours
- [ ] Cannot access admin pages without login
- [ ] Logout clears session
- [ ] Role-based access works

## Final Deployment Checklist

Before going to production:
- [ ] Change all test passwords
- [ ] Update SESSION_SECRET with strong random string
- [ ] Update JWT_SECRET with strong random string
- [ ] Set NODE_ENV=production in .env
- [ ] Configure HTTPS
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Set up monitoring and alerts
- [ ] Review security best practices in README.md

## Success Criteria

All of the following should be true:
- [ ] npm install completes without errors
- [ ] Database schema loads without errors
- [ ] Server starts successfully
- [ ] Homepage loads at http://localhost:3000
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Admin dashboard accessible with correct role
- [ ] Logout works properly
- [ ] All navigation links work
- [ ] Tables display student/user/visit data
- [ ] No errors in browser console (F12)

## Troubleshooting Resources

1. Check `README.md` for detailed documentation
2. Check `SETUP.md` for quick start
3. Review error messages in console
4. Check `.env` file configuration
5. Verify MySQL database and tables exist

---

**If you've checked all boxes above, your installation is successful!**

Need help? Review the logs in the terminal and check browser console (F12) for error messages.