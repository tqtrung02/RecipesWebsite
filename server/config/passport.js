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
      // Check if the user exists in the database
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If the user doesn't exist, create a new one
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value, // Get the user's email from their Google profile
          profilePicture: profile.photos[0].value // Get profile picture (if available)
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
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

module.exports = passport;
