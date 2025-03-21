const User = require('../models/User');

// Fetch all users for the admin
exports.getAllUsers = async () => {
    try {
        return await User.find();  // Fetch all users from the database
    } catch (error) {
        throw new Error('Error fetching users: ' + error);
    }
};

// Handle user update (name, email, role)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        // Update the user with the new details
        const updatedUser = await User.findByIdAndUpdate(id, { name, email, role }, { new: true });

        req.flash('infoSubmit', 'User updated successfully!');
        res.redirect('/admin/dashboard'); // Redirect back to admin dashboard
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('infoError', 'Error updating user.');
        res.redirect('/admin/dashboard');
    }
};

// Handle user deletion
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);

        req.flash('infoSubmit', 'User deleted successfully!');
        res.redirect('/admin/dashboard'); // Redirect back to admin dashboard
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('infoError', 'Error deleting user.');
        res.redirect('/admin/dashboard');
    }
};
