const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const recipeController = require('./recipeController');
const userController = require('../controllers/userController');


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

// Get all users for admin dashboard
exports.getAllUsers = async () => {
    try {
        const users = await User.find({});  // Fetch users from database
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);  // More detailed error log
        throw new Error(`Error fetching users: ${error.message}`);
    }
};


// Admin Dashboard
exports.adminDashboard = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    try {
        const { recipes, totalPages, currentPage } = await recipeController.getAllRecipes(page, limit);
        // Ensure getAllUsers is properly called
        const users = await userController.getAllUsers();  // Fetch users from the database

        res.render('admin-dashboard', {  // Render the dashboard with the fetched data
            user: req.user,
            recipes: recipes,
            totalPages: totalPages,
            currentPage: currentPage,
            users: users  // Ensure users are passed to the view
        });
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);  // Log error
        req.flash('infoError', 'Error fetching data for admin dashboard.');
        res.redirect('/');
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

// Google login route
exports.googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email']  // Request access to profile and email
});

// Google callback route after the user logs in
exports.googleCallback = passport.authenticate('google', {
    failureRedirect: '/login',  // Redirect to login page on failure
    successRedirect: '/'  // Redirect to homepage or dashboard after successful login
});

// Function to render the Forgot Password page
exports.renderForgotPasswordPage = (req, res) => {
    res.render('forgot-password');  // Render the forgot-password.ejs file
};

// Forgot password: Send reset link to user's email
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('infoError', 'No user found with that email address.');
            return res.redirect('/forgot-password');
        }

        // Generate password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
        
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email with reset token
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `To reset your password, please click the following link: \n\n http://localhost:4000/reset-password/${resetToken}`
        };

        await transporter.sendMail(mailOptions);
        req.flash('infoSubmit', 'Password reset email sent.');
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while processing your request.');
        res.redirect('/forgot-password');
    }
};

// Reset password page
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            req.flash('infoError', 'Invalid or expired token.');
            return res.redirect('/login');
        }

        res.render('reset-password', { title: 'Reset Password', token });
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while fetching the user.');
        res.redirect('/login');
    }
};

// Handle the password update after the user submits the reset form
exports.updatePassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            req.flash('infoError', 'Invalid or expired token.');
            return res.redirect('/login');
        }

        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        req.flash('infoSubmit', 'Your password has been updated successfully!');
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while updating your password.');
        res.redirect('/login');
    }
};