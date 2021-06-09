const multer = require('multer');
const Admin = require('../models/admin');

let auth =(req, res, next) => {
  // multer().array() (req, res, err => {
    // console.log(req.body)
    if (req.body.for === 'front') {
      delete req.body.for;
      next();
    } else {
      let token = req.body.token;
      Admin.findByToken(token, (err,user) => {
        if(err) throw err;
        if(!user) return res.json({
            success: false, message: 'Unauthorized'
        });
    
        req.token= token;
        req.user=user;
        delete req.body.token;
        next();
      })
    }
  
  // });
}

module.exports= {
  auth
};