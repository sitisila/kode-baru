import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface LoginProps {
  lang: 'id' | 'en';
  setLang: (l: 'id' | 'en') => void;
  t?: any;
  onLogin: (formData: any) => Promise<boolean>;
  onRegister: (formData: any) => Promise<boolean>;
  onForgotPassword: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({
  lang,
  setLang,
  t,
  onLogin,
  onRegister,
  onForgotPassword
}) => {

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    nim: '',
    phoneNumber: ''
  });

  // 🎯 SAKTI: Amankan parameter query link hasil scan QR saat pertama kali user mendarat di halaman login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scanCode = urlParams.get('scanCode');
    if (scanCode) {
      localStorage.setItem('prismafit_pending_scan', scanCode);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; 

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          title: lang === 'id' ? 'Gagal!' : 'Failed!',
          text: lang === 'id' ? 'Password tidak cocok!' : 'Passwords do not match!',
          icon: 'error',
          confirmButtonColor: '#5c1313',
          customClass: { popup: 'rounded-[2rem]' }
        });
        return;
      }

      setIsSubmitting(true);
      const success = await onRegister({
        fullName: formData.fullName,
        username: formData.username,
        nim: formData.nim,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });
      setIsSubmitting(false);

      if (success) {
        setIsRegistering(false);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    } else {
      setIsSubmitting(true);
      await onLogin({
        email: formData.email,
        password: formData.password
      });
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row font-sans no-print items-stretch">

      <div className="hidden md:flex md:w-1/2 bg-[#5c1313] flex-col justify-center p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a0d0d] via-[#2d0606] to-[#6b1515]"></div>
        <div className="absolute -left-20 -top-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -right-10 -bottom-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#911d1d]/30 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] opacity-60"></div>

        <div className="relative z-10 text-white max-w-lg">
          <span className="text-white/50 text-xs font-bold tracking-[0.4em] uppercase mb-3 block">
            Telkom University
          </span>
          <h1 className="text-7xl font-black uppercase tracking-wider leading-[0.9]">
            PRISMA
            <br />
            <span className="text-white/20">SYSTEM</span>
          </h1>
          <div className="w-16 h-1.5 bg-white/20 my-8 rounded-full"></div>
          <p className="text-xl font-medium leading-relaxed text-white/80 italic pr-6 transition-all duration-300">
            {isRegistering
              ? (lang === 'id' ? 'Daftar untuk akses aset laboratorium.' : 'Register to access laboratory assets.')
              : (lang === 'id' ? 'Pengelolaan, pemantauan dan peminjaman alat laboratorium.' : 'Management, monitoring and borrowing of laboratory equipment.')}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FDFDFD] relative overflow-y-auto">
        <div className="absolute top-8 right-8 flex gap-2 bg-white shadow-lg border border-gray-100 p-1 rounded-xl z-20">
          <button type="button" onClick={() => setLang('id')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${lang === 'id' ? 'bg-brand text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
            ID
          </button>
          <button type="button" onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${lang === 'en' ? 'bg-brand text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
            EN
          </button>
        </div>

        <div className="w-full max-w-md space-y-8 my-10 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 relative z-10">
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-utama uppercase tracking-tight text-center md:text-left leading-none">
              {isRegistering ? (lang === 'id' ? 'REGISTRASI' : 'REGISTER') : (t?.welcome || 'WELCOME')}
            </h2>
            <p className="text-gray-400 text-sm font-semibold leading-relaxed text-center md:text-left">
              {isRegistering
                ? (lang === 'id' ? 'Buat akun baru Civitas Academica Telkom University Anda.' : 'Create your new Telkom University Civitas Academica account.')
                : (lang === 'id' ? 'Login menggunakan akun Telkom University Anda.' : 'Login using your Telkom University account.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label htmlFor="fullName" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                    {lang === 'id' ? 'Nama Lengkap' : 'Full Name'}
                  </label>
                  <input id="fullName" type="text" name="fullName" placeholder="User Full Name" onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
                </div>

                <div className="space-y-1">
                  <label htmlFor="username" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Username</label>
                  <input id="username" type="text" name="username" placeholder="username" onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="nim" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">NIM / NIP</label>
                    <input id="nim" type="text" name="nim" placeholder="Masukkan NIM / NIP..." onChange={handleChange}
                      className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="phoneNumber" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                      {lang === 'id' ? 'Nomor HP' : 'Phone Number'}
                    </label>
                    <input id="phoneNumber" type="text" name="phoneNumber" placeholder="0812..." onChange={handleChange}
                      className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Email</label>
              <input id="email" type="email" name="email" placeholder="user@telkomuniversity.ac.id" onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Password</label>
              <input id="password" type="password" name="password" placeholder="••••••••" onChange={handleChange}
                minLength={isRegistering ? 8 : undefined}
                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                  {lang === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
                </label>
                <input id="confirmPassword" type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all duration-300 font-bold text-utama text-sm" required />
              </div>
            )}

            <div className="flex justify-between px-1 pt-2">
              <button type="button" onClick={() => onForgotPassword(formData.email)}
                className="text-[10px] font-black text-brand uppercase hover:underline tracking-widest">
                {t?.forgotPass || (lang === 'id' ? 'Lupa Password?' : 'Forgot Password?')}
              </button>
              <button type="button" onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-utama transition-colors">
                {isRegistering ? (lang === 'id' ? 'Kembali Login' : 'Back to Login') : (t?.register || (lang === 'id' ? 'Registrasi' : 'Register'))}
              </button>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-4 bg-brand text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 hover:bg-utama transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {isSubmitting
                ? (lang === 'id' ? 'MEMPROSES...' : 'PROCESSING...')
                : isRegistering ? (lang === 'id' ? 'Daftar Sekarang' : 'Register Now') : (t?.loginBtn || (lang === 'id' ? 'Masuk' : 'Login'))}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;