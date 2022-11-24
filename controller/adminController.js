var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Project = require('../models/project');
var csrf = require('csurf');
var config_passport = require('../config/passport.js');
var moment = require('moment');
var Leave = require('../models/leave');
var bcrypt=require('bcrypt-nodejs');
var Holiday = require('../models/holiday');

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
    subject: 'Your status of leave',
    text: ''
  };

router.use('/', isLoggedIn, function isAuthenticated(req, res, next) {
    next();
});
const logout=(isLoggedIn, function logoutUser(req, res, next) {
    req.session.destroy();
    req.logout(); // destroys the csurf token
    res.redirect('/');
});

const adminHome=(function viewHome(req, res, next) {
    if(req.session.user.type=="admin"){
    res.render('Admin/adminHome', {
        title: 'Admin Home',
        hasErrors:0,
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });return
}res.render("error")
});

const balanceLeave=(function viewProfile(req, res, next) {

    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Admin/balanceLeaves', {
            title: 'Balance Leaves',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });
});

const aboutUs=(req,res)=>{
    res.render("partials/admin/aboutUs",{
        userName: req.session.user.name
    });
}

const contactUs=(req,res)=>{
    res.render("partials/admin/contactUs",{
        userName: req.session.user.name
    });
};

const viewProfile=( function viewProfile(req, res, next) {
    if(req.session.user.type=="admin"){
    User.findById(req.session.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('Admin/viewProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });return
    }res.render("error")
});

const allEmployee=( function viewAllEmployees(req, res, next) {
    if(req.session.user.type=="admin"){
    var userChunks = [];
    var chunkSize = 3;
    //find is asynchronous function
    User.find({$or: [{type: 'Employee'}, {type: 'Manager'},{type:'Senior'}]}).sort({_id: -1}).exec(function getUsers(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            userChunks.push(docs[i]);
        }
        res.render('Admin/viewAllEmployee', {
            title: 'All Employees',
            csrfToken: req.csrfToken(),
            users: userChunks,
            userName: req.session.user.name
        });
    });return
}res.render("error")
});

const addEmployee=(function addEmployee(req, res, next) {
    if(req.session.user.type=="admin"){
    var messages = req.flash('error');
    var newUser = new User();
    
    res.render('Admin/addEmployee', {
        title: 'Add Employee',
        csrfToken: req.csrfToken(),
        user: config_passport.User,
        messages: messages,
        hasErrors: messages.length > 0,
        userName: req.session.user.name,

    });return
}res.render("error")

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

        res.render('Admin/publicHoliday', {
            title: 'List Of Public Holidays',
            csrfToken: req.csrfToken(),
            hasHoliday: hasHoliday,
            holiday: holidayChunks,
            userName: req.session.user.name
        });
    });
});

const addHoliday=(function addEmployee(req, res, next) {
    var messages = req.flash('error');
    var newUser = new User();
    
    res.render('Admin/addHoliday', {
        title: 'Add Holiday',
        csrfToken: req.csrfToken(),
        user: config_passport.User,

        userName: req.session.user.name,
    });
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
            if(docs[i].role=="Employee"||docs[i].role=="Manager"||docs[i].role=="Senior"){
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
            res.render('Admin/allApplications', {
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
    if(req.session.user.type=="admin"){
    Leave.findById(leaveID, function getLeave(err, leave) {

        if (err) {
            console.log(err);
        }
        User.findById(employeeID, function getUser(err, user) {
            console.log(user)
            if (err) {
                console.log(err);
            }
            res.render('admin/applicationResponse', {
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
            res.redirect('/admin/leave-applications');
        })
    })

});

const getEmployeeProject=(function getAllEmployeePojects(req, res, next) {
    var employeeId = req.params.id;
    var projectChunks = [];

    //find is asynchronous function
    Project.find({employeeID: employeeId}).sort({_id: -1}).exec(function findProjectOfEmployee(err, docs) {
        var hasProject = 0;
        if (docs.length > 0) {
            hasProject = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            projectChunks.push(docs[i]);
        }
        User.findById(employeeId, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Admin/employeeAllProjects', {
                title: 'List Of Employee Projects',
                hasProject: hasProject,
                projects: projectChunks,
                csrfToken: req.csrfToken(),
                user: user,
                userName: req.session.user.name
            });
        });

    });
});

const getEmployeeProfile=(function getEmployeeProfile(req, res, next) {
    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('Admin/employeeProfile', {
            title: 'Employee Profile',
            employee: user,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });
    });
});

const editEmployee=(function editEmployee(req, res, next) {
    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/admin/');
        }
        res.render('Admin/editEmployee', {
            title: 'Edit Employee',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});


const editEmployeeProject=(function editEmployeeProject(req, res, next) {
    var projectId = req.params.id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        res.render('Admin/editProject', {
            title: 'Edit Employee',
            csrfToken: req.csrfToken(),
            project: project,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});


const addEmployeeProject=(function addEmployeeProject(req, res, next) {

    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/admin/');
        }
        res.render('Admin/addProject', {
            title: 'Add Employee Project',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });

    });

});

const employeeProjectInfo=(function viewEmployeeProjectInfo(req, res, next) {
    var projectId = req.params.id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        User.findById(project.employeeID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Admin/projectInfo', {
                title: 'Employee Project Information',
                project: project,
                employee: user,
                moment: moment,
                message: '',
                userName: req.session.user.name,
                csrfToken: req.csrfToken()
            });
        })

    });

});



const redirectEmployeeProfile=(function viewEmployeeProfile(req, res, next) {
    var employeeId = req.user.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/employee-profile/' + employeeId);

    });

});

