require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
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

        res.render('index', { title: 'FoodRecipes - Homepage', categories, food } );
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
        const recipe = await Recipe.findById(recipeId);
        res.render('recipe', { title: 'FoodRecipes - Recipe', recipe } );
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
            email: req.user.email, // Assuming the user is logged in
            ingredients: ingredients,
            category: req.body.category,
            image: newImageName
        });

        await newRecipe.save(); // Save the recipe          

        // Set success message and redirect to submit recipe page
        req.flash('infoSubmit', 'Recipe has been submitted successfully!');
        console.log('Flash messages set:', req.flash());
        res.redirect('/submit-recipe');
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
            res.redirect('/my-recipes');
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

