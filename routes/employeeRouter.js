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
const employeeController=require("../controller/employeeController");

// router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
//     next();
// });
router.get("/aboutUs",employeeController.aboutUs);
router.get("/logout",employeeController.logout);
router.get("/",employeeController.employeeHome);
router.get("/contactUs",employeeController.contactUs);
router.get("/apply-for-leave",employeeController.applyForLeave);
router.get("/applied-leaves",employeeController.appliedLeave);
router.get("/public-holiday",employeeController.viewHoliday);
router.get("/view-profile",employeeController.viewProfile);
router.get("/balance-leaves",employeeController.balanceLeave);
router.get("/view-all-projects",employeeController.viewAllProject);
router.get("/view-project/:project_id",employeeController.viewProjectId);
router.post("/apply-for-leave",employeeController.postApplyForLeave);
router.get("/change-password",employeeController.changePassword);
router.post("/change-password",employeeController.postChangePassword);

module.exports = router;



