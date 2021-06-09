const moment = require('moment');
const LogStudent = require('../../models/logstudent');
const LogStaff = require('../../models/logstaff');
const Schedule = require('../../models/schedule');
const Belt = require('../../models/belt');
const Class = require('../../models/class');
const { getToday } = require('../../helper');
let ObjectId = require('mongoose').Types.ObjectId;

let getbystaff = function(req, res)
{
  var query = req.body;
  query.staff = ObjectId(query.staff);

  LogStaff.find(query)
  .sort({ 'createdAt': 1 }).lean()
  .exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });

    return res.json({ success: true, result: docs })
  })
}

let _is_consecutive = async function(pre, cur)
{
  if (!pre.student._id.equals(cur.student._id) || !pre.class_id._id.equals(cur.class_id._id)) {
    return false;
  }

  let pdate = moment(pre.createdAt).add(1, 'days').startOf('day').toISOString();
  let cdate = moment(cur.createdAt).startOf('day').toISOString(); // .utcOffset(0)

  let log_between = await LogStudent.findOne({
    student: pre.student._id,
    is_missed: { $ne: true },
    class_id: pre.class_id._id,
    createdAt: {
      $gt: pdate,
      $lt: cdate,
    }
  });

  if (log_between) return false;
  return true;
}

let _getmissedclasses = async function(req, res)
{
  var query = req.body;
  if (query.student) query.student = ObjectId(query.student);
  if (query.class_id) query.class_id = ObjectId(query.class_id);
  let belt_id = query.belt;
  if (query.belt) delete query.belt;
  let consecutive = query.consecutive || 1;
  if (query.consecutive) delete query.consecutive;

  try {
    var belts = await Belt.find({}).lean();
    let docs = await LogStudent.find(query).populate('student', 'firstname lastname levels')
    .populate('class_id', 'belt_group', Class)
    .select('is_late is_wrong class_name createdAt student')
    .sort({ 'student.firstname': 1, 'student.lastname': 1, class_name: 1, createdAt: 1 });
      
    let ret = [];
    for (var i=0; i< docs.length; i++)
    {
      var nLevels = docs[i].student.levels ? docs[i].student.levels.length : 0;
      docs[i].belt = '';
      let found = false;
      for (var j=0; j<nLevels; j++)
      {
        var belt = belts.find(b => b._id.equals(docs[i].student.levels[j]));
        if (belt && belt.group.equals(docs[i].class_id.belt_group)) {
          docs[i].belt = belt.name;
          if (belt._id.equals(belt_id)) found = true;
          break;
        }
      }
      delete docs[i].levels;
      if (!belt_id || found) ret.push(docs[i]);
    }

    let final = [];
    let nconsecutive = 1;
    let pre_idx = 0;
    for (var i=1; i<ret.length; i++) {
      let pre = ret[i-1];
      let cur = ret[i];
      let is_consec = await _is_consecutive(pre, cur);
      if (!is_consec) {
        // next group
        if (nconsecutive >= consecutive) {
          for (var j=pre_idx; j<i; j++) final.push(ret[j]);
        }
        pre_idx = i;
        nconsecutive = 0;
      } 
      nconsecutive += 1;
    }

    if (nconsecutive >= consecutive) {
      for (var j=pre_idx; j<ret.length; j++) final.push(ret[j]);
    }

    return res.json({ success: true, result: final });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
}

let getbystudent = async function(req, res)
{
  if (req.body.is_missed) {
    return _getmissedclasses(req, res);
  }
  
  var query = req.body;
  if (query.student) query.student = ObjectId(query.student);
  if (query.class_id) query.class_id = ObjectId(query.class_id);
  let belt_id = query.belt;
  if (query.belt) delete query.belt;
  query.is_missed = { $ne: true };

  var belts = await Belt.find({}).lean();
  LogStudent.find(query).populate('student', 'firstname lastname levels')
  .populate('class_id', 'belt_group', Class)
  .select('is_late is_wrong class_name createdAt student')
  .sort({ createdAt: 1, class_name: 1 })
  .lean().exec((err, docs) => {
    if (err)
      return res.json({ success: false, message: err.message });
    
    let ret = [];
    for (var i=0; i< docs.length; i++)
    {
      var nLevels = docs[i].student.levels ? docs[i].student.levels.length : 0;
      docs[i].belt = '';
      let found = false;
      for (var j=0; j<nLevels; j++)
      {
        var belt = belts.find(b => b._id.equals(docs[i].student.levels[j]));
        if (belt && belt.group.equals(docs[i].class_id.belt_group)) {
          docs[i].belt = belt.name;
          if (belt._id.equals(belt_id)) found = true;
          break;
        }
      }
      delete docs[i].levels;
      delete docs[i].class_id;
      if (!belt_id || found) ret.push(docs[i]);
    }

    return res.json({ success: true, result: ret })
  })
}

let addStudent = async function(req, res)
{
  try {
    let schedule = await Schedule.findById(req.body.schedule_id);
    if (!schedule) 
      return res.json({ success: false, message: 'Schedule not found'});
    
    let current = moment().format('HH:mm');
    if (current.localeCompare(schedule.time_end) >= 0)
      return res.json({ success: false, message: 'Class already ended'});

    let is_late = current.localeCompare(schedule.time_start) >= 0;
    let params = req.body;
    params.is_late = is_late;

    // check if the student has already checked in
    let today = getToday();
    let log = await LogStudent.find({ student: ObjectId(params.student), schedule_id: params.schedule_id, createdAt: { $gte: today }});
    if (log && log.length)
      return res.json({ success: false, message: "You already checked in the class"});

    const adoc = await new LogStudent(req.body).save();
    return res.json({ success: true, id: adoc.id })
  } catch(e) {
    return res.json({ success: false, message: e.message });
  }
}

let addStaff = async function(req, res)
{
  try {
    // check if the student has already checked in
    let params = req.body;
    // let today = getToday();
    // let log = await LogStaff.find({ staff: ObjectId(params.staff), createdAt: { $gte: today }});
    // if (log && log.length)
    //   return res.json({ success: false, message: "You already checked in"});

    const adoc = await new LogStaff(params).save();
    return res.json({ success: true, id: adoc.id })
  } catch(e) {
    return res.json({ success: false, message: e.message });
  }
}


module.exports = {
  addStudent,
  addStaff,
  getbystaff,
  getbystudent
} 