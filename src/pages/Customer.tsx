
// import React, { useEffect, useMemo, useRef, useState } from "react"; 
// import { Search, ShoppingCart, X, Plus, Minus, Trash2, Edit3, Eye } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../api/axios";
// import {BASE_URL_2} from "../api/axios"
// type Product = {
//   id: string | number;
//   name: string;
//   price: number;
//   unit?: string;
//   image?: string;
//   image_url?: string;
//   sku?: string;
//   stock?: number;
//   category?: any;
// };

// type CartLine = {
//   product: Product;
//   qty: number;
//   lineTotal: number;
// };

// type OrderItem = {
//   id?: string | number;
//   name: string;
//   qty: number;
//   price: number;
// };

// type PaymentDetails = {
//   method: string;
//   transactionId?: string;
//   status?: string;
//   provider?: string;
//   notes?: string;
//   raw?: any;
// };

// type Order = {
//   orderId: string;
//   customerName: string;
//   phone: string;
//   email?: string;
//   dateTimeISO: string;
//   amount: number;
//   items: OrderItem[];
//   payment: PaymentDetails;
//   offline?: boolean;
// };

// const SAMPLE_PRODUCTS: Product[] = [
//   { id: "p-1", name: "Millet Idly Ravvas (500g)", price: 120, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,idli,grain&sig=101", sku: "MIR-500", stock: 50, category: "Millets" },
//   { id: "p-2", name: "Millet Upma Ravva (500g)", price: 95, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,upma,coarse-grain&sig=102", sku: "MUR-500", stock: 40, category: "Millets" },
//   { id: "p-3", name: "Organic Grains Mix (1kg)", price: 240, unit: "1kg", image: "https://source.unsplash.com/featured/600x600/?organic,grains,mix&sig=103", sku: "GRA-1KG", stock: 30, category: "Grains" },
//   { id: "p-4", name: "Special Dry Fruits Pack", price: 480, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts,mix&sig=104", sku: "SDF-500", stock: 20, category: "Dry Fruits" },
//   { id: "p-5", name: "Premium Flour (2kg)", price: 180, unit: "2kg", image: "https://source.unsplash.com/featured/600x600/?flour,wheat,bread-ingredients&sig=105", sku: "FLO-2KG", stock: 60, category: "Flour" },
//   { id: "p-6", name: "Healthy Snack Mix (250g)", price: 150, unit: "250g", image: "https://source.unsplash.com/featured/600x600/?healthy-snack,nuts,seeds&sig=106", sku: "SNK-250", stock: 80, category: "Snacks" },
// ];

// // static sample orders (online/offline)
// const SAMPLE_ORDERS: Order[] = [
//   {
//     orderId: "ORD-1001",
//     customerName: "Anita Sharma",
//     phone: "+91 98765 43210",
//     email: "anita@example.com",
//     dateTimeISO: new Date().toISOString(),
//     amount: 599.0,
//     items: [
//       { id: "p-1", name: "Millet Idly Ravvas (500g)", qty: 2, price: 120 },
//       { id: "p-4", name: "Special Dry Fruits Pack", qty: 1, price: 359 },
//     ],
//     payment: {
//       method: "card",
//       transactionId: "txn_abc123",
//       status: "captured",
//       provider: "Razorpay",
//       notes: "online order",
//     },
//     offline: false,
//   },
//   {
//     orderId: "ORD-1002",
//     customerName: "Ravi Kumar",
//     phone: "+91 91234 56789",
//     email: "ravi.k@example.com",
//     dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
//     amount: 240.0,
//     items: [{ id: "p-3", name: "Organic Grains Mix (1kg)", qty: 1, price: 240 }],
//     payment: {
//       method: "upi",
//       transactionId: "upi-998877",
//       status: "success",
//       provider: "PhonePe",
//       notes: "delivered by rider",
//     },
//     offline: false,
//   },
//   {
//     orderId: "OFF-3001",
//     customerName: "Office Canteen",
//     phone: "+91 80123 45678",
//     email: "canteen@example.com",
//     dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
//     amount: 1999.0,
//     items: [
//       { id: "p-6", name: "Healthy Snack Mix (250g)", qty: 6, price: 150 },
//       { id: "p-5", name: "Premium Flour (2kg)", qty: 1, price: 180 },
//     ],
//     payment: {
//       method: "cash",
//       status: "collected",
//       notes: "cash collected at POS (offline)",
//     },
//     offline: true,
//   },
//   {
//     orderId: "OFF-3002",
//     customerName: "School Events",
//     phone: "+91 88900 11223",
//     email: "events@school.org",
//     dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
//     amount: 1299.0,
//     items: [{ name: "Festive Combo", qty: 1, price: 1299 }],
//     payment: {
//       method: "cash",
//       status: "collected",
//       notes: "bulk order - offline",
//     },
//     offline: true,
//   },
// ];

// const Spinner = ({ size = 16 }: { size?: number }) => (
//   <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
//     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
//     <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
//   </svg>
// );

// export default function POS(): JSX.Element {
//   // existing state & logic
//   const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [query, setQuery] = useState("");
//   const [cartMap, setCartMap] = useState<Record<string, number>>({});
//   const [cartOpen, setCartOpen] = useState(false);
//   const [discount, setDiscount] = useState<{ type: "fixed" | "percent"; value: number }>({ type: "fixed", value: 0 });
//   const [isCheckingOut, setIsCheckingOut] = useState(false);
//   const [gstPercent, setGstPercent] = useState<number>(18);
//   const [adminEditProduct, setAdminEditProduct] = useState<Product | null>(null);
//   const [adminModalOpen, setAdminModalOpen] = useState(false);
//   const [adminName, setAdminName] = useState("");
//   const [adminPrice, setAdminPrice] = useState<string>("");
//   const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
//   const [adminPreview, setAdminPreview] = useState<string>("");
//   const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const imageInputRef = useRef<HTMLInputElement | null>(null);

//   const [customerName, setCustomerName] = useState<string>("");
//   const [customerPhone, setCustomerPhone] = useState<string>("");

//   type PaymentMethod = "card" | "upi" | "cash" | "";
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

//   // keeping selectedOrder & helpers as-is (not rendered) to avoid larger changes
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

//   // normalize server product - kept unchanged
//   const normalizeServerProduct = (r: any, fallbackIndex = 0): Product => {
//     return {
//       id: r.id ?? r._id ?? r.product_id ?? `srv-${fallbackIndex}`,
//       name: r.name ?? r.title ?? `Product ${fallbackIndex + 1}`,
//       price: Number(r.price ?? r.amount ?? 0),
//       unit: r.grams ?? r.unit ?? r.size ?? undefined,
//       image: r.image ?? r.image_url ?? r.imageUrl ?? undefined,
//       image_url: r.image_url ?? undefined,
//       sku: r.sku ?? r.code ?? undefined,
//       stock: r.stock !== undefined ? Number(r.stock) : undefined,
//       category: r.category && typeof r.category === "object" ? r.category.name ?? r.category : r.category,
//     };
//   };

//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoadingProducts(true);
//       try {
//         const res = await api.get("/admin/products/show");
//         const body = res.data;
//         let rows: any[] = [];
//         if (Array.isArray(body)) rows = body;
//         else if (Array.isArray(body.data)) rows = body.data;
//         else if (Array.isArray(body.products)) rows = body.products;
//         else if (Array.isArray(body.rows)) rows = body.rows;
//         else rows = [];

