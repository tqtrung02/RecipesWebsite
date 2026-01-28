const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Category = require('../models/Category');
const User = require('../models/User');

// API endpoint to get current user
router.get('/user/current', async (req, res) => {
    try {
        if (!req.user) {
            return res.json(null);
        }
        const user = await User.findById(req.user._id).populate({
            path: 'favorites',
        });
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// API endpoint to get homepage data
router.get('/homepage', async (req, res) => {
    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        const thai = await Recipe.find({ 'category': 'Thái' }).limit(limitNumber);
        const american = await Recipe.find({ 'category': 'Mỹ' }).limit(limitNumber);
        const chinese = await Recipe.find({ 'category': 'Trung' }).limit(limitNumber);
        const vietnamese = await Recipe.find({ 'category': 'Việt' }).limit(limitNumber);

        const food = { latest, thai, american, chinese, vietnamese };

        let user = null;
        if (req.user) {
            try {
                user = await User.findById(req.user._id).populate({
                    path: 'favorites',
                });
                // Ensure favorites is always an array
                if (user && !Array.isArray(user.favorites)) {
                    user.favorites = [];
                }
            } catch (userError) {
                console.error('Error fetching user for homepage:', userError);
                // Continue without user data if there's an error
                user = null;
            }
        }

        res.json({ categories, food, user });
    } catch (error) {
        console.error('Error fetching homepage data:', error);
        res.status(500).json({ error: 'Error fetching homepage data' });
    }
});

// API endpoint to get recipe by ID
router.get('/recipe/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('comments.user', 'name');
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
});

// API endpoint to get categories
router.get('/categories', async (req, res) => {
    try {
        const limitNumber = 20;
        const categories = await Category.find({}).limit(limitNumber);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// API endpoint to get recipes by category
router.get('/categories/:id', async (req, res) => {
    try {
        // Decode the category name from URL parameter
        const categoryId = decodeURIComponent(req.params.id);
        const limitNumber = 20;
        
        // Try to find recipes by category name (exact match)
        let recipes = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        
        // If no recipes found, try to find category first and use its name
        let category = await Category.findOne({ name: categoryId });
        if (!category) {
            // Try to find by ID if categoryId is a valid ObjectId
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(categoryId)) {
                category = await Category.findById(categoryId);
            }
        }
        
        // If we found a category but no recipes, try using the category name from database
        if (category && recipes.length === 0) {
            recipes = await Recipe.find({ 'category': category.name }).limit(limitNumber);
        }
        
        res.json({ recipes, category });
    } catch (error) {
        console.error('Error fetching category recipes:', error);
        res.status(500).json({ error: 'Error fetching category recipes' });
    }
});

// API endpoint to get latest recipes
router.get('/explore-latest', async (req, res) => {
    try {
        const limitNumber = 20;
        const recipes = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching latest recipes:', error);
        res.status(500).json({ error: 'Error fetching latest recipes' });
    }
});

// API endpoint to get random recipe
router.get('/explore-random', async (req, res) => {
    try {
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        res.status(500).json({ error: 'Error fetching random recipe' });
    }
});

// API endpoint to get user's recipes
router.get('/my-recipes', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userEmail = req.user.email;
        const recipes = await Recipe.find({ email: userEmail });
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching user recipes:', error);
        res.status(500).json({ error: 'Error fetching user recipes' });
    }
});

// API endpoint to get user's favorite recipes
router.get('/favorites', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await User.findById(req.user._id).populate({
            path: 'favorites'
        });
        res.json(user.favorites || []);
    } catch (error) {
        console.error('Error fetching favorite recipes:', error);
        res.status(500).json({ error: 'Error fetching favorite recipes' });
    }
});

// API endpoint to search recipes
router.post('/search', async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm?.trim();
        const searchType = req.body.searchType;

        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        let query = {};
        if (searchType === 'name') {
            query.name = { $regex: searchTerm, $options: 'i' };
        } else if (searchType === 'ingredients') {
            query.ingredients = { $regex: searchTerm, $options: 'i' };
        }

        const recipes = await Recipe.find(query);
        res.json({ recipes, searchTerm, searchType });
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Error searching recipes' });
    }
});

// API endpoint to get categories for submit recipe
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// API endpoint to get recipe for editing
router.get('/recipe/:id/edit', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        if (req.user.role !== 'admin' && recipe.email !== req.user.email) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const categories = await Category.find({});
        res.json({ recipe, categories });
    } catch (error) {
        console.error('Error fetching recipe for edit:', error);
        res.status(500).json({ error: 'Error fetching recipe' });
    }
});

// API endpoint for admin dashboard - get recipes with pagination
router.get('/admin/recipes', async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const recipes = await Recipe.find()
            .skip(skip)
            .limit(limit);

        const totalRecipes = await Recipe.countDocuments();
        const totalPages = Math.ceil(totalRecipes / limit);

        res.json({ recipes, totalPages, currentPage: page });
    } catch (error) {
        console.error('Error fetching admin recipes:', error);
        res.status(500).json({ error: 'Error fetching recipes' });
    }
});

// API endpoint for admin dashboard - get all users
router.get('/admin/users', async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// API endpoint to update user (admin only)
router.post('/admin/user/edit-update/:id', async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.googleId) {
            await User.findByIdAndUpdate(id, { name, role }, { new: true });
        } else {
            await User.findByIdAndUpdate(id, { name, email, role }, { new: true });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

// API endpoint to delete user (admin only)
router.delete('/admin/user/delete/:id', async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;
