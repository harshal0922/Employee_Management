const express = require("express");
const homeController=require("../controller/homeController.js")
const router=express.Router();

router.get("/aboutUs",homeController.aboutUs);
router.get("/contactUs",homeController.contactUs);

module.exports=router;