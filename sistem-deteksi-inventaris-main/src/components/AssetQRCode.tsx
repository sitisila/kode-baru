import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Swal from 'sweetalert2';

interface AssetQRCodeProps {
  t: any; 
  assetData: {
    name: string;
    serialNumber: string;
    lab: string;
    brandType: string;
  };
}

const AssetQRCode: React.FC<AssetQRCodeProps> = ({ t, assetData }) => {
  const qrValue = `ASSET_ID:${assetData.serialNumber}`;

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const svgElement = document.querySelector('#qr-hidden-source svg');
    if (!svgElement) {
      Swal.fire('Error', t?.lang === 'id' ? "QR Code gagal diproses." : "QR Code processing failed.", 'error');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const qrImageUrl = URL.createObjectURL(svgBlob);

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      Swal.fire('Error', t?.lang === 'id' ? "Gagal membuka jendela cetak." : "Failed to open print window.", 'error');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${assetData.serialNumber}</title>
          <style>
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: 80mm 30mm; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 30mm; width: 80mm; font-family: 'Segoe UI', sans-serif; background-color: white; }
            .label-container { display: flex; flex-direction: row; align-items: center; width: 76mm; height: 26mm; padding: 2mm; box-sizing: border-box; border: 1px solid #000; }
            .qr-code { flex-shrink: 0; margin-right: 12px; }
            .qr-code img { width: 20mm; height: 20mm; }
            .details { display: flex; flex-direction: column; overflow: hidden; justify-content: center; }
            .header { font-size: 10px; font-weight: 900; color: #000; margin-bottom: 2px; border-bottom: 1px solid black; }
            .name { font-size: 9px; font-weight: bold; margin: 0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
            .meta { font-size: 7px; margin: 1px 0; color: #333; font-weight: 600; }
            .sn-box { background: black; color: white; padding: 0 2px; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="qr-code"><img src="${qrImageUrl}" alt="QR" id="print-qr-img" /></div>
            <div class="details">
              <div class="header">PRISMA FIT ASSET</div>
              <p class="name">${assetData.name}</p>
              <div class="meta">SN: <span class="sn-box">${assetData.serialNumber}</span></div>
              <div class="meta">LOC: ${assetData.lab}</div>
              <div class="meta">TYPE: ${assetData.brandType}</div>
            </div>
          </div>
          <script>
            const img = document.getElementById('print-qr-img');
            const doPrint = () => {
              window.focus();
              window.print();
              setTimeout(() => { window.close(); window.opener.URL.revokeObjectURL(img.src); }, 500);
            };
            if (img.complete) { doPrint(); } else { img.onload = doPrint; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] hover:border-red-400 transition-colors group">
      <div id="qr-hidden-source" style={{ display: 'none' }}>
        <QRCodeSVG value={qrValue} size={256} level="H" />
      </div>
      <div className="mb-4 bg-gray-50 p-3 rounded-2xl">
        <QRCodeSVG value={qrValue} size={100} level="M" />
      </div>
      <button type="button" onClick={handlePrint}
        className="relative z-50 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        {t?.printLabel || 'CETAK LABEL'}
      </button>
      <p className="mt-3 text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
        {t?.lang === 'id' ? 'Ukuran Label: 80 x 30 mm' : 'Label Size: 80 x 30 mm'}
      </p>
    </div>
  );
};

export default AssetQRCode;