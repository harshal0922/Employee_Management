var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var holidaySchema = new Schema({
    date: {type: String, required: false},
    desc:{type:String,required:false},
});


module.exports = mongoose.model('Holiday', holidaySchema);