import { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { 
  getMachines, 
  getDashboardSummary, 
  reportFailure, 
  startMaintenance, 
  completeMaintenance,
  getMachineHistory,
  createMachine,
  updateMachine,
  deleteMachine
} from './services/api.js';
import './App.css';

function App() {
  const [machines, setMachines] = useState([]);
  const [summary, setSummary] = useState({ totalMachines: 0, workingMachines: 0, faultyMachines: 0, inMaintenanceMachines: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  // Modal durumları
  const [activeModal, setActiveModal] = useState(null); // 'failure', 'startMaintenance', 'completeMaintenance', 'history', 'createMachine', 'editMachine'
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formData, setFormData] = useState({ description: '', technicianName: '', note: '', failureType: 'Mekanik', machineName: '', machineCode: '' });
  const [historyLogs, setHistoryLogs] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [machinesData, summaryData] = await Promise.all([
        getMachines(selectedDepartment || null, searchTerm),
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
  }, [searchTerm, selectedDepartment]);

  const openModal = async (type, machine = null) => {
    setSelectedMachine(machine);
    setActiveModal(type);
    
    if (type === 'editMachine' && machine) {
      setFormData({ 
        description: '', 
        technicianName: '', 
        note: '', 
        failureType: 'Mekanik', 
        machineName: machine.name, 
        machineCode: machine.code 
      });
    } else {
      setFormData({ description: '', technicianName: '', note: '', failureType: 'Mekanik', machineName: '', machineCode: '' });
    }

    if (type === 'history' && machine) {
      try {
        const historyData = await getMachineHistory(machine.id);
        setHistoryLogs(historyData || []);
      } catch (err) {
        console.error('Geçmiş çekilemedi:', err);
        setHistoryLogs([]);
      }
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedMachine(null);
    setHistoryLogs([]);
  };

  const handleDeleteMachine = async (machineId) => {
    if (window.confirm('Bu makineyi silmek istediğinize emin misiniz?')) {
      try {
        await deleteMachine(machineId);
        fetchData();
      } catch (err) {
        alert('Makine silinirken hata oluştu.');
      }
    }
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
      } else if (activeModal === 'createMachine') {
        await createMachine({
          name: formData.machineName,
          code: formData.machineCode,
          currentStatus: 0
        });
      } else if (activeModal === 'editMachine') {
        await updateMachine(selectedMachine.id, {
          id: selectedMachine.id,
          name: formData.machineName,
          code: formData.machineCode,
          currentStatus: selectedMachine.currentStatus
        });
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
  const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'Yüksek':
      return <span className="priority-badge priority-high">🔥 Yüksek Öncelik</span>;
    case 'Orta':
      return <span className="priority-badge priority-medium">⚠️ Orta Öncelik</span>;
    case 'Düşük':
      return <span className="priority-badge priority-low">🟢 Düşük Öncelik</span>;
    default:
      return null;
  }
};
// App bileşeni içinde, return'den ÖNCE yer almalı:
const exportToCSV = () => {
  const headers = ['ID', 'Makine Adı', 'Kod', 'Durum'];
  const rows = machines.map(m => [
    m.id,
    `"${m.name}"`,
    `"${m.code}"`,
    m.currentStatus === 0 ? 'Çalışıyor' : m.currentStatus === 1 ? 'Arızalı' : 'Bakımda'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `makine_listesi_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

return (
  <div className="container">
    {/* JSX içeriğin burada yer alır */}
  </div>
);

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

      {/* İstatistik Grafiği */}
      <div className="chart-container">
        <h3>📊 Makine Durum Dağılımı</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[
                  { name: 'Çalışıyor', value: summary.workingMachines },
                  { name: 'Arızalı', value: summary.faultyMachines },
                  { name: 'Bakımda', value: summary.inMaintenanceMachines },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell key="cell-0" fill="#10b981" />
                <Cell key="cell-1" fill="#ef4444" />
                <Cell key="cell-2" fill="#f59e0b" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Arama ve Ekleme Barı */}
      <div className="toolbar"><button className="btn btn-export" onClick={exportToCSV}>
  📥 CSV İndir
</button>
        <input
          type="text"
          className="search-input"
          placeholder="Makine adı veya kodu ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="department-select"
          value={selectedDepartment} 
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">Tüm Departmanlar</option>
          <option value="1">Dokuma</option>
          <option value="2">İplik</option>
          <option value="3">Boyahane</option>
          <option value="4">Kalite Kontrol</option>
        </select>

        <button className="btn btn-add" onClick={() => openModal('createMachine')}>
          + Yeni Makine Ekle
        </button>
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

    <label>Öncelik Seviyesi:</label>
    <select 
      value={formData.priority || 'Orta'} 
      onChange={(e) => setFormData({...formData, priority: e.target.value})}
    >
      <option value="Düşük">Düşük</option>
      <option value="Orta">Orta</option>
      <option value="Yüksek">Yüksek</option>
    </select>

    <label>Açıklama:</label>
    <textarea 
      required 
      value={formData.description} 
      onChange={(e) => setFormData({...formData, description: e.target.value})}
    />
  </>
)}
                <div className="card-sub-actions">
                  <button className="btn btn-info" onClick={() => openModal('history', machine)}>
                    📋 Geçmiş
                  </button>
                  <button className="btn btn-edit" onClick={() => openModal('editMachine', machine)}>
                    ✏️ Düzenle
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDeleteMachine(machine.id)}>
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up / Modal Formu */}
      {activeModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{
              activeModal === 'createMachine' ? 'Yeni Makine Ekle' :
              activeModal === 'editMachine' ? 'Makine Bilgilerini Düzenle' :
              `${selectedMachine?.name} - ${
                activeModal === 'failure' ? 'Arıza Bildirimi' : 
                activeModal === 'startMaintenance' ? 'Bakım Başlat' : 
                activeModal === 'completeMaintenance' ? 'Bakımı Tamamla' : 'İşlem Geçmişi'
              }`
            }</h3>
            
            {activeModal === 'history' ? (
              <div className="history-list">
                {historyLogs.length === 0 ? (
                  <p>Henüz kayıtlı bir geçmiş bulunmuyor.</p>
                ) : (
                  historyLogs.map((log, idx) => (
                    <div key={idx} className="history-item">
                      <p><strong>Tarih:</strong> {new Date(log.createdDate || Date.now()).toLocaleString()}</p>
                      <p><strong>Açıklama:</strong> {log.description || log.note || '-'}</p>
                      <p><strong>İşlem Yapan:</strong> {log.technicianName || log.reportedBy || '-'}</p>
                      <hr />
                    </div>
                  ))
                )}
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Kapat</button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAction}>
                {(activeModal === 'createMachine' || activeModal === 'editMachine') && (
                  <>
                    <label>Makine Adı:</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Örn: CNC Dokuma Tezgahı 01"
                      value={formData.machineName} 
                      onChange={(e) => setFormData({...formData, machineName: e.target.value})}
                    />

                    <label>Makine Kodu:</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Örn: MAC-104"
                      value={formData.machineCode} 
                      onChange={(e) => setFormData({...formData, machineCode: e.target.value})}
                    />
                  </>
                )}

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
            )}
          </div>
        </div>
      )}
    </div>
  );
 

}

export default App;