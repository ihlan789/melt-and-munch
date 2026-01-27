"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"

/* ================= CONFIG SUPABASE ================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ================= TYPES ================= */
interface MenuItem { id: number; name: string; price: number; image_url: string | null; description: string; category: string; }
interface CartItem { id: number; name: string; price: number; quantity: number; }
interface Banner { image_url: string; }

export default function DimsumWebsite() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Makanan Asin")
  const [currentSlide, setCurrentSlide] = useState(0)

  /* 1. FETCH DATA */
  useEffect(() => {
    const fetchData = async () => {
      const { data: m } = await supabase.from("dimsum_menu").select("*").order("id")
      if (m) setMenu(m)
      const { data: b } = await supabase.from("promo_banners").select("image_url").eq("active", true)
      if (b) setBanners(b)
    }
    fetchData()
  }, [])

  /* 2. CAROUSEL AUTO-PLAY */
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((p) => (p + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners])

  /* 3. LOGIKA KERANJANG */
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id)
      if (exist) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0))
  }

  const formatPrice = (p: number) => `Rp ${p.toLocaleString("id-ID")}`

  const handleCheckout = () => {
    if (cart.length === 0 || !customerName.trim()) return alert("Isi nama dan pilih menu!")
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    const msg = `Halo, saya ${customerName} ingin memesan di Melt & Munch:\n${cart.map(i => `• ${i.name} x${i.quantity}`).join("\n")}\n\nTotal: ${formatPrice(subtotal)}`
    window.open(`https://wa.me/6285157745547?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const filteredMenu = menu.filter(i => i.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim())

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#3d2622] font-sans">
      
      {/* HEADER DENGAN LOGO ASLI */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#3d2622]/10 p-4 sm:p-5">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3">
            {/* LOGO KAMU */}
            <img 
              src="/img/logo.png" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain" 
              alt="Melt & Munch Logo" 
              onError={(e) => {
                // Fallback jika gambar tidak ditemukan
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase text-[#3d2622]">Melt & Munch</h1>
          </div>
          <Button 
            variant="outline" 
            className="relative border-[#d9a01e] text-[#d9a01e] hover:bg-[#d9a01e] hover:text-white rounded-2xl px-4 sm:px-6 transition-all h-10 sm:h-11"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Keranjang</span>
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-[#d9a01e] text-white border-none h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 shadow-md text-[10px] sm:text-xs">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* EVENT CAROUSEL (VERTIKAL/TINGGI) */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative w-full h-[380px] sm:h-[550px] md:h-[650px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_25px_60px_rgba(61,38,34,0.18)] bg-white border-[8px] sm:border-[15px] border-white">
            {banners.length > 0 ? (
              <div className="flex transition-transform duration-1000 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {banners.map((b, i) => (
                  <img key={i} src={b.image_url} className="w-full h-full object-cover flex-shrink-0" alt="Promo Banner" />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#d9a01e] font-bold animate-pulse">Memuat Promo Spesial...</div>
            )}
            
            <Button variant="ghost" size="icon" className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-[#3d2622] rounded-full backdrop-blur-md h-10 w-10 sm:h-14 sm:w-14" onClick={() => setCurrentSlide((p) => (p - 1 + banners.length) % banners.length)}>
              <ChevronLeft className="h-6 w-6 sm:h-9 sm:w-9" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-[#3d2622] rounded-full backdrop-blur-md h-10 w-10 sm:h-14 sm:w-14" onClick={() => setCurrentSlide((p) => (p + 1) % banners.length)}>
              <ChevronRight className="h-6 w-6 sm:h-9 sm:w-9" />
            </Button>

            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
              {banners.map((_, i) => (
                <div key={i} className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${currentSlide === i ? "bg-[#d9a01e] w-8 sm:w-12 shadow-lg" : "bg-white/40 w-2 sm:w-2.5"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV */}
      <nav className="flex justify-center gap-3 sm:gap-4 mb-10 px-4 overflow-x-auto no-scrollbar">
        {["Makanan Asin", "Makanan Manis", "Frozen Food"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
              selectedCategory === cat 
              ? "bg-[#d9a01e] text-white shadow-[0_12px_24px_rgba(217,160,30,0.35)] scale-110" 
              : "bg-white text-gray-400 border border-gray-100 hover:border-[#d9a01e]/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* MENU GRID (1:1 ETALASE) */}
      <main className="container mx-auto px-4 pb-28 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-12">
          {filteredMenu.map((item) => {
            const qty = cart.find(i => i.id === item.id)?.quantity || 0
            return (
              <Card key={item.id} className="border-none shadow-[0_10px_40px_rgba(61,38,34,0.06)] rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white">
                <div className="aspect-square w-full overflow-hidden bg-[#fdfaf5]">
                  <img src={item.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt={item.name} />
                </div>
                <CardContent className="p-5 sm:p-8 text-center">
                  <h3 className="font-extrabold text-lg sm:text-2xl mb-1 text-[#3d2622] truncate">{item.name}</h3>
                  <p className="text-[#d9a01e] font-black text-base sm:text-xl mb-5 sm:mb-7">{formatPrice(item.price)}</p>
                  
                  {qty === 0 ? (
                    <Button 
                      className="w-full bg-[#3d2622] hover:bg-[#4d302b] text-white rounded-[1.5rem] h-12 sm:h-16 font-black text-sm sm:text-lg transition-all active:scale-95 shadow-xl shadow-[#3d2622]/15" 
                      onClick={() => addToCart(item)}
                    >
                      Beli Sekarang
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-[#fdfaf5] rounded-[1.5rem] p-1.5 sm:p-2 border border-gray-100 shadow-inner">
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-12 sm:w-12 text-[#3d2622] hover:bg-white" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-4 h-4 sm:w-6 sm:h-6" /></Button>
                      <span className="font-black text-lg sm:text-2xl text-[#3d2622]">{qty}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-12 sm:w-12 text-[#3d2622] hover:bg-white" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-4 h-4 sm:w-6 sm:h-6" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      {/* SIDEBAR KERANJANG */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#3d2622]/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full p-8 sm:p-10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-[#3d2622] tracking-tighter uppercase">Daftar Pesanan</h2>
              <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-gray-100" onClick={() => setIsCartOpen(false)}><X className="h-8 w-8 text-[#3d2622]" /></Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <ShoppingCart className="h-24 w-24 mb-4" />
                   <p className="font-bold">Keranjang kosong</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-[#fdfaf5] p-5 rounded-[2rem] border border-[#3d2622]/5 shadow-sm">
                    <div>
                      <p className="font-extrabold text-[#3d2622] text-base sm:text-lg">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 font-bold">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-black text-[#d9a01e] text-base sm:text-lg">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-8 border-t border-gray-100 mt-8 space-y-6">
                <div className="flex justify-between font-black text-2xl sm:text-3xl text-[#3d2622]">
                  <span>Total</span>
                  <span className="text-[#d9a01e]">{formatPrice(cart.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-[#3d2622]/50 px-2 uppercase tracking-[0.2em]">Data Pemesan</label>
                  <Input 
                    placeholder="Nama Lengkap" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    className="rounded-2xl h-14 sm:h-16 text-base sm:text-lg border-gray-200 focus:border-[#d9a01e] focus:ring-[#d9a01e] bg-gray-50 px-6 shadow-inner" 
                  />
                </div>
                <Button 
                  className="w-full bg-[#d9a01e] hover:bg-[#c48d1a] h-16 sm:h-20 rounded-[1.5rem] font-black text-lg sm:text-xl text-white shadow-2xl shadow-[#d9a01e]/30 transition-all active:scale-95" 
                  onClick={handleCheckout}
                >
                  Konfirmasi WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}