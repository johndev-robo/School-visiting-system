# Boarding School Visiting System

A comprehensive system for managing student visits in a boarding school environment. The system allows parents to request visits, administrators to manage visits and users, security officers to log visits, and tutors to track and approve visits.

## Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access Control**: Different dashboards and features for Admin, Parent, Tutor, and Security Officer roles
- **Visit Management**: Request, approve, and track student visits
- **Student Management**: Admin can manage student records
- **User Management**: Admin can manage system users
- **Notifications**: Real-time notifications for visit status updates
- **Visit Scheduling**: Easy visit scheduling with date and time management

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: EJS templating, HTML, CSS, JavaScript
- **Database**: MySQL
- **Authentication**: Bcrypt for password hashing, JWT tokens
- **Session Management**: Express sessions

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Installation

### 1. Clone or Extract the Project

```bash
cd BoardingSchoolVisitingSystem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Database

```bash
# Open MySQL client
mysql -u root -p

# Run the schema file
source backend/db/schema.sql;
```

Or execute the SQL commands from `backend/db/schema.sql` manually.

### 4. Set Up Environment Variables

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Edit `.env` and update:
- `DB_HOST`: Your MySQL host (default: localhost)
- `DB_USER`: Your MySQL user (default: root)
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Database name (default: boarding_school_visiting)
- `PORT`: Server port (default: 3000)
- `SESSION_SECRET`: Change this to a secure random string
- `JWT_SECRET`: Change this to a secure random string

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start at `http://localhost:3000`

## Default User Credentials

After running the schema, the following sample users are created:

### Admin
- **Email**: admin@school.com
- **Password**: admin123
- **Role**: Admin

### Parent
- **Email**: john@parent.com
- **Password**: parent123
- **Role**: Parent

### Tutor
- **Email**: smith@school.com
- **Password**: tutor123
- **Role**: Tutor

### Security Officer
- **Email**: security@school.com
- **Password**: security123
- **Role**: Security Officer

**Note**: Change these passwords in a production environment!

## Project Structure

```
BoardingSchoolVisitingSystem/
├── backend/
│   ├── app.js                 # Main application file
│   ├── db.js                  # Database configuration
│   ├── config/
│   │   └── dbConfig.js        # Database config
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── visitController.js
│   │   ├── studentController.js
│   │   ├── userController.js
│   │   └── notificationController.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Visit.js
│   │   ├── VisitRequest.js
│   │   └── Notification.js
│   ├── routes/               # API routes
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── visitRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── userRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js # Authentication middleware
│   └── db/
│       └── schema.sql        # Database schema
├── frontend/
│   ├── views/               # EJS templates
│   │   ├── index.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── 404.ejs
│   │   ├── admin/
│   │   ├── parent/
│   │   ├── tutor/
│   │   └── security/
│   ├── components/          # Reusable components
│   │   ├── header.ejs
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── sidebar.ejs
│   ├── css/
│   │   └── style.css        # Main styles
│   └── js/
│       └── main.js          # Client-side JavaScript
├── logs/                    # Application logs
├── package.json
└── .env.example             # Environment variables template
```

## Usage

### Admin Dashboard
- Access at `/dashboard` or `/dashboard/admin`
- Manage users, students, and visits
- View system statistics
- Approve/reject visit requests

### Parent Dashboard
- Access at `/dashboard/parent`
- View their children's visits
- Request new visits
- View notifications

### Tutor Dashboard
- Access at `/dashboard/tutor`
- View all student visits
- Review visit requests

### Security Officer Dashboard
- Access at `/dashboard/security`
- View visit schedule
- Log visitor check-ins/check-outs

## API Routes

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Dashboard
- `GET /dashboard` - Redirect to appropriate dashboard
- `GET /dashboard/admin` - Admin dashboard (Admin only)
- `GET /dashboard/parent` - Parent dashboard (Parent only)
- `GET /dashboard/tutor` - Tutor dashboard (Tutor only)
- `GET /dashboard/security` - Security dashboard (Security Officer only)

### Visits
- `GET /visits/status` - View parent's visits
- `POST /visits/request` - Request a visit
- `GET /visits/all` - View all visits (Admin/Tutor only)
- `POST /visits/update-status` - Update visit status

### Students
- `GET /students` - View all students
- `POST /students/create` - Create new student
- `POST /students/update` - Update student
- `GET /students/delete/:id` - Delete student

### Users
- `GET /users` - View all users (Admin only)

### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications/mark-read` - Mark notification as read

## Database Schema

### Users Table
- Stores user information with roles (Admin, Parent, Tutor, Security Officer)
- Password stored as bcrypt hash

### Students Table
- Contains student information and class details

### Visits Table
- Records actual visits with dates, times, and status
- Linked to parents and students

### Visit Requests Table
- Pending visit requests from parents
- Can be approved or rejected

### Notifications Table
- User notifications about visit status and system events

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- CSRF protection ready
- Input validation

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords in database
- [ ] Update SESSION_SECRET in .env
- [ ] Update JWT_SECRET in .env
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure proper error logging
- [ ] Set up database backups
- [ ] Review and update security headers
- [ ] Set up SSL certificates
- [ ] Configure database connection pooling
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts

## Troubleshooting

### Database Connection Error
- Verify MySQL server is running
- Check database credentials in .env
- Ensure database and tables have been created

### Port Already in Use
- Change PORT in .env
- Or kill process using the port

### Session Not Persisting
- Ensure SESSION_SECRET is set
- Check database tables are created
- Verify MySQL connection

## Contributing

This is a complete project. Feel free to modify and extend as needed.

## License

ISC

## Support

For issues and questions, please check the code comments or review the database schema and controller logic.

---

**Happy visiting!** 🎓# School-visiting-system
