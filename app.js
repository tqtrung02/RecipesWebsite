require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const passport = require('./server/config/passport');

const app = express();
const port = process.env.PORT || 4000;

// CORS middleware for Next.js frontend
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.urlencoded( { extended: true} ));
app.use(express.static('public'));
app.use(express.json());

app.use(cookieParser('RecipesWebsiteSecure'));
app.use(session({
    secret: 'RecipesWebsiteSecretSession',
    saveUninitialized: true,
    resave: true,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        sameSite: 'lax', // Allow cross-site requests
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
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

// API routes for Next.js frontend
const apiRoutes = require('./server/routes/apiRoutes.js');
app.use('/api', apiRoutes);

// Regular routes (POST endpoints for form submissions, redirects handled by Next.js)
const routes = require('./server/routes/recipeRoutes.js')
app.use('/', routes);

app.listen(port, ()=> console.log(`Listening to port ${port}`));
