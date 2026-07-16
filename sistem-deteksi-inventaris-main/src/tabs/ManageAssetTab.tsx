import React, { useState, useMemo, useEffect } from 'react';

interface Asset {
  id?: number | string;
  code?: string;
  asset_code?: string;
  name?: string;
  asset_name?: string;
  qty?: number | string;
  QTY?: number | string;
  quantity?: number | string;
  stok?: number | string;
  status?: string;
  conditionStatus?: string;
  condition?: string;
  lab?: string;
  serialNumber?: string;
  category?: string;
}

interface ManageAssetTabProps {
  assets: Asset[];
  onSaveAsset: (data: any) => Promise<void> | void;
  currentUser: any;
  t?: any;
}

const ManageAssetTab: React.FC<ManageAssetTabProps> = ({ assets, onSaveAsset, currentUser, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetIdToDelete, setAssetIdToDelete] = useState<number | string>('');

  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    qty: '1',
    status: 'AVAILABLE',
    condition: 'GOOD',
    lab: 'Mechanical Workshop (G13)',
    serialNumber: '',
    category: 'IT'
  });

  useEffect(() => {
    const handleLangCheck = () => {
      const pageText = document.body?.innerText || '';
      const hasEnglishMenu = pageText.includes('Manage Assets') || pageText.includes('Loan History') || pageText.includes('Active Monitoring');
      setIsEnglish(t?.lang === 'en' || localStorage.getItem('lang') === 'en' || hasEnglishMenu);
    };
    const interval = setInterval(handleLangCheck, 300);
    handleLangCheck();
    return () => clearInterval(interval);
  }, [t]);

  const categories = [
    { id: 'ALL', idLabel: 'SEMUA', enLabel: 'ALL' },
    { id: 'IT', idLabel: 'PERANGKAT IT & KOMPUTASI', enLabel: 'IT & COMPUTING DEVICES' },
    { id: 'NETWORK', idLabel: 'PERANGKAT JARINGAN & TELEKOMUNIKASI', enLabel: 'NETWORKING & TELECOMMUNICATION' },
    { id: 'IOT', idLabel: 'PERANGKAT ELEKTRONIKA & IOT', enLabel: 'ELECTRONICS & IOT DEVICES' },
    { id: 'LAB', idLabel: 'PERALATAN LABORATORIUM & PENGUKURAN', enLabel: 'LABORATORY & MEASUREMENT TOOLS' },
    { id: 'DOC', idLabel: 'ASET DOKUMEN & ADMINISTRASI', enLabel: 'DOCUMENT & ADMINISTRATIVE ASSETS' },
  ];

  // 🎯 SINKRONISASI KATEGORI DATABASE SAKTI
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const assetName = String(asset.name || asset.asset_name || '').toLowerCase();
      const assetCode = String(asset.code || asset.asset_code || '').toLowerCase();
      const matchesSearch = assetName.includes(searchTerm.toLowerCase()) || assetCode.includes(searchTerm.toLowerCase());
      
      const assetCategory = String(asset.category || '').toUpperCase();
      
      let mappedCategory = selectedCategory;
      if (selectedCategory === 'IT') mappedCategory = 'IT & COMPUTING DEVICES';
      if (selectedCategory === 'NETWORK') mappedCategory = 'NETWORKING & TELECOMMUNICATION';
      if (selectedCategory === 'IOT') mappedCategory = 'ELECTRONICS & IOT DEVICES';
      if (selectedCategory === 'LAB') mappedCategory = 'LABORATORY & MEASUREMENT TOOLS';
      if (selectedCategory === 'DOC') mappedCategory = 'DOCUMENT & ADMINISTRATIVE ASSETS';

      const matchesCategory = selectedCategory === 'ALL' || assetCategory === mappedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, selectedCategory]);

  const handleEditClick = (asset: Asset) => {
    setIsEditing(true);
    setFormData({
      id: String(asset.id || ''),
      code: asset.code || asset.asset_code || '',
      name: asset.name || asset.asset_name || '',
      qty: String(asset.quantity || asset.qty || asset.QTY || asset.stok || '1'),
      status: asset.status || 'AVAILABLE',
      condition: asset.conditionStatus || asset.condition || 'GOOD',
      lab: asset.lab || 'Mechanical Workshop (G13)',
      serialNumber: asset.serialNumber || '',
      category: asset.category || 'IT'
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ id: '', code: '', name: '', qty: '1', status: 'AVAILABLE', condition: 'GOOD', lab: 'Mechanical Workshop (G13)', serialNumber: '', category: 'IT' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveAsset(formData);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (id: number | string) => {
    setAssetIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`https://prismafitd3tektel.site/prisma-api/delete_asset.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: assetIdToDelete, token: token })
      });
      
      const result = await response.json();
      setIsDeleteModalOpen(false);
      
      if (result.status === 'success') {
        window.location.reload(); 
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Gagal terhubung ke server API!");
    }
  };

  const handlePrintQR = (code: string, name: string) => {
    const targetUrl = `https://prismafitd3tektel.site/?scanCode=${encodeURIComponent(code)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak QR Code - ${code}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
              .card { border: 2px dashed #5c1313; padding: 20px; display: inline-block; border-radius: 16px; background: #fff; }
              h2 { margin: 12px 0 5px 0; font-size: 15px; text-transform: uppercase; color: #1e293b; font-weight: 900; }
              p { margin: 0; font-size: 11px; color: #5c1313; font-weight: 900; font-family: monospace; tracking-wider; }
            </style>
          </head>
          <body onload="window.print();">
            <div class="card">
              <img src="${qrUrl}" alt="QR" style="width:140px; height:140px;" />
              <h2>${name}</h2>
              <p>${code}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-3xl font-black text-utama uppercase tracking-tight">
          {isEnglish ? 'MANAGE LAB ASSETS' : 'KELOLA DATA ASET'}
        </h3>
        
        <div className="flex items-center gap-3">
          {(
            currentUser?.role?.toLowerCase() === 'admin' || 
            currentUser?.role?.toLowerCase().includes('aslab') || 
            currentUser?.role?.toLowerCase().includes('asisten')
          ) && (
            <button 
              onClick={handleOpenAddModal}
              className="px-5 py-3 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              <span>{isEnglish ? 'ADD NEW ASSET' : 'TAMBAH ASET BARU'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-2xl px-1">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isEnglish ? "Search asset by name or code..." : "Cari nama atau kode aset..."}
          className="w-full pl-12 pr-4 py-4 bg-[#F7F7F7] border border-transparent rounded-full text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all shadow-sm" />
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
        {categories.map((cat) => (
          <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider border whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-utama text-white border-utama shadow-sm' : 'bg-white text-gray-400 border-gray-100'}`}>
            {isEnglish ? cat.enLabel : cat.idLabel}
          </button>
        ))}
      </div>

      <div className="space-y-4 px-1">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const stock = asset.quantity ?? asset.qty ?? asset.QTY ?? asset.stok ?? 0;
            const assetName = asset.name || asset.asset_name || '';
            const assetCode = asset.code || asset.asset_code || 'CODE';
            
            return (
              <div key={asset.id} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group hover:border-brand/20 transition-all duration-300">
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center p-1 shrink-0">
                    {/* Preview QR Code Terikat URL Tautan Aktif */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://prismafitd3tektel.site/?scanCode=${assetCode}`)}`} 
                      alt="QR" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                      <span className="font-mono text-brand uppercase">CODE: {assetCode}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-black uppercase">{isEnglish ? 'STOCK' : 'STOK'}: {stock} PCS</span>
                    </div>
                    <h4 className="font-black text-utama text-base uppercase leading-tight truncate">{assetName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-xl">SN: {asset.serialNumber || '-'} | LOCATION: {asset.lab}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl font-black text-[9px] uppercase tracking-wider">
                    {asset.status || 'TERSEDIA'}
                  </span>
                  
                  {/* Cetak Ikon Tombol QR Code */}
                  <button
                    type="button"
                    onClick={() => handlePrintQR(assetCode, assetName)}
                    className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-slate-900 hover:text-white border border-gray-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                    title={isEnglish ? "Print QR Code" : "Cetak QR Code"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.008v.008H6.75V6.75zM6.75 16.5h.008v.008H6.75V16.5zM16.5 6.75h.008v.008H16.5V6.75z" />
                    </svg>
                  </button>

                  {(
                    currentUser?.role?.toLowerCase() === 'admin' || 
                    currentUser?.role?.toLowerCase().includes('aslab') || 
                    currentUser?.role?.toLowerCase().includes('asisten')
                  ) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditClick(asset)}
                        className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-slate-950 hover:text-white border border-gray-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                        title={isEnglish ? "Edit Asset" : "Ubah Data Aset"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.25 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(asset.id || '')}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white border border-red-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                        title={isEnglish ? "Delete Asset" : "Hapus Aset"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white border border-gray-100 rounded-[2rem]">
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">{isEnglish ? 'NO ASSETS FOUND' : 'DATA ASET TIDAK DITEMUKAN'}</p>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT ASET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">
                {isEditing 
                  ? (isEnglish ? 'EDIT LAB ASSET' : 'FORM UBAH DATA ASET') 
                  : (isEnglish ? 'ADD NEW LAB ASSET' : 'FORM TAMBAH ALAT BARU')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-brand bg-gray-50 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
                {isEnglish ? 'LIVE QR PREVIEW' : 'PREVIEW QR OTOMATIS'}
              </span>
              <div className="w-28 h-28 bg-white p-2 border border-gray-100 rounded-xl shadow-sm flex items-center justify-center">
                {formData.code.trim() ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://prismafitd3tektel.site/?scanCode=${formData.code}`)}`} 
                    alt="Live QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[10px] text-gray-300 font-bold px-2">
                    {isEnglish ? 'Enter Code First' : 'Ketik Kode Terlebih Dahulu'}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md max-w-full truncate">
                {formData.code || '-'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET CODE' : 'KODE ASET'}</label>
                <input type="text" required placeholder="Contoh: AST0001" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET NAME' : 'NAMA ALAT'}</label>
                <input type="text" required placeholder="Contoh: LAN Tester" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'STOCK QUANTITY' : 'JUMLAH STOK'}</label>
                  <input type="number" required min="1" value={formData.qty} onChange={(e) => setFormData({...formData, qty: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">SERIAL NUMBER (SN)</label>
                  <input type="text" placeholder="Optional" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'LABORATORY LOCATION' : 'LOKASI LABORATORIUM'}</label>
                <select value={formData.lab} onChange={(e) => setFormData({...formData, lab: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama">
                  <option value="Mechanical Workshop (G13)">Mechanical Workshop (G13)</option>
                  <option value="TelNet Laboratory (G4)">TelNet Laboratory (G4)</option>
                  <option value="OCS Laboratory (G9)">OCS Laboratory (G9)</option>
                  <option value="WiComm Laboratory (E3)">WiComm Laboratory (E3)</option>
                  <option value="CellComm Laboratory (A1)">CellComm Laboratory (A1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'CLASSIFICATION CATEGORY' : 'KLASIFIKASI KATEGORI'}</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama">
                  <option value="IT & COMPUTING DEVICES">IT & COMPUTING DEVICES</option>
                  <option value="NETWORKING & TELECOMMUNICATION">NETWORKING & TELECOMMUNICATION</option>
                  <option value="ELECTRONICS & IOT DEVICES">ELECTRONICS & IOT DEVICES</option>
                  <option value="LABORATORY & MEASUREMENT TOOLS">LABORATORY & MEASUREMENT TOOLS</option>
                  <option value="DOCUMENT & ADMINISTRATIVE ASSETS">DOCUMENT & ADMINISTRATIVE ASSETS</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">{isEnglish ? 'CANCEL' : 'BATAL'}</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">{isEnglish ? 'SAVE ASSET' : 'SIMPAN ASET'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POP-UP MODAL KONFIRMASI HAPUS KUSTOM ESTETIK */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-100 text-red-600 mb-4 shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-utama tracking-tight uppercase mb-2">
              {isEnglish ? 'DELETE CONFIRMATION' : 'KONFIRMASI HAPUS'}
            </h3>
            <p className="text-xs font-bold text-gray-400 mb-6 px-2">
              {isEnglish ? "Are you sure you want to permanently delete this asset?" : "Apakah Anda yakin ingin menghapus aset ini secara permanen?"}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95">{isEnglish ? 'CANCEL' : 'BATAL'}</button>
              <button type="button" onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-200 hover:bg-red-700 active:scale-95">{isEnglish ? 'DELETE' : 'HAPUS'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssetTab;