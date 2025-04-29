const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(
  session({
    secret: "someKeyHere",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      console.log("here", profile);
      const user = {
        id: profile.id,
        name: profile.name,
        email: profile.emails[0].value,
      };
      return done(null, user);
    }
  )
);

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
  const user = req.user;
  res.render("profile", { user });
});

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port 3000");
});
