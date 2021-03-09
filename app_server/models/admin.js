const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config');

const Schema = mongoose.Schema;

var AdminSchema = new Schema ({
  name: {type: String, required: true, maxlength: 80, unique: 1},
  password: {type: String, required: true, minlength: 8},
  loc_id: {type: Schema.ObjectId, ref: 'location'},
  token: {type: String},
})

AdminSchema.pre('save',function(next){
  var user=this;
  
  if(user.isModified('password')){
    bcrypt.genSalt(salt,function(err,salt){
      if(err)return next(err);

      bcrypt.hash(user.password,salt,function(err,hash){
        if(err) return next(err);
          user.password=hash;
          next();
        })
      })
  }
  else {
    next();
  }
});

AdminSchema.methods.comparepassword=function(password,cb){
  cb(null, password == this.password);
  // bcrypt.compare(password,this.password,function(err,isMatch){
  //   if(err) return cb(next);
  //   cb(null,isMatch);
  // });
}

AdminSchema.methods.generateToken=function(cb){
  var user = this;
  var token = jwt.sign(user._id.toHexString(),secret);

  user.token = token;
  user.save(function(err,user){
    if(err) return cb(err);
    cb(null,user);
    return user;
  })
}

AdminSchema.statics.findByToken=function(token,cb){
  var user=this;

  jwt.verify(token, secret, function(err,decode){
    user.findOne({"_id": decode, "token": token},function(err,user){
      if(err) return cb(err);
      cb(null,user);
    })
  })
};

AdminSchema.methods.deleteToken=function(token,cb){
  var user=this;

  user.updateOne({$unset : {token: 1}},function(err,user){
    if(err) return cb(err);
    cb(null,user);
  })
}

module.exports = mongoose.model('Admin', AdminSchema, 'admin');
