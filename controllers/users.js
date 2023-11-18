const User = require('../models/user');
const session = require('express-session');

const renderRegister = (req, res) => {
    res.render('users/register');
}

const register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

const renderLogin = (req, res) => {
    res.render('users/login');
}


const login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // 
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

const logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}; 

module.exports = { renderRegister, register, renderLogin, login, logout }