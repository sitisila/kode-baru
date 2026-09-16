import React from 'react';
import { API_BASE_URL } from '../App';

interface AssetDetailReadOnlyProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  t: any;
}

const AssetDetailReadOnly: React.FC<AssetDetailReadOnlyProps> = ({ isOpen, onClose, asset, t }) => {
  const isEnglish = t?.lang === 'en';

  if (!isOpen || !asset) return null;

  const code = asset.code || asset.asset_code || asset.serialNumber || '-';
  const name = asset.name || asset.asset_name || '-';
  const qty = asset.quantity ?? asset.qty ?? asset.QTY ?? asset.stok ?? '-';
  const serialNumber = asset.serialNumber || asset.serial_number || '-';
  const lab = asset.lab || '-';
  const category = asset.category || '-';
  const condition = asset.conditionStatus || asset.condition || asset.status_kelayakan || '-';
  const conditionLower = String(condition).toLowerCase();
  const isGoodCondition = conditionLower.includes('baik') || conditionLower.includes('good');
  const photoUrl = asset.photo_path ? `${API_BASE_URL}/${asset.photo_path}` : '';

  const ValueBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full bg-slate-50 text-xs font-bold rounded-xl px-3.5 py-3 border border-gray-100 text-utama">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-black text-utama tracking-tight uppercase">
            {isEnglish ? 'ASSET DETAIL' : 'DETAIL ASET'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand bg-gray-50 p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="mb-4 bg-slate-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center h-36">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-[10px] text-gray-300 font-bold uppercase px-4">
              {isEnglish ? 'No photo available' : 'Belum ada foto'}
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
            {isEnglish ? 'ASSET QR CODE' : 'KODE QR ASET'}
          </span>
          <div className="w-28 h-28 bg-white p-2 border border-gray-100 rounded-xl shadow-sm flex items-center justify-center">
            {code !== '-' ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://prismafitd3tektel.site/?scanCode=${code}`)}`}
                alt="QR Aset"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-[10px] text-gray-300 font-bold px-2">-</div>
            )}
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md max-w-full truncate">
            {code}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET CODE' : 'KODE ASET'}</label>
            <ValueBox>{code}</ValueBox>
          </div>

          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'ASSET NAME' : 'NAMA ALAT'}</label>
            <ValueBox>{name}</ValueBox>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'STOCK QUANTITY' : 'JUMLAH STOK'}</label>
              <ValueBox>{qty}</ValueBox>
            </div>
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">SERIAL NUMBER (SN)</label>
              <ValueBox>{serialNumber}</ValueBox>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'LABORATORY LOCATION' : 'LOKASI LABORATORIUM'}</label>
            <ValueBox>{lab}</ValueBox>
          </div>

          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'CLASSIFICATION CATEGORY' : 'KLASIFIKASI KATEGORI'}</label>
            <ValueBox>{category}</ValueBox>
          </div>

          <div>
            <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">{isEnglish ? 'CONDITION' : 'KONDISI'}</label>
            <div className={`w-full text-xs font-black rounded-xl px-3.5 py-3 border ${isGoodCondition ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'} uppercase`}>
              {condition}
            </div>
          </div>

          <div className="pt-2">
            <button type="button" onClick={onClose} className="w-full py-3.5 bg-brand text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10">
              {isEnglish ? 'CLOSE' : 'TUTUP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailReadOnly;