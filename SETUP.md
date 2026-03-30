# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create .env File
```bash
cp .env.example .env
```

Then edit `.env` and set your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=boarding_school_visiting
PORT=3000
SESSION_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
```

## Step 3: Set Up MySQL Database

Use one of these methods:

### Method A: Using MySQL CLI
```bash
mysql -u root -p < backend/db/schema.sql
```

### Method B: Manual SQL Execution
```bash
mysql -u root -p
```
Then copy and paste contents of `backend/db/schema.sql`

### Method C: Inside MySQL Client
```sql
source backend/db/schema.sql;
```

## Step 4: Start the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Step 5: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Test Credentials

After setup, you can login with these credentials (passwords can be changed):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Parent | john@parent.com | parent123 |
| Tutor | smith@school.com | tutor123 |
| Security | security@school.com | security123 |

## Common Issues

### MySQL Connection Failed
- Make sure MySQL server is running
- Check your credentials in `.env`
- Verify database `boarding_school_visiting` exists

### Port 3000 Already in Use
- Change `PORT` in `.env`
- Or find and kill the process using port 3000

### Database Tables Not Created
- Run the schema.sql file again
- Check MySQL error logs

### npm install fails
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Verify Everything Works

1. **Home Page**: http://localhost:3000
2. **Login**: http://localhost:3000/auth/login
3. **Register**: http://localhost:3000/auth/register
4. **Admin Dashboard**: Login with admin account → http://localhost:3000/dashboard/admin

## Next Steps

- Customize the styling in `frontend/css/style.css`
- Add more features to controllers
- Set up email notifications
- Deploy to production

---

**Need help?** Check the README.md for detailed documentation.