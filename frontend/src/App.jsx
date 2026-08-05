import { useState, useEffect } from 'react';
import { 
  getMachines, 
  getDashboardSummary, 
  reportFailure, 
  startMaintenance, 
  completeMaintenance 
} from './services/api.js';
import './App.css';

function App() {
  const [machines, setMachines] = useState([]);
  const [summary, setSummary] = useState({ totalMachines: 0, workingMachines: 0, faultyMachines: 0, inMaintenanceMachines: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal durumları
  const [activeModal, setActiveModal] = useState(null); // 'failure', 'startMaintenance', 'completeMaintenance'
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formData, setFormData] = useState({ description: '', technicianName: '', note: '', failureType: 'Mekanik' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [machinesData, summaryData] = await Promise.all([
        getMachines(null, searchTerm),
        getDashboardSummary()
      ]);
      setMachines(machinesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Veri çekilirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const openModal = (type, machine) => {
    setSelectedMachine(machine);
    setActiveModal(type);
    setFormData({ description: '', technicianName: '', note: '', failureType: 'Mekanik' });
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedMachine(null);
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    try {
      if (activeModal === 'failure') {
        await reportFailure({
          machineId: selectedMachine.id,
          failureType: formData.failureType,
          description: formData.description,
          reportedBy: 'Operatör'
        });
      } else if (activeModal === 'startMaintenance') {
        await startMaintenance(selectedMachine.id, formData.technicianName);
      } else if (activeModal === 'completeMaintenance') {
        await completeMaintenance(selectedMachine.id, formData.note);
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert('İşlem sırasında bir hata oluştu.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0: return <span className="badge badge-success">Çalışıyor</span>;
      case 1: return <span className="badge badge-danger">Arızalı</span>;
      case 2: return <span className="badge badge-warning">Bakımda</span>;
      default: return <span className="badge">Bilinmiyor</span>;
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>⚙️ Makine Arıza & Bakım Takip Sistemi</h1>
      </header>

      {/* Özet Kartları */}
      <div className="summary-cards">
        <div className="card card-total">
          <h3>Toplam Makine</h3>
          <p>{summary.totalMachines}</p>
        </div>
        <div className="card card-working">
          <h3>Çalışan</h3>
          <p>{summary.workingMachines}</p>
        </div>
        <div className="card card-faulty">
          <h3>Arızalı</h3>
          <p>{summary.faultyMachines}</p>
        </div>
        <div className="card card-maintenance">
          <h3>Bakımda</h3>
          <p>{summary.inMaintenanceMachines}</p>
        </div>
      </div>

      {/* Arama Barı */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Makine adı veya kodu ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Makine Listesi */}
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <div className="machine-grid">
          {machines.map((machine) => (
            <div key={machine.id} className="machine-card">
              <div className="card-header">
                <h3>{machine.name}</h3>
                {getStatusBadge(machine.currentStatus)}
              </div>
              <p><strong>Kod:</strong> {machine.code}</p>
              <p><strong>Departman:</strong> {machine.departmentName || 'Belirtilmedi'}</p>

              <div className="card-actions">
                {machine.currentStatus === 0 && (
                  <button className="btn btn-danger" onClick={() => openModal('failure', machine)}>
                    Arıza Bildir
                  </button>
                )}
                {machine.currentStatus === 1 && (
                  <button className="btn btn-warning" onClick={() => openModal('startMaintenance', machine)}>
                    Bakıma Al
                  </button>
                )}
                {machine.currentStatus === 2 && (
                  <button className="btn btn-success" onClick={() => openModal('completeMaintenance', machine)}>
                    Bakımı Tamamla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up / Modal Formu */}
      {activeModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedMachine?.name} - {
              activeModal === 'failure' ? 'Arıza Bildirimi' : 
              activeModal === 'startMaintenance' ? 'Bakım Başlat' : 'Bakımı Tamamla'
            }</h3>
            
            <form onSubmit={handleSubmitAction}>
              {activeModal === 'failure' && (
                <>
                  <label>Arıza Tipi:</label>
                  <select 
                    value={formData.failureType} 
                    onChange={(e) => setFormData({...formData, failureType: e.target.value})}
                  >
                    <option value="Mekanik">Mekanik</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="Yazılım">Yazılım</option>
                    <option value="Genel">Genel</option>
                  </select>

                  <label>Açıklama:</label>
                  <textarea 
                    required 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </>
              )}

              {activeModal === 'startMaintenance' && (
                <>
                  <label>Teknisyen Adı:</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.technicianName} 
                    onChange={(e) => setFormData({...formData, technicianName: e.target.value})}
                  />
                </>
              )}

              {activeModal === 'completeMaintenance' && (
                <>
                  <label>Bakım Notu / Yapılan İşlem:</label>
                  <textarea 
                    required 
                    value={formData.note} 
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                <button type="submit" className="btn btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;