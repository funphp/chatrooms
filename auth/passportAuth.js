module.exports = function(passport, FacebookStrategy, config, mongoose) {

    var chatUser = new mongoose.Schema({
        profileID : String,
        fullName : String,
        profilePic : String
    })

    var userModel = mongoose.model('chatUser', chatUser);

    passport.serializeUser(function(user, done){
        done(null, user.id);
    })

    passport.deserializeUser(function(id, done){
        userModel.findById(id, function(err, user){
            done(null, user);
        })
    })
    passport.use(new FacebookStrategy({
        clientID: config.fb.appID,
        clientSecret : config.fb.appSecret,
        callbackURL : config.fb.callbackURL,
        profileFields : ['id', 'displayName', 'photos'],

    }, function(accessToken, refreshToken, profile, done){
        //check user in mongodb
        //if not exists then create
        //if exists return profile
        userModel.findOne({'profileID':profile.id}, function(err, result){
            if(result) {
                done(null, result);
            } else{
                //console.log(profile.photos);
                //create new user in mongo
                var newChatUser = new userModel({
                   profileID:  profile.id,
                   fullName : profile.displayName,
                   profilePic : profile.photos[0].value || '',
                })
                newChatUser.save(function(err){
                    done(null, newChatUser);
                })
            }
        })
    }))
}
