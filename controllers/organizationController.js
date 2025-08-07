const Organization = require('../models/organizationModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new organization
// @route   POST /api/organizations
// @access  Private
const createOrganization = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide organization name');
  }

  const organization = await Organization.create({
    name,
    user: req.user._id,
  });

  res.status(201).json(organization);
});

// @desc    Get all organizations for a user
// @route   GET /api/organizations
// @access  Private
const getOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find({ user: req.user._id });
  res.status(200).json(organizations);
});

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Private
const getOrganizationById = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }

  res.status(200).json(organization);
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private
const updateOrganization = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide organization name');
  }

  const organization = await Organization.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }

  organization.name = name;
  await organization.save();

  res.status(200).json(organization);
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private
const deleteOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }

  await organization.deleteOne();
  res.status(200).json({ message: 'Organization removed' });
});

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};