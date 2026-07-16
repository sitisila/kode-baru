import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from './../App';

interface User {
  id: number | string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  nim: string;
  role: string;
}

interface AdminRoomTabProps {
  authToken?: string | null;
  t?: any;
}

const AdminRoomTab: React.FC<AdminRoomTabProps> = ({ authToken, t }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

 
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    const handleLangCheck = () => {
      const pageText = document.body?.innerText || '';
     
      const hasEnglishMenu = pageText.includes('Manage Assets') || pageText.includes('Loan History') || pageText.includes('Active Monitoring');
      
      setIsEnglish(t?.lang === 'en' || localStorage.getItem('lang') === 'en' || hasEnglishMenu);
    };


    const interval = setInterval(handleLangCheck, 400);
    handleLangCheck();

    return () => clearInterval(interval);
  }, [t]);

  const API_URL = `${API_BASE_URL}/admin_users.php`;
  const DELETE_API_URL = `${API_BASE_URL}/delete_user.php`;
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, { headers: authHeaders() });
      const result = await response.json();
      
      if (result && result.status === 'success' && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number | string, currentRole: string, newRole: string) => {
    
    const confirmResult = await Swal.fire({
      title: isEnglish ? 'Are you sure?' : 'Apakah Anda yakin?',
      text: isEnglish ? `Change user role to ${newRole}?` : `Mengubah role pengguna menjadi ${newRole}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5c1313',
      cancelButtonColor: '#d33',
      confirmButtonText: isEnglish ? 'Yes, Change!' : 'Ya, Ubah!',
      cancelButtonText: isEnglish ? 'Cancel' : 'Batal',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (!confirmResult.isConfirmed) return; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId, newRole })
      });
      
      const result = await response.json();
      if (result.status === 'success') {

        Swal.fire({ 
          title: isEnglish ? 'Success!' : 'Berhasil!', 
          text: isEnglish ? 'User role updated successfully.' : (result.message || 'Role pengguna berhasil diperbarui.'), 
          icon: 'success', 
          confirmButtonColor: '#5c1313', 
          customClass: { popup: 'rounded-[2rem]' } 
        });
        fetchUsers();
      } else {
        Swal.fire({
          title: isEnglish ? 'Failed!' : 'Gagal!',
          text: result.message || (isEnglish ? 'Failed to change role.' : 'Gagal mengubah role.'),
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      Swal.fire({
        title: 'Error!',
        text: isEnglish ? 'Connection to server failed.' : 'Gagal terhubung ke database server.',
        icon: 'error',
        confirmButtonColor: '#5c1313',
        customClass: { popup: 'rounded-[2rem]' }
      });
      fetchUsers();
    }
  };

  
  const handleDeleteUser = async (user: User) => {

  const confirm = await Swal.fire({
    title: isEnglish ? 'Delete User?' : 'Hapus Pengguna?',
    text: isEnglish
      ? `Delete ${user.fullName}? This action cannot be undone.`
      : `Yakin ingin menghapus ${user.fullName}? Tindakan ini tidak dapat dibatalkan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: isEnglish ? 'Delete' : 'Hapus',
    cancelButtonText: isEnglish ? 'Cancel' : 'Batal',
    customClass: { popup: 'rounded-[2rem]' }
  });

  if (!confirm.isConfirmed) return;

  try {

    const response = await fetch(DELETE_API_URL,{
      method:'POST',
      headers:authHeaders(),
      body:JSON.stringify({
        id:user.id
      })
    });

    const result = await response.json();

    if(result.status==="success"){

      Swal.fire({
        icon:'success',
        title:isEnglish ? 'Success' : 'Berhasil',
        text:result.message,
        confirmButtonColor:'#5c1313'
      });

      fetchUsers();

    }else{

      Swal.fire({
        icon:'error',
        title:isEnglish ? 'Failed' : 'Gagal',
        text:result.message,
        confirmButtonColor:'#5c1313'
      });

    }

  }catch(err){

    Swal.fire({
      icon:'error',
      title:'Error',
      text:isEnglish
        ? 'Cannot connect to server.'
        : 'Tidak dapat terhubung ke server.',
      confirmButtonColor:'#5c1313'
    });

  }

}

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nim?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black text-gray-950 uppercase tracking-tight">
            {isEnglish ? 'MANAGE ADMIN USERS' : 'KELOLA PENGGUNA ADMIN'}
          </h1>
          <button onClick={fetchUsers} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition duration-200 transform active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="relative w-full max-w-2xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
            </svg>
          </span>
          <input type="text" placeholder={isEnglish ? "Search by name, username, or ID/NIM..." : "Cari nama, username, atau NIM..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#F7F7F7] border border-transparent rounded-full text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition duration-200 shadow-sm" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5c1313]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden relative z-10 mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'FULL NAME' : 'NAMA LENGKAP'}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">USERNAME</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">EMAIL</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'ID / NIM' : 'NIM / NIP'}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{isEnglish ? 'PHONE' : 'NO. HP'}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{isEnglish ? 'ACTION / ROLE' : 'AKSI / ROLE'}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{isEnglish ? 'DELETE' : 'HAPUS'}
                    </th>      
                  </tr>           
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 uppercase tracking-wider font-semibold text-xs">
                        {isEnglish ? 'No users found.' : 'Tidak ada data pengguna ditemukan.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="px-6 py-4 text-gray-900">{user.fullName}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.username}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{user.email}</td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{user.nim || '-'}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{user.phoneNumber || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <select value={user.role} onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                              className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#5c1313] font-bold text-xs bg-white text-gray-800 shadow-sm transition-all duration-300 cursor-pointer">
                              <option value="Mahasiswa">{isEnglish ? 'Student' : 'Mahasiswa'}</option>
                              <option value="Asisten Laboratorium">{isEnglish ? 'Lab Assistant' : 'Asisten Laboratorium'}</option>
                              <option value="Dosen">{isEnglish ? 'Lecturer' : 'Dosen'}</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300">
                            {isEnglish ? 'Delete' : 'Hapus'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomTab;