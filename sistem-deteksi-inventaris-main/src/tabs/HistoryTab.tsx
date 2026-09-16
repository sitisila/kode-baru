import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../App';

interface HistoryTabProps {
  t: any;
  loans: any[];
  currentUser: any;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ t, loans, currentUser }) => {
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [condition, setCondition] = useState('Baik / Layak');
  const [notes, setNotes] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_PHOTO_SIZE_BYTES = 3 * 1024 * 1024;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isEnglish = 
    t?.lang === 'en' || 
    localStorage.getItem('lang') === 'en' || 
    localStorage.getItem('language') === 'en' || 
    document.documentElement.lang === 'en' ||
    (t && Object.keys(t).length > 0 && t.historyTitle === 'LOAN HISTORY');

  const myLoans = loans.filter(l => {
    const roleLower = currentUser?.role?.toLowerCase();
    if (roleLower === 'admin' || roleLower === 'asisten laboratorium') return true;
    if (roleLower === 'dosen') {
      return currentUser?.assignedLab && l.lab === currentUser.assignedLab;
    }
    return String(l.user_id || '') === String(currentUser?.id || currentUser?.user_id || '');
  });

  const openReturnModal = (loan: any) => {
    setSelectedLoan(loan);
    setCondition('Baik / Layak');
    setNotes('');
    setPhotoBase64('');
    setPhotoFileName('');
    setPhotoPreviewUrl('');
    setPhotoError('');
    setIsReturnModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError(isEnglish ? 'File must be an image.' : 'File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError(isEnglish ? 'Image is too large (max 3MB).' : 'Ukuran gambar terlalu besar (maks 3MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPhotoBase64(dataUrl);
      setPhotoFileName(file.name);
      setPhotoPreviewUrl(dataUrl);
    };
    reader.onerror = () => {
      setPhotoError(isEnglish ? 'Failed to read the image file.' : 'Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const openDetailModal = (loan: any) => {
    setSelectedLoan(loan);
    setIsDetailModalOpen(true);
  };


  const handleDeleteLoan = async (loanId: any) => {
    Swal.fire({
      title: isEnglish ? 'Are you sure?' : 'Apakah Anda yakin?',
      text: isEnglish ? 'This loan record will be permanently deleted.' : 'Catatan riwayat peminjaman ini akan dihapus secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: isEnglish ? 'Yes, delete!' : 'Ya, hapus!',
      cancelButtonText: isEnglish ? 'Cancel' : 'Batal',
      customClass: { popup: 'rounded-[2rem]' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {

          const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || '';
          const res = await fetch(`${API_BASE_URL}/delete_loan.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: loanId })
          });

          const data = await res.json();
          if (data.status === 'success') {
            Swal.fire({
              title: isEnglish ? 'Deleted!' : 'Terhapus!',
              text: isEnglish ? 'Record deleted successfully.' : 'Riwayat peminjaman berhasil dihapus.',
              icon: 'success',
              confirmButtonColor: '#5c1313',
              customClass: { popup: 'rounded-[2rem]' }
            });
            window.dispatchEvent(new CustomEvent('refreshLoansData'));
          } else {
            Swal.fire('Gagal!', data.message || 'Gagal menghapus data.', 'error');
          }
        } catch (error) {
          Swal.fire('Error!', 'Gagal terhubung ke database server.', 'error');
        }
      }
    });
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!selectedLoan) return;

    if (!photoBase64) {
      setPhotoError(isEnglish ? 'Return proof photo is required.' : 'Foto bukti pengembalian wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || '';
      
      const payload = {
        loanId: selectedLoan.id || selectedLoan.loan_id,
        assetId: selectedLoan.asset_id || selectedLoan.assetId,
        condition: condition,
        notes: notes,
        photoBase64: photoBase64,
        photoFileName: photoFileName
      };

      const res = await fetch(`${API_BASE_URL}/return_loan.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === 'success') {

        Swal.fire({
          title: isEnglish ? 'Success!' : 'Berhasil!',
          text: result.photo_warning || (isEnglish ? 'Item return request submitted successfully.' : (result.message || 'Barang berhasil dikembalikan')),
          icon: result.photo_warning ? 'warning' : 'success',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        
        setIsReturnModalOpen(false);
        window.dispatchEvent(new CustomEvent('refreshLoansData'));
      } else {
        Swal.fire('Gagal!', result.message || 'Gagal memproses pengembalian.', 'error');
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      Swal.fire('Error!', 'Gagal terhubung ke database server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-2">
        <h3 className="text-3xl font-black text-utama tracking-tighter uppercase leading-none">
          {isEnglish ? 'LOAN HISTORY' : 'RIWAYAT PEMINJAMAN'}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {isEnglish ? 'YOUR LOGISTICS LOG ACTIVITY' : 'LOG AKTIVITAS LOGISTIK ANDA'}
        </p>
      </div>


      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-utama text-white">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{isEnglish ? 'ASSET & QTY' : 'ASET & QTY'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{isEnglish ? 'BORROW TIME' : 'WAKTU PINJAM'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">{isEnglish ? 'STATUS' : 'STATUS'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">{isEnglish ? 'ACTION' : 'AKSI'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {myLoans.length > 0 ? (
              myLoans.map((loan) => {
                const idLoan = loan.id || loan.loan_id || '';
                const namaAset = loan.assetName || loan.asset_name || 'Aset';
                const currentStatus = String(loan.status || '').toUpperCase();

                const isApproved = currentStatus === 'APPROVED' || currentStatus === 'DISETUJUI';
                const isReturned = currentStatus === 'RETURNED' || currentStatus === 'DIKEMBALIKAN';
                const isRejected = currentStatus === 'REJECTED' || currentStatus === 'DITOLAK';

                return (
                  <tr key={idLoan} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-brand text-sm uppercase">{namaAset}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{isEnglish ? 'QUANTITY' : 'JUMLAH'}: {loan.quantity || loan.qty || 1}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-600">{loan.loan_date || loan.loanDate || '2026-07-05'}</p>
                      <p className="text-[10px] text-brand font-black">{loan.borrowTime?.substring(0, 5) || loan.timeLabel || '00:00'} WIB</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        isApproved || isReturned ? 'bg-green-50 text-green-600 border-green-100' :
                        isRejected ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {isApproved ? (isEnglish ? 'APPROVED' : 'DISETUJUI') : 
                         isReturned ? (isEnglish ? 'RETURNED' : 'DIKEMBALIKAN') : 
                         isRejected ? (isEnglish ? 'REJECTED' : 'DITOLAK') : 
                         (isEnglish ? 'PENDING' : 'MENUNGGU')}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                         
                        {(currentStatus === 'APPROVED' || currentStatus === 'DISETUJUI') && currentUser?.role?.toLowerCase() === 'mahasiswa' && (
                          <button
                            type="button"
                            onClick={() => openReturnModal(loan)}
                            className="p-2.5 bg-brand text-white rounded-xl hover:bg-gray-950 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                            title={isEnglish ? 'Return Asset' : 'Kembalikan Aset'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDetailModal(loan)}
                          className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-slate-900 hover:text-white border border-gray-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                          title={isEnglish ? 'Loan Details' : 'Detail Data Lengkap'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644Q6 6.5 12 6.5c6 0 9.316 4.538 9.396 4.82a1.012 1.012 0 010 .644Q18 17.5 12 17.5c-6 0-9.316-4.538-9.358-4.758z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

 
                        {currentUser?.role?.toLowerCase() === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLoan(idLoan)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white border border-red-100 transition-all active:scale-95 flex items-center justify-center shadow-sm"
                            title={isEnglish ? "Delete History" : "Hapus Riwayat"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                  {isEnglish ? 'No loan history data found.' : 'Tidak ada data riwayat peminjaman.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>


      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-utama text-base uppercase tracking-tight">{isEnglish ? 'RETURN FORM' : 'FORM PENGEMBALIAN'}</h3>
              <button type="button" onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'Return Condition' : 'Kondisi Pengembalian'}</label>
                <select 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-gray-700 bg-white"
                >
                  <option value="Baik / Layak">{isEnglish ? 'Good / Usable' : 'Baik / Layak'}</option>
                  <option value="Rusak Ringan">{isEnglish ? 'Minor Damage' : 'Rusak Ringan'}</option>
                  <option value="Rusak Berat">{isEnglish ? 'Major Damage' : 'Rusak Berat'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'Return Proof Photo' : 'Foto Bukti Pengembalian'}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand/10 file:text-brand hover:file:bg-brand/20 cursor-pointer" 
                />
                {photoPreviewUrl && (
                  <img src={photoPreviewUrl} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-xl border border-gray-200" />
                )}
                {photoError && (
                  <p className="text-[10px] font-bold text-red-500">{photoError}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'Additional Notes' : 'Catatan Tambahan'}</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  rows={3} 
                  placeholder={isEnglish ? "Type notes here..." : "Ketik catatan di sini..."}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsReturnModalOpen(false)} 
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  {isEnglish ? 'Cancel' : 'Batal'}
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? (isEnglish ? 'SENDING...' : 'MENGIRIM...') : (isEnglish ? 'SUBMIT' : 'KIRIM')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedLoan && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-utama tracking-tight uppercase">
                {isEnglish ? 'LOAN DETAILS' : 'DETAIL DATA LENGKAP'}
              </h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-left max-h-[60vh] overflow-y-auto pr-1">

              <h5 className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">
                {isEnglish ? 'Loan Detail' : 'Detail Peminjaman'}
              </h5>

                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100">
                <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'ASSET INFO' : 'INFORMASI ASET'}</span>
                <h4 className="font-black text-utama text-base uppercase leading-tight">{selectedLoan.assetName || selectedLoan.asset_name || 'Aset'}</h4>
                <p className="text-[10px] font-mono font-bold text-brand mt-1">CODE: {selectedLoan.assetCode || selectedLoan.asset_code || '-'} | QTY: {selectedLoan.quantity || selectedLoan.qty || 1} PCS</p>
                {selectedLoan.lab && <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">LAB: {selectedLoan.lab}</p>}
              </div>

              
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-2">
                <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'BORROWER INFO' : 'DATA LENGKAP PEMINJAM'}</span>
                <div className="grid grid-cols-3 text-xs font-bold gap-y-1">
                  <span className="text-gray-400 uppercase">{isEnglish ? 'NAME' : 'NAMA'}</span>
                  <span className="col-span-2 text-utama uppercase font-black">: {selectedLoan.borrower_name || selectedLoan.userName || selectedLoan.borrowerName || selectedLoan.user_name || selectedLoan.name || 'Mahasiswa'}</span>

                  <span className="text-gray-400 uppercase">NIM / NIP</span>
                  <span className="col-span-2 text-utama font-mono">: {selectedLoan.borrowerNim || selectedLoan.nim || '-'}</span>

                  <span className="text-gray-400 uppercase">{isEnglish ? 'PHONE' : 'NO. HP'}</span>
                  <span className="col-span-2 text-utama font-mono">: {selectedLoan.borrowerPhone || selectedLoan.phone || selectedLoan.no_hp || '-'}</span>
                </div>
              </div>

              
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-2">
                <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'TIME & STATUS' : 'WAKTU & STATUS'}</span>
                <div className="grid grid-cols-3 text-xs font-bold gap-y-1">
                  <span className="text-gray-400 uppercase">{isEnglish ? 'DATE' : 'TANGGAL'}</span>
                  <span className="col-span-2 text-utama">: {selectedLoan.loan_date || selectedLoan.loanDate || '2026-07-05'}</span>

                  <span className="text-gray-400 uppercase">STATUS</span>
                  <span className="col-span-2">
                    : <span className={`px-2 py-0.5 border rounded-lg font-black text-[9px] uppercase tracking-wider ${
                        (selectedLoan.status?.toUpperCase() === 'APPROVED' || selectedLoan.status?.toUpperCase() === 'DISETUJUI' || selectedLoan.status?.toUpperCase() === 'RETURNED' || selectedLoan.status?.toUpperCase() === 'DIKEMBALIKAN') 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : (selectedLoan.status?.toUpperCase() === 'REJECTED' || selectedLoan.status?.toUpperCase() === 'DITOLAK') 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {selectedLoan.status || 'PENDING'}
                      </span>
                  </span>
                </div>
              </div>


              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100">
                <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'LOAN PURPOSE' : 'KEPERLUAN PINJAM'}</span>
                <p className="text-xs font-bold text-utama bg-white p-3 rounded-xl border border-gray-100 italic">
                  "{selectedLoan.purpose || (isEnglish ? 'No description provided' : 'Tidak ada keterangan keperluan')}"
                </p>
              </div>

              {(() => {
                const statusUpper = String(selectedLoan.status || '').toUpperCase();
                const isReturnedLoan = statusUpper === 'RETURNED' || statusUpper === 'DIKEMBALIKAN';
                if (!isReturnedLoan) return null;

                const rawNotes = String(selectedLoan.notes || '');
                const conditionMatch = rawNotes.match(/Kondisi:\s*(.*?)\s*\|/);
                const catatanMatch = rawNotes.match(/Catatan:\s*(.*?)\s*\|/);
                const fotoMatch = rawNotes.match(/Foto Bukti:\s*(.+)$/);

                const returnCondition = conditionMatch?.[1] || '-';
                const returnNotes = catatanMatch?.[1] || (isEnglish ? 'No notes' : 'Tidak ada catatan');
                const fotoPath = fotoMatch?.[1]?.trim() || '';
                const fotoUrl = fotoPath && !fotoPath.startsWith('bukti_default') && fotoPath !== 'gagal_disimpan'
                  ? `${API_BASE_URL}/${fotoPath}`
                  : '';

                return (
                  <>
                    <h5 className="text-[10px] font-black text-brand uppercase tracking-[0.2em] pt-1">
                      {isEnglish ? 'Return Detail' : 'Detail Pengembalian'}
                    </h5>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-3">
                      <div className="grid grid-cols-3 text-xs font-bold gap-y-1">
                        <span className="text-gray-400 uppercase">{isEnglish ? 'CONDITION' : 'KONDISI'}</span>
                        <span className="col-span-2 text-utama">: {returnCondition}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'NOTES' : 'CATATAN'}</span>
                        <p className="text-xs font-bold text-utama bg-white p-3 rounded-xl border border-gray-100 italic">"{returnNotes}"</p>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{isEnglish ? 'RETURN PROOF PHOTO' : 'FOTO BUKTI PENGEMBALIAN'}</span>
                        {fotoUrl ? (
                          <img src={fotoUrl} alt="Bukti Pengembalian" className="w-full max-h-64 object-contain rounded-xl border border-gray-100 bg-white" />
                        ) : (
                          <p className="text-[10px] font-bold text-gray-400 italic">
                            {isEnglish ? 'No photo available (returned before photo upload was implemented).' : 'Tidak ada foto (dikembalikan sebelum fitur upload foto diaktifkan).'}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

         
            <div className="pt-4 border-t border-gray-50 mt-4">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full py-3 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-brand/10"
              >
                {isEnglish ? 'CLOSE' : 'TUTUP DETAIL'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;