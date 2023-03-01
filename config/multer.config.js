const multer = require('multer');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage }).array('files');

module.exports = upload;
