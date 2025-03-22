const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Render the signup page
exports.signupPage = (req, res) => {
    res.render('signup', { title: 'Sign Up' });
};

// Handle user signup
exports.signupUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('infoError', 'Email already used.');
            return res.redirect('/signup');
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.login(newUser, (err) => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (error) {
        req.flash('infoError', 'An error occurred while signing up.');
        res.redirect('/signup');
    }
};

// Render the login page
exports.loginPage = (req, res) => {
    res.render('login', { title: 'Login' });
};

// Handle user logout
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};

// Render the user profile page
exports.profilePage = (req, res) => {
    res.render('profile', { title: 'User Profile', user: req.user });
};

// Render the edit profile page
exports.editProfilePage = (req, res) => {
    res.render('edit-profile', { title: 'Edit Profile', user: req.user });
};

// Handle profile update
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        await User.findByIdAndUpdate(req.user._id, { name, email });
        req.flash('infoSubmit', 'Profile updated successfully.');
        res.redirect('/profile');
    } catch (error) {
        req.flash('infoError', 'Error updating profile.');
        res.redirect('/edit-profile');
    }
};

// Render the change password page
exports.changePasswordPage = (req, res) => {
    res.render('change-password', { title: 'Change Password', user: req.user });
};

// Handle password change
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        req.flash('infoError', 'New passwords do not match.');
        return res.redirect('/change-password');
    }

    try {
        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('infoError', 'Incorrect current password.');
            return res.redirect('/change-password');
        }
        user.password = newPassword;
        await user.save();
        req.flash('infoSubmit', 'Password updated successfully.');
        res.redirect('/profile');
    } catch (error) {
        req.flash('infoError', 'Error changing password.');
        res.redirect('/change-password');
    }
};

// Admin Dashboard
exports.adminDashboard = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    try {
        const { recipes, totalPages, currentPage } = await recipeController.getAllRecipes(page, limit);
        const users = await this.getAllUsers();
        res.render('admin-dashboard', {
            user: req.user,
            recipes,
            totalPages,
            currentPage,
            users
        });
    } catch (error) {
        req.flash('infoError', 'Error fetching data for admin dashboard.');
        res.redirect('/');
    }
};

// Get all users for admin dashboard
exports.getAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error('Error fetching users: ' + error);
    }
};

// Update user details (name, email, role)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        await User.findByIdAndUpdate(id, { name, email, role }, { new: true });
        req.flash('infoSubmit', 'User updated successfully!');
        res.redirect('/admin/dashboard');
    } catch (error) {
        req.flash('infoError', 'Error updating user.');
        res.redirect('/admin/dashboard');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        req.flash('infoSubmit', 'User deleted successfully!');
        res.redirect('/admin/dashboard');
    } catch (error) {
        req.flash('infoError', 'Error deleting user.');
        res.redirect('/admin/dashboard');
    }
};
