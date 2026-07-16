import React, { useMemo } from 'react';

interface MonitoringTabProps {
  t: any;
  loans: any[]; 
  onReturnAsset: (loanId: string) => void;
  onRejectReturn: (loanId: string) => void;
}

const MonitoringTab: React.FC<MonitoringTabProps> = ({ t, loans, onReturnAsset, onRejectReturn }) => {

  const allMonitoredLoans = useMemo(() => {
    return loans?.filter(loan => {
      const statusText = String(loan.status || '').toUpperCase();
      return ['APPROVED', 'DIPINJAM', 'ACTIVE', 'RETURN_REQUESTED', 'DIKEMBALIKAN', 'RETURNED'].includes(statusText);
    }) || [];
  }, [loans]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-3xl font-black text-utama tracking-tighter uppercase leading-none">
          {t?.monitoringTitle || 'MONITORING ASET'} <span className="text-brand">({allMonitoredLoans.length})</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allMonitoredLoans.length > 0 ? (
          allMonitoredLoans.map((loan) => {
            const idLogistik = loan.id || loan.loan_id || '';
            const namaAset = loan.asset_name || loan.assetName || 'Aset Tidak Diketahui';
            const namaPeminjam = loan.borrower_name || 'Nama Tidak Diketahui';
            
            const statusText = String(loan.status || '').toUpperCase();
            const isReturnRequested = statusText === 'RETURN_REQUESTED';
            const isReturned = ['DIKEMBALIKAN', 'RETURNED'].includes(statusText);

            return (
              <div key={idLogistik} className="bg-white border border-gray-100 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between hover:shadow-lg transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-brand uppercase tracking-wider bg-brand/5 px-2.5 py-1 rounded-md">
                      {t?.asset || 'LOGISTIK'}
                    </span>
               
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${
                      isReturned ? 'bg-green-100 text-green-700' : 
                      isReturnRequested ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {isReturned ? (t?.statusApproved || 'SUDAH DIKEMBALIKAN') : 
                       isReturnRequested ? (t?.lang === 'en' ? 'WAITING CONFIRMATION' : 'MENUNGGU KONFIRMASI') : 
                       (t?.lang === 'en' ? 'ACTIVE LOAN' : 'AKTIF DIPINJAM')}
                    </span>
                  </div>
                  
                  <h4 className="font-black text-gray-950 uppercase text-lg pt-1.5 leading-none">{namaAset}</h4>
                  
                  
                  <p className="text-xs font-bold text-gray-500 pt-0.5">
                    {t?.thBorrower || 'Peminjam'}: <span className="text-gray-800 uppercase">{namaPeminjam}</span>
                  </p>
                  
                  <p className="text-[11px] font-medium text-gray-400">
                    {t?.borrowDate || 'Tanggal'}: <span className="text-utama font-bold">{loan.loan_date}</span> | {t?.time || 'Waktu'}: <span className="text-brand font-bold">{loan.borrowTime?.substring(0, 5)} - {loan.returnTime?.substring(0, 5)} WIB</span>
                  </p>
                </div>

                <div className="mt-4 md:mt-0 shrink-0">
                  {isReturnRequested ? (
                    <div className="flex gap-2">
                      <button onClick={() => onReturnAsset(idLogistik)} className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </button>
                      <button onClick={() => onRejectReturn(idLogistik)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : !isReturned ? (
                    <div className="px-6 py-3 bg-gray-50 text-gray-400 font-black text-[9px] uppercase tracking-widest rounded-xl">
                      {t?.lang === 'en' ? 'ACTIVE LOAN' : 'PINJAMAN AKTIF'}
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-green-50 text-green-600 font-black text-[9px] uppercase tracking-widest rounded-xl">
                      {t?.close || 'SELESAI'}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
         
          <div className="py-20 text-center bg-[#FDFDFD] rounded-[2rem] border border-dashed border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs">
            {t?.noActiveLoan || 'Tidak ada peminjaman yang perlu dipantau saat ini .'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringTab;