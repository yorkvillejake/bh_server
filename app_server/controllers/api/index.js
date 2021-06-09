var express = require('express');
var router = express.Router();
const multer = require('multer');

const { auth } = require('../../middleware/auth');
const Admin = require('./admin');
const Student = require('./student');
const Staff = require('./staff');
const Class = require('./class');
const Schedule = require('./schedule');
const Belt = require('./belt');
const Room = require('./room');
const Location = require('./location');
const Check = require('./check');

router.post('/login', Admin.login);
router.post('/logout', auth, Admin.logout);


var avatarStorage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, "./public/uploads/avatars/");
  },
  filename: function(req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});
var avatarUpload = multer({ storage: avatarStorage}).single('avatar'); // .array('file', 3);

router.post('/student/add', avatarUpload, auth, Student.add);
router.post('/student/edit', avatarUpload, auth, Student.edit);
router.post('/student/get', auth, Student.get);
router.post('/student/remove', auth, Student.remove);
router.post('/student/getall', auth, Student.getall);

router.post('/staff/getall', auth, Staff.getall);
router.post('/staff/get', auth, Staff.get);
router.post('/staff/add', auth, Staff.add);
router.post('/staff/edit', auth, Staff.edit);
router.post('/staff/remove', auth, Staff.remove);

router.post('/class/getall', auth, Class.getall);
router.post('/class/get', auth, Class.get);
router.post('/class/add', auth, Class.add);
router.post('/class/edit', auth, Class.edit);
router.post('/class/remove', auth, Class.remove);

router.post('/schedule/gettoday', Schedule.gettoday);
router.post('/schedule/getall', auth, Schedule.getall);
router.post('/schedule/getbyclass', auth, Schedule.getbyclass);
router.post('/schedule/getbystaff', auth, Schedule.getbystaff);
router.post('/schedule/getbyinterval', auth, Schedule.getbyinterval);
router.post('/schedule/getbydate', auth, Schedule.getbydate);
router.post('/schedule/get', auth, Schedule.get);
router.post('/schedule/add', auth, Schedule.add);
router.post('/schedule/edit', auth, Schedule.edit);
router.post('/schedule/remove', auth, Schedule.remove);

router.post('/room/getall', auth, Room.getall);
router.post('/belt/getall', Belt.getbelts);
router.post('/beltgroup/getall', Belt.getbeltgroups);
router.post('/location/getall', Location.getall);

router.post('/check/student/add', Check.addStudent);
router.post('/check/staff/add', Check.addStaff);
router.post('/check/staff/get', auth, Check.getbystaff);
router.post('/check/student/get', auth, Check.getbystudent);
module.exports = router;
