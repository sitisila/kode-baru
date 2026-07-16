import React from 'react';
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
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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

      <div className="overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-sm mx-2">
        <table className="w-full text-left border-collapse">
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

                return (
                  <tr key={idLoan} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col space-y-1">
                        <span className="font-extrabold text-utama text-xs truncate max-w-[200px]">
                          {loan.borrower_name || loan.name || 'Mahasiswa'}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider shrink-0">{isEnglish ? 'Course:' : 'MK:'}</span>
                          <span className="bg-brand/5 text-brand px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-brand/10 truncate max-w-[180px]">
                            {loan.course || loan.mata_kuliah || (isEnglish ? 'GENERAL' : 'UMUM')}
                          </span>
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
                        isRejected ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {isApproved ? (t?.statusApproved || 'DISETUJUI') : isRejected ? (t?.statusRejected || 'DITOLAK') : (t?.statusPending || 'MENUNGGU')}
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
                        <button type="button" onClick={() => handleDeleteLoan(idLoan, namaAset)} className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-gray-950 transition-all active:scale-95">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 6m-4.72 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
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
  );
};

export default ApprovalTab;