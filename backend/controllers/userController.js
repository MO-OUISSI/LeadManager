const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ _id: user._id, email: user.email, role: user.role }, 'your-secret-key', { expiresIn: '24h' });
};

exports.checkAdminExists = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    res.json({ exists: !!existingAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin account already exists. Only one admin is allowed.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();
    res.status(201).json({ message: 'Admin account created successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ message: 'Email is already in use.' });
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'agent'
    });

    await user.save();
    res.status(201).json({ message: 'Agent created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('-password');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (password) {
      req.body.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: 'Agent updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await User.findById(id).select('-password');

    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
