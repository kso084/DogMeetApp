const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');

const tokenSecret = process.env.TOKENSECRET || "I love cookies big time";
const cookieName = process.env.COOKIENAME || "accessTokenDogMeet";

const getCookie = req => {
  let token = null;
  if (req && req.cookies) { token = req.cookies[cookieName] };
  return token;
}

passport.use(new JwtStrategy({
  jwtFromRequest: getCookie,
  secretOrKey: tokenSecret
  }, (data, done) => {
    User.findById({ _id: data.sub }, (error, user) => {
      if (error) { return done(error, false) };
      if (user) { return done(null, user) };
      return done(null, false);
    })
  }
))

passport.use(new LocalStrategy(
  {
  usernameField: 'userName',
  passwordField: 'password'
  },
  async (userName, password, done) => {
    User.findOne({ userName }, function (error, user) {
      if (error) { return done(error) };
      if (!user) { return done(null, false, {message: 'Incorrect username'}) };
      user.comparePwds(password, done);
    });
  }
  ));