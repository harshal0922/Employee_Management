var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var config_passport = require('../config/passport.js');
var moment = require('moment');
var Leave = require('../models/leave');
var Holiday = require('../models/holiday');
var nodemailer=require('nodemailer');
var Project = require('../models/project');
var bcrypt=require('bcrypt-nodejs');

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
    subject: 'Your status of leave',
    text: ''
  };



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
router.use('/', isLoggedIn, function isAuthenticated(req, res, next) {
    next();
});
const logout=(isLoggedIn, function logoutUser(req, res, next) {
    req.session.destroy();
    req.logout(); // destroys the csurf token
    res.redirect('/');
});

const seniorHome=(function viewHome(req, res, next) {
    var message="ertyuio"
    if(req.session.user.type=="Senior"){
    res.render('Senior/seniorHome', {
        title: 'senior Home',
        hasErrors:0,
        csrfToken: req.csrfToken(),
        userName: req.session.user.name,
        message:message
    });return
}res.render("error"),{
    title: 'senior Home',
    hasErrors:0,
    csrfToken: req.csrfToken(),
    userName: req.session.user.name,
    message:message
}
});


const aboutUs=(req,res)=>{
    res.render("partials/senior/aboutUs",{
        userName: req.session.user.name
    });
}

const contactUs=(req,res)=>{
    res.render("partials/senior/contactUs",{
        userName: req.session.user.name
    });
};


const postRespondApplication=(function respondApplication(req, res) {
    Leave.findById(req.body.leave_id, function getLeave(err, leave) {
        leave.managerResponse = req.body.status;
        var leaveType=leave.type;
        User.findById(leave.applicantID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }else if(leave.managerResponse=="Approved"){
            var balanceLeave=user.balanceLeave;
            balanceLeave[leaveType]=balanceLeave[leaveType]-leave.period;
            user.save();
        }
        })
            
        leave.save(function saveLeave(err) {
            if (err) {
                console.log(err);
            }
            // mailOptions.to=req.body.email;
            var emailText="Your leave have been recieved to us and manager has "+req.body.status+" your leave"
            mailOptions.text=emailText;
            mailOptions.to=leave.email;
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info);
                }
              })
            res.redirect('/senior/leave-applications');
        })
    })

});
const leaveApplication=(function getLeaveApplications(req, res, next) {

    var leaveChunks = [];
    var employeeChunks = [];
    var temp;
    //find is asynchronous function
    Leave.find({}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            if(docs[i].role=="Manager"||docs[i].role=="admin"){
            leaveChunks.push(docs[i]);
            }
        }
        for (var i = 0; i < leaveChunks.length; i++) {

            User.findById(leaveChunks[i].applicantID, function getUser(err, user) {
                if (err) {
                    console.log(err);
                }
                // console.log(user)
                employeeChunks.push(user);

            })
        }

        // call the rest of the code and have it execute after 3 seconds
        setTimeout(render_view, 1500);
        function render_view() {
            res.render('Senior/allApplications', {
                title: 'List Of Leave Applications',
                csrfToken: req.csrfToken(),
                hasLeave: hasLeave,
                leaves: leaveChunks,
                employees: employeeChunks, moment: moment, userName: req.session.user.name
            });
        }
    });

});
const respondApplicationId=(function respondApplication(req, res, next) {
    var leaveID = req.params.leave_id;
    var employeeID = req.params.employee_id;
    if(req.session.user.type=="Senior"){
    Leave.findById(leaveID, function getLeave(err, leave) {

        if (err) {
            console.log(err);
        }
        User.findById(employeeID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            
            res.render('senior/applicationResponse', {
                title: 'Respond Leave Application',
                csrfToken: req.csrfToken(),
                leave: leave,
                employee: user,
                moment: moment, userName: req.session.user.name
            });


        })


    });return
    }
    res.render("error")

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

        res.render('Senior/publicHoliday', {
            title: 'List Of Public Holidays',
            csrfToken: req.csrfToken(),
            hasHoliday: hasHoliday,
            holiday: holidayChunks,
            userName: req.session.user.name
        });
    });
});



const viewProfile=( function viewProfile(req, res, next) {
    if(req.session.user.type=="Senior"){
    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('senior/viewManagerProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name,
            moment:moment
        });
    });return
    }res.render("error")
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
        res.render('Senior/viewPersonalProjects', {
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
        res.render('Senior/viewProject', {
            title: 'Project Details',
            project: project,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });


});
const changePassword=(function changePassword(req, res, next) {
    var messages = req.flash('error');
    res.render('Senior/changePassword', {
        title: 'Change Password',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name,
        messages: "",
        hasErrors: false,
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
        errors="New passwords do not match confirm password" ;
    }
    if (currentPassword == newPassword) {
        errors= "Current password is same as new password";
    }
    //Check password length
    if (newPassword.length < 6 || confirmNewPassword.length < 6) {
        errors.push({ msg: "Password should be at least six characters." });
    }
    if (errors.length > 0) {
        // var messages = req.flash('error');
        res.render("Senior/changePassword", {
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
            console.log(user.password,newPassword)
            bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
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
                    res.redirect("/senior");
                } else {
                    //Password does not match
                    messages=errors.push({ msg: "Current password is not a match." });
                    res.render("Senior/changePassword", {
                        title: 'Change Password',
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    res.render('senior/applyForLeave', {
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
                    
                    // res.redirect('/senior/applied-leaves');
                });
            res.redirect('/senior/applied-leaves');
            }
        
    });
      
    

});


const applyForLeave=(function applyForLeave(req, res, next) {
    var messages = req.flash('error');
    res.render('senior/applyForLeave', {
        title: 'Apply for Leave',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name,
        messages: messages,
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

        res.render('senior/appliedLeaves', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name,moment:moment
        });
    });

});
const balanceLeave=(function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('senior/balanceLeaves', {
            title: 'Balance Leaves',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });
});


module.exports={
    seniorHome,
    logout,
    viewProfile,
    contactUs,
    aboutUs,
    postRespondApplication,
    leaveApplication,
    respondApplicationId,
    changePassword,
    postChangePassword,
    viewHoliday,
    postApplyForLeave,
    appliedLeave,
    applyForLeave,
    balanceLeave,
    viewAllProject,
    viewProjectId
}

