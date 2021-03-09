const Staff = require('../../models/staff');

let getall = async function(req, res)
{
  var query = req.body;
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  Staff.find(query, null, { sort: { name: -1 }}).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let get = async function(req, res)
{
  var query = { _id: req.body._id };
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  Staff.findOne(query, null).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let add = function(req, res)
{
  req.body.loc_id = req.user.loc_id;
  const adoc = new Staff(req.body);
  adoc.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: err.message})
    }
    return res.json({ success: true, id: doc.id })
  })
}

let remove = function(req, res)
{
  Staff.findOneAndDelete({ _id: req.body._id, loc_id: req.user.loc_id }, (err) => {
    if (err)
    {
      console.log(err);
      return res.json({ success: false, message: err.message });
    }
    return res.json({ success: true });
  });
}

let edit = function(req, res)
{
  Staff.findOneAndUpdate({ _id: req.body._id, loc_id: req.user.loc_id }, req.body, (err, doc) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true });
  })
}

module.exports = {
  add,
  edit,
  remove,
  getall,
  get
}