//         if (mounted && rows.length) {
//           const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
//           setProducts(normalized);
//         } else if (mounted) {
//           toast("Showing sample products (no server items)");
//         }
//       } catch (err) {
//         console.error("Failed to load products", err);
//         if (mounted) toast("Using sample products (failed to load from API)", { icon: "ℹ️" });
//       } finally {
//         if (mounted) setLoadingProducts(false);
//       }
//     };
//     void load();
//     return () => { mounted = false; };
//   }, []);

//   const cartLines: CartLine[] = useMemo(() => {
//     const arr: CartLine[] = [];
//     for (const pid of Object.keys(cartMap)) {
//       const qty = cartMap[pid];
//       const prod = products.find((p) => String(p.id) === pid);
//       if (!prod) continue;
//       const lineTotal = Math.round((prod.price * qty + Number.EPSILON) * 100) / 100;
//       arr.push({ product: prod, qty, lineTotal });
//     }
//     return arr;
//   }, [cartMap, products]);

//   const itemsCount = cartLines.reduce((s, l) => s + l.qty, 0);
//   const subTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
//   const gstAmount = Math.round((subTotal * (gstPercent / 100) + Number.EPSILON) * 100) / 100;
//   const discountAmount = discount.type === "fixed" ? discount.value : Math.round((subTotal * (discount.value / 100) + Number.EPSILON) * 100) / 100;
//   const total = Math.max(0, Math.round((subTotal + gstAmount - discountAmount + Number.EPSILON) * 100) / 100);

//   const visibleProducts = products.filter((p) => {
//     if (!query) return true;
//     const q = query.toLowerCase();
//     return p.name.toLowerCase().includes(q) || String(p.sku || "").toLowerCase().includes(q) || String(p.category || "").toLowerCase().includes(q);
//   });

//   function addToCart(product: Product, qty = 1) {
//     setCartMap((m) => {
//       const key = String(product.id);
//       const nextQty = (m[key] ?? 0) + qty;
//       return { ...m, [key]: nextQty };
//     });
//     toast.success(`${product.name} added to cart`);
//   }

//   function setQty(productId: string | number, qty: number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       if (qty <= 0) {
//         const copy = { ...m };
//         delete copy[key];
//         return copy;
//       }
//       return { ...m, [key]: qty };
//     });
//   }
//   function inc(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => ({ ...m, [key]: (m[key] ?? 0) + 1 }));
//   }
//   function dec(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       const next = (m[key] ?? 0) - 1;
//       if (next <= 0) {
//         const copy = { ...m };
//         delete copy[key];
//         return copy;
//       }
//       return { ...m, [key]: next };
//     });
//   }

//   function removeLine(productId: string | number) {
//     const key = String(productId);
//     setCartMap((m) => {
//       const copy = { ...m };
//       delete copy[key];
//       return copy;
//     });
//   }

//   const validPhone = (p: string) => {
//     const cleaned = p.replace(/\D/g, "");
//     return cleaned.length >= 10;
//   };
//   const validName = (n: string) => n.trim().length > 0;

//   async function handleCheckout() {
//     if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
//     if (!validName(customerName)) { toast.error("Enter customer name"); return; }
//     if (!validPhone(customerPhone)) { toast.error("Enter valid phone number (min 10 digits)"); return; }
//     if (!paymentMethod) { toast.error("Select payment method"); return; }

//     setIsCheckingOut(true);

//     const payload = {
//       name: customerName.trim(),
//       phone: customerPhone.replace(/\D/g, ""),
//       payment: paymentMethod,
//       items: cartLines.map(l => ({
//         product_id: typeof l.product.id === "string" && /^\d+$/.test(String(l.product.id)) ? Number(l.product.id) : l.product.id,
//         name: l.product.name,
//         qty: l.qty,
//         price: l.product.price
//       })),
//       subtotal: subTotal,
//       gst_percent: gstPercent,
//       gst_amount: gstAmount,
//       discount_type: discount.type,
//       discount_value: discount.value,
//       total,
//     };
//     try {
//       const res = await api.post("admin/pos-orders/create", payload, { headers: { "Content-Type": "application/json" } });
//       const body = res.data;
//       toast.success("Purchase successful");
//       setCartMap({});
//       setCartOpen(false);
//       setCustomerName("");
//       setCustomerPhone("");
//       setPaymentMethod("");
//       if (body?.order_id) toast.success(`Order ${body.order_id} created`);
//     } catch (err: any) {
//       console.error("Checkout error", err);
//       toast.error("Network/server error while creating order");
//     } finally {
//       setIsCheckingOut(false);
//     }
//   }

//   async function apiCreateProduct(name: string, price: number, file?: File | null) {
//     const fd = new FormData();
//     fd.append("name", name);
//     fd.append("price", String(price));
//     if (file) fd.append("image", file);
//     const res = await api.post("/admin/products/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
//     const body = res.data;
//     const raw = body?.data ?? body?.product ?? body ?? null;
//     return {
//       id: raw?.id ?? raw?._id ?? `srv-${Date.now()}`,
//       name: raw?.name ?? name,
//       price: Number(raw?.price ?? price ?? 0),
//       image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
//       image_url: raw?.image_url ?? undefined,
//       category: raw?.category ?? raw?.category?.name ?? undefined,
//     } as Product;
//   }

//   async function apiUpdateProduct(id: string | number, name: string, price: number, file?: File | null) {
//     const fd = new FormData();
//     fd.append("name", name);
//     fd.append("price", String(price));
//     if (file) fd.append("image", file);
//     const res = await api.post(`/admin/products/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     const body = res.data;
//     const raw = body?.data ?? body?.product ?? body ?? null;
//     return {
//       id: raw?.id ?? id,
//       name: raw?.name ?? name,
//       price: Number(raw?.price ?? price ?? 0),
//       image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
//       image_url: raw?.image_url ?? undefined,
//       category: raw?.category ?? raw?.category?.name ?? undefined,
//     } as Product;
//   }

//   async function apiDeleteProduct(id: string | number) {
//     const res = await api.delete(`/admin/products/delete/${id}`);
//     return res.status >= 200 && res.status < 300;
//   }

//   function openAdminCreate() {
//     setAdminEditProduct(null);
//     setAdminName("");
//     setAdminPrice("");
//     setAdminImageFile(null);
//     setAdminPreview("");
//     setAdminModalOpen(true);
//   }

//   function openAdminEdit(p: Product) {
//     setAdminEditProduct(p);
//     setAdminName(p.name ?? "");
//     setAdminPrice(String(p.price ?? ""));
//     setAdminImageFile(null);
//     setAdminPreview(p.image_url ?? p.image ?? "");
//     setAdminModalOpen(true);
//   }

//   function onAdminImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     setAdminImageFile(f);
//     const r = new FileReader();
//     r.onload = () => setAdminPreview(String(r.result ?? ""));
//     r.readAsDataURL(f);
//   }

