const Lead = require('../models/leadModel');
const Notification = require('../models/notificationModel');

const ajouterLead = async (req, res) => {
  try {
    const { nom, prenom, telephone , nbAppels, dateDernierAppel, dateProchainRDV, etat, NF } = req.body;

    const lead = new Lead({
      nom,
      prenom,
      telephone,
      nbAppels,
      dateDernierAppel,
      dateProchainRDV,
      etat,
      NF: NF !== undefined ? Math.max(0, Math.min(5, Number(NF) || 0)) : 0,
      agent: req.user._id,
    });

    const createdLead = await lead.save();

    await Notification.create({
      message: `Nouveau lead ajouté : ${prenom} ${nom}`,
      userId: req.user._id,
      leadId: createdLead._id,
      type: 'lead',
    });

    res.status(201).json(createdLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('agent', 'name email');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('agent', 'name email');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const modifierLead = async (req, res) => {
  try {
    const leadBefore = await Lead.findById(req.params.id);

    if (!leadBefore)
      return res.status(404).json({ message: 'Lead not found' });

    // Validate and normalize NF if provided
    const updateData = { ...req.body };
    if (updateData.NF !== undefined) {
      updateData.NF = Math.max(0, Math.min(5, Number(updateData.NF) || 0));
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    await Notification.create({
      message: `Lead mis à jour : ${updatedLead.prenom} ${updatedLead.nom}`,
      userId: req.user._id,
      leadId: updatedLead._id,
      type: 'lead',
    });

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const supprimerLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead)
      return res.status(404).json({ message: 'Lead not found' });

    await Lead.findByIdAndDelete(req.params.id);

    await Notification.create({
      message: `Lead supprimé : ${lead.prenom} ${lead.nom}`,
      userId: req.user._id,
      leadId: lead._id,
      type: 'lead',
    });

    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  ajouterLead,
  getAllLeads,
  getLead,
  modifierLead,
  supprimerLead,
};
