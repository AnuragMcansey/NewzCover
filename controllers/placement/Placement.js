const Placement = require("../../models/Placement/PlacementModel");

// Create a new Placement
const createPlacement = async (req, res) => {
    try {
        const { PlacementName } = req.body;

        if (!PlacementName) {
            return res.status(400).json({ message: "Placement name is required" });
        }

        const newPlacement = new Placement({ PlacementName });
        await newPlacement.save();

        res.status(201).json({ message: "Placement created successfully", Placement: newPlacement });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Retrieve all Placements
const getAllPlacements = async (req, res) => {
    try {
        const placements = await Placement.find();
        res.status(200).json(placements);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Retrieve a single Placement by ID
const getPlacementById = async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ message: "Placement not found" });
        }

        res.status(200).json(placement);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a Placement by ID
const updatePlacement = async (req, res) => {
    try {
        const { PlacementName } = req.body;

        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ message: "Placement not found" });
        }

        if (!PlacementName) {
            return res.status(400).json({ message: "Placement name is required" });
        }

        placement.PlacementName = PlacementName;
        const updatedPlacement = await placement.save();

        res.status(200).json({ message: "Placement updated successfully", Placement: updatedPlacement });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a Placement by ID
const deletePlacement = async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({ message: "Placement not found" });
        }

        await Placement.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Placement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createPlacement,
    getAllPlacements,
    getPlacementById,
    updatePlacement,
    deletePlacement,
};
