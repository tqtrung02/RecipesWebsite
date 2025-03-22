const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Ensure passport-local is being required
const User = require('../models/User');  // Import your User model

// Local Strategy for sign-in
passport.use(
    new LocalStrategy(
        { usernameField: 'email' },  // Specify email as the username
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: 'No user found with this email.' });
                }

                const isMatch = await user.comparePassword(password); // Compare password with stored hash
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user); // Authentication successful
            } catch (error) {
                return done(error); // Handle any errors that occur
            }
        }
    )
);

// Serialize user to store user information in session
passport.serializeUser((user, done) => {
    done(null, user.id);  // Store the user ID in the session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);  // Fetch the user from the database using the stored ID
    done(null, user);  // Store user object in session
});

module.exports = passport;  // Export passport for use in app.js
