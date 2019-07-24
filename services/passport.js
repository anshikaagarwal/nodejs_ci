const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('User');

const fun = async () => {
  const data = await new User({ googleId: 'anshika', displayName: 'anshika' })
  console.log("--------------------------------------------------");
  console.log("data=", data);
  data.save()
    .then(doc => {
      console.log(doc)
    })
    .catch(err => {
      console.log(err)
    });
  // const user = await User.findById('5d32b3a01c9d440000c09c8e');
  // console.log("user=", user);
  console.log("--------------------------------------------------");

}
//fun();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: '/auth/callback',
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("profile here", profile);
      User.findOne({ googleId: profile.id })
        .then((existing) => {
          if (existing) {
            //user existing
            done(null, existing);
          }
          else {
            //user doesnt exists..
            new User({
              googleId: profile.id,
              displayName: profile.displayName
            })
              .save()
              .then((user) => {
                console.log("done dina done=", user);
                done(null, user);
              })
              .catch(err => {
                console.log("error is here in catch", err)
              });
          }
        })


    }
  )
);
