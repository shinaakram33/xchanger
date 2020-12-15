const multer = require('multer');

var storage = multer.memoryStorage();
// console.log('storuage', storage);
var upload = multer({ storage: storage }).array('files');

module.exports = upload;
