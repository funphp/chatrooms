var express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    path = require('path'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbUrl),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy

    rooms =[];

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
var env = process.env.NODE_ENV || "development";

if(env =='development') {
    app.use(session({secret:config.sessionSecret, resave:true, saveUninitialized:true}));
} else{
    app.use(session({
        secret:config.sessionSecret,
        resave:true,
        saveUninitialized:true,
        store: new ConnectMongo({
            //url: config.dbUrl,
            mongooseConnection:mongoose.connections[0],
            stringify : true
        })
    }));
}

//** this is testing code , not required for this apps
/*var userSchema = mongoose.Schema({
    username:String,
    password:String,
    fullname:String
});

var person = mongoose.model('users', userSchema);

var jhon = new person({
    username:"jhondoe",
    password:"jhondoe",
    fullname:"Jhon Doe"
});

jhon.save(function(err){
    console.log('Done');
});*/
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);


/*app.listen(3000, function(){
    console.log('server running on '+env+" mode");
});*/
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function(){
    console.log('server running on '+app.get('port'));
})







