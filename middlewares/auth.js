const isLoggedIn = (req, res, next) => {
    // Check if user_id is set in the session
    if (req.session.user_id) {
        req.user = { id: req.session.user_id }; // Or include more user info if needed
        return next(); // Proceed to the next middleware or route handler
    } else {
        // If user_id does not exist, redirect to the login page
        res.redirect('/');
    }
};

// Middleware for logging out
const isLogOut = (req, res, next) => {
    // Clear the session and redirect to the home page or login
    if (req.session.user_id) {
            res.redirect('/main'); // Redirect after logout
        };
        next()

};

module.exports = {
    isLoggedIn,
    isLogOut
};
