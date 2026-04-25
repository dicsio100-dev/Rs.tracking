const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const { generateToken } = require('../middleware/auth');

async function login(req, res) {
  const { username, password } = req.body;

  const { data: user, error } = await supabase.from('users').select('*').eq('username', username).eq('is_active', true).single();
  if (error || !user) return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });

  const token = generateToken(user);
  res.json({ message: 'Connexion réussie', token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
}

async function getMe(req, res) {
  const { data: user, error } = await supabase.from('users').select('id, username, full_name, role, created_at').eq('id', req.user.id).single();
  if (error || !user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  res.json({ user });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

  const valid = bcrypt.compareSync(oldPassword, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Ancien mot de passe incorrect.' });

  const hash = bcrypt.hashSync(newPassword, 12);
  const { error } = await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Mot de passe mis à jour avec succès.' });
}

module.exports = { login, getMe, changePassword };
