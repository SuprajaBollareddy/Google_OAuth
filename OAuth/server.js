const express = require('express');
const PORT = 8080;
const path = require('path');
const app = express();

app.use(express.static(__dirname + '/public'));

const session = require('express-session');
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "79226762885-o7elmo39b2fteobct5gsiogqptqtuq76.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'email'] // Include 'email' scope
}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect to the root URL
        res.redirect('/');
    });

// Serve the login.html file
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
    // If authenticated, serve home.html with user's display name
    if (req.isAuthenticated()) {
        const displayName = req.user.displayName;
        const userPhotos = req.user.photos;
        let photoUrl = '';
        const email = req.user.emails && req.user.emails[0] ? req.user.emails[0].value : 'No email available';
        if (userPhotos && userPhotos.length > 0) {
            photoUrl = userPhotos[0].value;
        }
        res.send(`
            <h1>Hello ${displayName}</h1>
            <img src="${photoUrl}" />
            <h4>${email}</h4>
        `);
    } else {
        // If not authenticated, redirect to the login page
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`server running on port :${PORT}`);
});