//   async function submitAdminForm(e?: React.FormEvent) {
//     e?.preventDefault();
//     const name = adminName.trim();
//     const price = Number(adminPrice || 0);
//     if (!name) { toast.error("Name required"); return; }
//     if (Number.isNaN(price)) { toast.error("Price invalid"); return; }
//     try {
//       if (adminEditProduct) {
//         const optimistic = products.map((p) => (String(p.id) === String(adminEditProduct.id) ? { ...p, name, price, image: adminPreview || p.image, image_url: adminPreview || p.image_url } : p));
//         setProducts(optimistic);
//         setAdminModalOpen(false);
//         const updated = await apiUpdateProduct(adminEditProduct.id, name, price, adminImageFile);
//         setProducts((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
//         toast.success("Product updated");
//       } else {
//         const tmpId = `tmp-${Date.now()}`;
//         const optimistic: Product = { id: tmpId, name, price, image: adminPreview || undefined, image_url: adminPreview || undefined };
//         setProducts((prev) => [optimistic, ...prev]);
//         setAdminModalOpen(false);
//         const created = await apiCreateProduct(name, price, adminImageFile);
//         setProducts((prev) => [created, ...prev.filter((p) => p.id !== tmpId)]);
//         toast.success("Product created");
//       }
//     } catch (err: any) {
//       console.error("Save product failed", err);
//       toast.error(err?.message || "Save failed");
//     } finally {
//       setAdminImageFile(null);
//       setAdminPreview("");
//     }
//   }

//   function requestDelete(id: string | number, name?: string) {
//     setDeleteTarget({ id, name });
//   }

//   async function confirmDelete() {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     const id = deleteTarget.id;
//     const prev = products;
//     setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
//     try {
//       await apiDeleteProduct(id);
//       toast.success("Product deleted");
//     } catch (err: any) {
//       console.error("Delete failed", err);
//       toast.error(err?.message || "Delete failed");
//       setProducts(prev);
//     } finally {
//       setDeleteLoading(false);
//       setDeleteTarget(null);
//     }
//   }

//   async function refreshProducts() {
//     setLoadingProducts(true);
//     try {
//       const res = await api.get("/admin/products/show");
//       const body = res.data;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) rows = body.data;
//       else rows = [];
//       if (rows.length) {
//         const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
//         setProducts(normalized);
//         toast.success("Products refreshed");
//       } else {
//         toast("No products returned");
//       }
//     } catch (err) {
//       console.error("Refresh failed", err);
//       toast.error("Refresh failed");
//     } finally {
//       setLoadingProducts(false);
//     }
//   }

//   const fallbackFor = (p: Product) => {
//     const seed = encodeURIComponent(p.category || p.name.split(" ")[0] || "product");
//     return `https://source.unsplash.com/featured/400x400/?${seed}`;
//   };

//   // helpers preserved (unused)
//   const allSales = useMemo(() => SAMPLE_ORDERS, []);
//   const formatDateTime = (iso: string) => {
//     try {
//       const d = new Date(iso);
//       return d.toLocaleString();
//     } catch {
//       return iso;
//     }
//   };
//   const formatCurrency = (n: number) => `₹ ${n.toFixed(2)}`;

//   const openOrderModal = (o: Order) => setSelectedOrder(o);
//   const closeOrderModal = () => setSelectedOrder(null);

//   return (
//     <div>
//       <Toaster position="top-right" />

//       {/* Top row: title + search + cart */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
//         <div>
//           {/* <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Point of Sales</h1> */}
//         </div>
//         <div className="flex w-full md:w-auto items-center gap-3">
//           <div className="relative flex-1 md:flex-none">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <input
//               type="search"
//               placeholder="Search products, SKU or category..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-9 pr-4 py-2 rounded-full border w-full md:w-[360px] focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <button
//             onClick={() => setCartOpen((s) => !s)}
//             className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
//             title="Open cart"
//             aria-label="Open cart"
//           >
//             <ShoppingCart className="w-5 h-5" />
//             <span className="hidden sm:inline">Cart</span>
//             <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-white text-indigo-600 rounded-full">
//               {itemsCount}
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Orders table removed as requested */}

//       {/* rest of your product listing UI (unchanged) */}
//       <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <div className="text-sm text-slate-600">{visibleProducts.length} products</div>
//           <div className="flex items-center gap-2">
//             {/* <button onClick={() => refreshProducts()} className="px-3 py-1 rounded bg-slate-100 text-sm">Refresh</button> */}
//             {/* <button onClick={() => openAdminCreate()} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Add Product</button> */}
//           </div>
//         </div>

//         {/* Desktop table (md+) */}
//         <div className="hidden md:block overflow-x-auto">
//           <table className="min-w-full divide-y divide-slate-100">
//             <thead>
//               <tr className="text-left text-sm text-slate-600">
//                 <th className="px-4 py-3 w-12">S.no</th>
//                 <th className="px-4 py-3 w-20">Image</th>
//                 <th className="px-4 py-3">Name</th>
//                 <th className="px-4 py-3">Category</th>
//                 <th className="px-4 py-3">Grams</th>
//                 <th className="px-4 py-3">Price</th>
//                 <th className="px-4 py-3">Stock</th>
//                 <th className="px-4 py-3 text-right">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-slate-100">
//               {loadingProducts
//                 ? Array.from({ length: 6 }).map((_, i) => (
//                     <tr key={i} className="animate-pulse">
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-6" /></td>
//                       <td className="px-4 py-4"><div className="h-12 w-12 rounded-full bg-slate-200" /></td>
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
//                       <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-8" /></td>
//                       <td className="px-4 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-24 inline-block" /></td>
//                     </tr>
//                   ))
//                 : visibleProducts.map((p, idx) => {
//                     const inCartQty = cartMap[String(p.id)] ?? 0;
//                     const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
//                     return (
//                       <tr key={p.id}>
//                         <td className="px-4 py-4 align-top text-sm text-slate-700">{idx + 1}</td>
//                         <td className="px-4 py-4 align-top">
//                           <div className="w-14 h-14 rounded-full overflow-hidden bg-white border">
//                             <img
//                               src={imageSrc}
//                               alt={p.name}
//                               className="object-cover w-full h-full"
//                               onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackFor(p); }}
//                             />
//                           </div>
//                         </td>
//                         <td className="px-4 py-4 align-top">
//                           <div className="font-medium text-slate-800">{p.name}</div>
//                           <div className="text-sm text-slate-500 mt-1">{p.sku ?? p.unit}</div>
//                         </td>
//                         <td className="px-4 py-4 align-top text-sm text-slate-600">{p.category ?? "-"}</td>
//                         <td className="px-4 py-4 align-top text-sm text-slate-600">{p.unit ?? "-"}</td>
//                         <td className="px-4 py-4 align-top text-sm font-semibold">₹ {Number(p.price || 0).toFixed(2)}</td>
//                         <td className="px-4 py-4 align-top text-sm text-slate-700">{p.stock ?? "-"}</td>
//                         <td className="px-4 py-4 align-top text-right">
//                           <div className="flex items-center justify-end gap-2 flex-wrap">
//                             {inCartQty === 0 ? (
//                               <button
//                                 onClick={() => addToCart(p, 1)}
//                                 className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-600 text-white text-sm"
//                               >
//                                 <Plus className="w-4 h-4" /> Add
//                               </button>
//                             ) : (
//                               <div className="inline-flex items-center gap-1 border rounded px-1">
//                                 <button onClick={() => dec(p.id)} className="px-2 py-1 rounded"><Minus className="w-4 h-4" /></button>
//                                 <div className="px-3 py-1 text-sm">{inCartQty}</div>
//                                 <button onClick={() => inc(p.id)} className="px-2 py-1 rounded"><Plus className="w-4 h-4" /></button>
//                               </div>
//                             )}
//                             <button onClick={() => openAdminEdit(p)} title="Edit" className="p-2 rounded border hover:bg-slate-50">
//                               <Edit3 className="w-4 h-4" />
//                             </button>
//                             <button onClick={() => requestDelete(p.id, p.name)} title="Delete" className="p-2 rounded border hover:bg-slate-50">
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile / small screens */}
//         <div className="md:hidden">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {loadingProducts
//               ? Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="animate-pulse p-4 border rounded-xl bg-white">
//                     <div className="aspect-[4/3] w-full bg-slate-200 rounded-lg mb-3" />
//                     <div className="h-4 bg-slate-200 rounded mb-2 w-3/4" />
//                     <div className="h-3 bg-slate-200 rounded w-1/2" />
//                   </div>
//                 ))
//               : visibleProducts.map((p) => {
//                   const inCartQty = cartMap[String(p.id)] ?? 0;
//                   const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
//                   return (
//                     <article
//                       key={p.id}
//                       className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md w-full"
//                     >
//                       <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-50">
//                         <img
//                           src={imageSrc}
//                           alt={p.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             (e.currentTarget as HTMLImageElement).src = fallbackFor(p);
//                           }}
//                         />
//                       </div>

