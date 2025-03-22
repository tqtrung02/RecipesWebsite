require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const path = require('path');
const mongoose = require("mongoose");
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

/**
 * GET /
 * Homepage 
*/
exports.homepage = async(req, res) => {
    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        const thai = await Recipe.find({ 'category': 'Thái' }).limit(limitNumber);
        const american = await Recipe.find({ 'category': 'Mỹ' }).limit(limitNumber);
        const chinese = await Recipe.find({ 'category': 'Trung' }).limit(limitNumber);
        const vietnamese = await Recipe.find({ 'category': 'Việt' }).limit(limitNumber);

        const food = { latest, thai, american, chinese, vietnamese };

        const user = req.user ? await User.findById(req.user._id).populate({
            path: 'favorites',
        }) : null;

        res.render('index', { title: 'FoodRecipes - Homepage', categories, food, user: user, recipes:[] } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

/**
 * GET / categories
 * exploreCategories 
*/
exports.exploreCategories = async(req, res) => {
    try {
        const limitNumber = 20;
        const categories = await Category.find({}).limit(limitNumber);
        res.render('categories', { title: 'FoodRecipes - Categories', categories } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

/**
 * GET / categories/:id
 * exploreCategories By ID
*/
exports.exploreCategoriesById = async(req, res) => {
    try {
        let categoryId = req.params.id;
        let category;
        if (mongoose.Types.ObjectId.isValid(categoryId)) {
            category = await Category.findById(categoryId);
        } else {
            category = await Category.findOne({ name: categoryId });
        }
        let recipes = await Recipe.find({ category: categoryId });
        const limitNumber = 20;
        const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        res.render('categories', { title: 'FoodRecipes - Categories', categoryById, category: category, srecipes: recipes } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

/**
 * GET / recipe
 * exploreRecipe
*/
exports.exploreRecipe = async(req, res) => {
    try {
        let recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId)
        .populate('comments.user', 'name');
        res.render('recipe', { title: 'FoodRecipes - Recipe', recipe: recipe, user: req.user } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
    
}

/**
 * POST / search
 * Search
*/
exports.searchRecipe = async(req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } } )
        res.render('search', { title: 'FoodRecipes - Search', recipe } );
        
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }
}

/**
 * GET /exlpore-latest
 * Explore Latest
*/
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find({}).sort({_id: -1 }).limit(limitNumber);
        res.render('explore-latest', { title: 'FoodRecipes - Explore Latest', recipe } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }  
}

/**
 * GET /exlpore-random
 * Explore Random
*/
exports.exploreRandom = async(req, res) => {
    try {
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();
        res.render('explore-random', { title: 'FoodRecipes - Explore Random', recipe } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
    }  
}

/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async(req, res) => {
    const infoErrorObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    res.render('submit-recipe', { title: 'FoodRecipes - Submit Recipe', infoErrorObj, infoSubmitObj } );
}

/**
 * POST /submit-recipe
 * Submit Recipe
*/

exports.submitRecipeOnPost = async (req, res) => {
    try {
        // Check if files are uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            req.flash('infoError', 'Please upload an image.');
            return res.redirect('/submit-recipe');
        }

        let imageUploadFile = req.files.image;
        let newImageName = Date.now() + '-' + imageUploadFile.name;
        let uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

        // Move the uploaded image to the desired directory
        imageUploadFile.mv(uploadPath, function(err) {
            if (err) {
                req.flash('infoError', 'Error occurred while uploading the image.');
                return res.redirect('/submit-recipe');
            }
        });

        // Create a new recipe object
        const ingredients = req.body.ingredients; 
        const newRecipe = new Recipe({
            name: req.body.name,
            description: req.body.description,
            email: req.user.email,
            ingredients: ingredients,
            category: req.body.category,
            image: newImageName
        });

        await newRecipe.save(); // Save the recipe          

        // Set success message and redirect to submit recipe page
        req.flash('infoSubmit', 'Recipe has been submitted successfully!');
        res.redirect(`/recipe/${newRecipe._id}`);
    } catch (error) {
        // Flash error message and redirect
        req.flash('infoError', 'An error occurred while submitting the recipe.');
        res.redirect('/submit-recipe');
    }
};

// Route to delete a recipe (GET)
exports.deleteRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);

        if (req.user.role === 'admin' || recipe.email === req.user.email) {
            await Recipe.deleteOne({ _id: recipeId });
            req.flash('infoSubmit', 'Recipe has been deleted successfully!');
            res.redirect('/my-recipes');
        } else {
            req.flash('infoError', 'You are not authorized to delete this recipe.');
            res.redirect('/my-recipes');
        }
    } catch (error) {
        console.log('Error deleting recipe:', error);
        req.flash('infoError', 'An error occurred while deleting the recipe.');
        res.redirect('/my-recipes');
    }
};

// GET /recipe/edit/:id - Render edit page with recipe data
exports.editRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (req.user.role !== 'admin' && recipe.email !== req.user.email) {
            req.flash('infoError', 'You are not authorized to edit this recipe.');
            return res.redirect('/my-recipes');
        }

        res.render('edit-recipe', { title: 'Edit Recipe', recipe });
    } catch (error) {
        req.flash('infoError', 'An error occurred while fetching the recipe.');
        res.redirect('/my-recipes');
    }
};

// POST /recipe/edit/:id - Handle recipe update
exports.updateRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);

        if (recipe && (recipe.email === req.user.email || req.user.role === 'admin')) {
            console.log("Ingredients received:", req.body.ingredients);
            let ingredients = req.body.ingredients || [];
            if (!Array.isArray(ingredients)) {
                ingredients = [ingredients];
            }

            ingredients = ingredients.filter(ingredient => ingredient.trim() !== '');
            if (ingredients.length === 0) {
                ingredients = recipe.ingredients;
            }
            recipe.name = req.body.name;
            recipe.description = req.body.description;
            recipe.ingredients = req.body.ingredients || recipe.ingredients;  // Ingredients as an array
            recipe.category = req.body.category;

            // Handle image upload
            if (req.files && req.files.image) {
                let imageUploadFile = req.files.image;
                let newImageName = Date.now() + '-' + imageUploadFile.name;
                let uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
                imageUploadFile.mv(uploadPath, function(err) {
                    if (err) return res.status(500).send(err);
                });
                recipe.image = newImageName;
            }

            await recipe.save();
            req.flash('infoSubmit', 'Recipe has been updated successfully!');
            res.redirect(`/recipe/${recipe._id}`);
        } else {
            req.flash('infoError', 'You are not authorized to update this recipe.');
            res.redirect('/my-recipes');
        }
    } catch (error) {
        console.log('Error updating recipe:', error);
        req.flash('infoError', 'An error occurred while updating the recipe.');
        res.redirect('/my-recipes');
    }
};

exports.getAllRecipes = async (page = 1, limit = 15) => {
    try {
        // Define the number of recipes per page
        const skip = (page - 1) * limit;

        // Fetch recipes with pagination
        const recipes = await Recipe.find()
            .skip(skip)    // Skip the previous pages
            .limit(limit); // Limit to the number of recipes per page

        // Get total recipe count to calculate total pages
        const totalRecipes = await Recipe.countDocuments();
        const totalPages = Math.ceil(totalRecipes / limit);

        return { recipes, totalPages, currentPage: page };
    } catch (error) {
        throw new Error('Error fetching recipes: ' + error);
    }
};

// Add a recipe to the favorites list
exports.addFavorite = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user._id;

        // Check if the recipe is already in the user's favorites
        const user = await User.findById(userId);
        if (user.favorites.includes(recipeId)) {
            req.flash('infoError', 'Recipe already added to favorites.');
            return res.redirect(`/recipe/${recipeId}`);
        }

        // Add the recipe to the favorites array
        user.favorites.push(recipeId);
        await user.save();

        req.flash('infoSubmit', 'Recipe added to favorites.');
        res.redirect(`/recipe/${recipeId}`);
    } catch (error) {
        req.flash('infoError', 'An error occurred while adding to favorites.');
        res.redirect(`/recipe/${recipeId}`);
    }
};

// Remove a recipe from the favorites list
exports.removeFavorite = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const userId = req.user._id;

        // Remove the recipe from the favorites array
        const user = await User.findById(userId);
        user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
        await user.save();

        req.flash('infoSubmit', 'Recipe removed from favorites.');
        res.redirect(`/recipe/${recipeId}`);
    } catch (error) {
        req.flash('infoError', 'An error occurred while removing from favorites.');
        res.redirect(`/recipe/${recipeId}`);
    }
};

// GET favorite recipes for the logged-in user
exports.getFavoriteRecipes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'favorites'
        }); // Populate the favorite recipes
        console.log('Populated User Favorite Recipes:', user.favorites);
        
        const favorites = user.favorites;

        res.render('favorite-recipes', {
            title: 'Favorite Recipes',
            recipes: favorites,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
        req.flash('infoError', 'An error occurred while fetching your favorite recipes.');
        res.redirect('/'); // Redirect to the home page in case of error
    }
};

exports.addComment = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { commentText } = req.body;

        // Find the recipe by ID
        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            req.flash('infoError', 'Recipe not found.');
            return res.redirect(`/recipe/${recipeId}`);
        }

        // Add the new comment
        recipe.comments.push({
            user: req.user._id, // Logged-in user's ID
            commentText: commentText
        });

        // Save the updated recipe
        await recipe.save();

        req.flash('infoSubmit', 'Comment added successfully!');
        res.redirect(`/recipe/${recipeId}`); // Redirect back to the recipe detail page
    } catch (error) {
        console.error('Error adding comment:', error);
        req.flash('infoError', 'An error occurred while adding your comment.');
        res.redirect(`/recipe/${req.params.id}`);
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const recipeId = req.params.recipeId;
        const commentId = req.params.commentId;

        // Find the recipe by ID
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            req.flash('infoError', 'Recipe not found.');
            return res.redirect(`/recipe/${recipeId}`);
        }

        // Remove the comment with the specified commentId
        const commentIndex = recipe.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            req.flash('infoError', 'Comment not found.');
            return res.redirect(`/recipe/${recipeId}`);
        }

        // Remove the comment from the comments array
        recipe.comments.splice(commentIndex, 1);
        await recipe.save();

        req.flash('infoSubmit', 'Bình luận đã được xóa thành công!');
        res.redirect(`/recipe/${recipeId}`); // Redirect back to the recipe detail page
    } catch (error) {
        console.error('Error deleting comment:', error);
        req.flash('infoError', 'Có lỗi xảy ra khi xóa bình luận.');
        res.redirect(`/recipe/${req.params.recipeId}`);
    }
};