const postAddEmployee=(passport.authenticate('local.add-employee', {
    
    successRedirect: '/admin/redirect-employee-profile',
    failureRedirect: '/admin/add-employee',
    failureFlash: true,
})
);

const postAddHoliday =(function applyForHoliday(req, res, next) {
    
    var newHoliday = new Holiday();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var date  = new Date(req.body.date);
    newHoliday.date=date.toLocaleDateString("en-IN", options)
    
    newHoliday.desc = req.body.desc;
    newHoliday.save(function saveHoliday(err) {
        if (err) {
            console.log("inside"+err);
        }
        
        res.redirect('/admin/view-holiday');
    });

});

const postEditEmployee=(function editEmployee(req, res) {
    var employeeId = req.params.id;
    var newUser = new User();
    newUser.email = req.body.email;
    if (req.body.designation == "Manager") {
        newUser.type = "Manager";
    }
    else if (req.body.designation == "Senior") {
        newUser.type = "Senior";
    }
    else {
        newUser.type = "Employee";
    }
    newUser.name = req.body.name,
        newUser.dateOfBirth = new Date(req.body.DOB),
        newUser.contactNumber = req.body.number,
        newUser.department = req.body.department;
    newUser.Skills = req.body['skills[]'];
    newUser.designation = req.body.designation;

    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            res.redirect('/admin/');
        }
        if (user.email != req.body.email) {
            User.findOne({'email': req.body.email}, function getUser(err, user) {
                if (err) {
                    res.redirect('/admin/');
                }
                if (user) {
                    res.render('Admin/editEmployee', {
                        title: 'Edit Employee',
                        csrfToken: req.csrfToken(),
                        employee: newUser,
                        moment: moment,
                        message: 'Email is already in use', userName: req.session.user.name
                    });

                }
            });
        }
        user.email = req.body.email;
        if (req.body.designation == "Manager") {
            user.type = "Manager";
        }
        else {
            user.type = "Employee";
        }
        user.name = req.body.name,
            user.dateOfBirth = new Date(req.body.DOB),
            user.contactNumber = req.body.number,
            user.department = req.body.department;
        user.Skills = req.body['skills[]'];
        user.designation = req.body.designation;

        user.save(function saveUser(err) {
            if (err) {
                console.log(error);
            }
            res.redirect('/admin/employee-profile/' + employeeId);

        });
    });

});


const postAddEmployeeProject=(function addEmployeeProject(req, res) {
    var newProject = new Project();
    newProject.employeeID = req.params.id;
    newProject.title = req.body.title;
    newProject.type = req.body.type;
    newProject.startDate = new Date(req.body.start_date),
        newProject.endDate = new Date(req.body.end_date),
        newProject.description = req.body.description,
        newProject.status = req.body.status;

    newProject.save(function saveProject(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin/employee-project-info/' + newProject._id);


    });

});


const postEditEmployeeProject=(function editEmployeeProject(req, res) {
    var projectId = req.params.id;
    var newProject = new Project();

    Project.findById(projectId, function (err, project) {
        if (err) {
            console.log(err);
        }
        project.title = req.body.title;
        project.type = req.body.type;
        project.startDate = new Date(req.body.start_date),
            project.endDate = new Date(req.body.end_date),
            project.description = req.body.description,
            project.status = req.body.status;

        project.save(function saveProject(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/admin/employee-project-info/' + projectId);

        });
    });

});

const postDeleteEmployee=(function deleteEmployee(req, res) {
    var id = req.params.id;
    User.findByIdAndRemove({_id: id}, function deleteUser(err) {
        if (err) {
            console.log('unable to delete employee');
        }
        else {
            res.redirect('/admin/view-all-employees');
        }
    });
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    res.render('admin/applyForLeave', {
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
                    
                    // res.redirect('/admin/applied-leaves');
                });
            res.redirect('/admin/applied-leaves');
            }
        
    });
      
    

});


const applyForLeave=(function applyForLeave(req, res, next) {
    var messages = req.flash('error');
    res.render('admin/applyForLeave', {
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

        res.render('Admin/appliedLeaves', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name,
            moment:moment
        });
    });

});

const changePassword=(function changePassword(req, res, next) {
    var messages = req.flash('error');
    res.render('Admin/changePassword', {
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
        errors.push({ msg: "New passwords do not match." });
    }
    
    //Check password length
    if (newPassword.length < 6 || confirmNewPassword.length < 6) {
        errors.push({ msg: "Password should be at least six characters." });
    }
    
    if (errors.length > 0) {
        // var messages = req.flash('error');
        res.render("Admin/changePassword", {
            title: 'Change Password ',
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
                    res.redirect("/admin");
                } else {
                    //Password does not match
                    messages=errors.push({ msg: "Current password is not a match." });
                    res.render("Admin/changePassword", {
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





function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
module.exports={
    adminHome,
    aboutUs,
    contactUs,
    viewProfile,
    applyForLeave,
    appliedLeave,
    postApplyForLeave,
    allEmployee,
    addEmployee,
    viewHoliday,
    addHoliday,
    leaveApplication,
    getEmployeeProject,
    getEmployeeProfile,
    editEmployee,
    editEmployeeProject,
    addEmployeeProject,
    employeeProjectInfo,
    redirectEmployeeProfile,
    balanceLeave,
    postAddEmployee,
    postAddHoliday,
    postRespondApplication,
    respondApplicationId,
    postEditEmployee,
    postAddEmployeeProject,
    postEditEmployeeProject,
    postDeleteEmployee,
    changePassword,
    postChangePassword,
    logout
}