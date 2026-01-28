require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const passport = require('./server/config/passport');
const { mongoose } = require('./server/models/database');

const app = express();
const port = process.env.PORT || 4000;

// CORS middleware for Next.js frontend
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        frontendUrl
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else if (origin && frontendUrl) {
        res.header('Access-Control-Allow-Origin', frontendUrl);
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

app.use(cookieParser(process.env.COOKIE_SECRET || 'RecipesWebsiteSecure'));

// Session configuration with MongoDB store
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
    secret: process.env.SESSION_SECRET || 'RecipesWebsiteSecretSession',
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 24 hours
    }),
    saveUninitialized: false,
    resave: false,
    cookie: { 
        secure: isProduction, // HTTPS only in production
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
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
    // Only log flash messages in development
    if (process.env.NODE_ENV !== 'production') {
        const flashMessages = req.flash();
        if (Object.keys(flashMessages).length > 0) {
            console.log('Flash messages:', flashMessages);
        }
    }
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
