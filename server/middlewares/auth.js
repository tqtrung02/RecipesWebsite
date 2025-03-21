const User = require('../models/User');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Check if user is authenticated (i.e., logged in)
        return next(); // Proceed to the next route if the user is logged in
    }
    req.flash('infoError', 'You need to be logged in to access your recipes.');
    res.redirect('/login');  // Redirect to login page if not authenticated
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/');  // Redirect to homepage if not admin
};

module.exports = { isAuthenticated, isAdmin };