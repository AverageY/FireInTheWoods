const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // req.originalUrl is the url that the user is requesting
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
const storeReturnTo = (req, res, next) => {   // this is to store the url that the user is requesting before being logged in
    if (req.session.returnTo) {               //else user gets send to homepage everytime
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports = { isLoggedIn, storeReturnTo };