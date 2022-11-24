var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer=require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'harshalpatil092000@gmail.com',
      pass: 'plxhwyoixuikifmk'
    }
  });

  var mailOptions = {
    from: 'harshalpatil092000@gmail.com',
    to: '',
    subject: 'Your Profile has been created',
    text: ''
  };
 


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.add-employee', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // callback return the user
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 6});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        var newUser = new User();
        newUser.email = email;
        if (req.body.designation == "Manager") {
            newUser.type = "Manager";
        }
        else if(req.body.designation=="Employee"){
            newUser.type = "Employee";
        }else{
            newUser.type="Senior"
        }
        newUser.password = newUser.encryptPassword(password);
        newUser.name = req.body.name,
        newUser.dateOfBirth = new Date(req.body.DOB),
        newUser.contactNumber = req.body.number,
        newUser.designation = req.body.designation;
        var empId=createEmpId(req.body.number)
        newUser.empId=empId;
        newUser.dateAdded = new Date();
        mailOptions.to=req.body.email;
        var emailText="Dear "+req.body.name+" We have successfully created your account Your username is "+req.body.email+" and Your password is your contact number http://localhost:8000/ click here and change your password"
        mailOptions.text=emailText;
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info);
            }
          });
        if (user) {
            exports.User = newUser;
            return done(null, false, {message: 'Email is already in use'});
        }
        newUser.save(function (err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

function createEmpId(mobNumber) {
    return "AXIS_"+mobNumber;
  }
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Incorrect email or password'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect email or password'});
        }
        return done(null, user);
    });
}));