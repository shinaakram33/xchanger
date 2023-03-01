const s3 = require('../config/s3.config');

const fileFilter = (file) => {
  if (
    file.mimetype == 'image/jpeg' ||
    file.mimetype == 'image/png' ||
    file.mimetype == 'image/jpg' ||
    file.mimetype == null
  ) {
    return true;
  } else {
    return false;
  }
};

exports.uploadFile = async (req, res) => {
  const files = req.files;
  if (!files || files.length < 1) {
    res.status(400).json({
      status: 'fail',
      message: 'No Image Found',
    });
  } else {
    var data;
    var errors = [];
    var locations = [];
    var count = 0;
    files.map(async (item) => {
      if (!fileFilter(item)) {
        count++;
        errors.push('Invalid file format, must be jpeg, jpg or png');
      } else {
        var params = {
          Bucket: process.env.BUCKET,
          Key: 'app/' + item.originalname,
          Body: item.buffer,
          ContentType: item.mimetype,
          ACL: 'public-read',
        };
        var upload = await new Promise((resolve, reject) => {
          s3.upload(params, (err, data) => {
            if (!err) {
              resolve(data);
            } else {
              reject(err);
            }
          });
        });
        if (upload) {
          locations.push(upload.Location);
          count++;
        } else {
          error.push(upload);
          count++;
        }
      }
      if (count == files.length && errors.length < 1) {
        data = { error: false, locations };
        res.status(200).json({
          success: true,
          data: locations,
        });
      } else if (count == files.length && errors.length > 0) {
        data = { error: true, errors };
        res.status(400).json({
          success: true,
          errors: errors,
        });
      }
    });
  }
};
