var express = require('express');
var router = express.Router();
const seniorController=require("../controller/seniorController")

router.get("/",seniorController.seniorHome);
router.get("/logout",seniorController.logout);
router.get("/aboutUs",seniorController.aboutUs);
router.get("/contactUs",seniorController.contactUs);
router.get("/view-holiday",seniorController.viewHoliday);
router.get("/view-profile",seniorController.viewProfile);
router.post("/respond-application",seniorController.postRespondApplication);
router.get("/change-password",seniorController.changePassword);
router.post("/change-password",seniorController.postChangePassword);
router.get("/leave-applications",seniorController.leaveApplication);
router.get("/respond-application/:leave_id/:employee_id",seniorController.respondApplicationId);
router.get("/apply-for-leave",seniorController.applyForLeave);
router.get("/applied-leaves",seniorController.appliedLeave);
router.get("/balance-leaves",seniorController.balanceLeave);
router.post("/apply-for-leave",seniorController.postApplyForLeave);
router.get("/view-all-projects",seniorController.viewAllProject);
router.get("/view-project/:project_id",seniorController.viewProjectId);
module.exports=router;