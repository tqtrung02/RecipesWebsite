require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const passport = require('./server/config/passport');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.urlencoded( { extended: true} ));
app.use(express.static('public'));
app.use(expressLayouts);
app.use(express.json());

app.use(cookieParser('RecipesWebsiteSecure'));
app.use(session({
    secret: 'RecipesWebsiteSecretSession',
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use(flash());
app.use((req, res, next) => {
    console.log('Flash messages:', req.flash());
    res.locals.flash = req.flash();
    res.locals.infoSubmit = req.flash('infoSubmit');
    res.locals.infoError = req.flash('infoError');
    next();
});
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', "ejs");

const routes = require('./server/routes/recipeRoutes.js')
app.use('/', routes);

app.listen(port, ()=> console.log(`Listening to port ${port}`));
