require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const path = require('path');
const mongoose = require("mongoose");
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const multer = require('multer');
const { Readable, getGridFSBucket, getGFS } = require('../models/database');

// Helper function to get Next.js frontend URL
const getFrontendUrl = (path = '') => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}${path}`;
};


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

        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/'));
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
        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/categories'));
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
        // Redirect to Next.js frontend
        const categoryName = encodeURIComponent(categoryId);
        res.redirect(getFrontendUrl(`/categories/${categoryName}`));
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
        const recipe = await Recipe.findById(req.params.id)
            .populate('comments.user', 'name');
        if (recipe) {
            // Redirect to Next.js frontend
            res.redirect(getFrontendUrl(`/recipe/${recipe._id}`));
        } else {
            res.redirect(getFrontendUrl('/explore-latest'));
        }
    } catch (error) {
        console.log('Error fetching recipe:', error);
        req.flash('infoError', 'An error occurred while fetching the recipe.');
            res.redirect(getFrontendUrl('/explore-latest'));
    }
}

/**
 * POST / search
 * Search
*/
exports.searchRecipe = async (req, res) => {
    const searchTerm = req.body.searchTerm.trim();
    const searchType = req.body.searchType; // This will be either "name" or "ingredients"

    try {
        let query = {};

        if (searchType === 'name') {
            // Search by recipe name
            query.name = { $regex: searchTerm, $options: 'i' };
        } else if (searchType === 'ingredients') {
            // Search by ingredient
            query.ingredients = { $regex: searchTerm, $options: 'i' };
        }

        const recipes = await Recipe.find(query); // Execute the query based on search type

        // Redirect to Next.js frontend with search params
        const searchParams = new URLSearchParams({
            q: searchTerm,
            type: searchType
        });
        res.redirect(getFrontendUrl(`/search?${searchParams.toString()}`));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        req.flash('infoError', 'An error occurred while processing your search.');
            res.redirect(getFrontendUrl('/explore-latest'));
    }
};

/**
 * GET /exlpore-latest
 * Explore Latest
*/
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find({}).sort({_id: -1 }).limit(limitNumber);
        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/explore-latest'));
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
        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/explore-random'));
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
    if (!req.user) {  // Check if the user is not logged in
        return res.redirect(getFrontendUrl('/login'));  // Redirect to login page if not logged in
    }
    // Redirect to Next.js frontend
    res.redirect(getFrontendUrl('/submit-recipe'));
}

/**
 * POST /submit-recipe
 * Submit Recipe
*/

exports.submitRecipeOnPost = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            req.flash('infoError', 'Please upload an image.');
            return res.redirect(getFrontendUrl('/submit-recipe'));
        }

        const image = req.files.image;
        const filename = Date.now() + '-' + image.name;

        const readStream = Readable.from(image.data);
        const uploadStream = getGridFSBucket().openUploadStream(filename, {
            contentType: image.mimetype
        });

        readStream.pipe(uploadStream)
            .on('error', (err) => {
                console.error('Upload Error:', err);
                req.flash('infoError', 'Image upload failed.');
                return res.redirect(getFrontendUrl('/submit-recipe'));
            })
            .on('finish', async () => {
                const ingredients = Array.isArray(req.body.ingredients)
                    ? req.body.ingredients
                    : [req.body.ingredients];

                const newRecipe = new Recipe({
                    name: req.body.name,
                    description: req.body.description,
                    email: req.user.email,
                    ingredients,
                    category: req.body.category,
                    image: filename
                });

                await newRecipe.save();
                req.flash('infoSubmit', 'Recipe submitted successfully!');
                res.redirect(getFrontendUrl(`/recipe/${newRecipe._id}`));
            });

    } catch (error) {
        console.error('Submit Error:', error);
        req.flash('infoError', 'An error occurred while submitting the recipe.');
        res.redirect(getFrontendUrl('/submit-recipe'));
    }
};



// Route to delete a recipe (GET)
exports.deleteRecipe = async (req, res) => {
    try {
        console.log('Delete route triggered for recipe ID:', req.params.id);
        
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);

        console.log("Recipe Email: ", recipe.email);
        console.log("User Email: ", req.user.email);
        console.log("User Role: ", req.user.role);

        if (req.user.role === 'admin' || recipe.email === req.user.email) {
            await Recipe.deleteOne({ _id: recipeId });
            req.flash('infoSubmit', 'Recipe has been deleted successfully!');
            res.redirect(getFrontendUrl('/my-recipes'));
        } else {
            req.flash('infoError', 'You are not authorized to delete this recipe.');
            res.redirect(getFrontendUrl('/my-recipes'));
        }
    } catch (error) {
        console.log('Error deleting recipe:', error);
        req.flash('infoError', 'An error occurred while deleting the recipe.');
        res.redirect(getFrontendUrl('/my-recipes'));
    }
};

// GET /recipe/edit/:id - Render edit page with recipe data
exports.editRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        const categories = await Category.find({});
        if (req.user.role !== 'admin' && recipe.email !== req.user.email) {
            req.flash('infoError', 'You are not authorized to edit this recipe.');
            return res.redirect(getFrontendUrl('/my-recipes'));
        }

        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl(`/recipe/edit/${recipe._id}`));
    } catch (error) {
        req.flash('infoError', 'An error occurred while fetching the recipe.');
        res.redirect(getFrontendUrl('/my-recipes'));
    }
};

// POST /recipe/edit/:id - Handle recipe update
exports.updateRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);

        if (!recipe || (recipe.email !== req.user.email && req.user.role !== 'admin')) {
            req.flash('infoError', 'You are not authorized to update this recipe.');
            return res.redirect(getFrontendUrl('/my-recipes'));
        }

        let ingredients = req.body.ingredients || [];
        if (!Array.isArray(ingredients)) {
            ingredients = [ingredients];
        }

        ingredients = ingredients.filter(ing => ing.trim() !== '');
        if (ingredients.length === 0) {
            ingredients = recipe.ingredients;
        }

        recipe.name = req.body.name;
        recipe.description = req.body.description;
        recipe.ingredients = ingredients;
        recipe.category = req.body.category;

        if (req.files && req.files.image) {
            const image = req.files.image;
            const filename = Date.now() + '-' + image.name;

            const readStream = Readable.from(image.data);
            const uploadStream = getGridFSBucket().openUploadStream(filename, {
                contentType: image.mimetype
            });

            readStream.pipe(uploadStream)
                .on('error', (err) => {
                    console.error('Upload Error:', err);
                    req.flash('infoError', 'Image upload failed.');
                    return res.redirect(getFrontendUrl('/my-recipes'));
                })
                .on('finish', async () => {
                    recipe.image = filename;
                    await recipe.save();
                    req.flash('infoSubmit', 'Recipe updated successfully!');
                    res.redirect(getFrontendUrl(`/recipe/${recipe._id}`));
                });

        } else {
            await recipe.save();
            req.flash('infoSubmit', 'Recipe updated successfully!');
            res.redirect(`/recipe/${recipe._id}`);
        }

    } catch (error) {
        console.error('Update Error:', error);
        req.flash('infoError', 'An error occurred while updating the recipe.');
        res.redirect(getFrontendUrl('/my-recipes'));
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
            return res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
        }

        // Add the recipe to the favorites array
        user.favorites.push(recipeId);
        await user.save();

        req.flash('infoSubmit', 'Recipe added to favorites.');
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
    } catch (error) {
        req.flash('infoError', 'An error occurred while adding to favorites.');
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
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
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
    } catch (error) {
        req.flash('infoError', 'An error occurred while removing from favorites.');
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
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

        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/favorites'));
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
        req.flash('infoError', 'An error occurred while fetching your favorite recipes.');
        res.redirect(getFrontendUrl('/')); // Redirect to the home page in case of error
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
            return res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
        }

        // Add the new comment
        recipe.comments.push({
            user: req.user._id, // Logged-in user's ID
            commentText: commentText
        });

        // Save the updated recipe
        await recipe.save();

        req.flash('infoSubmit', 'Comment added successfully!');
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`)); // Redirect back to the recipe detail page
    } catch (error) {
        console.error('Error adding comment:', error);
        req.flash('infoError', 'An error occurred while adding your comment.');
        res.redirect(getFrontendUrl(`/recipe/${req.params.id}`));
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
            return res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
        }

        // Remove the comment with the specified commentId
        const commentIndex = recipe.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            req.flash('infoError', 'Comment not found.');
            return res.redirect(getFrontendUrl(`/recipe/${recipeId}`));
        }

        // Remove the comment from the comments array
        recipe.comments.splice(commentIndex, 1);
        await recipe.save();

        req.flash('infoSubmit', 'Bình luận đã được xóa thành công!');
            res.redirect(getFrontendUrl(`/recipe/${recipeId}`)); // Redirect back to the recipe detail page
    } catch (error) {
        console.error('Error deleting comment:', error);
        req.flash('infoError', 'Có lỗi xảy ra khi xóa bình luận.');
        res.redirect(`/recipe/${req.params.recipeId}`);
    }
};

// Fetch and render the recipes submitted by the logged-in user
exports.myRecipes = async (req, res) => {
    try {
        const userEmail = req.user.email; // Get the email of the logged-in user
        const userRecipes = await Recipe.find({ email: userEmail }); // Find recipes by the user's email
        // Redirect to Next.js frontend
        res.redirect(getFrontendUrl('/my-recipes'));
    } catch (error) {
        console.error('Error fetching recipes:', error);
        req.flash('infoError', 'An error occurred while fetching your recipes.');
        res.redirect(getFrontendUrl('/profile'));
    }
};
