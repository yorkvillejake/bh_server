const Location = require('../../models/location');

let getall = function(req, res)
{
  Location.find({}, null, { sort: { name: 1 }}).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

module.exports = {
  getall,
}