const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
  const randomNumber = Math.floor(Math.random() * 1000);
  cb(null, `${file.originalname}-${randomNumber}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
