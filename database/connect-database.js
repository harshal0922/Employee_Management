var User= require('../models/user');
var bcrypt=require('bcrypt-nodejs');
var mongoose= require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('localhost:27017/test');

var users=[
    new User({
        type: 'admin',
        email: 'harshal@gmail.com',
        designation:"HR",
        password: bcrypt.hashSync('admin123', bcrypt.genSaltSync(5), null),
        name: 'Harshal Patil',
        dateOfBirth: new Date('1990-05-26'),
        contactNumber: '0300-4297859',
    }),
];
//save function is asynchronous
//so we need to ceck all itmes are saved before we disconnect to db
done=0;
for (i=0;i<users.length;i++){
    users[i].save(function(err,result){
        done++;
        if(done==users.length){
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}