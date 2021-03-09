const Room = require('../../models/room');

let getall = function(req, res)
{
  var query = {};
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  Room.find(query).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

module.exports = {
  getall
}