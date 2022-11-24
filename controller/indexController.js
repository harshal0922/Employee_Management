const express = require("express");
const router=express.Router();
var passport = require('passport');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);

const login=( function viewLoginPage(req, res, next) {
    var messages = req.flash('error');

    res.render('login', {
        title: 'Log In',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});

const signUp=(function signUp(req, res, next) {

    var messages = req.flash('error');
    res.render('signup', {
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});
const logout=(isLoggedIn, function logoutUser(req, res, next) {
    req.session.destroy();
    req.logout(); // destroys the csurf token
    res.redirect('/');
});

const checkType=(function checkTypeOfLoggedInUser(req, res, next) {
    req.session.user = req.user;
    if (req.user.designation == "Manager") {
        res.redirect('/manager/');
    }
    else if (req.user.designation == "Employee") {
        res.redirect('/employee/');
    }
    else if(req.user.designation=="Senior"){
        res.redirect('/senior/')
    }else{
        res.redirect('/admin/');
    }

});
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports={
    login,
    signUp,
    logout,
    checkType
}