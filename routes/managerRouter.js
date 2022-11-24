var express = require('express');
var router = express.Router();
const managerController=require("../controller/managerController")




router.get("/",managerController.managerHome);
router.get("/contactUs",managerController.contactUs);
router.get("/logout",managerController.logout);
router.get("/aboutUs",managerController.aboutUs);
router.post("/respond-application",managerController.postRespondApplication);
router.get("/leave-applications",managerController.leaveApplication);
router.get("/balance-leaves",managerController.balanceLeave);
router.get("/respond-application/:leave_id/:employee_id",managerController.respondApplicationId);
router.get("/view-holiday",managerController.viewHoliday);
router.get("/view-profile",managerController.viewProfile);


router.get("/apply-for-leave",managerController.applyForLeave);
router.get("/applied-leaves",managerController.appliedLeave);
router.get("/change-password",managerController.changePassword);
router.post("/change-password",managerController.postChangePassword);
router.post("/apply-for-leave",managerController.postApplyForLeave);
router.get("/view-all-projects",managerController.viewAllProject);
router.get("/view-project/:project_id",managerController.viewProjectId);

//  var holidayChunks = [];

//     //find is asynchronous function
//     Holiday.find(function getLeaves(err, docs) {
//         var hasHoliday = 0;
//         if (docs.length > 0) {
//             hasHoliday = 1;
//         }
//         for (var i = 0; i < docs.length; i++) {
//             holidayChunks.push(docs[i]);
//         }

//         res.render('Manager/publicHoliday', {
//             title: 'List Of Public Holidays',
//             csrfToken: req.csrfToken(),
//             hasHoliday: hasHoliday,
//             holiday: holidayChunks,
//             userName: req.session.user.name
//         });
//     });

// });


// router.get('/view-employees', function viewEmployees(req, res) {

//     var userChunks = [];
//     var chunkSize = 3;
//   if (req.user.designation === 'Manager') {
//         //find is asynchronous function
//         var salaryChunks = [];

//         User.find({$or: [{type: 'employee'}, {type: 'project_manager'}]}).sort({_id: -1}).exec(function getUser(err, docs) {
//             if (err) {
//                 console.log(err);
//             }
//             for (var i = 0; i < docs.length; i++) {
//                 userChunks.push(docs[i]);
//             }

//         });

//         setTimeout(getUserSalaries, 900);

//         function getUserSalaries() {


//             function callback(i) {
//                 if (i < userChunks.length) {
//                     UserSalary.find({employeeID: userChunks[i]._id}, function (err, salary) {
//                         console.log(i);

//                         if (err) {
//                             console.log(err);
//                         }
//                         if (salary.length > 0) {
//                             salaryChunks.push(salary[0]);
//                         }
//                         else {
//                             var newSalary = new UserSalary();
//                             newSalary.accountManagerID = req.session.user._id;
//                             newSalary.employeeID = userChunks[i]._id;
//                             newSalary.save(function (err) {
//                                 if (err) {
//                                     console.log(err);
//                                 }
//                                 salaryChunks.push(newSalary);
//                             })
//                         }

//                         callback(i + 1);
//                     });
//                 }
//             }

//             callback(0);

//         }

//         setTimeout(render_view, 2000);
//         function render_view() {


//             res.render('Manager/viewemp_accountant', {
//                 title: 'List Of Employees', csrfToken: req.csrfToken(),
//                 users: userChunks, salary: salaryChunks, userName: req.session.user.name
//             });

//         }


//     }


// });

//  router.post('/respond-application', function respondApplication(req, res) {

//     Leave.findById(req.body.leave_id, function getLeave(err, leave) {
//         leave.managerResponse = req.body.status;
//         leave.save(function saveLeave(err) {
//             if (err) {
//                 console.log(err);
//             }
//             // mailOptions.to=req.body.email;
//             var emailText="Your leave have been recieved to us and manager has "+req.body.status+" your leave"
//             mailOptions.text=emailText;
//             mailOptions.to=leave.email;
//             transporter.sendMail(mailOptions, function(error, info){
//                 if (error) {
//                   console.log(error);
//                 } else {
//                   console.log('Email sent: ' + info);
//                 }
//               });
//             res.redirect('/manager/leave-applications');
//         })
//     })


