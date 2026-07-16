import React, { useState, useMemo, useEffect } from 'react';
import HomeTab from './tabs/HomeTab';
import ManageAssetTab from './tabs/ManageAssetTab';
import LabsTab from './tabs/LabsTab';
import AddAssetModal from './tabs/EditAssetModal'; 
import ApprovalTab from './tabs/ApprovalTab';
import MonitoringTab from './tabs/MonitoringTab'; 
import HistoryTab from './tabs/HistoryTab';
import AdminPanel from './tabs/AdminPanel'; 
import Swal from 'sweetalert2';
import { API_BASE_URL } from './App';

interface DashboardProps {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  authToken: string | null;
  lang: 'id' | 'en';
  setLang: (l: 'id' | 'en') => void;
  t: any;
  assets: any[];
  setAssets: React.Dispatch<React.SetStateAction<any[]>>;
  loans: any[];
  activeTab: 'home' | 'labs' | 'manage-assets' | 'loans' | 'monitoring' | 'history' | 'admin-panel' | string;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  selectedLab: string | null;
  setSelectedLab: (lab: string | null) => void;
  setIsScannerOpen: (val: boolean) => void;
  setIsAddAssetOpen: (val: boolean) => void;
  isAddAssetOpen: boolean; 
  isLoanFormOpen: boolean;
  setIsLoanFormOpen: (val: boolean) => void; 
  selectedAssetForLoan: any; 
  setSelectedAssetForLoan: (asset: any) => void; 
  openLoanForm: (asset: any) => void;
  handlePrint: (asset: any) => void;
  labList: any[];
  filteredAssets: any[];
  onSaveAsset: (data: any) => void; 
  onLoanSubmit: (data: any) => void;
  onReturnAsset?: (loanId: string) => void; 
  onRejectReturn?: (loanId: string) => void; 
}

