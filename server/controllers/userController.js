const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const recipeController = require('./recipeController');
const userController = require('../controllers/userController');

// Helper function to get Next.js frontend URL
const getFrontendUrl = (path = '') => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}${path}`;
};


// Redirect to Next.js signup page
exports.signupPage = (req, res) => {
    res.redirect(getFrontendUrl('/signup'));
};

// Handle user signup
exports.signupUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('infoError', 'Email already used.');
            return res.redirect(getFrontendUrl('/signup'));
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        req.login(newUser, (err) => {
            if (err) return next(err);
            res.redirect(getFrontendUrl('/'));
        });
    } catch (error) {
        req.flash('infoError', 'An error occurred while signing up.');
        res.redirect(getFrontendUrl('/signup'));
    }
};

// Redirect to Next.js login page
exports.loginPage = (req, res) => {
    res.redirect(getFrontendUrl('/login'));
};

// Handle user logout
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(getFrontendUrl('/'));
    });
};

// Redirect to Next.js profile page
exports.profilePage = (req, res) => {
    res.redirect(getFrontendUrl('/profile'));
};

// Redirect to Next.js edit profile page
exports.editProfilePage = (req, res) => {
    res.redirect(getFrontendUrl('/edit-profile'));
};

// Handle profile update
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        await User.findByIdAndUpdate(req.user._id, { name, email });
        req.flash('infoSubmit', 'Profile updated successfully.');
        res.redirect(getFrontendUrl('/profile'));
    } catch (error) {
        req.flash('infoError', 'Error updating profile.');
        res.redirect(getFrontendUrl('/edit-profile'));
    }
};

// Redirect to Next.js change password page
exports.changePasswordPage = (req, res) => {
    res.redirect(getFrontendUrl('/change-password'));
};

// Handle password change
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        req.flash('infoError', 'New passwords do not match.');
        return res.redirect(getFrontendUrl('/change-password'));
    }

    try {
        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            req.flash('infoError', 'Incorrect current password.');
            return res.redirect(getFrontendUrl('/change-password'));
        }
        user.password = newPassword;
        await user.save();
        req.flash('infoSubmit', 'Password updated successfully.');
        res.redirect(getFrontendUrl('/profile'));
    } catch (error) {
        req.flash('infoError', 'Error changing password.');
        res.redirect(getFrontendUrl('/change-password'));
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

        // Redirect to Next.js admin dashboard
        const pageParam = page > 1 ? `?page=${page}` : '';
        res.redirect(getFrontendUrl(`/admin/dashboard${pageParam}`));
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);  // Log error
        req.flash('infoError', 'Error fetching data for admin dashboard.');
        res.redirect(getFrontendUrl('/'));
    }
};

// Update user details (name, email, role)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            req.flash('infoError', 'User not found.');
            return res.redirect(getFrontendUrl('/admin/dashboard'));
        }

        // Nếu là user Google, không cho phép cập nhật email
        if (user.googleId) {
            await User.findByIdAndUpdate(id, { name, role }, { new: true });
        } else {
            await User.findByIdAndUpdate(id, { name, email, role }, { new: true });
        }

        req.flash('infoSubmit', 'User updated successfully!');
        res.redirect(getFrontendUrl('/admin/dashboard'));
    } catch (error) {
        req.flash('infoError', 'Error updating user.');
        res.redirect(getFrontendUrl('/admin/dashboard'));
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        req.flash('infoSubmit', 'User deleted successfully!');
        res.redirect(getFrontendUrl('/admin/dashboard'));
    } catch (error) {
        req.flash('infoError', 'Error deleting user.');
        res.redirect(getFrontendUrl('/admin/dashboard'));
    }
};

// Google login route
exports.googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email']  // Request access to profile and email
});

// Google callback route after the user logs in
exports.googleCallback = passport.authenticate('google', {
    failureRedirect: getFrontendUrl('/login'),  // Redirect to login page on failure
    successRedirect: getFrontendUrl('/')  // Redirect to homepage or dashboard after successful login
});

// Redirect to Next.js forgot password page
exports.renderForgotPasswordPage = (req, res) => {
    res.redirect(getFrontendUrl('/forgot-password'));
};

// Forgot password: Send reset link to user's email
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('infoError', 'No user found with that email address.');
            return res.redirect(getFrontendUrl('/forgot-password'));
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
            text: `To reset your password, please click the following link: \n\n https://recipeswebsite-o52h.onrender.com/reset-password/${resetToken}`
        };

        await transporter.sendMail(mailOptions);
        req.flash('infoSubmit', 'Password reset email sent.');
        res.redirect(getFrontendUrl('/login'));
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while processing your request.');
        res.redirect(getFrontendUrl('/forgot-password'));
    }
};

// Reset password page
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            req.flash('infoError', 'Invalid or expired token.');
            return res.redirect(getFrontendUrl('/login'));
        }

        // Redirect to Next.js reset password page
        res.redirect(getFrontendUrl(`/reset-password/${token}`));
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while fetching the user.');
        res.redirect(getFrontendUrl('/login'));
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
            return res.redirect(getFrontendUrl('/login'));
        }

        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        req.flash('infoSubmit', 'Your password has been updated successfully!');
        res.redirect(getFrontendUrl('/login'));
    } catch (error) {
        console.log(error);
        req.flash('infoError', 'An error occurred while updating your password.');
        res.redirect(getFrontendUrl('/login'));
    }
};