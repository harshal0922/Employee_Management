var express = require('express');
var router = express.Router();
var csrf = require('csurf');
const adminController=require("../controller/adminController");

router.get("/",adminController.adminHome);
router.get("/logout",adminController.logout);
router.get("/aboutUs",adminController.aboutUs);
router.get("/contactUs",adminController.contactUs);
router.get("/view-profile",adminController.viewProfile);
router.get("/view-all-employees",adminController.allEmployee);
router.get("/add-employee",adminController.addEmployee);
router.get("/view-holiday",adminController.viewHoliday);
router.get("/add-holiday",adminController.addHoliday);
router.get("/leave-applications",adminController.leaveApplication);
router.get("/all-employee-projects/:id",adminController.getEmployeeProject);
router.get("/employee-profile/:id",adminController.getEmployeeProfile);
router.get('/edit-employee/:id',adminController.editEmployee);
router.get('/edit-employee-project/:id',adminController.editEmployeeProject);
router.get('/add-employee-project/:id',adminController.addEmployeeProject);
router.get('/employee-project-info/:id',adminController.employeeProjectInfo);
router.get("/redirect-employee-profile",adminController.redirectEmployeeProfile);
router.get("/balance-leaves",adminController.balanceLeave);
router.post("/add-employee",adminController.postAddEmployee);
router.post("/add-holiday",adminController.postAddHoliday);
router.post("/edit-employee/:id",adminController.postEditEmployee);
router.post("/add-employee-project/:id",adminController.postAddEmployeeProject);
router.post("/edit-employee-project/:id",adminController.postEditEmployeeProject);
router.post("/delete-employee/:id",adminController.postDeleteEmployee);
router.post("/respond-application",adminController.postRespondApplication);
router.get("/respond-application/:leave_id/:employee_id",adminController.respondApplicationId);

router.get("/apply-for-leave",adminController.applyForLeave);
router.get("/applied-leaves",adminController.appliedLeave);
router.get("/change-password",adminController.changePassword);
router.post("/change-password",adminController.postChangePassword);
router.post("/apply-for-leave",adminController.postApplyForLeave);


module.exports = router;
