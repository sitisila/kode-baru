import React, { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';

interface HomeTabProps {
  t: any;
  assets: any[];
  loans: any[];
  setActiveTab: (tab: string) => void;
  currentUser?: any;
  onLoanSubmit?: (loanData: any) => Promise<void> | void; 
}

const GUIDE_URL_STORAGE_KEY = 'prismafit_guide_url';

const HomeTab: React.FC<HomeTabProps> = ({ t, assets, loans, setActiveTab, currentUser, onLoanSubmit }) => {
  const [guideUrl, setGuideUrl] = useState<string>(
    () => localStorage.getItem(GUIDE_URL_STORAGE_KEY) || 'https://drive.google.com'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnglish, setIsEnglish] = useState(false);


  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isMahasiswa = currentUser?.role?.toLowerCase() === 'mahasiswa';
  const currentUserId = currentUser?.id || currentUser?.user_id;


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


  const stats = useMemo(() => {
    const myLoans = (loans || []).filter(loan => {
      if (isAdmin) return true; 
      

      const loanUserId = String(loan.user_id || '');
      const loanNim = String(loan.nim || '');
      const loanName = String(loan.borrower_name || loan.name || '').toUpperCase();
      
      
      const currentIdStr = String(currentUserId || '');
      const currentNimStr = String(currentUser?.nim || currentUser?.username || '');
      const currentNameStr = String(currentUser?.name || '').toUpperCase();

      return (
        (loanUserId !== '' && loanUserId === currentIdStr) || 
        (loanNim !== '' && (loanNim === currentNimStr || loanNim === String(currentUser?.username))) ||
        (currentNameStr !== '' && loanName.includes(currentNameStr)) ||
        (loanName !== '' && currentNameStr.includes(loanName))
      );
    });

    // 1. Hitung status DISETUJUI / APPROVED / ACTIVE
    const borrowedCount = myLoans.filter(l => 
      ['APPROVED', 'ACTIVE', 'DIPINJAM', 'BORROWED', 'DISETUJUI'].includes(String(l.status).toUpperCase())
    ).length;

    // 2. Hitung status DIKEMBALIKAN / RETURNED
    const returnedCount = myLoans.filter(l => 
      ['RETURNED', 'DIKEMBALIKAN'].includes(String(l.status).toUpperCase())
    ).length;

    // 3. Hitung status TERKENA DEADLINE (Peminjaman aktif & tanggal kembali melewati waktu saat ini)
    const deadlineCount = myLoans.filter(l => {
      const statusText = String(l.status).toUpperCase();
      const isCurrentlyBorrowed = ['APPROVED', 'ACTIVE', 'DIPINJAM', 'BORROWED', 'DISETUJUI'].includes(statusText);
      const targetDate = l.return_date || l.returnDate || l.tanggal_kembali;
      
      if (isCurrentlyBorrowed && targetDate) {
        return new Date(targetDate).getTime() < new Date().getTime();
      }
      return false;
    }).length;

    return { borrowedCount, returnedCount, deadlineCount, myLoans };
  }, [loans, currentUserId, currentUser, isAdmin]);

  // --- 🔄 STATE FORM PEMINJAMAN UPDATE ---
  const [formData, setFormData] = useState({
    assetId: '',
    selectedAssetName: '',
    borrowTime: '',
    returnTime: '',
    phoneNumber: '', 
    course: '', 
    reason: ''
  });

  
  useEffect(() => {
    const pendingScan = localStorage.getItem('prismafit_pending_scan');
    
    if (pendingScan && assets && assets.length > 0) {
      // Cari data logistik di database kelompok lu yang kodenya klop dengan hasil scan QR
      const matchedAsset = assets.find(a => {
        const itemCode = String(a.code || a.asset_code || '').toUpperCase().trim();
        return itemCode === pendingScan.toUpperCase().trim();
      });

      if (matchedAsset) {
        const stock = parseInt(matchedAsset.QTY || matchedAsset.qty || matchedAsset.quantity || matchedAsset.stok || '0');
        
        if (stock > 0) {
          
          setFormData({
            assetId: String(matchedAsset.id),
            selectedAssetName: `${matchedAsset.name || matchedAsset.asset_name} (${isEnglish ? 'Stock' : 'Stok'}: ${stock})`,
            borrowTime: new Date().toTimeString().slice(0, 5), // Set default jam pinjam sekarang
            returnTime: new Date(new Date().getTime() + 2*60*60*1000).toTimeString().slice(0, 5), // Set default jam selesai (+2 jam)
            phoneNumber: currentUser?.phone || currentUser?.telepon || '',
            course: '',
            reason: ''
          });
          
          // Bersihkan storage biar kodenya gak gantung dan pop-up terus pas di-refresh
          localStorage.removeItem('prismafit_pending_scan');
          
          // LANGSUNG JEDERRR MELUNCUR FORM MODALNYA DI BERANDA!
          setIsModalOpen(true);
        } else {
          localStorage.removeItem('prismafit_pending_scan');
          Swal.fire({
            title: isEnglish ? 'Out of Stock!' : 'Stok Habis!',
            text: isEnglish 
              ? `Sorry, ${matchedAsset.name || matchedAsset.asset_name} is currently out of stock.` 
              : `Maaf, kuantitas stok alat ${matchedAsset.name || matchedAsset.asset_name} sedang kosong/habis!`,
            icon: 'error',
            confirmButtonColor: '#5c1313',
            customClass: { popup: 'rounded-[2rem]' }
          });
        }
      }
    }
  }, [assets, currentUser, isEnglish]);

  // Filter list aset berdasarkan ketikan user di kolom pencarian alat
  const filteredAssetOptions = useMemo(() => {
    if (!assetSearchQuery) return assets;
    return assets.filter(a => {
      const nameStr = String(a.name || a.asset_name || '').toLowerCase();
      return nameStr.includes(assetSearchQuery.toLowerCase());
    });
  }, [assets, assetSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetId || !formData.borrowTime || !formData.returnTime || !formData.phoneNumber || !formData.course || !formData.reason) {
      Swal.fire({
        title: isEnglish ? 'Failed!' : 'Gagal!',
        text: isEnglish ? 'Please fill out all mandatory fields including Course and Time.' : 'Silakan isi seluruh kolom formulir termasuk Mata Kuliah, Jam Mulai & Jam Selesai secara lengkap.',
        icon: 'warning',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    if (formData.returnTime <= formData.borrowTime) {
      Swal.fire({
        title: isEnglish ? 'Invalid Time!' : 'Waktu Tidak Valid!',
        text: isEnglish ? 'Return time cannot be prior or equal to borrow time.' : 'Jam Selesai tidak boleh sama atau mendahului Jam Mulai peminjaman.',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    const selectedAsset = assets.find(a => String(a.id) === String(formData.assetId));
    const currentQty = selectedAsset ? parseInt(selectedAsset.QTY || selectedAsset.qty || selectedAsset.quantity || selectedAsset.stok || '0') : 0;

    if (currentQty <= 0) {
      Swal.fire({
        title: isEnglish ? 'Out of Stock!' : 'Stok Habis!',
        text: isEnglish ? 'Sorry, this laboratory asset is currently out of stock.' : 'Maaf, kuantitas aset logistik laboratorium ini sedang kosong!',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    const today = new Date();
    const startDateFormated = today.toISOString().slice(0, 19).replace('T', ' ');
    const endDateFormated = today.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      assetId: formData.assetId,
      asset_id: formData.assetId,
      assetName: selectedAsset?.asset_name || selectedAsset?.name || 'Alat Lab',
      startDate: startDateFormated,
      endDate: endDateFormated,
      borrowTime: formData.borrowTime,
      returnTime: formData.returnTime,
      phone: formData.phoneNumber,
      course: formData.course, 
      purpose: formData.reason,
      reason: formData.reason,
      quantity: 1
    };

    try {
      if (onLoanSubmit) {
        await onLoanSubmit(payload); 
        setFormData({ assetId: '', selectedAssetName: '', borrowTime: '', returnTime: '', phoneNumber: '', course: '', reason: '' });
        setAssetSearchQuery('');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Gagal submit loan frontend:", err);
    }
  };

  const handleEditGuideLink = async () => {
    const { value: url } = await Swal.fire({
      title: 'Perbarui Tautan Panduan',
      input: 'url',
      inputValue: guideUrl,
      showCancelButton: true,
      confirmButtonColor: '#5c1313',
      cancelButtonColor: '#d33',
    } as any);

    if (url) {
      setGuideUrl(url);
      localStorage.setItem(GUIDE_URL_STORAGE_KEY, url);
    }
  };

  const handleOpenDocument = () => {
    if (guideUrl) window.open(guideUrl, '_blank', 'noopener,noreferrer');
  };

  const displayActivities = useMemo(() => {
    return stats.myLoans.slice(0, 3);
  }, [stats.myLoans]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* BANNER WELCOME */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand via-[#5c1313] to-utama py-6 px-10 rounded-[2rem] text-white shadow-lg shadow-brand/10 mx-2">
        <div className="absolute top-0 right-0 w-52 h-52 bg-white/[0.03] rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {isMahasiswa ? (isEnglish ? "Student Home Panel" : "Panel Beranda Mahasiswa") : (isEnglish ? "ASSET MONITORING SYSTEM" : "Sistem Monitoring Aset")}
          </span>
          <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-1 uppercase leading-none mt-3">PRISMA FIT</h3>
          <p className="text-white/80 text-sm font-medium leading-relaxed normal-case">
            {isMahasiswa 
              ? (isEnglish 
                  ? `Welcome back, ${currentUser?.name || 'User'}! Track active logistic loans, manage device return deadlines, and submit a loan form directly on this page.`
                  : `Selamat datang kembali, ${currentUser?.name || 'User Biasa'}! Pantau status peminjaman logistik aktif, kelola batas pengembalian barang, dan ajukan peminjaman alat langsung pada halaman ini.`)
              : (isEnglish ? "Management, monitoring, and borrowing of laboratory equipment at the Faculty of Applied Sciences, Telkom University" : "Pengelolaan, pemantauan, dan peminjaman alat laboratorium Laboratorium Fakultas Ilmu Terapan Telkom University")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STATISTIK RINGKASAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1 mx-2">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-brand rounded-full"></span>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {isMahasiswa 
                  ? (isEnglish ? "MY LOGISTICS SUMMARY" : "RINGKASAN LOGISTIK SAYA") 
                  : (isEnglish ? "LOGISTICS DATA SUMMARY" : "RINGKASAN DATA LOGISTIK")}
              </h4>
            </div>

            {currentUser?.role?.toLowerCase() === 'mahasiswa' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-gray-950 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                <span>{isEnglish ? "Fill Loan Form" : "Isi Form Peminjaman"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mx-2">
            {isMahasiswa ? (
              <>
                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "ASSETS CURRENTLY BORROWED" : "ASET SEDANG DIPINJAM"}</p>
                    <p className="text-4xl font-black text-orange-500 tracking-tight">{stats.borrowedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50"><svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "SUCCESSFULLY RETURNED" : "TELAH DIKEMBALIKAN"}</p>
                    <p className="text-4xl font-black text-green-600 tracking-tight">{stats.returnedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-red-100 rounded-[1.5rem] shadow-md sm:col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1.5">{isEnglish ? "TOTAL ASSETS OVER DUE DEADLINE" : "TOTAL ASET TERKENA DEADLINE"}</p>
                    <p className="text-4xl font-black text-brand tracking-tight">{stats.deadlineCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/5"><svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "TOTAL ASSETS" : "TOTAL ASET"}</p>
                    <p className="text-4xl font-black text-utama tracking-tight">{assets?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50"><svg className="w-5 h-5 text-utama" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "BORROWED" : "DIPINJAM"}</p>
                    <p className="text-4xl font-black text-orange-500 tracking-tight">{stats.borrowedCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50"><svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "APPROVALS" : "PERSETUJUAN"}</p>
                    <p className="text-4xl font-black text-brand tracking-tight">
                      {loans?.filter(l => ['PENDING', 'PROSES', 'MENUNGGU'].includes(String(l.status).toUpperCase())).length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/5"><svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></div>
                </div>

                <div className="p-6 bg-white border border-gray-100/70 rounded-[1.5rem] shadow-md flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{isEnglish ? "AVAILABLE" : "TERSEDIA"}</p>
                    <p className="text-4xl font-black text-green-600 tracking-tight">
                      {assets?.filter(a => ['AVAILABLE', 'TERSEDIA'].includes(String(a.status).toUpperCase())).length || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50"><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* PANDUAN LAB */}
        <div className="space-y-6 mx-2 lg:mx-0">
          <div className="flex items-center gap-3 px-1">
            <span className="w-1.5 h-4 bg-brand rounded-full"></span>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{isEnglish ? "FILE SHORTCUTS" : "DOKUMEN PANDUAN"}</h4>
          </div>
          <div className="p-6 bg-gradient-to-br from-zinc-900 to-utama text-white rounded-[1.5rem] shadow-md relative overflow-hidden">
            {isAdmin && (
              <button onClick={handleEditGuideLink} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white border border-white/5 transition-all z-20">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
              </button>
            )}
            <h5 className="text-xs font-black tracking-widest text-brand uppercase mb-1">{isEnglish ? "USER GUIDE" : "PANDUAN PENGGUNA"}</h5>
            <p className="text-[11px] text-zinc-400 normal-case mb-4 leading-relaxed">
              {isEnglish ? "Need laboratory operational help? Download the equipment loan procedure module here." : "Butuh bantuan operasional laboratorium? Unduh modul tata cara peminjaman alat di sini."}
            </p>
            <button onClick={handleOpenDocument} className="text-[9px] font-black uppercase tracking-wider bg-white/10 hover:bg-brand hover:text-white border border-white/10 px-4 py-2 rounded-lg transition-all">
              {isEnglish ? "OPEN DOCUMENT" : "Buka Dokumen"}
            </button>
          </div>
        </div>
      </div>

      {/* LOG AKTIVITAS BAWAH */}
      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-gray-100/80 shadow-sm mx-2">
        <div className="flex items-center justify-between mb-6 px-1">
          <h4 className="text-[10px] font-black text-utama uppercase tracking-[0.25em]">
            {isMahasiswa 
              ? (isEnglish ? "MY ACTIVITY LOGS" : "LOG AKTIVITAS SAYA") 
              : (isEnglish ? "RECENT ACTIVITY" : "AKTIVITAS TERAKHIR")}
          </h4>
          <div className="h-px flex-grow mx-4 bg-gray-200/70"></div>
        </div>
        <div className="space-y-3">
          {displayActivities?.length > 0 ? displayActivities.map((loan: any) => {
            const statusText = String(loan.status || '').toUpperCase();
            const isReturned = ['RETURNED', 'DIKEMBALIKAN'].includes(statusText);
            const isRejected = ['REJECTED', 'DITOLAK'].includes(statusText);
            const isPending = ['PENDING', 'PROSES', 'MENUNGGU'].includes(statusText);

            return (
              <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100/60 hover:border-brand/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/5 flex items-center justify-center text-brand font-black text-xs">
                    {String(loan.assetName || loan.asset_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-utama text-xs tracking-tight normal-case">
                      {isMahasiswa ? (
                        isEnglish ? (
                          <>Requested loan for equipment <span className="font-black text-brand">{loan.assetName || loan.asset_name || 'Asset'}</span></>
                        ) : (
                          <>Mengajukan peminjaman alat <span className="font-black text-brand">{loan.assetName || loan.asset_name || 'Aset'}</span></>
                        )
                      ) : (
                        isEnglish ? (
                          <>Student <span className="font-black text-brand">{loan.nim || 'Anonymous'}</span> requested asset <span className="font-semibold text-brand">{loan.assetName || loan.asset_name}</span></>
                        ) : (
                          <>Mahasiswa <span className="font-black text-brand">{loan.nim || 'Anonim'}</span> mengajukan alat <span className="font-semibold text-brand">{loan.assetName || loan.asset_name}</span></>
                        )
                      )}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                      STATUS:{' '}
                      <span className={isPending ? 'text-brand' : isReturned ? 'text-green-600' : 'text-red-600'}>
                        {isPending ? (isEnglish ? 'PENDING' : 'MENUNGGU') :
                         isReturned ? (isEnglish ? 'RETURNED' : 'DIKEMBALIKAN') :
                         isRejected ? (isEnglish ? 'REJECTED' : 'DITOLAK') : statusText}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-gray-300 uppercase tracking-wider px-2">
                  {loan.loan_date || loan.tanggal_pinjam || (isEnglish ? "Just now" : "Baru saja")}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center px-4">
              <h5 className="text-xs font-black text-utama uppercase tracking-wider mb-1">{isEnglish ? "NO DATA AVAILABLE" : "BELUM ADA DATA"}</h5>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto normal-case">
                {isMahasiswa 
                  ? (isEnglish ? "You have never requested any logistical asset loan activities." : "kamu belum pernah mengajukan aktivitas peminjaman logistik apa pun.") 
                  : (isEnglish ? "No activities found." : "Belum ada aktivitas.")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* POP-UP MODAL PEMINJAMAN MAHASISWA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">{isEnglish ? "EQUIPMENT LOAN FORM" : "FORM PEMINJAMAN ALAT"}</h3>
              <button onClick={() => { setIsModalOpen(false); setIsDropdownOpen(false); }} className="text-gray-400 hover:text-brand bg-gray-50 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleQuickLoanSubmit} className="space-y-4">
              <div className="bg-brand/[0.02] border border-brand/10 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{isEnglish ? "Full Name" : "Nama Lengkap"}</p>
                    <p className="text-xs font-black text-utama truncate">{currentUser?.name || 'User Biasa'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{isEnglish ? "Campus Email" : "Email Kampus"}</p>
                    <p className="text-xs font-bold text-utama truncate opacity-90">{currentUser?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">NIM</p>
                    <p className="text-xs font-black text-brand tracking-wider">{currentUser?.nim || currentUser?.username || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{isEnglish ? "Phone Number" : "Nomor HP"}</p>
                    <p className="text-xs font-bold text-gray-700">{currentUser?.phone || currentUser?.telepon || '081299998888'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
                  {isEnglish ? "Active WhatsApp / Phone Number" : "Nomor WhatsApp / Telp Aktif"}
                </label>
                <input 
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder={isEnglish ? "Example: 081234567890" : "Contoh: 081234567890"}
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama placeholder-gray-400 focus:outline-none focus:border-brand transition-all"
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
                  {isEnglish ? "Search & Select Equipment" : "Cari & Pilih Alat Lab"}
                </label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama cursor-pointer flex justify-between items-center"
                >
                  <span className={formData.selectedAssetName ? "text-utama" : "text-gray-400"}>
                    {formData.selectedAssetName || (isEnglish ? "-- Search Equipment Name --" : "-- Ketik/Cari Nama Aset --")}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-2xl p-3 z-[9999] space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <input 
                      type="text"
                      autoFocus
                      placeholder={isEnglish ? "Type here to filter asset..." : "Ketik nama alat logistik disini..."}
                      value={assetSearchQuery}
                      onChange={(e) => setAssetSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand"
                    />
                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-50">
                      {filteredAssetOptions.length > 0 ? (
                        filteredAssetOptions.map(a => {
                          const stock = parseInt(a.QTY || a.qty || a.quantity || a.stok || '0');
                          const hasStock = stock > 0;
                          return (
                            <div 
                              key={a.id}
                              onClick={() => {
                                if (hasStock) {
                                  setFormData({ ...formData, assetId: String(a.id), selectedAssetName: `${a.name || a.asset_name} (${isEnglish ? 'Stock' : 'Stok'}: ${stock})` });
                                  setIsDropdownOpen(false);
                                }
                              }}
                              className={`py-2 px-1 text-xs font-bold transition-all flex justify-between ${hasStock ? 'cursor-pointer text-gray-700 hover:text-brand hover:bg-brand/5' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                              <span>{a.name || a.asset_name}</span>
                              <span className="text-[10px] uppercase font-black">{hasStock ? `${isEnglish ? 'Ready' : 'Tersedia'}: ${stock} Pcs` : '[OUT OF STOCK]'}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-3 text-center text-gray-400 text-[11px] font-medium">{isEnglish ? 'No assets match your search.' : 'Aset tidak ditemukan.'}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
                  {isEnglish ? "Course Name" : "Mata Kuliah"}
                </label>
                <input 
                  type="text" name="course" value={formData.course} onChange={handleInputChange} placeholder={isEnglish ? "e.g., Software Engineering" : "Contoh: Rekayasa Perangkat Lunak / Jaringan"}
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama placeholder-gray-400 focus:outline-none focus:border-brand transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Borrow Time" : "Jam Pinjam"}</label>
                  <input 
                    type="time" name="borrowTime" value={formData.borrowTime} onChange={handleInputChange} required
                    className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama focus:outline-none focus:border-brand transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Return Time" : "Jam Selesai"}</label>
                  <input 
                    type="time" name="returnTime" value={formData.returnTime} onChange={handleInputChange} required
                    className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? "Reason" : "Alasan"}</label>
                <textarea 
                  name="reason" rows={2} value={formData.reason} onChange={handleInputChange} placeholder={isEnglish ? "Enter your clear loan purpose..." : "Masukkan alasan peminjaman anda secara jelas..."}
                  className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-2.5 border border-gray-100 text-utama placeholder-gray-400 focus:outline-none focus:border-brand transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsDropdownOpen(false); }} className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                  {isEnglish ? "Cancel" : "Batal"}
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">
                  {isEnglish ? "Submit Request" : "Ajukan Pinjaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;