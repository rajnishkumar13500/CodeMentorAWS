const express = require('express');
const router = express.Router();
const Project = require('../models/DynamoProject');
const { authenticateToken } = require('../middleware/authMiddleware');

const ensureAuth = authenticateToken;

// List all projects for logged-in user
router.get('/', ensureAuth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
    // Normalize legacy fields before sending to client
    const normalized = projects.map((p) => {
      const obj = p.toObject();
      obj.diagram = obj.diagram || obj.mermaidDiagram || '';
      obj.input = obj.input || '';
      obj.question = obj.question || '';
      return obj;
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new project
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, language, code = '', input = '', diagram = '', question = '' } = req.body;
    const project = new Project({
      user: req.user._id,
      name,
      language,
      code,
      input,
      diagram,
      question
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update code, language, input, diagram, or name for a project
router.patch('/:id', ensureAuth, async (req, res) => {
  try {
    const { code, language, diagram, name, input, question } = req.body;
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const updates = {};
    if (typeof code === 'string') updates.code = code;
    if (typeof input === 'string') updates.input = input;
    if (typeof language === 'string') updates.language = language;
    if (typeof diagram === 'string') updates.diagram = diagram;
    if (typeof name === 'string') updates.name = name;
    if (typeof question === 'string') updates.question = question;

    const updatedProject = await project.updateOne(updates);
    const obj = updatedProject.toObject();
    obj.diagram = obj.diagram || obj.mermaidDiagram || '';
    obj.input = obj.input || '';
    obj.question = obj.question || '';

    res.json({
      success: true,
      project: obj,
      message: 'Project updated successfully'
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate key error',
        message: 'A project with this data already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
