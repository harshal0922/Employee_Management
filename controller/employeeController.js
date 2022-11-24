var express = require('express');
var router = express.Router();
var Leave = require('../models/leave');
var Project = require('../models/project');
var moment = require('moment');
var User = require('../models/user');
var csrf = require('csurf');
var csrfProtection = csrf();
var moment = require('moment');
const Holiday = require('../models/holiday');
var bcrypt=require('bcrypt-nodejs');

router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
    next();
});
const logout=(isLoggedIn, function logoutUser(req, res, next) {

    req.logout(); // destroys the csurf token
    res.redirect('/');
});
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

const employeeHome=(function viewHome(req, res, next) {
    if(req.session.user.type=="Employee"){
    res.render('Employee/employeeHome', {
        title: 'Home',
        userName: req.session.user.name,
        csrfToken: req.csrfToken()
    });return
}res.render("error")
});

const aboutUs=(req,res)=>{
    res.render("partials/employee/aboutUs",{
        userName: req.session.user.name
    });
}
const contactUs=(req,res)=>{
    res.render("partials/employee/contactUs",{
        userName: req.session.user.name
    });
}


const applyForLeave=(function applyForLeave(req, res, next) {
    var messages = req.flash('error');
    res.render('Employee/applyForLeave', {
        title: 'Apply for Leave',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name,
        messages: messages,
        hasErrors: false,
    });
});
const changePassword=(function changePassword(req, res, next) {
    var messages = req.flash('error');
    res.render('Employee/changePassword', {
        title: 'Change Password',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name,
        messages: "",
        hasErrors: false,
    });
});
const appliedLeave=(function viewAppliedLeaves(req, res, next) {
    var leaveChunks = [];

    //find is asynchronous function
    Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i]);
        }

        res.render('Employee/appliedLeaves', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name,moment: moment
        });
    });

});

const viewHoliday=(function viewAllHoliday(req, res, next) {
    var holidayChunks = [];

    //find is asynchronous function
    Holiday.find(function getLeaves(err, docs) {
        var hasHoliday = 0;
        if (docs.length > 0) {
            hasHoliday = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            holidayChunks.push(docs[i]);
        }

        res.render('Employee/publicHoliday', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasHoliday: hasHoliday,
            holiday: holidayChunks,
            userName: req.session.user.name
        });
    });

});

const viewProfile=(function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Employee/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });

});

const balanceLeave=(function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Employee/balanceLeaves', {
            title: 'Balance Leaves',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });
});

const viewAllProject=(function viewAllProjects(req, res, next) {

    var projectChunks = [];
    Project.find({employeeID: req.session.user._id}).sort({_id: -1}).exec(function getProjects(err, docs) {
        var hasProject = 0;
        if (docs.length > 0) {
            hasProject = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            projectChunks.push(docs[i]);
        }
        res.render('Employee/viewPersonalProjects', {
            title: 'List Of Projects',
            hasProject: hasProject,
            projects: projectChunks,
            csrfToken: req.csrfToken(),
            userName: req.session.user.name
        });

    });

});

const viewProjectId=(function viewProject(req, res, next) {

    var projectId = req.params.project_id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        res.render('Employee/viewProject', {
            title: 'Project Details',
            project: project,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });


});

const postApplyForLeave=(function applyForLeave(req, res, next) {
    
    var newLeave = new Leave();
    newLeave.applicantID = req.user._id;
    newLeave.email = req.user.email;
    newLeave.title = req.user.name;
    newLeave.type = req.body.type;
    newLeave.role = req.user.type;
    newLeave.startDate = new Date(req.body.start_date);
    newLeave.endDate = new Date(req.body.end_date);
    var endDate=new Date(req.body.end_date);
    var startDate=new Date(req.body.start_date);
    
    newLeave.period = req.body.period;
    newLeave.reason = req.body.reason;
    newLeave.appliedDate = new Date();
    newLeave.managerResponse = 'Pending';
    var Difference_In_Time = endDate.getTime() - startDate.getTime();
    var days= Difference_In_Time / (1000 * 3600 * 24);
    console.log(days+1)
    newLeave.period = days+1;
    leavePeriod=days+1;
    var hasError=0;
    
      User.findById(req.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        const leave=req.body.type;
        var balanceLeave=user.balanceLeave;
        var messages = req.flash('error');
        switch (leave) {
            case 'SickLeave':
                if(balanceLeave.SickLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.SickLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
              break;
            case 'CasualLeave':
                if(balanceLeave.CasualLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.CasualLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
                break;
            case 'PersonalLeave':
                if(balanceLeave.PersonalLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.PersonalLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
              break;
            case 'MaternityLeave':
                if(balanceLeave.MaternityLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.MaternityLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
              break;
            case 'PaternityLeave':
                if(balanceLeave.PaternityLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.PaternityLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
              break;
            case 'MarriageLeave':
                if(balanceLeave.MarriageLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the leave because your remaining "+leave+"s are "+balanceLeave.MarriageLeave+ " days and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
              break;
            case 'AdoptionLeave':
                if(balanceLeave.AdoptionLeave<leavePeriod){
                    hasError=1;
                    var messages = "you cant apply for the the leave because your remaining "+leave+"s are "+balanceLeave.AdoptionLeave+ " days  and you applied for "+leavePeriod+" days";
                    res.render('Employee/applyForLeave', {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: messages,
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                    break;
                }
            }
            if (hasError==0){
                newLeave.save(function saveLeave(err) {
                    if (err) {
                        console.log(err);
                    }
                    
                    // res.redirect('/employee/applied-leaves');
                });
            res.redirect('/employee/applied-leaves');
            }
        
    });
      
    

});


const postChangePassword=(function ensureAuthenticated(req, res) {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    console.log(currentPassword,newPassword,confirmNewPassword)
    // console.log(req.user)
    const userID = req.user._id;
    let errors = [];
    //Check passwords match
    if (newPassword !== confirmNewPassword) {
        errors= "New password does not match confirm password";
    }
    if (currentPassword == newPassword) {
        errors= "Current password is same as new password";
    }
    
    //Check password length
    if (newPassword.length < 6 || confirmNewPassword.length < 6) {
        errors="Password should be at least six characters.";
    }
    
    if (errors.length > 0) {
        // var messages = req.flash('error');
        res.render("Employee/changePassword", {
            title: 'Change Password',
            csrfToken: req.csrfToken(),
            messages: errors,
            hasErrors: true,
            userName: req.session.user.name,
        });
    } else {
        //VALIDATION PASSED
        //Ensure current password submitted matches
        User.findOne({ _id: userID }).then(user => {
            //encrypt newly submitted password
            console.log("jijijd")
            console.log(user.password,newPassword)
            bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    console.log("onsjisjdi")
                    //Update password for user with new password
                    bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newPassword, salt, null, function (err, hash) {
                            if (err) throw err;
                            console.log(user.password)
                            user.password = hash;
                            user.save();
                        })
                    );
                    req.flash("success_msg", "Password successfully updated!");
                    res.redirect("/employee");
                } else {
                    //Password does not match
                    messages=errors.push({ msg: "Current password is not a match." });
                    res.render("Employee/changePassword", {
                        title: 'Apply For Leave ',
                        csrfToken: req.csrfToken(),
                        messages: "Current Password is not a match",
                        hasErrors: true,
                        userName: req.session.user.name,
                    });
                }
            });
        });
    }
});
module.exports={
    employeeHome,
    aboutUs,
    contactUs,
    applyForLeave,
    appliedLeave,
    viewHoliday,
    viewProfile,
    balanceLeave,
    viewAllProject,
    viewProjectId,
    postApplyForLeave,
    logout,
    changePassword,
    postChangePassword
}