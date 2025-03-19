const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const passport = require('passport');
const User = require('../models/User'); // Include the User model
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

/**
 * App Routes 
*/
router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe);
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);
router.get('/submit-recipe', recipeController.submitRecipe);
router.post('/submit-recipe', recipeController.submitRecipeOnPost);

router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

router.post('/signup',
    // Validate input
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('name').not().isEmpty().withMessage('Name is required.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Pass errors to the signup view
            return res.render('signup', { title: 'Sign Up', errors: errors.array() });
        }

        const { name, email, password } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash('error', 'Email is already taken.');
                return res.render('signup', { title: 'Sign Up' });
            }

            const newUser = new User({ name, email, password });
            await newUser.save();
            req.login(newUser, (err) => {
                if (err) {
                    return next(err);
                }
                // Redirect to homepage after successful login
                res.redirect('/');
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
);

// Login Route
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// Logout Route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
