const User = require('../models/User');

// Helper function to get Next.js frontend URL
const getFrontendUrl = (path = '') => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}${path}`;
};

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Check if user is authenticated (i.e., logged in)
        return next(); // Proceed to the next route if the user is logged in
    }
    req.flash('infoError', 'You need to be logged in to access your recipes.');
    res.redirect(getFrontendUrl('/login'));  // Redirect to login page if not authenticated
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        res.redirect(getFrontendUrl('/'));  // Redirect to homepage if not admin
}
}

module.exports = { isAuthenticated, isAdmin };