const DashboardMain: React.FC<DashboardProps> = ({
  currentUser, setCurrentUser, authToken, lang, setLang, t, assets, setAssets, loans, activeTab, setActiveTab, 
  selectedLab, setSelectedLab, setIsScannerOpen, setIsAddAssetOpen, isAddAssetOpen, 
  isLoanFormOpen, setIsLoanFormOpen, selectedAssetForLoan, setSelectedAssetForLoan,
  openLoanForm, handlePrint, labList, filteredAssets, onLoanSubmit, onReturnAsset,
  onRejectReturn 
}) => {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);
  const [isEnglish, setIsEnglish] = useState(false);


  const [phoneInput, setPhoneInput] = useState('');
  const [borrowTimeInput, setBorrowTimeInput] = useState('');
  const [returnTimeInput, setReturnTimeInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  // 🎯 DETEKTOR LIVE INTERNASIONALISASI ANTI-BOCOR
  useEffect(() => {
    const handleLangCheck = () => {
      const pageText = document.body?.innerText || '';
      const hasEnglishMenu = pageText.includes('Manage Assets') || pageText.includes('Loan History') || pageText.includes('Active Monitoring');
      setIsEnglish(lang === 'en' || t?.lang === 'en' || localStorage.getItem('lang') === 'en' || hasEnglishMenu);
    };
    const interval = setInterval(handleLangCheck, 300);
    handleLangCheck();
    return () => clearInterval(interval);
  }, [lang, t]);


  useEffect(() => {
    if (!isLoanFormOpen) {
      setPhoneInput('');
      setBorrowTimeInput('');
      setReturnTimeInput('');
      setCourseInput('');
      setReasonInput('');
    }
  }, [isLoanFormOpen]);

  const handleOpenLoanForm = (asset: any) => {
    setSelectedAssetForLoan(asset);
    setIsLoanFormOpen(true);
    if (openLoanForm) openLoanForm(asset);
  };

  const handleInlineLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const startDateFormated = today.toISOString().slice(0, 19).replace('T', ' ');
    const endDateFormated = today.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      assetId: selectedAssetForLoan?.id,
      asset_id: selectedAssetForLoan?.id,
      assetName: selectedAssetForLoan?.name || selectedAssetForLoan?.asset_name || 'Alat Lab',
      startDate: startDateFormated,
      endDate: endDateFormated,
      borrowTime: borrowTimeInput,
      returnTime: returnTimeInput,
      phone: phoneInput,
      course: courseInput, 
      purpose: reasonInput,
      reason: reasonInput,
      quantity: 1
    };

    onLoanSubmit(payload);
    setIsLoanFormOpen(false);
  };

  const handleApproveLoan = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const targetLoan = loans.find(l => String(l.id) === String(loanId));
      const assetId = targetLoan ? targetLoan.asset_id || targetLoan.assetId : '';

      const res = await fetch(`${API_BASE_URL}/approve_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ id: loanId, assetId })
      });
      const result = await res.json();
      if (result.status === 'success') {
        Swal.fire({ 
          title: isEnglish ? 'Success!' : 'Berhasil!', 
          text: isEnglish ? 'Loan request approved successfully.' : 'Peminjaman logistik laboratorium berhasil disetujui.', 
          icon: 'success', 
          confirmButtonColor: '#5c1313', 
          customClass: { popup: 'rounded-[2rem]' } 
        });
      } else {
        Swal.fire({ title: 'Gagal!', text: result.message, icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: isEnglish ? 'Failed to connect to backend server.' : 'Gagal menghubungi database server.', icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    setProcessingLoanId(loanId);
    try {
      const res = await fetch(`${API_BASE_URL}/reject_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ id: loanId })
      });
      const result = await res.json();
      if (result.status === 'success') {
        Swal.fire({ 
          title: isEnglish ? 'Rejected!' : 'Berhasil!', 
          text: isEnglish ? 'Loan request has been rejected.' : 'Permintaan peminjaman berhasil ditolak.', 
          icon: 'success', 
          confirmButtonColor: '#5c1313', 
          customClass: { popup: 'rounded-[2rem]' } 
        });
      } else {
        Swal.fire({ title: 'Gagal!', text: result.message, icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
      }
    } catch (error) {
      Swal.fire({ title: 'Error!', text: isEnglish ? 'Failed to reach the database server.' : 'Gagal terhubung ke server.', icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
    } finally {
      setProcessingLoanId(null);
    }
  };

  const onSaveAssetHandler = async (formData: any) => {
    try {
      const token = authToken || localStorage.getItem('token') || localStorage.getItem('authToken');
      const cleanId = formData.id || formData.asset_id || formData.assetId;

      const payloadData = { ...formData, id: cleanId };

      const res = await fetch(`${API_BASE_URL}/save_asset.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payloadData)
      });

      const result = await res.json();

      if (result.status === 'success') {
        Swal.fire({
          title: isEnglish ? 'Success!' : 'Berhasil!',
          text: isEnglish ? 'Asset inventory updated successfully.' : 'Data aset berhasil disimpan.',
          icon: 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        
        const refreshRes = await fetch(`${API_BASE_URL}/get_assets.php`);
        if (refreshRes.ok) {
          const freshData = await refreshRes.json();
          if (Array.isArray(freshData)) setAssets(freshData); 
        }
        setIsAddAssetOpen(false);
      } else {
        Swal.fire({ title: 'Gagal!', text: result.message, icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
      }
    } catch (error) {
      Swal.fire({ title: 'Gagal!', text: 'Gagal terhubung ke database server.', icon: 'error', confirmButtonColor: '#5c1313', customClass: { popup: 'rounded-[2rem]' } });
    }
  };

  const navItems = [
    { id: 'home', label: lang === 'id' ? 'Beranda' : 'Dashboard', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'labs', label: lang === 'id' ? 'Daftar Laboratorium' : 'Laboratory List', icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'manage-assets', label: lang === 'id' ? 'Kelola Aset' : 'Manage Assets', icon: 'M10.34 15.84c-.68.68-1.79.68-2.47 0M12 9V3m0 3c-1.66 0-3 1.34-3 3v.17c0 .44-.24.84-.62 1.06l-1.63.94c-.4.23-.65.66-.65 1.13v2.2c0 .47.25.9.65 1.13l1.63.94c.38.22.62.62.62 1.06V18c0 1.66 1.34 3 3 3s3-1.34 3-3v-.17c0-.44.24-.84.62-1.06l1.63-.94c.4-.23.65-.66.65-1.13v-2.2c0-.47-.25-.9-.65-1.13l-1.63-.94c-.38-.22-.62-.62-.62-1.06V9c0-1.66-1.34-3-3-3z', roles: ['admin', 'asisten laboratorium'] },
    { id: 'loans', label: lang === 'id' ? 'Persetujuan Peminjaman' : 'Loan Approvals', icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z', roles: ['admin', 'asisten laboratorium'] },
    { id: 'monitoring', label: lang === 'id' ? 'Pemantauan Aktif' : 'Active Monitoring', icon: 'M2.036 12.322a1.012 1.012 0 010-.644M21.396 11.32c.252.31.252.834 0 1.142Q18 17.5 12 17.5c-6 0-9.316-4.538-9.358-4.758a1.012 1.012 0 010-.644Q6 6.5 12 6.5c6 0 9.316 4.538 9.396 4.82zM15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['admin', 'dosen', 'asisten laboratorium'] },
    { id: 'history', label: lang === 'id' ? 'Riwayat Peminjaman' : 'Loan History', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin', 'mahasiswa', 'dosen', 'asisten laboratorium'] },
    { id: 'admin-panel', label: lang === 'id' ? 'Kelola Pengguna' : 'Manage Users', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', roles: ['admin'] },
  ];

  const manageAssetTabProps: any = {
    assets, setAssets, currentUser, t, searchTerm, setSearchTerm, 
    selectedLab, setSelectedLab, setIsAddAssetOpen, handlePrint, onSaveAsset: onSaveAssetHandler, labList, authToken
  };

  return (
    <div className="no-print flex flex-col min-h-screen bg-slate-50/70">
      <header className="bg-brand h-14 flex items-center justify-between px-6 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button aria-label="Toggle sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/20 rounded-lg transition-all">
            <svg className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-base font-black tracking-[0.2em] uppercase opacity-95">PRISMA FIT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/10 p-0.5 rounded-lg">
            <button onClick={() => setLang('id')} className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${lang === 'id' ? 'bg-white text-brand shadow' : 'text-white/40 hover:text-white'}`}>ID</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${lang === 'en' ? 'bg-white text-brand shadow' : 'text-white/40 hover:text-white'}`}>EN</button>
          </div>
          <button aria-label="Logout" onClick={() => setCurrentUser(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <div className={`bg-gradient-to-r from-brand via-[#5c1313] to-utama transition-all duration-500 overflow-hidden relative ${isSidebarOpen ? 'h-40' : 'h-0 opacity-0'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="h-full w-full relative">
          <div className="absolute top-6 right-8 text-right">
            <h1 className="text-white text-3xl lg:text-4xl font-black tracking-[0.15em] uppercase opacity-10 pointer-events-none select-none leading-tight">
              PRISMA <br/> 
              <span className="text-xl lg:text-2xl">TELKOM UNIVERSITY</span>
            </h1>
          </div>
        </div>
      </div>

      <div className={`mx-auto w-full px-4 lg:px-6 transition-all duration-500 flex flex-col lg:flex-row gap-6 pb-12 relative z-30 
        ${isSidebarOpen ? '-mt-14 max-w-[1600px]' : 'mt-6 max-w-[1600px]'}`}>
        
        <aside className={`shrink-0 space-y-4 transition-all duration-500 ease-in-out 
          ${isSidebarOpen ? 'w-full lg:w-72 opacity-100' : 'w-0 h-0 opacity-0 pointer-events-none'}`}>
          
          <div className="bg-white rounded-[24px] shadow-xl shadow-black/5 overflow-hidden border border-gray-100/80">
            <div className="h-14 bg-gray-50"></div>
            <div className="px-6 pb-6 -mt-8 flex flex-col items-center">
              <h2 className="text-utama font-bold text-lg leading-tight mb-1.5 text-center tracking-tight pt-2">
                {currentUser?.name}
              </h2>
              <div className="bg-brand/5 px-3 py-1 rounded-full border border-brand/10 mb-2">
                <p className="text-brand font-black text-[9px] uppercase tracking-widest">
                  {currentUser?.role?.toLowerCase() === 'mahasiswa' ? (t?.userLabel || 'Mahasiswa') : currentUser?.role}
                </p>
              </div>
              <p className="text-[10px] font-semibold text-gray-400 lowercase tracking-wider">{currentUser?.email}</p>
            </div>
          </div>

          <nav className="bg-white rounded-[24px] shadow-xl shadow-black/5 border border-gray-100/80 overflow-hidden py-2">
            {navItems.map(nav => {
              const hasAccess = nav.roles.map(r => r.toLowerCase().trim()).includes(currentUser?.role?.toLowerCase().trim());
              return hasAccess && (
                <button 
                  key={nav.id} 
                  onClick={() => { setActiveTab(nav.id); setSelectedLab(null); }} 
                  className={`w-full flex items-center gap-3.5 px-6 py-3.5 font-bold text-xs transition-all border-l-[5px] group
                    ${activeTab === nav.id 
                      ? 'bg-brand/5 text-brand border-brand font-extrabold' 
                      : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-utama'}`}
                >
                  <svg className={`w-4 h-4 transition-colors ${activeTab === nav.id ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d={nav.icon} />
                  </svg>
                  {nav.label}
                </button>
              );
            })}

            {/* 🎯 REVISI SAKTI: BUTTON QR COCOK BERADA DI BAWAH KELOLA PENGGUNA (MANAGE USERS) */}
            <div className="px-6 py-3 border-t border-gray-50 mt-2">
              <button 
                onClick={() => setIsScannerOpen(true)} 
                className="w-full py-3.5 bg-gradient-to-r from-brand to-[#4a0d0d] text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5 shadow-md shadow-brand/20 flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                <svg className="w-4 h-4 text-white/90 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>{isEnglish ? 'SCAN QR CODE' : 'PINDAI QR CODE'}</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 w-full bg-white rounded-[1.5rem] lg:rounded-[2rem] shadow-xl shadow-black/5 p-6 lg:p-8 border border-gray-100/60 min-h-[550px] transition-all duration-500 overflow-hidden">
          {activeTab === 'home' && <HomeTab t={t} assets={assets} loans={loans} setActiveTab={setActiveTab} currentUser={currentUser} onLoanSubmit={onLoanSubmit} />}
          {activeTab === 'labs' && <LabsTab t={t} assets={assets} selectedLab={selectedLab} setSelectedLab={setSelectedLab} openLoanForm={handleOpenLoanForm} currentUser={currentUser} />}
          {activeTab === 'loans' && <ApprovalTab t={t} loans={loans} onApprove={handleApproveLoan} onReject={handleRejectLoan} processingLoanId={processingLoanId} />}
          {activeTab === 'monitoring' && <MonitoringTab t={t} loans={loans} onReturnAsset={(id) => onReturnAsset ? onReturnAsset(id) : undefined} onRejectReturn={(id) => onRejectReturn ? onRejectReturn(id) : undefined} />}
          {activeTab === 'history' && <HistoryTab t={t} loans={loans} currentUser={currentUser} />}
          {activeTab === 'admin-panel' && currentUser?.role?.toLowerCase() === 'admin' && <AdminPanel authToken={authToken} />}
          {activeTab === 'manage-assets' && <ManageAssetTab {...manageAssetTabProps} />}
        </main>
      </div>

      <AddAssetModal isOpen={isAddAssetOpen} onClose={() => setIsAddAssetOpen(false)} labList={labList} t={t} authToken={authToken} onSave={(data) => onSaveAssetHandler(data)} />
      
      {/* 🎯 REVISI SAKTI INLINE MODAL */}
      {isLoanFormOpen && selectedAssetForLoan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">
                {isEnglish ? "LAB EQUIPMENT LOAN" : "FORM PEMINJAMAN LAB"}
              </h3>
              <button type="button" onClick={() => setIsLoanFormOpen(false)} className="text-gray-400 hover:text-brand bg-gray-50 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="mb-4 bg-brand/[0.02] border border-brand/10 p-4 rounded-2xl">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{isEnglish ? "SELECTED ASSET" : "ASET YANG DIPILIH"}</p>
              <h4 className="text-sm font-black text-brand uppercase truncate">{selectedAssetForLoan.name || selectedAssetForLoan.asset_name}</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">CODE: {selectedAssetForLoan.code || '#PRISMA-FIT'} | LOCATION: {selectedAssetForLoan.lab}</p>
            </div>

            <form onSubmit={handleInlineLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Active WhatsApp Number" : "Nomor WhatsApp Aktif"}</label>
                <input type="tel" required value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder={isEnglish ? "Example: 081234567890" : "Contoh: 081234567890"} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Course Name" : "Mata Kuliah"}</label>
                <input type="text" required value={courseInput} onChange={(e) => setCourseInput(e.target.value)} placeholder={isEnglish ? "e.g., Telecom Networking" : "Contoh: Jaringan Telekomunikasi / IoT"} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Borrow Time" : "Jam Pinjam"}</label>
                  <input type="time" required value={borrowTimeInput} onChange={(e) => setBorrowTimeInput(e.target.value)} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Return Time" : "Jam Selesai"}</label>
                  <input type="time" required value={returnTimeInput} onChange={(e) => setReturnTimeInput(e.target.value)} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Reason for Loan" : "Alasan Peminjaman"}</label>
                <textarea rows={2} required value={reasonInput} onChange={(e) => setReasonInput(e.target.value)} placeholder={isEnglish ? "Enter your clear loan purpose..." : "Masukkan keperluan peminjaman alat secara jelas..."} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-2.5 border border-gray-100 text-utama resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsLoanFormOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">{isEnglish ? "Cancel" : "Batal"}</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">{isEnglish ? "Submit" : "Ajukan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMain;