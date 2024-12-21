const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../../controllers/media/mediaController');
const Media = require('../../models/media/mediaModel');
const router = express.Router();

// Handle file uploads
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const media = new Media({
    name: req.file.filename,
    originalName: req.file.originalname,
    url: `uploads/${req.file.filename}`,
    type: Media.getFileType(req.file.mimetype),
    size: req.file.size,
    description: req.body.description || null, 
    alt: req.body.alt || null, 
    title: req.body.title || null, 
    isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
    dateUploaded: new Date(),
  });

  try {
    const savedMedia = await media.save();
    res.json(savedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const mediaFiles = await Media.find();
    res.json(mediaFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single media file by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).send('Media not found.');
    }
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a single media file by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedMedia = await Media.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedMedia) {
      return res.status(404).send('Media not found.');
    }
    res.json(updatedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete a single media file by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      return res.status(404).send('Media not found.');
    }

    // Remove the file from the filesystem
    const filePath = path.join(__dirname, '../../uploads', media.name);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.send('Media deleted successfully.');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// { THIS CODE DOES NOT WORK PROPERLY} {Bulk delete media files by IDsF}

// router.delete('/delete', async (req, res) => {
//   const { ids } = req.body;

//   if (!Array.isArray(ids) || ids.length === 0) {
//     return res.status(400).send('No IDs provided.');
//   }

//   try {
//     const mediaFiles = await Media.find({ _id: { $in: ids } });

//     if (mediaFiles.length === 0) {
//       return res.status(404).send('No media files found.');
//     }

//     // Delete files from the filesystem
//     const deleteFilePromises = mediaFiles.map(async media => {
//       const filePath = path.join(__dirname, '../../uploads', media.name);
//       return fs.promises.unlink(filePath).catch(err => {
//         console.error(`Failed to delete file: ${filePath}`, err);
//       });
//     });

//     await Promise.all(deleteFilePromises);
//     // Delete media records from the database
//     await Media.deleteMany({ _id: { $in: ids } });

//     res.send('Media files deleted successfully.');
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
