const path = require('path');
const multer = require('multer');
const Student = require('../../models/student');
const Class = require('../../models/class'); 
const Belt = require('../../models/belt');
// const Attendence = require('../../models/attendence');
let ObjectId = require('mongoose').Types.ObjectId;

let getall = async function(req, res)
{
  var query = req.body;
  if (req.user && req.user.loc_id) query.loc_id = req.user.loc_id;
  else if (!!query.loc_id) query.loc_id = ObjectId(query.loc_id);
  
  var belts = await Belt.find({}).lean();
  var classes = await Class.find({}).lean().exec();
  Student.find(query, [ 'firstname', 'lastname', 'avatar', 'is_active', 'levels', 'attendance', 'birthday', 'date_end' ], { sort: { name: -1 }}).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    for (var i=0; i< docs.length; i++)
    {
      var cur_belts = [];
      var nLevels = docs[i].levels ? docs[i].levels.length : 0;
      for (var j=0; j<nLevels; j++)
      {
        var belt = belts.find(b => b._id.equals(docs[i].levels[j]));
        if (belt) cur_belts.push(belt.name);
      }
      docs[i].belts = cur_belts.join(',');

      var nAtt = docs[i].attendance ? docs[i].attendance.length : 0;
      var cur_classes = [];
      for (var j=0; j<nAtt; j++)
      {
        var cl = classes.find(c => c._id.equals(docs[i].attendance[j].class_id));
        if (cl) cur_classes.push(cl.name);
      }
      delete docs[i].attendance;
      docs[i].class_names = cur_classes.length < 3 ? cur_classes.join(',') : cur_classes[0]+','+cur_classes[1]+' (+'+(cur_classes.length-2)+' more)';
    }
    return res.json({ success: true, result: docs })
  })
}


let get = function(req, res)
{
  var query = req.body;
  if (req.user && req.user.loc_id) query.loc_id = req.user.loc_id;

  Student.findOne(query, null).lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    // Attendence.find({ student_id: req.body._id }).lean().exec((e, atts) => {
    //   if (e)
    //     return res.json({ success: false, message: e.message });

      // docs.attendence = atts;
      return res.json({ success: true, result: docs })
    // })
  })
}

let add = function(req, res)
{
  req.body.loc_id = req.user.loc_id;
  const root_path = path.dirname(require.main.filename);
  if (req.file)
    req.body.avatar = '/uploads/avatars/' + req.file.filename; // path.join(root_path, req.file.path); // 
  if (req.body.levels)
  {
    req.body.levels = req.body.levels.split(',');
  }
  if (req.body.attendance)
  {
    req.body.attendance = JSON.parse(req.body.attendance);
  }
  const aStudent = new Student(req.body);
  aStudent.save((err, doc) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: err.message})
    }
    return res.json({ success: true, id: doc.id })
  })
}

let edit = function(req, res)
{
  const root_path = path.dirname(require.main.filename);
  if (req.file)
    req.body.avatar = '/uploads/avatars/' + req.file.filename; // path.join(root_path, req.file.path); // 
  if (req.body.levels)
  {
    req.body.levels = req.body.levels.split(',');
  }
  if (req.body.attendance)
  {
    req.body.attendance = JSON.parse(req.body.attendance);
  }
  Student.findOneAndUpdate({ _id: req.body._id, loc_id: req.user.loc_id }, req.body, (err, doc) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true });
  })
}

let remove = function(req, res)
{
  Student.findOneAndDelete({ _id: req.body._id, loc_id: req.user.loc_id }, (err) => {
    if (err)
    {
      console.log(err);
      return res.json({ success: false, message: err.message });
    }
    return res.json({ success: true });
  });
}

module.exports = {
  add,
  edit,
  remove,
  get,
  getall
}