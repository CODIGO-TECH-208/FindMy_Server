import Item from "../models/Item.js";

// get all items (with filters)
export const getAllItems = async (req, res) => {
  try {
    const { type, category, status, location, sort } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: "i" };

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "date") sortOption = { date: -1 };

    const items = await Item.find(filter)
      .populate("postedBy", "name email studentId")
      .sort(sortOption);

    return res.status(200).json({
      message: "Items retrieved successfully.",
      count: items.length,
      items
    });

  } catch (error) {
    console.error("Get all items error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// search items
export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required." });
    }

    const items = await Item.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } }
      ]
    })
      .populate("postedBy", "name email studentId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Search results retrieved.",
      count: items.length,
      items
    });

  } catch (error) {
    console.error("Search items error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// get single item
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("postedBy", "name email studentId phoneNumber");

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    return res.status(200).json({
      message: "Item retrieved successfully.",
      item
    });

  } catch (error) {
    console.error("Get item error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// post new item
export const createItem = async (req, res) => {
  try {
    const {
      title, type, category, description,
      date, location, locationDetails, rewardOffered
    } = req.body;

    if (!title || !type || !category || !description || !date || !location) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const item = await Item.create({
      postedBy: req.user.id,
      title,
      type,
      category,
      description,
      date,
      location,
      locationDetails,
      rewardOffered: rewardOffered || false,
      expiresAt
    });

    return res.status(201).json({
      message: "Item posted successfully.",
      item
    });

  } catch (error) {
    console.error("Create item error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// edit item
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this item." });
    }

    const allowedUpdates = [
      "title", "type", "category", "description",
      "date", "location", "locationDetails", "status", "rewardOffered"
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    return res.status(200).json({
      message: "Item updated successfully.",
      item
    });

  } catch (error) {
    console.error("Update item error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// delete item
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this item." });
    }

    await item.deleteOne();

    return res.status(200).json({
      message: "Item deleted successfully."
    });

  } catch (error) {
    console.error("Delete item error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// upload item images
export const uploadItemImages = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to upload images for this item." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided." });
    }

    const imagePaths = req.files.map((file) => file.path);
    item.images.push(...imagePaths);
    await item.save();

    return res.status(200).json({
      message: "Images uploaded successfully.",
      images: item.images
    });

  } catch (error) {
    console.error("Upload images error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
