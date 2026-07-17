import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { inventoryAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import { Search, Package, AlertTriangle, Plus, ShieldOff } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function Inventory() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      // inventoryAPI.vaccines is the correct method (inventoryAPI.list does not exist)
      const response = await inventoryAPI.vaccines(params);
      const data = response.data;
      setItems(data.results || data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const getStockStatus = (item) => {
    if (item.stock <= 0) return { label: 'Out of Stock', class: 'badge-danger' };
    if (item.stock <= (item.threshold || 10)) return { label: 'Low Stock', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-success' };
  };

  return (
    <motion.div
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <div className="page-header-left">
          <h1>Vaccine Inventory</h1>
          <p>Manage vaccine stock and supplies</p>
        </div>
        <div className="header-actions">
          {!isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <ShieldOff className="w-3 h-3" />
              View only
            </div>
          )}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
          </form>
          {isAdmin && (
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Vaccine
            </button>
          )}
        </div>
      </motion.div>

      {loading ? (
        <Loader text="Loading inventory..." />
      ) : items.length === 0 ? (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-icon">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h3>No Inventory Items</h3>
          <p>No vaccine inventory records found.</p>
        </motion.div>
      ) : (
        <motion.div className="table-container" variants={itemVariants}>
          <table className="table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Type</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Last Updated</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr
                    key={item.id}
                    className={`animate-fade-in ${item.stock <= (item.threshold || 10) ? 'bg-red-50/30' : ''}`}                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                  <td className="font-medium">{item.name}</td>
                    <td className="capitalize text-slate-500">{item.vaccine_type || 'N/A'}</td>
                    <td>
                      <span className={`font-semibold ${item.stock <= (item.threshold || 10) ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="text-slate-500">{item.threshold || 10}</td>
                    <td>
                      <span className={`badge ${stockStatus.class}`}>
                        {stockStatus.label === 'Low Stock' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="text-slate-500">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}</td>
                    {isAdmin && (
                      <td className="actions-cell">
                        <button className="btn-sm" title="Restock">📦</button>
                        <button className="btn-sm" title="Edit">✏️</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
