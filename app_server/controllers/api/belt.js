const Belt = require('../../models/belt');
const BeltGroup = require('../../models/beltgroup');

let getbelts = function(req, res)
{
  Belt.find({}, null, { sort: { sequence: 1 }}).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let getbeltgroups = function(req, res)
{
  BeltGroup.find({}, null).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

module.exports = {
  getbelts,
  getbeltgroups,
}