import React, { useState } from 'react';

interface LoanRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onSubmit: (loanData: any) => void;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ isOpen, onClose, asset, onSubmit }) => {
  const [loanData, setLoanData] = useState({
    purpose: '', startDate: '', endDate: '', borrowTime: '', quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Form Peminjaman</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
              Aset: <span className="text-red-600">{asset.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-sm font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-2 text-gray-500">Tujuan Peminjaman</label>
            <textarea required rows={3} placeholder="Jelaskan untuk keperluan praktikum/penelitian apa..." 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
              value={loanData.purpose} onChange={e => setLoanData({...loanData, purpose: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">Tanggal Mulai</label>
              <input required type="date" min={todayStr}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.startDate} onChange={e => setLoanData({...loanData, startDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">Tanggal Kembali</label>
              <input required type="date" min={loanData.startDate || todayStr}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.endDate} onChange={e => setLoanData({...loanData, endDate: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">Jam Peminjaman</label>
              <input required type="time"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.borrowTime} onChange={e => setLoanData({...loanData, borrowTime: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-2 text-gray-500">Jumlah Alat</label>
              <input required type="number" min="1"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-red-500 text-sm" 
                value={loanData.quantity} onChange={e => setLoanData({...loanData, quantity: e.target.value})} />
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-2xl">
            <p className="text-red-600 text-[11px] font-black text-center uppercase tracking-tighter">
              ASET HARUS DIKEMBALIKAN SEBELUM JAM 18.00 WIB DI HARI YANG SAMA!
            </p>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'MENGIRIM...' : 'Kirim Permintaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestModal;