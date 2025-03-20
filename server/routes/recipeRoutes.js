const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const passport = require('passport');
const User = require('../models/User'); // Include the User model
const Recipe = require('../models/Recipe');
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
    body('email').isEmail().withMessage('Xin điền email hợp lệ.'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải dài 6 ký tự.'),
    body('name').not().isEmpty().withMessage('Xin điền họ và têntên.'),
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
                req.flash('error', 'Email đã được sử dụng.');
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

// Check if the user is logged in before rendering the submit-recipe page
router.get('/submit-recipe', (req, res) => {
    if (!req.user) {  // Check if the user is not logged in
        return res.redirect('/login');  // Redirect to login page if not logged in
    }

    // Render the recipe submission page if the user is logged in
    res.render('submit-recipe', { title: 'Submit Recipe' });
});


// Route to display user profile
router.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');  // If the user is not logged in, redirect to login
    }
    // Render profile page and pass the user object to the view
    res.render('profile', { title: 'User Profile', user: req.user });
});

// Route to display the edit profile page
router.get('/edit-profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');  // If the user is not logged in, redirect to login
    }
    res.render('edit-profile', { title: 'Edit Profile', user: req.user });
});

// Handle profile update
router.post('/edit-profile', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    const { name, email } = req.body;

    try {
        // Update the user in the database
        await User.findByIdAndUpdate(req.user._id, { name, email });

        // After a successful update, redirect to the profile page with success message
        return res.redirect('/profile?success=true');  // Redirect with success query parameter
    } catch (err) {
        return res.render('edit-profile', {
            title: 'Edit Profile',
            user: req.user,
            error: 'Có lỗi xảy ra khi cập nhật thông tin.'
        });
    }
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { // Check if user is authenticated (i.e., logged in)
        return next(); // Proceed to the next route if the user is logged in
    }
    req.flash('infoError', 'You need to be logged in to access your recipes.');
    res.redirect('/login');  // Redirect to login page if not authenticated
}

// Use this middleware for protected routes
router.get('/profile', isAuthenticated, (req, res) => {
    // Render profile page
});

// Route to show the Change Password page
router.get('/change-password', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');  // Redirect to login if the user is not logged in
    }
    res.render('change-password', { title: 'Change Password', user: req.user });
});

// Handle Password Change
router.post('/change-password', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');  // Redirect to login if the user is not logged in
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Ensure new password and confirm password match
    if (newPassword !== confirmPassword) {
        return res.render('change-password', {
            title: 'Change Password',
            error: 'Mật khẩu mới và xác nhận mật khẩu không khớp.'  // Pass error message to the view
        });
    }

    try {
        // Check if the current password is correct
        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.render('change-password', {
                title: 'Change Password',
                error: 'Mật khẩu hiện tại không đúng.'  // Pass error message to the view
            });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        // Success message after password change
        return res.render('change-password', {
            title: 'Change Password',
            success: 'Mật khẩu của bạn đã được cập nhật thành công!'
        });

        res.redirect('/profile');  // Redirect to profile after successful password change
    } catch (err) {
        res.status(500).send('Error changing password');
    }
});

// This route shows the recipes submitted by the logged-in user
router.get('/my-recipes', isAuthenticated, async (req, res) => {
    try {
        const userEmail = req.user.email; // Assuming user is logged in
        const userRecipes = await Recipe.find({ email: userEmail }); // Find recipes by the logged-in user's email
        res.render('my-recipes', { title: 'My Recipes', recipes: userRecipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        req.flash('infoError', 'An error occurred while fetching your recipes.');
        res.redirect('/profile');
    }
});


// Route to delete a recipe (GET)
router.get('/recipe/delete/:id', isAuthenticated, recipeController.deleteRecipe);

// Route to view a single recipe
router.get('/recipe/:id', isAuthenticated, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (recipe) {
            res.render('recipe', { 
                title: recipe.name, 
                recipe: recipe, 
                user: req.user // Pass the logged-in user to the view
            });
        } else {
            req.flash('infoError', 'Recipe not found.');
            res.redirect('/explore-latest');
        }
    } catch (error) {
        console.log('Error fetching recipe:', error);
        req.flash('infoError', 'An error occurred while fetching the recipe.');
        res.redirect('/explore-latest');
    }
});

// Route to render the edit recipe page
router.get('/recipe/edit/:id', isAuthenticated, recipeController.editRecipe);

// Route to handle the update of the recipe
router.post('/recipe/edit/:id', isAuthenticated, recipeController.updateRecipe);

module.exports = router;
