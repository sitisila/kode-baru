export enum Role {
  ADMIN = 'ADMIN',
  DOSEN = 'DOSEN',
  MAHASISWA = 'MAHASISWA'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
  nimOrStaffId?: string;
  prodi?: string;
  phone?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';
  qrCodeUrl: string;
  lastBorrowedBy?: string;
  // 🔍 TAMBAHKAN DUA BARIS INI BIAR FILTER DAN SCAN KODE AMAN:
  serialNumber?: string; 
  lab?: string;          
}

export interface Loan {
  id: string;
  assetId: string;
  assetName: string;
  userId: string;
  userName: string;
  userRole: Role;
  status: LoanStatus;
  requestDate: string;
  approvalDate?: string;
  location: string;
  // New Fields
  nim?: string;
  kelas?: string;
  borrowTime?: string;
  reason?: string;
  deadlineNotice?: string;
}