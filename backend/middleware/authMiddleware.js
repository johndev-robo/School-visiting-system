// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'Admin') {
    return next();
  }
  res.status(403).send('Access denied. Admin only.');
};

// Middleware to check if user is a tutor
const isTutor = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'Tutor') {
    return next();
  }
  res.status(403).send('Access denied. Tutor only.');
};

// Middleware to check if user is a security officer
const isSecurityOfficer = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'Security Officer') {
    return next();
  }
  res.status(403).send('Access denied. Security Officer only.');
};

// Middleware to check if user is a parent
const isParent = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'Parent') {
    return next();
  }
  res.status(403).send('Access denied. Parent only.');
};

// Admin, Tutor, and Security Officer can view the consolidated visits list (read-only for non-admins in the view)
const canViewAllVisits = (req, res, next) => {
  const role = req.session && req.session.userRole;
  if (req.session && req.session.userId && ['Admin', 'Tutor', 'Security Officer'].includes(role)) {
    return next();
  }
  res.status(403).send('Access denied.');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isTutor,
  isSecurityOfficer,
  isParent,
  canViewAllVisits
};
