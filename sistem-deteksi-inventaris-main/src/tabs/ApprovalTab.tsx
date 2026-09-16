import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../App';

interface ApprovalTabProps {
  t: any;
  loans: any[];
  onApprove: (loanId: string) => void;
  onReject: (loanId: string) => void;
  processingLoanId?: string | null;
}

const ApprovalTab: React.FC<ApprovalTabProps> = ({ t, loans, onApprove, onReject, processingLoanId }) => {
  
  const isEnglish = t?.lang === 'en' || localStorage.getItem('lang') === 'en';
  const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);
  const toWaLink = (phone: any): string | null => {
    const digitsOnly = String(phone || '').replace(/\D/g, '');
    if (!digitsOnly) return null;
    const normalized = digitsOnly.startsWith('0')
      ? '62' + digitsOnly.slice(1)
      : digitsOnly.startsWith('62') ? digitsOnly : '62' + digitsOnly;
    return `https://wa.me/${normalized}`;
  };

  const handleDeleteLoan = async (loanId: string, assetName: string) => {
    const result = await Swal.fire({
      title: isEnglish ? 'Are you sure?' : 'Apakah Anda yakin?',
      text: isEnglish ? `Loan history data for asset "${assetName}" will be permanently deleted!` : `Data riwayat peminjaman untuk aset "${assetName}" akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5c1313',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isEnglish ? 'Yes, Delete!' : 'Ya, Hapus!',
      cancelButtonText: t?.cancel || 'Batal',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      setDeletingLoanId(loanId);
      try {

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/delete_loan.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ id: loanId })
        });
        const data = await res.json();
        if (data.status === 'success') {
          Swal.fire({
            title: isEnglish ? 'Deleted!' : 'Terhapus!',
            text: isEnglish ? 'Loan history successfully deleted.' : 'Riwayat peminjaman berhasil dihapus.',
            icon: 'success',
            confirmButtonColor: '#5c1313',
            customClass: { popup: 'rounded-[2rem]' }
          });
          window.dispatchEvent(new CustomEvent('refreshLoansData'));
        } else {
          Swal.fire('Gagal!', data.message || 'Gagal menghapus data.', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Gagal terhubung ke database server.', 'error');
      } finally {
        setDeletingLoanId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-2">
        <h3 className="text-3xl font-black text-utama tracking-tighter uppercase leading-none">
          {t?.approvalTitle || 'PERSETUJUAN PEMINJAMAN'}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {t?.approvalDesc || 'KONFIRMASI PERMINTAAN PENGGUNAAN ASET'}
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-utama text-white">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t?.thApplicant || 'PEMOHON'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t?.thAssetQty || 'ASET & QTY'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">{t?.thBorrowTime || 'WAKTU PINJAM'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">{t?.statusTable || 'STATUS'}</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">{t?.action || 'AKSI'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loans && loans.length > 0 ? (
              loans.map((loan) => {
               
                const idLoan = String(loan.id || loan.loan_id || '');
                const namaAset = loan.assetName || loan.asset_name || 'Alat Lab';
                const statusLower = String(loan.status || '').toLowerCase();
                const isApproved = statusLower === 'approved' || statusLower === 'disetujui' || statusLower === 'active';
                const isRejected = statusLower === 'rejected' || statusLower === 'ditolak';
                const isReturned = statusLower === 'dikembalikan' || statusLower === 'returned';

                return (
                  <tr key={idLoan} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-utama text-xs truncate max-w-[200px]">
                            {loan.borrower_name || loan.name || 'Mahasiswa'}
                          </span>

                          {toWaLink(loan.phone || loan.no_hp) && (
                            <a
                              href={toWaLink(loan.phone || loan.no_hp)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={isEnglish ? 'Contact via WhatsApp' : 'Hubungi lewat WhatsApp'}
                              className="shrink-0 p-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21h.005c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.28.58-.35.78-.35.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.13-.29.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.58.74 1.85.88.27.13.45.2.51.31.07.11.07.63-.17 1.31z"/></svg>
                            </a>
                          )}
                        </div>
                
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-mono font-bold text-gray-400 block mb-0.5">{loan.asset_code || '#PRISMA-FIT'}</span>
                      <span className="font-bold text-utama text-xs uppercase block truncate max-w-[180px]">{namaAset}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{t?.qtyLabel || 'JUMLAH'}: {loan.quantity || loan.qty || 1} PCS</span>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] font-bold text-gray-600 space-y-0.5">
                        <p className="text-utama">🕒 {loan.borrowTime || '00:00'} - {loan.returnTime || '00:00'}</p>
                        <p className="text-[11px] text-gray-400 font-medium italic truncate max-w-[160px]">"{loan.purpose || loan.reason || '-'}"</p>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-black text-[9px] tracking-widest uppercase border ${
                        isApproved ? 'bg-green-50 text-green-600 border-green-100' : 
                        isRejected ? 'bg-red-50 text-red-600 border-red-100' : 
                        isReturned ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {isApproved ? (t?.statusApproved || 'DISETUJUI') : 
                         isRejected ? (t?.statusRejected || 'DITOLAK') : 
                         isReturned ? (isEnglish ? 'RETURNED' : 'DIKEMBALIKAN') :
                         (t?.statusPending || 'MENUNGGU')}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {statusLower === 'pending' || statusLower === 'proses' || statusLower === 'menunggu' ? (
                        <div className="flex justify-center gap-2">
                          <button type="button" onClick={() => onApprove(idLoan)} disabled={processingLoanId === idLoan} className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all active:scale-95 disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </button>
                          <button type="button" onClick={() => onReject(idLoan)} disabled={processingLoanId === idLoan} className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleDeleteLoan(idLoan, namaAset)} disabled={deletingLoanId === idLoan} className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-gray-950 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                          {deletingLoanId === idLoan ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                          ) : (<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 6m-4.72 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>)}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                  {isEnglish ? 'No approval data available at the moment.' : 'Tidak ada data persetujuan saat ini.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalTab;