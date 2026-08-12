const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/v1/categories - Get categories (support tree hierarchy)
router.get('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const { tree } = req.query;

    const categories = await Category.find({ hospitalId, isActive: true }).lean();

    if (tree === 'true') {
      const categoryMap = {};
      categories.forEach(cat => { categoryMap[cat._id] = { ...cat, children: [] }; });
      const rootCategories = [];

      categories.forEach(cat => {
        if (cat.parentId && categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        } else {
          rootCategories.push(categoryMap[cat._id]);
        }
      });

      return res.json({ success: true, data: rootCategories });
    }

    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories/seed - Seed default Section 10 category hierarchy
router.post('/seed', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;

    // Root categories
    const medicinesParent = await Category.findOneAndUpdate(
      { hospitalId, code: 'CAT-MED' },
      { name: 'Medicines', code: 'CAT-MED', itemType: 'MEDICINE', description: 'Pharmaceutical drugs and formulations' },
      { upsert: true, new: true }
    );

    const consumablesParent = await Category.findOneAndUpdate(
      { hospitalId, code: 'CAT-CONS' },
      { name: 'Consumables', code: 'CAT-CONS', itemType: 'CONSUMABLE', description: 'Medical and surgical single-use supplies' },
      { upsert: true, new: true }
    );

    // Section 10 Medicine Subcategories
    await Promise.all([
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-ANTIBIOTICS' }, { name: 'Antibiotics', code: 'CAT-ANTIBIOTICS', parentId: medicinesParent._id, itemType: 'MEDICINE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-ANALGESICS' }, { name: 'Analgesics', code: 'CAT-ANALGESICS', parentId: medicinesParent._id, itemType: 'MEDICINE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-ANTIHYPERTENSIVES' }, { name: 'Antihypertensives', code: 'CAT-ANTIHYPERTENSIVES', parentId: medicinesParent._id, itemType: 'MEDICINE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-EMERGENCY' }, { name: 'Emergency Drugs', code: 'CAT-EMERGENCY', parentId: medicinesParent._id, itemType: 'MEDICINE' }, { upsert: true }),

      // Section 10 Consumable Subcategories
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-SYRINGES' }, { name: 'Syringes', code: 'CAT-SYRINGES', parentId: consumablesParent._id, itemType: 'CONSUMABLE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-GLOVES' }, { name: 'Gloves', code: 'CAT-GLOVES', parentId: consumablesParent._id, itemType: 'CONSUMABLE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-IVSETS' }, { name: 'IV Sets', code: 'CAT-IVSETS', parentId: consumablesParent._id, itemType: 'CONSUMABLE' }, { upsert: true }),
      Category.findOneAndUpdate({ hospitalId, code: 'CAT-CATHETERS' }, { name: 'Catheters', code: 'CAT-CATHETERS', parentId: consumablesParent._id, itemType: 'CONSUMABLE' }, { upsert: true }),
    ]);

    const allCategories = await Category.find({ hospitalId });
    res.json({ success: true, message: 'Section 10 Category hierarchy seeded successfully.', count: allCategories.length, data: allCategories });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories - Create category
router.post('/', async (req, res, next) => {
  try {
    const hospitalId = req.user.hospitalId;
    const category = new Category({ ...req.body, hospitalId });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