// });
//  router.get('/leave-applications', function getLeaveApplications(req, res, next) {

//     var leaveChunks = [];
//     var employeeChunks = [];
//     var temp;
//     //find is asynchronous function
//     Leave.find({}).sort({_id: -1}).exec(function findAllLeaves(err, docs) {
//         var hasLeave = 0;
//         if (docs.length > 0) {
//             hasLeave = 1;
//         }
//         for (var i = 0; i < docs.length; i++) {
//             leaveChunks.push(docs[i])
//         }
//         for (var i = 0; i < leaveChunks.length; i++) {

//             User.findById(leaveChunks[i].applicantID, function getUser(err, user) {
//                 if (err) {
//                     console.log(err);
//                 }
//                 // console.log(user)
//                 employeeChunks.push(user);

//             })
//         }

//         // call the rest of the code and have it execute after 3 seconds
//         setTimeout(render_view, 1500);
//         function render_view() {
//             res.render('Manager/allApplications', {
//                 title: 'List Of Leave Applications',
//                 csrfToken: req.csrfToken(),
//                 hasLeave: hasLeave,
//                 leaves: leaveChunks,
//                 employees: employeeChunks, moment: moment, userName: req.session.user.name
//             });
//         }
//     });

// });
//  router.get('/respond-application/:leave_id/:employee_id', function respondApplication(req, res, next) {
//     var leaveID = req.params.leave_id;
//     var employeeID = req.params.employee_id;
//     Leave.findById(leaveID, function getLeave(err, leave) {

//         if (err) {
//             console.log(err);
//         }
//         User.findById(employeeID, function getUser(err, user) {
//             if (err) {
//                 console.log(err);
//             }
//             res.render('manager/applicationResponse', {
//                 title: 'Respond Leave Application',
//                 csrfToken: req.csrfToken(),
//                 leave: leave,
//                 employee: user,
//                 moment: moment, userName: req.session.user.name
//             });


//         })


//     });


// });

// router.get('/apply-for-leave', function applyForLeave(req, res, next) {

//     res.render('Manager/managerApplyForLeave', {
//         title: 'Apply for Leave',
//         csrfToken: req.csrfToken(),
//         userName: req.session.user.name
//     });
// });
// router.get('/applied-leaves', function appliedLeaves(req, res, next) {

//     var leaveChunks = [];

//     //find is asynchronous function
//     Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeave(err, docs) {
//         var hasLeave = 0;
//         if (docs.length > 0) {
//             hasLeave = 1;
//         }
//         for (var i = 0; i < docs.length; i++) {
//             leaveChunks.push(docs[i]);
//         }

//         res.render('Manager/managerAppliedLeaves', {
//             title: 'List Of Applied Leaves',
//             csrfToken: req.csrfToken(),
//             hasLeave: hasLeave,
//             leaves: leaveChunks,
//             userName: req.session.user.name
//         });
//     });

// });

// router.get('/view-profile', function viewProfile(req, res, next) {

//     User.findById(req.user._id, function getUser(err, user) {
//         if (err) {
//             console.log(err);

//         }
//         res.render('Manager/viewManagerProfile', {
//             title: 'Profile',
//             csrfToken: req.csrfToken(),
//             employee: user,
//             moment: moment,
//             userName: req.session.user.name
//         });
//     });

// });


// router.post('/apply-for-leave', function applyForLeave(req, res, next) {

//     var newLeave = new Leave();
//     newLeave.applicantID = req.user._id;
//     newLeave.title = req.body.title;
//     newLeave.type = req.body.type;
//     newLeave.startDate = new Date(req.body.start_date);
//     newLeave.endDate = new Date(req.body.end_date);
//     newLeave.period = req.body.period;
//     newLeave.reason = req.body.reason;
//     newLeave.appliedDate = new Date();
//     newLeave.adminResponse = 'Pending';
//     newLeave.save(function saveLeave(err) {
//         if (err) {
//             console.log(err);
//         }
//         res.redirect('/manager/applied-leaves');
//     });

// });
module.exports = router;



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}