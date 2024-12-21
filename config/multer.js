const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { getFileType } = require('../utils/fileHelpers');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const type = getFileType(file.mimetype);
    const dir = `uploads/${type}`;
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB
  }
});

module.exports = upload;
