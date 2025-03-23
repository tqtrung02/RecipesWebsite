const User = require('../models/User');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Check if user is authenticated (i.e., logged in)
        console.log('User is authenticated');
        return next(); // Proceed to the next route if the user is logged in
    } else {
        console.log('User is NOT authenticated');
        res.redirect('/login');
    }
    req.flash('infoError', 'You need to be logged in to access your recipes.');
    res.redirect('/login');  // Redirect to login page if not authenticated
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('User is an admin');
        return next();
    } else {
        console.log('User is NOT an admin');
        res.redirect('/');  // Redirect to homepage if not admin
}
}

module.exports = { isAuthenticated, isAdmin };