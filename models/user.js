var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
require('mongoose-type-email');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

    type: {type: String},
    email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
    password: {type: String, required: true},
    empId: {type: String},
    name: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    contactNumber: {type: String, required: true},
    department: String,
    Skills: [String],
    designation: String,
    dateAdded: {type: Date},
    balanceLeave:{
        SickLeave:{type: Number, default: 15},
        CasualLeave:{type: Number, default: 15},
        PersonalLeave:{type: Number, default: 15},
        MaternityLeave:{type: Number, default: 180},
        PaternityLeave:{type: Number, default: 30},
        MarriageLeave:{type: Number, default: 15},
        AdoptionLeave:{type: Number, default: 30},
    },

});

UserSchema.methods.encryptPassword = function (password) { // whwenever a new user is created
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null); 
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', UserSchema);