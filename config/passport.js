// Importing Passport, strategies, and config
const passport = require("passport"),
  User = require("../models/user"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  GoogleStrategy = require("passport-google-oauth20");
require("dotenv/config");

// Setting JWT strategy options
const jwtOptions = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  // Telling Passport where to find the secret
  secretOrKey: process.env.JWT_SECRET,

  // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload._id, (err, user) => {
    if (err) {
      return done(err, false);
    }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          authGoogleID: profile.id,
          authType: "google",
        });
        if (user) return done(null, user);
        console.log("profile ", profile);
        const newUser = new User({
          username: profile.displayName + profile.id,
          email: profile.emails[0].value,
          authType: "google",
          profile: {
            full_name: profile.displayName,
          },
          authGoogleID: profile.id,
        });
        await newUser.save();
        user = newUser;
        return done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
