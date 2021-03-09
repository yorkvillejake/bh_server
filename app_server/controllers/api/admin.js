const Admin = require('../../models/admin');

let login = function(req, res)
{
  let token = req.body.token;

  Admin.findByToken(token, function(err, user) {
    if (err) return res.json({ success: false, message: err.message });
    if (user) return res.json({ success: false, message: "You are already logged in" })

    Admin.findOne({ name: req.body.name }, function(e, u) {
      if (!u) return res.json({ success: false, message: "There is not such admin"})
      u.comparepassword(req.body.password, function (e, isMatch) {
        if (!isMatch) return res.json({ success: false, message: "Incorrect Password"})

        u.generateToken((e, gu) => {
          if (e) return res.json({ success: false, message: e.message })
          res.json({ success: true, token: gu.token, account_id: gu.id })
        })
      })
    })
  })
}

let logout = function(req, res)
{
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.json({ success: false, message: err.message })
    res.json({ success: true })
  })
}

module.exports = {
  login,
  logout
}