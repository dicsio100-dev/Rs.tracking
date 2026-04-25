const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');

async function getAllUsers(req, res) {
  const { data: users, error } = await supabase.from('users').select('id, username, full_name, role, is_active, created_at').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ users });
}

async function getUserById(req, res) {
  const { data: user, error } = await supabase.from('users').select('id, username, full_name, role, is_active, created_at').eq('id', req.params.id).single();
  if (error || !user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  res.json({ user });
}

async function createUser(req, res) {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !full_name) return res.status(400).json({ error: 'Champs obligatoires manquants.' });

  const hash = bcrypt.hashSync(password, 12);
  
  try {
    const { data: user, error } = await supabase.from('users').insert({ username, password_hash: hash, full_name, role: role || 'assistant' }).select('id, username, full_name, role, is_active, created_at').single();
    if (error) throw error;
    res.status(201).json({ message: 'Utilisateur créé.', user });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Cet identifiant existe déjà.' });
    res.status(500).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  const { full_name, role, is_active, password } = req.body;
  const updates = {};
  
  if (full_name !== undefined) updates.full_name = full_name;
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (password) updates.password_hash = bcrypt.hashSync(password, 12);

  const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select('id, username, full_name, role, is_active, created_at').single();
  if (error) return res.status(500).json({ error: error.message });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

  res.json({ message: 'Utilisateur mis à jour.', user });
}

async function deleteUser(req, res) {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Utilisateur supprimé.' });
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
