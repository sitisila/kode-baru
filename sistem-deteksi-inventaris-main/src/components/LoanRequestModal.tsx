import React, { useState } from 'react';

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onSubmit: (loanData: any) => void;
  t?: any;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ isOpen, onClose, asset, onSubmit, t }) => {
  const [loanData, setLoanData] = useState({
    purpose: '', startDate: '', endDate: '', borrowTime: '', quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEnglish = t?.lang === 'en';

  if (!isOpen || !asset) return null;

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...loanData,
        assetId: asset.id,
        assetName: asset.name,
        assetCode: asset.code
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">{t?.formTitle || (isEnglish ? 'Equipment Loan Form' : 'Form Peminjaman')}</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
              {t?.assetLabel || (isEnglish ? 'Asset' : 'Aset')}: <span className="text-red-600">{asset.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-sm font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-2 text-gray-500">{t?.purposeLabel || (isEnglish ? 'Loan Purpose' : 'Tujuan Peminjaman')}</label>
            <textarea required rows={3} placeholder={t?.purposePlaceholder || (isEnglish ? 'Describe the purpose (practicum/research)...' : 'Jelaskan untuk keperluan praktikum/penelitian apa...')}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
              value={loanData.purpose} onChange={e => setLoanData({...loanData, purpose: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">{t?.startDateLabel || (isEnglish ? 'Start Date' : 'Tanggal Mulai')}</label>
              <input required type="date" min={todayStr}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.startDate} onChange={e => setLoanData({...loanData, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">{t?.endDateLabel || (isEnglish ? 'Return Date' : 'Tanggal Kembali')}</label>
              <input required type="date" min={loanData.startDate || todayStr}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.endDate} onChange={e => setLoanData({...loanData, endDate: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">{t?.borrowTimeLabel || (isEnglish ? 'Borrow Time' : 'Jam Peminjaman')}</label>
              <input required type="time"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.borrowTime} onChange={e => setLoanData({...loanData, borrowTime: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">{t?.quantityLabel || (isEnglish ? 'Quantity' : 'Jumlah Alat')}</label>
              <input required type="number" min="1"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.quantity} onChange={e => setLoanData({...loanData, quantity: e.target.value})} />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-2xl">
            <p className="text-red-600 text-[11px] font-black text-center uppercase tracking-tighter">
              {t?.deadlineWarning || (isEnglish ? 'Warning: Equipment must be returned to the Technician before 6:00 PM on the same day.' : 'Peringatan: Alat wajib dikembalikan ke Laboran sebelum jam 18:00 WIB di hari yang sama.')}
            </p>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (t?.sending || (isEnglish ? 'SENDING...' : 'MENGIRIM...')) : (t?.submitRequestBtn || (isEnglish ? 'Submit Request' : 'Kirim Permintaan'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal;