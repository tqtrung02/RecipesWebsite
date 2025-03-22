const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const userController = require('../controllers/userController');
const passport = require('passport');
const User = require('../models/User'); // Include the User model
const Recipe = require('../models/Recipe');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');


router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe);
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);
router.get('/submit-recipe', recipeController.submitRecipe);
router.post('/submit-recipe', recipeController.submitRecipeOnPost);

router.get('/signup', userController.signupPage);
router.post('/signup', userController.signupUser);

router.get('/login', userController.loginPage);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/logout', userController.logout);


router.get('/profile', isAuthenticated, userController.profilePage);
router.get('/edit-profile', isAuthenticated, userController.editProfilePage);
router.post('/edit-profile', isAuthenticated, userController.updateProfile);

router.get('/change-password', isAuthenticated, userController.changePasswordPage);
router.post('/change-password', isAuthenticated, userController.changePassword);

router.get('/my-recipes', isAuthenticated, recipeController.myRecipes);

// Route to delete a recipe (GET)
router.get('/recipe/delete/:id', isAuthenticated, isAdmin, recipeController.deleteRecipe);

// Route to render the edit recipe page
router.get('/recipe/edit/:id', isAuthenticated, recipeController.editRecipe);

// Route to handle the update of the recipe
router.post('/recipe/edit/:id', isAuthenticated, recipeController.updateRecipe);

router.get('/admin/dashboard', isAuthenticated, isAdmin, userController.adminDashboard);

// Route for updating user information (name, email, role)
router.post('/admin/user/edit-update/:id', isAuthenticated, isAdmin, userController.updateUser);

// Route for deleting a user
router.get('/admin/user/delete/:id', isAuthenticated, isAdmin, userController.deleteUser);

// Add to favorites
router.get('/recipe/favorite/:id', isAuthenticated, recipeController.addFavorite);

// Remove from favorites
router.get('/recipe/unfavorite/:id', isAuthenticated, recipeController.removeFavorite);

// Route to display favorite recipes for the logged-in user
router.get('/favorites', isAuthenticated, recipeController.getFavoriteRecipes);

// Add comment to recipe
router.post('/recipe/:id/comment', isAuthenticated, recipeController.addComment);

// Delete comment for admin
router.get('/recipe/:recipeId/comment/delete/:commentId', isAuthenticated, isAdmin, recipeController.deleteComment);

module.exports = router;
