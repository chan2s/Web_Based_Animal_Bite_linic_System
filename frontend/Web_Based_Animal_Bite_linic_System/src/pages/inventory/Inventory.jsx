import { useState, useEffect } from 'react';
import { inventoryAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('summary');
  const [vaccines, setVaccines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({ name: '', vaccine_type: 'rabies', manufacturer: '', unit: 'dose' });
  const [batchForm, setBatchForm] = useState({
    vaccine: '', batch_number: '', transaction_type: 'in', quantity: 1,
    manufacturing_date: '', expiration_date: '', supplier: '', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'summary' || activeTab === 'vaccines') {
        const vRes = await inventoryAPI.vaccines();
        setVaccines(vRes.data.results || vRes.data || []);
      }
      if (activeTab === 'batches') {
        const bRes = await inventoryAPI.batches();
        setBatches(bRes.data.results || bRes.data || []);
      }
      const sRes = await inventoryAPI.summary();
      setSummary(sRes.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVaccine = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await inventoryAPI.createVaccine(vaccineForm);
      setShowVaccineForm(false);
      setVaccineForm({ name: '', vaccine_type: 'rabies', manufacturer: '', unit: 'dose' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create vaccine.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await inventoryAPI.createBatch(batchForm);
      setShowBatchForm(false);
      setBatchForm({
        vaccine: '', batch_number: '', transaction_type: 'in', quantity: 1,
        manufacturing_date: '', expiration_date: '', supplier: '', notes: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record transaction.');
    } finally {
      setSaving(false);
    }
  };

  const lowStockCount = summary.filter(s => s.is_low_stock).length;

  return (
    <div className="page-container">
      <div className="stats-grid">
        <StatCard title="Vaccine Types" value={vaccines.length} icon="💉" color="#4f46e5" />
        <StatCard title="Low Stock Items" value={lowStockCount} icon="⚠️" color={lowStockCount > 0 ? '#dc2626' : '#16a34a'} />
        <StatCard title="Total Batches" value={batches.length} icon="📦" color="#0891b2" />
      </div>

      <div className="page-header">
        <div className="view-tabs">
          <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
          <button className={`tab ${activeTab === 'vaccines' ? 'active' : ''}`} onClick={() => setActiveTab('vaccines')}>Vaccines</button>
          <button className={`tab ${activeTab === 'batches' ? 'active' : ''}`} onClick={() => setActiveTab('batches')}>Stock Transactions</button>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowVaccineForm(true)}>+ New Vaccine</button>
          <button className="btn-primary" onClick={() => setShowBatchForm(true)}>+ Record Transaction</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? <Loader text="Loading inventory..." /> : (
        <>
          {activeTab === 'summary' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Type</th>
                    <th>Current Stock</th>
                    <th>Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item) => (
                    <tr key={item.vaccine_id} className={item.is_low_stock ? 'row-warning' : ''}>
                      <td><strong>{item.vaccine_name}</strong></td>
                      <td>{item.vaccine_type}</td>
                      <td>{item.current_stock} {item.unit}</td>
                      <td>{item.threshold} {item.unit}</td>
                      <td>
                        {item.is_low_stock ? (
                          <span className="badge badge-danger">⚠️ Low Stock</span>
                        ) : (
                          <span className="badge badge-success">✓ In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vaccines' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Manufacturer</th>
                    <th>Unit</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccines.map((v) => (
                    <tr key={v.id}>
                      <td><strong>{v.name}</strong></td>
                      <td>{v.vaccine_type}</td>
                      <td>{v.manufacturer || '—'}</td>
                      <td>{v.unit}</td>
                      <td>{v.current_stock}</td>
                      <td>{v.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-secondary">Inactive</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Batch #</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Expiration</th>
                    <th>Recorded By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td>{b.vaccine_name}</td>
                      <td>{b.batch_number}</td>
                      <td>
                        <span className={`badge ${b.transaction_type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                          {b.transaction_type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td>{b.quantity}</td>
                      <td>{b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : '—'}</td>
                      <td>{b.recorded_by_name || '—'}</td>
                      <td>{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Vaccine Create Modal */}
      {showVaccineForm && (
        <div className="modal-overlay" onClick={() => setShowVaccineForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Vaccine</h3>
              <button className="modal-close" onClick={() => setShowVaccineForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateVaccine}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input value={vaccineForm.name} onChange={(e) => setVaccineForm({...vaccineForm, name: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={vaccineForm.vaccine_type} onChange={(e) => setVaccineForm({...vaccineForm, vaccine_type: e.target.value})}>
                      <option value="rabies">Rabies Vaccine</option>
                      <option value="tetanus">Tetanus Toxoid</option>
                      <option value="rabies_ig">Rabies Immune Globulin</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select value={vaccineForm.unit} onChange={(e) => setVaccineForm({...vaccineForm, unit: e.target.value})}>
                      <option value="dose">Dose</option>
                      <option value="vial">Vial</option>
                      <option value="ampule">Ampule</option>
                      <option value="ml">Milliliter</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input value={vaccineForm.manufacturer} onChange={(e) => setVaccineForm({...vaccineForm, manufacturer: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Vaccine'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowVaccineForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Transaction Modal */}
      {showBatchForm && (
        <div className="modal-overlay" onClick={() => setShowBatchForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Stock Transaction</h3>
              <button className="modal-close" onClick={() => setShowBatchForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateBatch}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Vaccine *</label>
                  <select value={batchForm.vaccine} onChange={(e) => setBatchForm({...batchForm, vaccine: e.target.value})} required>
                    <option value="">Select Vaccine</option>
                    {vaccines.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Transaction Type</label>
                    <select value={batchForm.transaction_type} onChange={(e) => setBatchForm({...batchForm, transaction_type: e.target.value})}>
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input type="number" min="1" value={batchForm.quantity} onChange={(e) => setBatchForm({...batchForm, quantity: parseInt(e.target.value) || 1})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input value={batchForm.batch_number} onChange={(e) => setBatchForm({...batchForm, batch_number: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Manufacturing Date</label>
                    <input type="date" value={batchForm.manufacturing_date} onChange={(e) => setBatchForm({...batchForm, manufacturing_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input type="date" value={batchForm.expiration_date} onChange={(e) => setBatchForm({...batchForm, expiration_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input value={batchForm.supplier} onChange={(e) => setBatchForm({...batchForm, supplier: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={batchForm.notes} onChange={(e) => setBatchForm({...batchForm, notes: e.target.value})} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Record Transaction'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBatchForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
