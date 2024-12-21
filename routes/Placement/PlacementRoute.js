const express = require('express');
const {
    createPlacement,
    getAllPlacements,
    getPlacementById,
    updatePlacement,
    deletePlacement,
} = require('../../controllers/placement/Placement');

const router = express.Router();

// Route to create a new Placement
router.post('/', createPlacement);

// Route to get all Placements
router.get('/', getAllPlacements);

// Route to get a Placement by ID
router.get('/:id', getPlacementById);

// Route to update a Placement by ID
router.put('/:id', updatePlacement);

// Route to delete a Placement by ID
router.delete('/:id', deletePlacement);

module.exports = router;