//                       <div className="mt-3">
//                         <h3 className="text-sm font-semibold text-slate-900 leading-snug whitespace-normal break-words hyphens-auto">
//                           {p.name}
//                         </h3>
//                         {p.unit || p.sku ? (
//                           <div className="text-xs text-slate-500 mt-0.5">
//                             {p.sku ?? p.unit}
//                           </div>
//                         ) : null}

//                         <div className="mt-2 flex items-center justify-between">
//                           <div className="text-base font-semibold">
//                             ₹ {Number(p.price).toFixed(2)}
//                           </div>
//                           <div className="text-xs text-slate-600">
//                             Stock: {p.stock ?? "-"}
//                           </div>
//                         </div>

//                         <div className="mt-3 space-y-2">
//                           {inCartQty === 0 ? (
//                             <button
//                               onClick={() => addToCart(p, 1)}
//                               className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm"
//                             >
//                               <Plus className="w-4 h-4" /> Add
//                             </button>
//                           ) : (
//                             <div className="w-full inline-flex items-center justify-between gap-2 border rounded-md px-2 py-1.5">
//                               <button onClick={() => dec(p.id)} className="p-1.5 rounded">
//                                 <Minus className="w-4 h-4" />
//                               </button>
//                               <div className="text-sm font-medium">{inCartQty}</div>
//                               <button onClick={() => inc(p.id)} className="p-1.5 rounded">
//                                 <Plus className="w-4 h-4" />
//                               </button>
//                             </div>
//                           )}
//                           <div className="grid grid-cols-2 gap-2">
//                             <button
//                               onClick={() => openAdminEdit(p)}
//                               className="px-3 py-2 rounded-md border text-sm inline-flex items-center justify-center gap-2"
//                             >
//                               <Edit3 className="w-4 h-4" />
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => requestDelete(p.id, p.name)}
//                               className="px-3 py-2 rounded-md border text-sm inline-flex items-center justify-center gap-2"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                               Delete
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </article>
//                   );
//                 })}
//           </div>
//         </div>
//       </div>

//       {/* Cart Drawer (unchanged) */}
//       <div className={`fixed inset-0 z-50 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
//         <div onClick={() => setCartOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`} />
//         <aside
//           className={`fixed right-0 top-0 h-full bg-white shadow-2xl transform transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
//           style={{
//             width: "100%",
//             maxWidth: 820,
//           }}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div className="p-4 md:p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h3 className="text-xl font-semibold">Cart</h3>
//                 <div className="text-sm text-slate-500">{itemsCount} items</div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setCartOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-auto">
//               {cartLines.length === 0 ? (
//                 <div className="h-full grid place-items-center text-slate-400">
//                   <div className="text-center">
//                     <div className="w-28 h-28 rounded-full bg-slate-100 grid place-items-center mb-4">
//                       <ShoppingCart className="w-6 h-6" />
//                     </div>
//                     <div>No items in cart</div>
//                     <div className="text-sm text-slate-400">Add items from the product list</div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {cartLines.map((ln) => (
//                     <div key={String(ln.product.id)} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg">
//                       <div className="w-full sm:w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-slate-50">
//                         <img
//                           src={ln.product.image_url ?? ln.product.image ?? fallbackFor(ln.product)}
//                           alt={ln.product.name}
//                           className="object-cover w-full h-full"
//                           onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackFor(ln.product); }}
//                         />
//                       </div>

//                       <div className="flex-1 w-full">
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="min-w-0">
//                             <div className="font-medium text-slate-800">{ln.product.name}</div>
//                             <div className="text-sm text-slate-500 mt-1">{ln.product.unit ?? ln.product.sku}</div>
//                           </div>

//                           <div className="text-right">
//                             <div className="font-semibold">₹ {(ln.product.price * ln.qty).toFixed(2)}</div>
//                             <div className="text-xs text-slate-500">₹ {ln.product.price.toFixed(2)} x {ln.qty}</div>
//                           </div>
//                         </div>

//                         <div className="mt-3 flex flex-wrap gap-2 items-center">
//                           <div className="inline-flex items-center gap-2 border rounded px-1">
//                             <button onClick={() => dec(ln.product.id)} className="px-2 py-1 rounded"><Minus /></button>
//                             <div className="px-3 py-1 text-sm">{ln.qty}</div>
//                             <button onClick={() => inc(ln.product.id)} className="px-2 py-1 rounded"><Plus /></button>
//                           </div>

//                           <button onClick={() => removeLine(ln.product.id)} className="ml-auto px-3 py-1 rounded border text-sm inline-flex items-center gap-2">
//                             <Trash2 className="w-4 h-4" /> Remove
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="mt-4 border-t pt-4">
//               <div className="grid grid-cols-2 gap-2 mb-2">
//                 <div className="text-sm text-slate-600">Subtotal</div>
//                 <div className="text-right font-medium">₹ {subTotal.toFixed(2)}</div>

//                 <div className="text-sm text-slate-600">GST ({gstPercent}%)</div>
//                 <div className="text-right font-medium">₹ {gstAmount.toFixed(2)}</div>

//                 <div className="text-sm text-slate-600">Discount</div>
//                 <div className="text-right font-medium">- ₹ {discountAmount.toFixed(2)}</div>
//               </div>

//               <div className="flex items-center gap-2 mb-3">
//                 <select value={discount.type} onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as "fixed" | "percent" }))} className="p-2 border rounded bg-slate-50">
//                   <option value="fixed">Fixed</option>
//                   <option value="percent">Percent</option>
//                 </select>
//                 <input type="number" min={0} value={discount.value} onChange={(e) => setDiscount((d) => ({ ...d, value: Number(e.target.value || 0) }))} className="p-2 border rounded w-36" placeholder={discount.type === "fixed" ? "₹ amount" : "%"} />
//                 <div className="ml-auto text-sm text-slate-600">Adjust discount</div>
//               </div>

//               <div className="mb-3">
//                 <label className="text-sm text-slate-600 block mb-1">GST %</label>
//                 <select value={gstPercent} onChange={(e) => setGstPercent(Number(e.target.value))} className="p-2 border rounded bg-slate-50">
//                   <option value={0}>0</option>
//                   <option value={0.25}>0.25</option>
//                   <option value={3}>3</option>
//                   <option value={5}>5</option>
//                   <option value={12}>12</option>
//                   <option value={18}>18</option>
//                   <option value={28}>28</option>
//                 </select>
//                 <div className="ml-auto text-sm text-slate-500">Tax applied to subtotal</div>
//               </div>

//               <div className="flex items-center justify-between mb-4">
//                 <div className="text-lg font-medium">Total</div>
//                 <div className="text-2xl font-extrabold">₹ {total.toFixed(2)}</div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
//                 <div>
//                   <label className="text-sm text-slate-600 block mb-1">Customer name</label>
//                   <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full p-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="text-sm text-slate-600 block mb-1">Phone number</label>
//                   <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="10+ digits" className="w-full p-2 border rounded" inputMode="tel" />
//                 </div>
//               </div>

//               <div className="mb-3">
//                 <label className="text-sm text-slate-600 block mb-1">Payment</label>
//                 <select value={paymentMethod} onChange={(e) => {
//                   const val = e.target.value as PaymentMethod;
//                   if (val === "card" || val === "upi" || val === "cash" || val === "") setPaymentMethod(val);
//                   else setPaymentMethod("");
//                 }} className="p-2 border rounded bg-white w-full">
//                   <option value="">Select payment</option>
//                   <option value="card">Card</option>
//                   <option value="upi">UPI</option>
//                   <option value="cash">Cash</option>
//                 </select>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => void handleCheckout()}
//                   disabled={isCheckingOut || cartLines.length === 0 || !validName(customerName) || !validPhone(customerPhone) || !paymentMethod}
//                   className="ml-auto px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
//                 >
//                   {isCheckingOut ? "Processing…" : `Purchase ₹ ${total.toFixed(2)}`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* Admin modal */}
//       {adminModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setAdminModalOpen(false)} />
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-medium">{adminEditProduct ? "Edit Product" : "Add Product"}</h3>
//               <button onClick={() => setAdminModalOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
//             </div>

