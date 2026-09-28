"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle, Flame, User, Check, Star, Search, Calendar } from "lucide-react";

type Tukang = {
  id: number;
  name: string;
  category: string;
  rating: number;
  jobs: number;
  price: number;
  verified: boolean;
  skills: string[];
};

const TUKANG_DATA: Tukang[] = [
  { id: 1, name: "Budi Santoso", category: "Listrik", rating: 4.9, jobs: 124, price: 150000, verified: true, skills: ["Instalasi", "Panel"] },
  { id: 2, name: "Agus Pipa", category: "Pipa & Air", rating: 4.8, jobs: 89, price: 120000, verified: true, skills: ["Bocor", "Pompa"] },
  { id: 3, name: "Siti AC", category: "AC", rating: 5.0, jobs: 210, price: 100000, verified: true, skills: ["Cuci AC", "Freon"] },
  { id: 4, name: "Hendra Bangun", category: "Renovasi", rating: 4.7, jobs: 56, price: 500000, verified: true, skills: ["Keramik", "Atap"] },
];

const CATEGORIES = ["Semua", "Listrik", "AC", "Pipa & Air", "Renovasi"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTukang, setSelectedTukang] = useState<Tukang | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredTukang = TUKANG_DATA.filter(t => {
    const matchCat = activeCategory === "Semua" || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handlePesan = (tukang: Tukang) => {
    setSelectedTukang(tukang);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setToastMsg("Menunggu Tukang");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-[#FF6B00]/20 selection:text-[#0F172A] pb-safe">
      
      {/* Navbar Sticky */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-200 ${isScrolled ? "bg-slate-900 shadow-md py-3" : "bg-slate-900 py-4"}`}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            Tukang<span className="text-[#FF6B00]">In</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#layanan" className="text-slate-300 hover:text-white transition-colors relative group">
              Layanan
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="#mitra" className="text-slate-300 hover:text-white transition-colors relative group">
              Mitra Tukang
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="#cara-kerja" className="text-slate-300 hover:text-white transition-colors relative group">
              Cara Kerja
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/login">
              <Button className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold h-10 px-6 rounded-lg transition-all active:scale-95 shadow-[0_4px_12px_rgba(255,107,0,0.35)]">
                Pesan Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 pt-32 pb-24 px-4 relative">
        <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <h1 className="text-[32px] md:text-[48px] font-extrabold text-white leading-tight mb-4 -tracking-[0.02em]">
            Temukan <span className="text-[#FF6B00]">Tukang Profesional</span><br className="hidden md:block"/> untuk Rumah Anda
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-8">
            Solusi terpercaya untuk perbaikan dan perawatan rumah. Cari teknisi ahli, bayar aman, dan nikmati garansi layanan.
          </p>
          
          <div className="w-full max-w-2xl bg-white p-2 rounded-xl shadow-lg flex gap-2 mb-10 transition-shadow focus-within:ring-3 focus-within:ring-[#FF6B00]/15">
            <div className="pl-4 flex items-center justify-center">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari layanan atau nama tukang..." 
              className="flex-1 h-12 px-2 outline-none text-slate-900 rounded-lg placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="bg-[#FF6B00] hover:bg-[#E05E00] text-white h-12 px-8 rounded-lg font-semibold active:scale-95 transition-transform">
              Cari
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4" /> KTP & SKCK Verified
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Garansi 14 Hari
            </span>
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-200">
              <Flame className="w-4 h-4 text-orange-500" /> 1,200+ Pesanan Berjalan
            </span>
          </div>
        </div>
      </section>

      {/* Categories Grid overlapping Hero */}
      <section id="layanan" className="max-w-[1200px] mx-auto px-4 -mt-10 relative z-10 w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`snap-center shrink-0 flex items-center justify-center h-16 px-6 rounded-xl border font-semibold transition-all duration-200
                  ${isActive 
                    ? "bg-white border-[#FF6B00] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] ring-[3px] ring-[#FF6B00]/15 text-[#FF6B00]" 
                    : "bg-white border-slate-200 text-slate-700 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 active:scale-95"}
                `}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* Tukang List */}
      <section id="mitra" className="max-w-[1200px] mx-auto px-4 py-16 w-full flex-1">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 -tracking-[0.02em]">Mitra Tukang Tersedia</h2>
        </div>

        {filteredTukang.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
            <div className="flex justify-center mb-4 bg-slate-50 w-20 h-20 rounded-full items-center border border-slate-100">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tukang tidak ditemukan</h3>
            <p className="text-slate-500">Coba ubah kata kunci atau kategori pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTukang.map((tukang, idx) => (
              <div 
                key={tukang.id} 
                className="bg-white rounded-[16px] border border-slate-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] hover:border-slate-300 group animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center relative border border-slate-200 shrink-0">
                    <User className="w-6 h-6 text-slate-400" />
                    {tukang.verified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#FF6B00] transition-colors">{tukang.name}</h3>
                    <p className="text-sm text-slate-500">{tukang.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {tukang.rating}
                  </div>
                  <div className="text-slate-500">
                    {tukang.jobs} pekerjaan
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {tukang.skills.map(skill => (
                    <span key={skill} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Garansi
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Mulai dari</p>
                    <p className="font-bold text-slate-900 tabular-nums">
                      Rp{tukang.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handlePesan(tukang)}
                    className="bg-white text-slate-900 border-[1.5px] border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold h-10 px-5 rounded-lg active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                  >
                    Pesan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 -tracking-[0.02em]">Cara Kerja Tukang<span className="text-[#FF6B00]">In</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                <Search className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Pilih Tukang</h3>
              <p className="text-slate-400">Pilih mitra tukang yang sesuai dengan kendala dan budget Anda.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                <Calendar className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Atur Jadwal</h3>
              <p className="text-slate-400">Tentukan waktu pengerjaan, tukang akan datang tepat waktu.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                <ShieldCheck className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Selesai & Garansi</h3>
              <p className="text-slate-400">Pekerjaan selesai, bayar aman, dan nikmati garansi 14 hari.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-extrabold text-white tracking-tight mb-4">
              Tukang<span className="text-[#FF6B00]">In</span>
            </div>
            <p className="max-w-xs">Platform terpercaya menghubungkan Anda dengan teknisi ahli di sekitar Anda.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">Listrik</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">AC</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pipa & Air</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Renovasi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; {new Date().getFullYear()} Tukangin. Hak Cipta Dilindungi.
        </div>
      </footer>

      {/* Booking Modal / Bottom Sheet */}
      {isModalOpen && selectedTukang && (
        <div 
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full md:w-[500px] rounded-t-[24px] md:rounded-[24px] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.14)] flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300">
            {/* Grab Handle for Mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-9 h-1 bg-slate-300 rounded-full"></div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Jadwalkan Tukang</h3>
              <p className="text-slate-500 mb-6">Pesan layanan {selectedTukang.category} dengan {selectedTukang.name}</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Pilih Jadwal</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Hari Ini', 'Besok', 'Lusa'].map((day, i) => (
                      <label key={day} className="cursor-pointer group">
                        <input type="radio" name="jadwal" className="peer sr-only" defaultChecked={i === 0} />
                        <div className="text-center py-3 border-2 border-slate-200 rounded-lg peer-checked:border-[#FF6B00] peer-checked:bg-orange-50 peer-checked:text-[#FF6B00] font-semibold text-slate-700 transition-colors group-active:scale-95">
                          {day}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Estimasi Biaya Dasar</span>
                    <span className="font-bold tabular-nums">Rp{selectedTukang.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Biaya Layanan Aplikasi</span>
                    <span className="tabular-nums">Rp5.000</span>
                  </div>
                  <hr className="my-3 border-slate-200" />
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-[#FF6B00] tabular-nums">Rp{(selectedTukang.price + 5000).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white md:rounded-b-[24px] pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-4px_rgba(15,23,42,0.05)]">
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white text-slate-700 border-[1.5px] border-slate-200 hover:bg-slate-50 h-12 rounded-lg font-semibold active:scale-95 transition-all"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="flex-1 bg-[#FF6B00] hover:bg-[#E05E00] text-white h-12 rounded-lg font-semibold active:scale-95 shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-all"
                >
                  Konfirmasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-safe mb-6 left-1/2 -translate-x-1/2 z-[110] bg-orange-50 border border-orange-200 text-orange-800 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 font-semibold">
          <CheckCircle className="w-5 h-5 text-orange-600" />
          {toastMsg}
        </div>
      )}

    </div>
  );
}
