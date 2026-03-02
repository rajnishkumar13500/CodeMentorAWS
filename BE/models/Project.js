const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, default: '' },
  input: { type: String, default: '' }, // input persistence
  diagram: { type: String, default: '' }, // last saved mermaid diagram
  question: { type: String, default: '' }, // problem statement/question for AI hints
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
