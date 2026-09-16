import React from 'react';
import { API_BASE_URL } from '../App';


interface ScanResultModalProps {
  asset: any;
  currentUserRole: string;
  isAvailable: boolean;
  onClose: () => void;
  onBorrow: () => void;
  lang: 'id' | 'en';
}

const ScanResultModal: React.FC<ScanResultModalProps> = ({ asset, currentUserRole, isAvailable, onClose, onBorrow, lang }) => {
  const isEnglish = lang === 'en';
  const isMahasiswa = currentUserRole?.toLowerCase() === 'mahasiswa';

  if (!asset) return null;

  const name = asset.name || asset.asset_name || '-';
  const code = asset.code || asset.asset_code || asset.serialNumber || '-';
  const condition = asset.conditionStatus || asset.condition || asset.status_kelayakan || '-';
  const conditionLower = String(condition).toLowerCase();
  const isGoodCondition = conditionLower.includes('baik') || conditionLower.includes('good');
  const canBorrow = isAvailable && isGoodCondition;
  const photoUrl = asset.photo_path ? `${API_BASE_URL}/${asset.photo_path}` : '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-utama tracking-tight uppercase">
            {isEnglish ? 'SCAN RESULT' : 'HASIL PINDAI'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-brand bg-gray-50 p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="mb-4 bg-slate-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center h-40">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-[10px] text-gray-300 font-bold uppercase px-4">
              {isEnglish ? 'No photo available' : 'Belum ada foto'}
            </div>
          )}
        </div>

        <h4 className="font-black text-utama text-base uppercase leading-tight mb-1">{name}</h4>
        <p className="text-[10px] font-mono font-bold text-gray-400 mb-3">{code}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{isEnglish ? 'CONDITION' : 'KONDISI'}</span>
            <span className={`text-xs font-black uppercase ${isGoodCondition ? 'text-green-600' : 'text-red-600'}`}>{condition}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-gray-100">
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{isEnglish ? 'STATUS' : 'STATUS'}</span>
            <span className={`text-xs font-black uppercase ${isAvailable ? 'text-green-600' : 'text-orange-500'}`}>
              {isAvailable ? (isEnglish ? 'AVAILABLE' : 'TERSEDIA') : (isEnglish ? 'UNAVAILABLE' : 'TIDAK TERSEDIA')}
            </span>
          </div>
        </div>

        {isMahasiswa ? (
          <>
            <button
              type="button"
              onClick={onBorrow}
              disabled={!canBorrow}
              className={`w-full py-3.5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md ${canBorrow ? 'bg-brand text-white hover:bg-utama' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
            >
              {isEnglish ? 'BORROW ASSET' : 'PINJAM ALAT'}
            </button>
            {!canBorrow && (
              <p className="text-center text-[9px] font-bold text-red-500 mt-1.5 uppercase tracking-wide">
                {!isGoodCondition
                  ? (isEnglish ? 'Cannot borrow — asset is damaged' : 'Tidak dapat dipinjam — aset dalam kondisi rusak')
                  : (isEnglish ? 'Asset is currently unavailable' : 'Aset sedang tidak tersedia')}
              </p>
            )}
          </>
        ) : (
          <button type="button" onClick={onClose} className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
            {isEnglish ? 'CLOSE' : 'TUTUP'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ScanResultModal;