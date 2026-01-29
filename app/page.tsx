"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  MapPin,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"

/* ================= CONFIG SUPABASE ================= */
// Menggunakan variabel environment dari file .env.local kamu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ================= TYPES ================= */
interface Variant { 
  id: number; 
  variant_name: string; 
  price_override: number; 
}

interface MenuItem { 
  id: number; 
  name: string; 
  price: number; 
  image_url: string | null; 
  description: string; 
  category: string;
  product_variants?: Variant[]; 
}

interface CartItem { 
  cartKey: string; 
  id: number; 
  name: string; 
  variantName?: string;
  price: number; 
  quantity: number;
  checked: boolean;
}

interface Banner { image_url: string; }

export default function DimsumWebsite() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [address, setAddress] = useState("")
  
  // Kategori Baru: Makanan Berat sebagai default
  const [selectedCategory, setSelectedCategory] = useState<string>("Makanan Berat")
  const [currentSlide, setCurrentSlide] = useState(0)

  // State Modal Pilihan Varian (Pop-up ala Shopee)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [activeProduct, setActiveProduct] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)

  /* 1. FETCH DATA (Menu + Varian & Banner) */
  useEffect(() => {
    const fetchData = async () => {
      // Mengambil menu beserta data variannya
      const { data: m } = await supabase
        .from("dimsum_menu")
        .select("*, product_variants(*)") 
        .order("id")
      
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

  /* 3. LOGIKA KERANJANG & MODAL */
  const handleOpenSelection = (item: MenuItem) => {
    setActiveProduct(item)
    // Otomatis pilih varian pertama jika produk punya varian
    if (item.product_variants && item.product_variants.length > 0) {
      setSelectedVariant(item.product_variants[0])
    } else {
      setSelectedVariant(null)
    }
    setShowVariantModal(true)
  }

  const confirmAddToCart = () => {
    if (!activeProduct) return

    const item = activeProduct
    const variant = selectedVariant
    const cartKey = variant ? `${item.id}-${variant.id}` : `${item.id}`
    const price = variant ? variant.price_override : item.price
    const vName = variant ? variant.variant_name : undefined

    setCart((prev) => {
      const exist = prev.find((i) => i.cartKey === cartKey)
      if (exist) {
        return prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { 
        cartKey, id: item.id, name: item.name, variantName: vName, 
        price, quantity: 1, checked: true 
      }]
    })

    setShowVariantModal(false)
    setIsCartOpen(true)
  }

  const updateQuantity = (cartKey: string, delta: number) => {
    setCart((prev) => 
      prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0) // Hapus otomatis jika di-minus saat quantity 1
    )
  }

  const toggleCheck = (cartKey: string) => {
    setCart((prev) => prev.map((i) => i.cartKey === cartKey ? { ...i, checked: !i.checked } : i))
  }

  const formatPrice = (p: number) => `Rp ${p.toLocaleString("id-ID")}`

  const handleCheckout = () => {
    const checkedItems = cart.filter(i => i.checked)
    if (checkedItems.length === 0 || !customerName.trim() || !address.trim()) {
      return alert("Lengkapi Nama, Alamat, dan centang produk yang ingin dipesan!")
    }

    const subtotal = checkedItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const itemsList = checkedItems.map(i => `• ${i.name} ${i.variantName ? `(${i.variantName})` : ''} x${i.quantity}`).join("\n")
    
    const msg = `Halo Daily Bites Co.!\n\n*Data Pemesan:*\nNama: ${customerName}\nAlamat: ${address}\n\n*Pesanan:*\n${itemsList}\n\n*Total Tagihan:* ${formatPrice(subtotal)}`
    
    window.open(`https://wa.me/6285157745547?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#3d2622] font-sans">
      <title>Daily Bites Co. | Katalog Menu</title>
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#3d2622]/10 p-4">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-3">
            <img src="/img/logo.png" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" alt="Logo" />
            <h1 className="text-lg font-black uppercase tracking-tighter">Daily Bites Co.</h1>
          </div>
          <Button variant="outline" className="relative border-[#d9a01e] text-[#d9a01e] rounded-2xl h-10 px-4" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline font-bold">Keranjang</span>
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-[#d9a01e] text-white">
                {cart.filter(i => i.checked).length}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* CAROUSEL EVENT */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative w-full h-[380px] sm:h-[550px] rounded-[2.5rem] overflow-hidden shadow-xl bg-white border-[8px] border-white">
            <div className="flex transition-transform duration-1000 h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {banners.map((b, i) => (
                <img key={i} src={b.image_url} className="w-full h-full object-cover flex-shrink-0" alt="Promo" />
              ))}
            </div>
            <Button variant="ghost" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 rounded-full" onClick={() => setCurrentSlide((p) => (p - 1 + banners.length) % banners.length)}><ChevronLeft /></Button>
            <Button variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 rounded-full" onClick={() => setCurrentSlide((p) => (p + 1) % banners.length)}><ChevronRight /></Button>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV (KATEGORI BARU) */}
      <nav className="flex justify-center gap-3 mb-10 px-4 overflow-x-auto no-scrollbar">
        {["Makanan Berat", "Snack", "Frozen Food"].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)} 
            className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
              selectedCategory === cat 
              ? "bg-[#d9a01e] text-white shadow-lg scale-110" 
              : "bg-white text-gray-400 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* MENU GRID */}
      <main className="container mx-auto px-4 pb-28 max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {menu
            .filter(i => i.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim())
            .map((item) => (
              <Card key={item.id} className="rounded-[2rem] overflow-hidden border-none shadow-md bg-white hover:shadow-xl transition-all">
                <img src={item.image_url || "/placeholder.svg"} className="aspect-square object-cover w-full" alt={item.name} />
                <CardContent className="p-5 text-center">
                  <h3 className="font-extrabold text-lg mb-1 truncate">{item.name}</h3>
                  <p className="text-[#d9a01e] font-black text-xl mb-4">{formatPrice(item.price)}</p>
                  <Button className="w-full bg-[#3d2622] hover:bg-black text-white rounded-xl font-bold h-12" onClick={() => handleOpenSelection(item)}>Beli Sekarang</Button>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </main>

      {/* POP-UP PILIHAN VARIAN */}
      {showVariantModal && activeProduct && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVariantModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex gap-4 mb-6">
               <img src={activeProduct.image_url || "/placeholder.svg"} className="w-24 h-24 rounded-2xl object-cover border" alt="Thumbnail" />
               <div>
                  <h2 className="text-xl font-black">{activeProduct.name}</h2>
                  <p className="text-[#d9a01e] font-black text-lg">{formatPrice(selectedVariant?.price_override || activeProduct.price)}</p>
               </div>
            </div>
            
            <p className="text-gray-500 font-bold text-sm mb-3">Pilih Varian:</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {activeProduct.product_variants && activeProduct.product_variants.length > 0 ? (
                activeProduct.product_variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                      selectedVariant?.id === v.id ? "border-[#d9a01e] bg-[#fdfaf5] text-[#d9a01e]" : "border-gray-100 text-gray-400"
                    }`}
                  >
                    {v.variant_name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">Produk ini tidak memiliki varian tambahan.</p>
              )}
            </div>

            <Button className="w-full bg-[#d9a01e] h-14 rounded-2xl font-black text-white text-lg shadow-lg" onClick={confirmAddToCart}>
              Tambahkan ke Keranjang
            </Button>
          </div>
        </div>
      )}

      {/* SIDEBAR KERANJANG */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase flex items-center gap-2"><ShoppingBag className="text-[#d9a01e]" /> Keranjang Belanja</h2>
              <Button variant="ghost" onClick={() => setIsCartOpen(false)}><X /></Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              {cart.map(item => (
                <div key={item.cartKey} className={`flex items-center gap-3 p-4 rounded-2xl border ${item.checked ? 'border-[#d9a01e] bg-[#fdfaf5]' : 'border-gray-100'}`}>
                  <button onClick={() => toggleCheck(item.cartKey)}>
                    {item.checked ? <CheckCircle2 className="text-[#d9a01e] w-6 h-6" /> : <Circle className="text-gray-300 w-6 h-6" />}
                  </button>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#3d2622] leading-tight">{item.name}</p>
                    {item.variantName && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">└ Varian: {item.variantName}</p>}
                    <p className="text-xs font-black text-[#d9a01e] mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white border rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.cartKey, -1)} className="p-1 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartKey, 1)} className="p-1 hover:text-[#d9a01e]"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t mt-4 space-y-4 bg-white">
              <div className="flex justify-between font-black text-lg">
                <span>Total Terpilih</span>
                <span className="text-[#d9a01e]">{formatPrice(cart.filter(i => i.checked).reduce((s, i) => s + i.price * i.quantity, 0))}</span>
              </div>
              
              <div className="space-y-3">
                <Input placeholder="Nama Lengkap" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-none pl-4" />
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <Input placeholder="Alamat Pengiriman" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-none pl-10" />
                </div>
              </div>

              <Button className="w-full bg-[#d9a01e] h-14 rounded-2xl font-black text-white text-lg shadow-xl" onClick={handleCheckout}>
                Konfirmasi via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
