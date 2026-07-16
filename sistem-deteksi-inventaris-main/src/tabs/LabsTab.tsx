import React, { useState, useMemo, useEffect } from 'react';

interface LabsTabProps {
  t: any;
  assets: any[];
  selectedLab: string | null | any;
  setSelectedLab: (lab: string | null) => void;
  openLoanForm: (asset: any) => void;
  currentUser: any;
}

const LabsTab: React.FC<LabsTabProps> = ({ 
  t, assets, selectedLab, setSelectedLab, openLoanForm, currentUser 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    const handleLangCheck = () => {
      const pageText = document.body?.innerText || '';
      const hasEnglishMenu = pageText.includes('Manage Assets') || pageText.includes('Loan History') || pageText.includes('Active Monitoring');
      setIsEnglish(t?.lang === 'en' || localStorage.getItem('lang') === 'en' || localStorage.getItem('language') === 'en' || hasEnglishMenu);
    };

    const interval = setInterval(handleLangCheck, 300);
    handleLangCheck();
    return () => clearInterval(interval);
  }, [t]);

  const labList = useMemo(() => [
    { id: 'Admin', name: 'Office', room: 'Office', color: 'from-gray-600 to-gray-800' },
    { id: 'Mechanical Workshop', name: 'Mechanical Workshop (G13)', room: 'G13', color: 'from-blue-500 to-blue-700' },
    { id: 'TelNet', name: 'TelNet Laboratory (G4)', room: 'G4', color: 'from-purple-500 to-purple-700' },
    { id: 'OCS', name: 'OCS Laboratory (G9)', room: 'G9', color: 'from-orange-500 to-orange-700' },
    { id: 'WiComm', name: 'WiComm Laboratory (E3)', room: 'E3', color: 'from-green-500 to-green-700' },
    { id: 'CellComm', name: 'CellComm Laboratory (A1)', room: 'A1', color: 'from-cyan-500 to-cyan-700' },
  ], []);

  const categories = [
    { id: 'ALL', idLabel: 'SEMUA KLASIFIKASI', enLabel: 'ALL CLASSIFICATIONS' },
    { id: 'IT', idLabel: 'PERANGKAT IT & KOMPUTASI', enLabel: 'IT & COMPUTING DEVICES' },
    { id: 'NETWORK', idLabel: 'PERANGKAT JARINGAN & TELEKOMUNIKASI', enLabel: 'NETWORKING & TELECOMMUNICATION' },
    { id: 'IOT', idLabel: 'PERANGKAT ELEKTRONIKA & IOT', enLabel: 'ELECTRONICS & IOT DEVICES' },
    { id: 'LAB', idLabel: 'PERALATAN LABORATORIUM & PENGUKURAN', enLabel: 'LABORATORY & MEASUREMENT TOOLS' },
    { id: 'DOC', idLabel: 'ASET DOKUMEN & ADMINISTRASI', enLabel: 'DOCUMENT & ADMINISTRATIVE ASSETS' }
  ];


  const baseLabAssets = useMemo(() => {
    if (!selectedLab) return [];
    const targetLabName = typeof selectedLab === 'object' ? selectedLab?.name : selectedLab;
    const targetLabClean = String(targetLabName || '').trim().toLowerCase();
    
    return assets.filter(a => {
      const assetLabClean = String(a.lab || '').trim().toLowerCase();
      
      if (targetLabClean.includes('mechanical') || targetLabClean.includes('g13')) {
        return assetLabClean.includes('mechanical') || assetLabClean.includes('g13');
      }
      if (targetLabClean.includes('telnet') || targetLabClean.includes('g4')) {
        return assetLabClean.includes('telnet') || assetLabClean.includes('g4');
      }
      if (targetLabClean.includes('ocs') || targetLabClean.includes('g9')) {
        return assetLabClean.includes('g9') || assetLabClean.includes('ocs');
      }
      if (targetLabClean.includes('wicomm') || targetLabClean.includes('e3')) {
        return assetLabClean.includes('e3') || assetLabClean.includes('wicomm');
      }
      if (targetLabClean.includes('cellcomm') || targetLabClean.includes('a1')) {
        return assetLabClean.includes('a1') || assetLabClean.includes('cellcomm');
      }
      
      return assetLabClean === targetLabClean;
    });
  }, [assets, selectedLab]);

  // 2. Filter lanjutan berdasarkan Search Bar kata kunci dan Klasifikasi Kategori SQL
  const filteredLabAssets = useMemo(() => {
    return baseLabAssets.filter(asset => {
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
  }, [baseLabAssets, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!selectedLab ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-utama uppercase tracking-tighter">
              {isEnglish ? 'LABORATORY LIST' : 'DAFTAR LABORATORIUM'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isEnglish ? 'Please select a laboratory to view its asset inventory.' : 'Silahkan pilih laboratorium untuk melihat aset'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {labList.filter(l => l.id !== 'Admin').map((lab) => (
              <button key={lab.id} onClick={() => { setSelectedLab(lab.name); setSearchTerm(''); setSelectedCategory('ALL'); }} className="group relative overflow-hidden bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all text-left">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${lab.color} opacity-10 rounded-bl-[4rem] group-hover:scale-110 transition-transform`}></div>
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2">{isEnglish ? 'ROOM' : 'RUANG'}: {lab.room}</p>
                <h3 className="text-xl font-black text-utama leading-tight uppercase group-hover:text-brand transition-colors">{lab.name}</h3>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{isEnglish ? 'VIEW ASSETS' : 'LIHAT ASET'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedLab(null)} className="flex items-center gap-2 text-gray-400 hover:text-brand font-black text-[10px] uppercase tracking-widest transition-colors border border-gray-100 bg-white px-5 py-2.5 rounded-xl active:scale-95">
            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7-7m-7 7h18"/></svg>
            <span>{isEnglish ? 'BACK TO LIST' : 'KEMBALIKAN ASET'}</span>
          </button>

          <div className="relative overflow-hidden bg-gradient-to-r from-brand to-utama py-6 px-10 rounded-[2rem] text-white shadow-sm">
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-1 uppercase leading-none">
                {selectedLab}
              </h3>
              <p className="text-white/70 text-[10px] font-black tracking-widest uppercase mt-1">
                {isEnglish ? 'LABORATORY ASSET INVENTORY' : 'INVENTARIS LOGISTIK LABORATORIUM'}
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-2xl px-1">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEnglish ? "Search all assets by name or code..." : "Cari seluruh aset berdasarkan nama atau kode..."}
              className="w-full pl-12 pr-4 py-4 bg-[#F7F7F7] border border-transparent rounded-full text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all shadow-sm" />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x px-1">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-utama text-white border-utama shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:bg-slate-50'}`}>
                {isEnglish ? cat.enLabel : cat.idLabel}
              </button>
            ))}
          </div>

          <div className="space-y-4 px-1">
            {filteredLabAssets.length > 0 ? (
              filteredLabAssets.map((asset) => {
                const isAvailable = String(asset.status).toUpperCase() === 'AVAILABLE' || String(asset.status).toUpperCase() === 'TERSEDIA';
                const realStock = asset.quantity ?? asset.qty ?? asset.QTY ?? asset.stok ?? 1;

                return (
                  <div key={asset.id} className="bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:border-brand/20">
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-brand opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[9px] font-mono font-bold text-gray-400 tracking-wider">{asset.code || asset.asset_code || '#PRISMA-FIT'}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-black text-[9px] uppercase tracking-wider">{isEnglish ? 'STOCK' : 'STOK'}: {realStock} PCS</span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${isAvailable ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {isAvailable ? (isEnglish ? 'AVAILABLE' : 'TERSEDIA') : (isEnglish ? 'BORROWED' : 'DIPINJAM')}
                        </span>
                      </div>
                      <h4 className="font-black text-utama uppercase text-base group-hover:text-brand transition-colors leading-tight truncate">{asset.name || asset.asset_name}</h4>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        <span>{isEnglish ? 'Condition: ' : 'Kondisi: '}</span>
                        <span className="text-brand font-black">{asset.conditionStatus || asset.condition || 'GOOD'}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end">
                      {currentUser?.role?.toLowerCase() === 'mahasiswa' ? (
                        <button onClick={() => openLoanForm(asset)} disabled={!isAvailable} className={`text-[10px] font-black uppercase tracking-wider transition-all duration-300 px-5 py-3 rounded-xl border shadow-sm active:scale-95 ${isAvailable ? 'bg-brand text-white border-brand hover:bg-utama hover:border-utama' : 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100 shadow-none'}`}>
                          {isEnglish ? 'BORROW ASSET' : 'PINJAM ALAT'}
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                          {isEnglish ? 'STAFF CONTROL ONLY' : 'PEMANTAUAN PETUGAS'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 text-center bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
                <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-xs">{isEnglish ? 'NO ASSETS IN THIS CLASSIFICATION' : 'TIDAK ADA ASET DI KLASIFIKASI INI'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabsTab;