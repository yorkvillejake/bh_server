const Schedule = require('../../models/schedule');
const Class = require('../../models/class');
const Student = require('../../models/student');
let ObjectId = require('mongoose').Types.ObjectId;

let getall = function(req, res)
{
  var query = {};
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  Schedule.aggregate()
  .match(query)
  .sort({ 'weekday': 1, 'date': 1 })
  .group({ _id: '$class_id', schedules: { $push : '$$CURRENT'} })
  .lookup({ from: 'class', localField: '_id', foreignField: '_id', as: 'class' })
  .sort({ 'class.name': 1 })
  .exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let getbyclass = async function(req, res)
{
  var query = { class_id: req.body.class_id };
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  var cl = await Class.findOne({ _id: req.body.class_id, loc_id: req.user.loc_id }).lean();
  query.is_regular = cl.is_regular;
  var sort_qry = cl.is_regular ? {weekday: 1, time_start: 1} : { date: 1, time_start: 1};
  Schedule.find(query, null).sort(sort_qry).lean().exec(async (err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    for (var i=0; i<docs.length; i++)
    {
      docs[i].num_students = await Student.find({ 'attendance.schedules': docs[i]._id, is_active: true }).count().exec();
    }
    return res.json({ success: true, result: {schedules: docs, class: cl} });
  })
}

let getbystaff = async function(req, res)
{
  var query = { staffs: req.body.staff_id };
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  var classes = await Class.find({ loc_id: req.user.loc_id }).lean();
  Schedule.find(query, null).lean().exec(async (err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    for (var i=0; i<docs.length; i++)
    {
      var cl = classes.find(c => c._id.equals(docs[i].class_id));
      if (cl) {
        docs[i].class_name = cl.name;
        docs[i].class_is_active = cl.is_active;
      }
      docs[i].num_students = await Student.find({ 'attendance.schedules': docs[i]._id, is_active: true }).count().exec();
    }
    return res.json({ success: true, result: docs });
  })
}

let getbyinterval = function(req, res)
{
  var sp_query = { date: {"$gte": req.body.date_start, "$lt": req.body.date_end}, is_regular: false };
  var query = { is_regular: true };
  if (req.user.loc_id) {
    sp_query.loc_id = req.user.loc_id;
    query.loc_id = req.user.loc_id;
  }

  Schedule.find({$or: [sp_query, query]}, null).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs });
  })
}

let getbydate = async function(req, res)
{
  var sp_query = { date: req.body.date, is_regular: false };
  var date = new Date(req.body.date);
  var query = { is_regular: true, weekday: date.getDay() };
  if (req.user.loc_id) {
    sp_query.loc_id = req.user.loc_id;
    query.loc_id = req.user.loc_id;
  }

  var classes = await Class.find({ loc_id: req.user.loc_id }).lean();
  Schedule.find({$or: [query, sp_query]}, null).lean().exec(async (err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    var result = docs;
    for (var i=0; i<result.length; i++)
    {
      var cl = classes.find(c => c._id.equals(result[i].class_id));
      result[i].class_name = cl ? cl.name : '';
      result[i].class_is_active = cl ? cl.is_active : false;
      result[i].num_students = await Student.find({ 'attendance.schedules': result[i]._id, is_active: true }).count().exec();
    }
    return res.json({ success: true, result });
  })
}

let gettoday = async function(req, res) 
{
  var date = new Date();
  let loc_id = ObjectId(req.body.loc_id);

  var sp_query = { date, is_regular: false, loc_id };
  var query = { is_regular: true, weekday: date.getDay(), loc_id };

  var classes = await Class.find({ loc_id }).lean();
  Schedule.find({$or: [query, sp_query]}, null).sort({ time_start: 1, time_end: 1 }).lean().exec(async (err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    var result = [];
    for (var i=0; i<docs.length; i++)
    {
      var cl = classes.find(c => c._id.equals(docs[i].class_id));
      if (!cl || !cl.is_active) continue;
      docs[i].class_name = cl ? cl.name : '';
      docs[i].class_is_active = true;
      docs[i].num_students = await Student.find({ 'attendance.schedules': docs[i]._id, is_active: true }).count().exec();
      result.push(docs[i]);
    }
    return res.json({ success: true, result });
  })
}

let get = function(req, res)
{
  var query = { _id: req.body._id };
  if (req.user.loc_id) query.loc_id = req.user.loc_id;

  Schedule.findOne(query, null).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let add = function(req, res)
{
  req.body.loc_id = req.user.loc_id;
  const adoc = new Schedule(req.body);
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
  Schedule.findOneAndDelete({ _id: req.body._id, loc_id: req.user.loc_id }, (err) => {
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
  Schedule.findOneAndUpdate({ _id: req.body._id, loc_id: req.user.loc_id }, req.body, (err, doc) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true });
  })
}

module.exports = {
  add,
  edit,
  remove,
  getall,
  getbyclass,
  getbyinterval,
  getbystaff,
  getbydate,
  get,
  gettoday
}