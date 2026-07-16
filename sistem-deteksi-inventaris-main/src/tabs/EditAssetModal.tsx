import React, { useState, useEffect } from 'react';
import AssetQRCode from '../components/AssetQRCode';
import Swal from 'sweetalert2'; 

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  labList: any[];
  initialData?: any; 
  t: any;
  authToken?: string | null;
}

const EditAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSave, labList, initialData, t }) => {
  const [renderQR, setRenderQR] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: '', name: '', brandType: '', serialNumber: '',
    procurementYear: '', fundingSource: '', invoiceNumber: '',
    lab: 'Ruangan Admin (Aset Kantor)', specificLocation: '', 
    category: 'PERANGKAT IT & KOMPUTASI', conditionStatus: 'Baik', pic: '',
    description: '', accessories: '',
    manualBookUrl: '', photoMainUrl: '', photoLabelUrl: '',
    quantity: 1, status: 'Tersedia'
  });

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setRenderQR(true);
      }, 350);

      if (initialData) {
        let extractedLab = 'Ruangan Admin (Aset Kantor)';
        if (initialData.lab) {
          extractedLab = typeof initialData.lab === 'object' 
            ? (initialData.lab.name || initialData.lab.id || 'Ruangan Admin (Aset Kantor)') 
            : initialData.lab;
        }

        let bType = '';
        let pYear = '';
        let accs = '';
        let qty = 1;
        let descText = initialData.description || initialData.deskripsi || '';

        if (descText.startsWith("||META:")) {
          try {
            const parts = descText.split("||");
            const decoded = JSON.parse(atob(parts[1].replace("META:", "")));
            bType = decoded.brand || '';
            pYear = decoded.year || '';
            accs = decoded.acc || '';
            qty = decoded.qty || 1;
            descText = decoded.desc || '';
          } catch (e) {
            console.error("Failed parsing meta data description", e);
          }
        }

        setFormData({
          id: initialData.id || '',
          name: initialData.asset_name || initialData.name || '',
          brandType: bType,
          serialNumber: initialData.serialNumber || initialData.serial_number || '',
          procurementYear: pYear,
          fundingSource: initialData.sumber_pendanaan || '',
          invoiceNumber: initialData.no_invoice || '',
          lab: extractedLab, 
          category: initialData.category || 'PERANGKAT IT & KOMPUTASI',
          conditionStatus: initialData.status_kelayakan || 'Baik',
          pic: initialData.pic || '',
          description: descText,
          accessories: accs,
          specificLocation: initialData.location || '',
          manualBookUrl: initialData.manualBookUrl || '',
          photoMainUrl: initialData.photoMainUrl || '',
          photoLabelUrl: initialData.photoLabelUrl || '',
          quantity: qty,
          status: initialData.status || 'Tersedia'
        });
      } else {
        let defaultLab = 'Ruangan Admin (Aset Kantor)';
        if (labList && labList.length > 0) {
          defaultLab = typeof labList[0] === 'object' ? (labList[0].name || labList[0].id) : labList[0];
        }

        setFormData({
          id: '', name: '', brandType: '', serialNumber: '',
          procurementYear: '', fundingSource: '', invoiceNumber: '',
          lab: defaultLab, specificLocation: '',
          category: 'PERANGKAT IT & KOMPUTASI', conditionStatus: 'Baik', pic: '',
          description: '', accessories: '',
          manualBookUrl: '', photoMainUrl: '', photoLabelUrl: '',
          quantity: 1, status: 'Tersedia'
        });
      }

      return () => clearTimeout(timer);
    } else {
      setRenderQR(false); 
    }
  }, [initialData, isOpen, labList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, Number(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDeleteAsset = async () => {
    if (!initialData?.id) return;
    
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Aset "${formData.name}" akan dihapus secara permanen beserta datanya!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#991b1b', 
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        const res = await fetch(`http://localhost/prisma-api/delete_asset.php?id=${initialData.id}`, {
          method: 'GET',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.status === 'success') {
          Swal.fire('Terhapus!', 'Aset berhasil dihapus dari sistem logistik.', 'success');
          
          const deleteEvent = new CustomEvent('assetDeletedLocally', { detail: { id: initialData.id } });
          window.dispatchEvent(deleteEvent);
          
          onClose(); 
        } else {
          Swal.fire('Error', data.message || 'Gagal menghapus aset', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Gagal terhubung ke database server', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-brand h-20 flex items-center justify-between px-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-black tracking-[0.1em] text-sm lg:text-base uppercase">
                {initialData ? 'PERBARUI DATA ASET' : 'TAMBAH ALAT BARU'}
              </h3>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-0.5">Sistem Logistik Prisma Fit</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-2.5 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 bg-gradient-to-b from-white to-slate-50/40 max-h-[calc(100vh-160px)] overflow-y-auto">
          
          <section className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">NAMA ASET / ALAT</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">MERK / TIPE</label>
                <input type="text" name="brandType" value={formData.brandType} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">NOMOR SERI (SN)</label>
                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">TAHUN PENGADAAN</label>
                <input type="text" name="procurementYear" value={formData.procurementYear} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">SUMBER PENDANAAN</label>
                <input type="text" name="fundingSource" value={formData.fundingSource} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">NOMOR INVOICE</label>
                <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">LABORATORIUM / LOKASI</label>
                <select name="lab" value={formData.lab} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-700 bg-white appearance-none cursor-pointer">
                  {labList?.map((l, idx) => {
                    const labValue = typeof l === 'object' ? (l.name || l.id) : l;
                    return <option key={idx} value={labValue}>{labValue}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">LOKASI SPESIFIK</label>
                <input type="text" name="specificLocation" value={formData.specificLocation} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand text-xs font-bold text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 🎯 KATEGORI ASET DIUBAH MENJADI DROPDOWN SESUAI DENGAN IMAGE_1C0164.PNG */}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">KATEGORI ASET</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-700 bg-white cursor-pointer focus:outline-none focus:border-brand">
                  <option value="PERANGKAT IT & KOMPUTASI">PERANGKAT IT & KOMPUTASI</option>
                  <option value="PERANGKAT JARINGAN & TELEKOMUNIKASI">PERANGKAT JARINGAN & TELEKOMUNIKASI</option>
                  <option value="PERANGKAT ELEKTRONIKA & IOT">PERANGKAT ELEKTRONIKA & IOT</option>
                  <option value="PERALATAN LABORATORIUM & PENGUKURAN">PERALATAN LABORATORIUM & PENGUKURAN</option>
                  <option value="ASET DOKUMEN & ADMINISTRASI">ASET DOKUMEN & ADMINISTRASI</option>
                  <option value="PERANGKAT KEAMANAN & KONTROL AKSES">PERANGKAT KEAMANAN & KONTROL AKSES</option>
                  <option value="ASET NON-TEKNIS TAPI BERNILAI">ASET NON-TEKNIS TAPI BERNILAI</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">JUMLAH ALAT (QTY)</label>
                <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-800" />
              </div>
            </div>

            {/* 🎯 HAPUS STATUS OPERASIONAL ASET & STATUS KELAYAKAN MENJADI FULL WIDTH GRID */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">STATUS KELAYAKAN</label>
                <select name="conditionStatus" value={formData.conditionStatus} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-700 bg-white">
                  <option value="Baik">Baik / Layak</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat / Perbaikan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">DESKRIPSI ASET</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-800 resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">AKSESORIS ALAT</label>
                <textarea name="accessories" value={formData.accessories} onChange={handleChange} rows={3} className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-xs font-bold text-gray-800 resize-none" />
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">KODE QR OTOMATIS</label>
                {formData.serialNumber ? (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[220px]">
                    {renderQR ? (
                      <AssetQRCode 
                        t={t || { lang: 'id', printLabel: 'CETAK LABEL' }} 
                        assetData={{
                          name: formData.name || 'Tanpa Nama',
                          serialNumber: formData.serialNumber,
                          lab: formData.lab || 'Ruangan Admin',
                          brandType: formData.brandType || '-'
                        }} 
                      />
                    ) : (
                      <div className="animate-pulse flex items-center justify-center h-32 w-32 bg-slate-200 rounded-xl" />
                    )}
                    <p className="text-[10px] font-bold text-slate-400 mt-4 tracking-wider">{formData.serialNumber}</p>
                  </div>
                ) : null}
                
                <div className="mt-6 border-2 border-dashed border-zinc-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">FOTO UTAMA & LABEL SPEK</p>
                  <input type="file" className="text-[10px] opacity-50" />
                </div>
                
                <div className="mt-6 border-2 border-dashed border-zinc-100 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">MANUAL BOOK (DIGITAL)</p>
                  <input type="file" className="text-[10px] opacity-50" />
                </div>
              </div>
            </div>

            <div className={`pt-6 grid gap-4 w-full ${initialData ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {initialData && (
                <button type="button" onClick={handleDeleteAsset} className="w-full py-5 bg-red-50 hover:bg-red-100 text-red-700 rounded-[2.5rem] font-black uppercase text-[10px] tracking-wider flex items-center justify-center">
                  HAPUS ALAT
                </button>
              )}
              <button type="submit" className="w-full py-5 bg-brand hover:bg-utama text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-wider whitespace-nowrap flex items-center justify-center">
                {initialData ? 'PERBARUI DATA ASET' : 'TAMBAH ALAT'}
              </button>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default EditAssetModal;