var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveSchema = new Schema({

    applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    email: {type: String, required: true},
    type: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    appliedDate: {type: Date, required: true},
    period: {type: Number, required: true},
    role: {type: String, required: true},
    reason: {type: String, required: true},
    managerResponse: {type: String, default: 'N/A'},
    
});


module.exports = mongoose.model('Leave', LeaveSchema);