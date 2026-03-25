import express from 'express';
import {
  getAllItems,
  searchItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  uploadItemImages
} from '../controllers/items.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/items
// @desc    List all items (with filters)
router.get('/', getAllItems);

// @route   GET /api/items/search?q=keyword
// @desc    Search items
router.get('/search', searchItems);

// @route   GET /api/items/:id
// @desc    Get single item
router.get('/:id', getItemById);

// @route   POST /api/items
// @desc    Post new item
router.post('/', verifyToken, createItem);

// @route   PUT /api/items/:id
// @desc    Edit item
router.put('/:id', verifyToken, updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete item
router.delete('/:id', verifyToken, deleteItem);

// @route   POST /api/items/:id/images
// @desc    Upload item images (max 5)
router.post('/:id/images', verifyToken, upload.array('images', 5), uploadItemImages);

export default router;
