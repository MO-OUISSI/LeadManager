const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  nbAppels: {
    type: Number,
    default: 0,
  },
  dateDernierAppel: {
    type: Date,
  },
  dateProchainRDV: {
    type: Date,
  },
  etat: {
    type: String,
    enum: ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'],
    default: 'Nouveau',
  },
  NF: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);