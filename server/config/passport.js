const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, 
    scope: ['profile', 'email']
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      console.log(error);
      return done(error, null);
    }
  }
));

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
