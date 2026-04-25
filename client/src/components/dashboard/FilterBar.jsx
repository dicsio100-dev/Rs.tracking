import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const FilterBar = ({ filters, onFilterChange }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.users.getAll();
        setUsers(data.users.filter(u => u.role === 'assistant'));
      } catch (error) {
        console.error("Erreur chargement utilisateurs:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      date: new Date().toISOString().split('T')[0],
      user_id: '',
      status: ''
    });
  };

  return (
    <div className="filter-bar card">
      <div className="filter-group">
        <label>Date</label>
        <input 
          type="date" 
          name="date" 
          value={filters.date || ''} 
          onChange={handleChange} 
        />
      </div>

      <div className="filter-group">
        <label>Assistant</label>
        <select 
          name="user_id" 
          value={filters.user_id || ''} 
          onChange={handleChange}
        >
          <option value="">Tous les assistants</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.full_name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Statut Global</label>
        <select 
          name="status" 
          value={filters.status || ''} 
          onChange={handleChange}
        >
          <option value="">Tous les statuts</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="bloque">Bloqué</option>
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn-secondary" onClick={clearFilters}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
};
