const aboutUs=(req,res)=>{
    res.render("aboutUs");
}
const contactUs=(req,res)=>{
    res.render("contactUs");
}

module.exports={
    aboutUs,
    contactUs,
}