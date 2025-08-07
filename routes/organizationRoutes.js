const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} = require('../controllers/organizationController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createOrganization)
  .get(protect, getOrganizations);

router.route('/:id')
  .get(protect, getOrganizationById)
  .put(protect, updateOrganization)
  .delete(protect, deleteOrganization);

module.exports = router;