const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size too large. Maximum size is 2GB'
        });
      }
    }
    
    res.status(500).json({
      error: 'Something went wrong!'
    });
  };
  
  module.exports = errorHandler;