//             <form onSubmit={submitAdminForm} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-2 border rounded" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Price</label>
//                 <input value={adminPrice} onChange={(e) => setAdminPrice(e.target.value)} className="w-full p-2 border rounded" type="number" step="0.01" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Image</label>
//                 <input ref={imageInputRef} type="file" accept="image/*" onChange={onAdminImageChange} className="w-full text-sm" />
//                 {adminPreview && <div className="mt-2 w-full h-40 rounded overflow-hidden"><img src={adminPreview} alt="preview" className="w-full h-full object-cover" /></div>}
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button type="button" onClick={() => setAdminModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">{adminEditProduct ? "Save" : "Add"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete confirm */}
//       {deleteTarget && (
//         <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 z-10">
//             <h3 className="text-lg font-medium">Confirm deletion</h3>
//             <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this product"}</strong>? This action cannot be undone.</p>
//             <div className="mt-4 flex justify-end gap-2">
//               <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
//               <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Yes, delete"}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ORDER VIEW MODAL (kept but unreachable without the table trigger) */}
//       {selectedOrder && (
//         <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/40" onClick={closeOrderModal} />
//           <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg z-10 overflow-auto max-h-[90vh]">
//             <div className="p-6">
//               {/* modal content unchanged */}
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Trash2, Edit3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { BASE_URL_2 } from "../api/axios";
import { useGst, GstItem } from "@/components/contexts/gstContext";


type Product = {
  id: string | number;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  image_url?: string;
  sku?: string;
  stock?: number;
  category?: any;
};

type CartLine = {
  product: Product;
  qty: number;
  lineTotal: number;
};

type OrderItem = {
  id?: string | number;
  name: string;
  qty: number;
  price: number;
};

type PaymentDetails = {
  method: string;
  transactionId?: string;
  status?: string;
  provider?: string;
  notes?: string;
  raw?: any;
};

type Order = {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  dateTimeISO: string;
  amount: number;
  items: OrderItem[];
  payment: PaymentDetails;
  offline?: boolean;
};

const SAMPLE_PRODUCTS: Product[] = [
  { id: "p-1", name: "Millet Idly Ravvas (500g)", price: 120, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,idli,grain&sig=101", sku: "MIR-500", stock: 50, category: "Millets" },
  { id: "p-2", name: "Millet Upma Ravva (500g)", price: 95, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?millet,upma,coarse-grain&sig=102", sku: "MUR-500", stock: 40, category: "Millets" },
  { id: "p-3", name: "Organic Grains Mix (1kg)", price: 240, unit: "1kg", image: "https://source.unsplash.com/featured/600x600/?organic,grains,mix&sig=103", sku: "GRA-1KG", stock: 30, category: "Grains" },
  { id: "p-4", name: "Special Dry Fruits Pack", price: 480, unit: "500g", image: "https://source.unsplash.com/featured/600x600/?dry-fruits,nuts,mix&sig=104", sku: "SDF-500", stock: 20, category: "Dry Fruits" },
  { id: "p-5", name: "Premium Flour (2kg)", price: 180, unit: "2kg", image: "https://source.unsplash.com/featured/600x600/?flour,wheat,bread-ingredients&sig=105", sku: "FLO-2KG", stock: 60, category: "Flour" },
  { id: "p-6", name: "Healthy Snack Mix (250g)", price: 150, unit: "250g", image: "https://source.unsplash.com/featured/600x600/?healthy-snack,nuts,seeds&sig=106", sku: "SNK-250", stock: 80, category: "Snacks" },
];

const SAMPLE_ORDERS: Order[] = [
  {
    orderId: "ORD-1001",
    customerName: "Anita Sharma",
    phone: "+91 98765 43210",
    email: "anita@example.com",
    dateTimeISO: new Date().toISOString(),
    amount: 599.0,
    items: [
      { id: "p-1", name: "Millet Idly Ravvas (500g)", qty: 2, price: 120 },
      { id: "p-4", name: "Special Dry Fruits Pack", qty: 1, price: 359 },
    ],
    payment: {
      method: "card",
      transactionId: "txn_abc123",
      status: "captured",
      provider: "Razorpay",
      notes: "online order",
    },
    offline: false,
  },
  {
    orderId: "ORD-1002",
    customerName: "Ravi Kumar",
    phone: "+91 91234 56789",
    email: "ravi.k@example.com",
    dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    amount: 240.0,
    items: [{ id: "p-3", name: "Organic Grains Mix (1kg)", qty: 1, price: 240 }],
    payment: {
      method: "upi",
      transactionId: "upi-998877",
      status: "success",
      provider: "PhonePe",
      notes: "delivered by rider",
    },
    offline: false,
  },
  {
    orderId: "OFF-3001",
    customerName: "Office Canteen",
    phone: "+91 80123 45678",
    email: "canteen@example.com",
    dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    amount: 1999.0,
    items: [
      { id: "p-6", name: "Healthy Snack Mix (250g)", qty: 6, price: 150 },
      { id: "p-5", name: "Premium Flour (2kg)", qty: 1, price: 180 },
    ],
    payment: {
      method: "cash",
      status: "collected",
      notes: "cash collected at POS (offline)",
    },
    offline: true,
  },
  {
    orderId: "OFF-3002",
    customerName: "School Events",
    phone: "+91 88900 11223",
    email: "events@school.org",
    dateTimeISO: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    amount: 1299.0,
    items: [{ name: "Festive Combo", qty: 1, price: 1299 }],
    payment: {
      method: "cash",
      status: "collected",
      notes: "bulk order - offline",
    },
    offline: true,
  },
];

const Spinner = ({ size = 16 }: { size?: number }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function POS(): JSX.Element {
  // existing state & logic
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [query, setQuery] = useState("");
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [discount, setDiscount] = useState<{ type: "fixed" | "percent"; value: number }>({ type: "fixed", value: 0 });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [adminEditProduct, setAdminEditProduct] = useState<Product | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPrice, setAdminPrice] = useState<string>("");
  const [adminImageFile, setAdminImageFile] = useState<File | null>(null);
  const [adminPreview, setAdminPreview] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name?: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customeremail, setCustomerEmail] = useState<string>("");

  type PaymentMethod = "card" | "upi" | "cash" | "";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");

  // pagination: added Tailwind pagination (only)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState<number>(1);

  // keeping selectedOrder & helpers as-is (not rendered) to avoid larger changes
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // normalize server product - kept unchanged
  const normalizeServerProduct = (r: any, fallbackIndex = 0): Product => {
    return {
      id: r.id ?? r._id ?? r.product_id ?? `srv-${fallbackIndex}`,
      name: r.name ?? r.title ?? `Product ${fallbackIndex + 1}`,
      price: Number(r.price ?? r.amount ?? 0),
      unit: r.grams ?? r.unit ?? r.size ?? undefined,
      image: r.image ?? r.image_url ?? r.imageUrl ?? undefined,
      image_url: r.image_url ?? undefined,
      sku: r.sku ?? r.code ?? undefined,
      stock: r.stock !== undefined ? Number(r.stock) : undefined,
      category: r.category && typeof r.category === "object" ? r.category.name ?? r.category : r.category,
    };
  };
  const { items, loading, error, fetchGsts, addGst, updateGst, deleteGst } = useGst();
  const { items: gstOptions, loading: gstLoading } = useGst();
  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get("/admin/products/show");
        const body = res.data;
        let rows: any[] = [];
        if (Array.isArray(body)) rows = body;
        else if (Array.isArray(body.data)) rows = body.data;
        else if (Array.isArray(body.products)) rows = body.products;
        else if (Array.isArray(body.rows)) rows = body.rows;
        else rows = [];

        if (mounted && rows.length) {
          const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
          setProducts(normalized);
        } else if (mounted) {
          toast("Showing sample products (no server items)");
        }
      } catch (err) {
        console.error("Failed to load products", err);
        if (mounted) toast("Using sample products (failed to load from API)", { icon: "ℹ️" });
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  // reset page when query or product list changes
  useEffect(() => {
    setPage(1);
  }, [query, products]);

  const cartLines: CartLine[] = useMemo(() => {
    const arr: CartLine[] = [];
    for (const pid of Object.keys(cartMap)) {
      const qty = cartMap[pid];
      const prod = products.find((p) => String(p.id) === pid);
      if (!prod) continue;
      const lineTotal = Math.round((prod.price * qty + Number.EPSILON) * 100) / 100;
      arr.push({ product: prod, qty, lineTotal });
    }
    return arr;
  }, [cartMap, products]);

  const itemsCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const subTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const gstAmount = Math.round((subTotal * (gstPercent / 100) + Number.EPSILON) * 100) / 100;
  const discountAmount = discount.type === "fixed" ? discount.value : Math.round((subTotal * (discount.value / 100) + Number.EPSILON) * 100) / 100;
  const total = Math.max(0, Math.round((subTotal + gstAmount - discountAmount + Number.EPSILON) * 100) / 100);

  const visibleProducts = products.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || String(p.sku || "").toLowerCase().includes(q) || String(p.category || "").toLowerCase().includes(q);
  });

  // pagination: compute paginated products and pages
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const paginatedProducts = visibleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function addToCart(product: Product, qty = 1) {
    setCartMap((m) => {
      const key = String(product.id);
      const nextQty = (m[key] ?? 0) + qty;
      return { ...m, [key]: nextQty };
    });
    toast.success(`${product.name} added to cart`);
  }

  function setQty(productId: string | number, qty: number) {
    const key = String(productId);
    setCartMap((m) => {
      if (qty <= 0) {
        const copy = { ...m };
        delete copy[key];
        return copy;
      }
      return { ...m, [key]: qty };
    });
  }
  function inc(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => ({ ...m, [key]: (m[key] ?? 0) + 1 }));
  }
  function dec(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => {
      const next = (m[key] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...m };
        delete copy[key];
        return copy;
      }
      return { ...m, [key]: next };
    });
  }

  function removeLine(productId: string | number) {
    const key = String(productId);
    setCartMap((m) => {
      const copy = { ...m };
      delete copy[key];
      return copy;
    });
  }

  const validPhone = (p: string) => {
    const cleaned = p.replace(/\D/g, "");
    return cleaned.length >= 10;
  };
  const validName = (n: string) => n.trim().length > 0;

  async function handleCheckout() {
    if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
    if (!validName(customerName)) { toast.error("Enter customer name"); return; }
    if (!validPhone(customerPhone)) { toast.error("Enter valid phone number (min 10 digits)"); return; }
    if (!paymentMethod) { toast.error("Select payment method"); return; }

    setIsCheckingOut(true);

    const payload = {
      name: customerName.trim(),
      phone: customerPhone.replace(/\D/g, ""),
      // email:customeremail.trim(),
      payment: paymentMethod,
      items: cartLines.map(l => ({
        product_id: typeof l.product.id === "string" && /^\d+$/.test(String(l.product.id)) ? Number(l.product.id) : l.product.id,
        name: l.product.name,
        qty: l.qty,
        price: l.product.price
      })),
      subtotal: subTotal,
      gst_percent: gstPercent,
      gst_amount: gstAmount,
      discount_type: discount.type,
      discount_value: discount.value,
      total,
    };
    try {
      const res = await api.post("admin/pos-orders/create", payload, { headers: { "Content-Type": "application/json" } });
      const body = res.data;
      toast.success("Purchase successful");
      setCartMap({});
      setCartOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("");
      if (body?.order_id) toast.success(`Order ${body.order_id} created`);
    } catch (err: any) {
      console.error("Checkout error", err);
      toast.error("Network/server error while creating order");
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function apiCreateProduct(name: string, price: number, file?: File | null) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(price));
    if (file) fd.append("image", file);
    const res = await api.post("/admin/products/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
    const body = res.data;
    const raw = body?.data ?? body?.product ?? body ?? null;
    return {
      id: raw?.id ?? raw?._id ?? `srv-${Date.now()}`,
      name: raw?.name ?? name,
      price: Number(raw?.price ?? price ?? 0),
      image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
      image_url: raw?.image_url ?? undefined,
      category: raw?.category ?? raw?.category?.name ?? undefined,
    } as Product;
  }

  async function apiUpdateProduct(id: string | number, name: string, price: number, file?: File | null) {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", String(price));
    if (file) fd.append("image", file);
    const res = await api.post(`/admin/products/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    const body = res.data;
    const raw = body?.data ?? body?.product ?? body ?? null;
    return {
      id: raw?.id ?? id,
      name: raw?.name ?? name,
      price: Number(raw?.price ?? price ?? 0),
      image: raw?.image ?? raw?.image_url ?? raw?.imageUrl ?? undefined,
      image_url: raw?.image_url ?? undefined,
      category: raw?.category ?? raw?.category?.name ?? undefined,
    } as Product;
  }

  async function apiDeleteProduct(id: string | number) {
    const res = await api.delete(`/admin/products/delete/${id}`);
    return res.status >= 200 && res.status < 300;
  }

  function openAdminCreate() {
    setAdminEditProduct(null);
    setAdminName("");
    setAdminPrice("");
    setAdminImageFile(null);
    setAdminPreview("");
    setAdminModalOpen(true);
  }

  function openAdminEdit(p: Product) {
    setAdminEditProduct(p);
    setAdminName(p.name ?? "");
    setAdminPrice(String(p.price ?? ""));
    setAdminImageFile(null);
    setAdminPreview(p.image_url ?? p.image ?? "");
    setAdminModalOpen(true);
  }

  function onAdminImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAdminImageFile(f);
    const r = new FileReader();
    r.onload = () => setAdminPreview(String(r.result ?? ""));
    r.readAsDataURL(f);
  }

  async function submitAdminForm(e?: React.FormEvent) {
    e?.preventDefault();
    const name = adminName.trim();
    const price = Number(adminPrice || 0);
    if (!name) { toast.error("Name required"); return; }
    if (Number.isNaN(price)) { toast.error("Price invalid"); return; }
    try {
      if (adminEditProduct) {
        const optimistic = products.map((p) => (String(p.id) === String(adminEditProduct.id) ? { ...p, name, price, image: adminPreview || p.image, image_url: adminPreview || p.image_url } : p));
        setProducts(optimistic);
        setAdminModalOpen(false);
        const updated = await apiUpdateProduct(adminEditProduct.id, name, price, adminImageFile);
        setProducts((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
        toast.success("Product updated");
      } else {
        const tmpId = `tmp-${Date.now()}`;
        const optimistic: Product = { id: tmpId, name, price, image: adminPreview || undefined, image_url: adminPreview || undefined };
        setProducts((prev) => [optimistic, ...prev]);
        setAdminModalOpen(false);
        const created = await apiCreateProduct(name, price, adminImageFile);
        setProducts((prev) => [created, ...prev.filter((p) => p.id !== tmpId)]);
        toast.success("Product created");
      }
    } catch (err: any) {
      console.error("Save product failed", err);
      toast.error(err?.message || "Save failed");
    } finally {
      setAdminImageFile(null);
      setAdminPreview("");
    }
  }

  function requestDelete(id: string | number, name?: string) {
    setDeleteTarget({ id, name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const id = deleteTarget.id;
    const prev = products;
    setProducts((p) => p.filter((x) => String(x.id) !== String(id)));
    try {
      await apiDeleteProduct(id);
      toast.success("Product deleted");
    } catch (err: any) {
      console.error("Delete failed", err);
      toast.error(err?.message || "Delete failed");
      setProducts(prev);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  async function refreshProducts() {
    setLoadingProducts(true);
    try {
      const res = await api.get("/admin/products/show");
      const body = res.data;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else rows = [];
      if (rows.length) {
        const normalized = rows.map((r: any, i: number) => normalizeServerProduct(r, i));
        setProducts(normalized);
        toast.success("Products refreshed");
      } else {
        toast("No products returned");
      }
    } catch (err) {
      console.error("Refresh failed", err);
      toast.error("Refresh failed");
    } finally {
      setLoadingProducts(false);
    }
  }

  const fallbackFor = (p: Product) => {
    const seed = encodeURIComponent(p.category || p.name.split(" ")[0] || "product");
    return `https://source.unsplash.com/featured/400x400/?${seed}`;
  };

  const allSales = useMemo(() => SAMPLE_ORDERS, []);
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };
  const formatCurrency = (n: number) => `₹ ${n.toFixed(2)}`;

  const openOrderModal = (o: Order) => setSelectedOrder(o);
  const closeOrderModal = () => setSelectedOrder(null);

  return (
    <div>
      <Toaster position="top-right" />
      <div className="bg-white rounded-xl p-2 md:p-6 shadow-sm mb-6" >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div />
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search products, SKU or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full border w-full md:w-[360px] focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={() => setCartOpen((s) => !s)}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            title="Open cart"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-white text-indigo-600 rounded-full">
              {itemsCount}
            </span>
          </button>
        </div>
      </div>
        <div className="flex items-center justify-between mb-4">
          {/* <div className="text-sm text-slate-600">{visibleProducts.length} products</div> */}
          <div className="flex items-center gap-2" />
        </div>

        {/* Desktop table (md+) */}
        <div >
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="text-left text-sm text-slate-600">
                <th className="px-4  w-12">S.no</th>
                <th className="px-4  w-20">Image</th>
                <th className="px-4">Name</th>
                <th className="px-4">Category</th>
                <th className="px-4">Grams</th>
                <th className="px-4">Price</th>
                <th className="px-4">Stock</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {loadingProducts
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-6" /></td>
                      <td className="px-4 "><div className="h-12 w-12 rounded-full bg-slate-200" /></td>
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-48" /></td>
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-32" /></td>
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-12" /></td>
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-20" /></td>
                      <td className="px-4 "><div className="h-4 bg-slate-200 rounded w-8" /></td>
                      <td className="px-4  text-right"><div className="h-8 bg-slate-200 rounded w-24 inline-block" /></td>
                    </tr>
                  ))
                : paginatedProducts.map((p, idx) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + idx;
                    const inCartQty = cartMap[String(p.id)] ?? 0;
                    const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">{globalIndex + 1}</td>
                        <td className="px-4 py-4 align-top">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white border">
                            <img
                              src={imageSrc}
                              alt={p.name}
                              className="object-cover w-10 h-10"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackFor(p); }}
                            />
                          </div>
                        </td>
                        <td className="px-4 align-top">
                          <div className="font-medium text-slate-800">{p.name}</div>
                          <div className="text-sm text-slate-500 mt-1">{p.sku ?? p.unit}</div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-600">{p.category ?? "-"}</td>
                        <td className="px-4 py-4 align-top text-sm text-slate-600">{p.unit ?? "-"}</td>
                        <td className="px-4 py-4 align-top text-sm font-semibold">₹ {Number(p.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">{p.stock ?? "-"}</td>
                        <td className="px-4 py-4 align-top text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {inCartQty === 0 ? (
                              <button
                                onClick={() => addToCart(p, 1)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-600 text-white text-sm"
                              >
                                <Plus className="w-4 h-4" /> Add
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1 border rounded px-1">
                                <button onClick={() => dec(p.id)} className="px-2 py-1 rounded"><Minus className="w-4 h-4" /></button>
                                <div className="px-3 py-1 text-sm">{inCartQty}</div>
                                <button onClick={() => inc(p.id)} className="px-2 py-1 rounded"><Plus className="w-4 h-4" /></button>
                              </div>
                            )}
                            <button onClick={() => openAdminEdit(p)} title="Edit" className="p-2 rounded border hover:bg-slate-50">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => requestDelete(p.id, p.name)} title="Delete" className="p-2 rounded border hover:bg-slate-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Mobile / small screens */}
        <div className="md:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingProducts
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border rounded-xl bg-white">
                    <div className="aspect-[4/3] w-full bg-slate-200 rounded-lg mb-3" />
                    <div className="h-4 bg-slate-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))
              : paginatedProducts.map((p) => {
                  const inCartQty = cartMap[String(p.id)] ?? 0;
                  const imageSrc = p.image_url ?? p.image ?? fallbackFor(p);
                  return (
                    <article
                      key={p.id}
                      className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md w-full"
                    >
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={imageSrc}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackFor(p);
                          }}
                        />
                      </div>

                      <div className="mt-3">
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug whitespace-normal break-words hyphens-auto">
                          {p.name}
                        </h3>
                        {p.unit || p.sku ? (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {p.sku ?? p.unit}
                          </div>
                        ) : null}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-base font-semibold">
                            ₹ {Number(p.price).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-600">
                            Stock: {p.stock ?? "-"}
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {inCartQty === 0 ? (
                            <button
                              onClick={() => addToCart(p, 1)}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm"
                            >
                              <Plus className="w-4 h-4" /> Add
                            </button>
                          ) : (
                            <div className="w-full inline-flex items-center justify-between gap-2 border rounded-md px-2 py-1.5">
                              <button onClick={() => dec(p.id)} className="p-1.5 rounded">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="text-sm font-medium">{inCartQty}</div>
                              <button onClick={() => inc(p.id)} className="p-1.5 rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => openAdminEdit(p)}
                              className="px-3 py-2 rounded-md border text-sm inline-flex items-center justify-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => requestDelete(p.id, p.name)}
                              className="px-3 py-2 rounded-md border text-sm inline-flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>
        </div>

        {/* Pagination (Tailwind) */}
        {visibleProducts.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {(visibleProducts.length === 0) ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, visibleProducts.length)} of {visibleProducts.length}
            </div>

            <nav className="inline-flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  const isActive = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`px-3 py-1 rounded ${isActive ? "bg-slate-800 text-white" : "bg-white border hover:bg-slate-50"}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              {/* compact display for small screens */}
              <div className="sm:hidden text-sm text-slate-700 px-2">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Cart Drawer (unchanged) */}
      <div className={`fixed inset-0 z-50 ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!cartOpen} >
        <div onClick={() => setCartOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`}  />
        <aside
          className={`fixed right-0 top-0 h-full bg-white shadow-2xl transform transition-transform ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{
            // width: "80%",
            maxWidth: 820,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Cart</h3>
                <div className="text-sm text-slate-500">{itemsCount} items</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCartOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {cartLines.length === 0 ? (
                <div className="h-full grid place-items-center text-slate-400">
                  <div className="text-center">
                    <div className="w-28 h-28 rounded-full bg-slate-100 grid place-items-center mb-4">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>No items in cart</div>
                    <div className="text-sm text-slate-400">Add items from the product list</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartLines.map((ln) => (
                    <div key={String(ln.product.id)} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg">
                      <div className="w-full sm:w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-slate-50">
                        <img
                          src={ln.product.image_url ?? ln.product.image ?? fallbackFor(ln.product)}
                          alt={ln.product.name}
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackFor(ln.product); }}
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800">{ln.product.name}</div>
                            <div className="text-sm text-slate-500 mt-1">{ln.product.unit ?? ln.product.sku}</div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold">₹ {(ln.product.price * ln.qty).toFixed(2)}</div>
                            <div className="text-xs text-slate-500">₹ {ln.product.price.toFixed(2)} x {ln.qty}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          <div className="inline-flex items-center gap-2 border rounded px-1">
                            <button onClick={() => dec(ln.product.id)} className="px-2 py-1 rounded"><Minus /></button>
                            <div className="px-3 py-1 text-sm">{ln.qty}</div>
                            <button onClick={() => inc(ln.product.id)} className="px-2 py-1 rounded"><Plus /></button>
                          </div>

                          <button onClick={() => removeLine(ln.product.id)} className="ml-auto px-3 py-1 rounded border text-sm inline-flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-sm text-slate-600">Subtotal</div>
                <div className="text-right font-medium">₹ {subTotal.toFixed(2)}</div>

                <div className="text-sm text-slate-600">GST ({gstPercent}%)</div>
                <div className="text-right font-medium">₹ {gstAmount.toFixed(2)}</div>

                <div className="text-sm text-slate-600">Discount</div>
                <div className="text-right font-medium">- ₹ {discountAmount.toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <select value={discount.type} onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as "fixed" | "percent" }))} className="p-2 border rounded bg-slate-50">
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
                <input type="number" min={0} value={discount.value} onChange={(e) => setDiscount((d) => ({ ...d, value: Number(e.target.value || 0) }))} className="p-2 border rounded w-36" placeholder={discount.type === "fixed" ? "₹ amount" : "%"} />
                <div className="ml-auto text-sm text-slate-600">Adjust discount</div>
              </div>

              <div className="mb-3">
  <label className="text-sm text-slate-600 block mb-1">GST %</label>
  <select
    value={gstPercent}
    onChange={(e) => setGstPercent(Number(e.target.value))}
    disabled={gstLoading}
    className="p-2 border rounded bg-slate-50 w-full"
  >
    {/* fallback if API not loaded */}
    {gstLoading && <option>Loading...</option>}

    {/* dynamic options from context */}
    {!gstLoading &&
      gstOptions.length > 0 &&
      gstOptions.map((gst) => (
        <option key={gst.id} value={gst.percentage}>
          {`${gst.percentage}%`}
        </option>
      ))}

    {/* fallback if API fails or empty */}
    {!gstLoading && gstOptions.length === 0 && (
      <>
        <option value={0}>0%</option>
        <option value={0.25}>0.25%</option>
        <option value={3}>3%</option>
        <option value={5}>5%</option>
        <option value={12}>12%</option>
        <option value={18}>18%</option>
        <option value={28}>28%</option>
      </>
    )}
  </select>
  <div className="ml-auto text-sm text-slate-500">Tax applied to subtotal</div>
</div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">Total</div>
                <div className="text-2xl font-extrabold">₹ {total.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Customer name</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Enter your WhatsApp Number</label>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="10+ digits" className="w-full p-2 border rounded" inputMode="tel" />
                </div>
                 {/* <div>
                  <label className="text-sm text-slate-600 block mb-1">Email</label>
                  <input value={customeremail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" inputMode="tel" />
                </div> */}
              </div>

              <div className="mb-3">
                <label className="text-sm text-slate-600 block mb-1">Payment</label>
                <select value={paymentMethod} onChange={(e) => {
                  const val = e.target.value as PaymentMethod;
                  if (val === "card" || val === "upi" || val === "cash" || val === "") setPaymentMethod(val);
                  else setPaymentMethod("");
                }} className="p-2 border rounded bg-white w-full">
                  <option value="">Select payment</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => void handleCheckout()}
                  disabled={isCheckingOut || cartLines.length === 0 || !validName(customerName) || !validPhone(customerPhone) || !paymentMethod}
                  className="ml-auto px-6 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isCheckingOut ? "Processing…" : `Purchase ₹ ${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAdminModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{adminEditProduct ? "Edit Product" : "Add Product"}</h3>
              <button onClick={() => setAdminModalOpen(false)} className="p-2 rounded hover:bg-slate-100"><X /></button>
            </div>

            <form onSubmit={submitAdminForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-2 border rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input value={adminPrice} onChange={(e) => setAdminPrice(e.target.value)} className="w-full p-2 border rounded" type="number" step="0.01" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={onAdminImageChange} className="w-full text-sm" />
                {adminPreview && <div className="mt-2 w-full h-40 rounded overflow-hidden"><img src={adminPreview} alt="preview" className="w-full h-full object-cover" /></div>}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setAdminModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">{adminEditProduct ? "Save" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-5 z-10">
            <h3 className="text-lg font-medium">Confirm deletion</h3>
            <p className="text-sm text-slate-600 mt-2">Are you sure you want to delete <strong>{deleteTarget.name ?? "this product"}</strong>? This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Yes, delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER VIEW MODAL (kept but unreachable without the table trigger) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeOrderModal} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg z-10 overflow-auto max-h-[90vh]">
            <div className="p-6">
              {/* modal content unchanged */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
