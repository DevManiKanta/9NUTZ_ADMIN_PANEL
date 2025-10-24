
// import React, { useEffect, useRef, useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import api from "../api/axios";
// import { IMAGES } from "../assets/images";

// type Product = {
//   id: string | number;
//   name: string;
//   price: string;
//   grams?: string;
//   discount_amount?: string;
//   discount_price?: string;
//   image?: string;
//   image_url?: string;
//   category?: { id?: number | string; name?: string } | string | null;
//   stock?: number | string | null;
//   slug?: string;
//   [k: string]: any;
// };

// type CategoryItem = { id: string; name: string };

// const defaultForm = {
//   name: "",
//   grams: "",
//   category: "",
//   price: "",
//   discount_amount: "",
//   discount_price: "",
//   image: "",
//   description: "",
// };

// export default function Products(): JSX.Element {
//   const basePath = "/admin/products";

//   // state
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<CategoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // drawers & view
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [isViewOpen, setIsViewOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   // form
//   const [form, setForm] = useState({ ...defaultForm });
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // delete confirm modal
//   const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const firstInputRef = useRef<HTMLInputElement | null>(null);
//   const descInputRef = useRef<HTMLInputElement | null>(null);
//   const drawerRef = useRef<HTMLDivElement | null>(null);
//   const viewDrawerRef = useRef<HTMLDivElement | null>(null);

//   // ---------------- helpers ----------------
//   const safeTrim = (v: unknown): string | undefined => {
//     if (v === undefined || v === null) return undefined;
//     const s = String(v).trim();
//     return s === "" ? undefined : s;
//   };

//   const resolveImage = (p?: Product | string | undefined) => {
//     if (!p) return IMAGES.DummyImage;
//     if (typeof p === "string") {
//       const str = p.trim();
//       return str ? str : IMAGES.DummyImage;
//     }
//     const raw =
//       (p as any).image_url ??
//       (p as any).image ??
//       (p as any).imageUrl ??
//       (p as any).photo ??
//       (p as any).thumbnail ??
//       "";
//     const str = String(raw ?? "").trim();
//     if (!str) return IMAGES.DummyImage;
//     if (/^https?:\/\//i.test(str)) return str;
//     try {
//       const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
//       const baseClean = base.endsWith("/") ? base : base + "/";
//       return new URL(str.replace(/^\/+/, ""), baseClean).toString();
//     } catch {
//       return IMAGES.Nutz;
//     }
//   };

//   function normalizeProduct(raw: any): Product {
//     if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };

//     const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;

//     let catRaw = raw.category ?? raw.cat ?? raw.category_id ?? null;
//     if (catRaw === "" || catRaw === 0) catRaw = null;
//     const category =
//       catRaw && typeof catRaw === "object"
//         ? { id: catRaw.id ?? catRaw._id ?? catRaw.category_id, name: catRaw.name ?? catRaw.title ?? "" }
//         : catRaw ?? null;

//     const imageVal =
//       raw.image ?? raw.image_url ?? raw.imageUrl ?? raw.photo ?? raw.thumbnail ?? undefined;

//     const image_url_val = raw.image_url ?? raw.imageUrl ?? raw.image ?? undefined;

//     return {
//       id,
//       name: String(raw.name ?? raw.title ?? "Untitled"),
//       price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
//       grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
//       discount_amount: safeTrim(raw.discount_amount ?? raw.discountAmount) ?? "",
//       discount_price: safeTrim(raw.discount_price ?? raw.discountPrice) ?? "",
//       image: imageVal,
//       image_url: image_url_val,
//       category,
//       stock: raw.stock ?? raw.qty ?? null,
//       slug: raw.slug ?? "",
//       ...raw,
//     };
//   }

//   // ---------------- API ----------------
//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/admin/categories/show");
//       const body = res.data.data ?? res;
//       let rows: any[] = [];
//       if (Array.isArray(body)) rows = body;
//       else if (Array.isArray(body.data)) {
//         if (Array.isArray(body.data.data)) rows = body.data.data;
//         else rows = body.data;
//       } else {
//         const arr = Object.values(body || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       const normalizedCats: CategoryItem[] = rows
//         .map((r) => {
//           const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "").trim();
//           const name = String(r.name ?? r.title ?? r.label ?? r.category_name ?? id ?? "");
//           return id ? { id, name } : null;
//         })
//         .filter(Boolean) as CategoryItem[];

//       const dedup: Record<string, CategoryItem> = {};
//       normalizedCats.forEach((c) => (dedup[c.id] = c));
//       setCategories(Object.values(dedup));
//     } catch (err: any) {
//       console.error("fetchCategories failed:", err, err?.response?.data);
//       toast.error("Failed to load categories (dropdown may be incomplete)");
//     }
//   };

//   const fetchProducts = async () => {
//     setIsLoading(true);
//     try {
//       const res = await api.get(`${basePath}/show`);
//       const body = res.data ?? res;
//       if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

//       let rows: any[] = [];
//       const payload = body.data ?? body;
//       if (Array.isArray(payload)) rows = payload;
//       else if (Array.isArray(payload.data)) rows = payload.data;
//       else {
//         const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) rows = arr as any[];
//       }

//       const normalized = rows.map((r: any) => normalizeProduct(r));
//       setProducts(normalized);
//     } catch (err: any) {
//       console.error("fetchProducts failed:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
//       toast.error(message);
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // create: append description correctly
//   const createProductApi = async (payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if ((payload as any).description !== undefined) fd.append("description", String((payload as any).description));
//     if (file) fd.append("image", file);
//     const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res.data ?? res;
//   };

//   // update: append description as well
//   const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
//     const fd = new FormData();
//     if (payload.name !== undefined) fd.append("name", String(payload.name));
//     if (payload.price !== undefined) fd.append("price", String(payload.price));
//     if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
//     if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
//     if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
//     if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
//     if ((payload as any).description !== undefined) fd.append("description", String((payload as any).description));
//     if (file) fd.append("image", file);
//     const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
//     return res.data ?? res;
//   };

//   const deleteProductApi = async (id: string | number) => {
//     const res = await api.delete(`${basePath}/delete/${id}`);
//     return res.data ?? res;
//   };

//   // ---------------- lifecycle ----------------
//   useEffect(() => {
//     void fetchProducts();
//     void fetchCategories();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------- form & drawers ----------------
//   const openAddDrawer = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 100);
//   };

//   const openEditDrawer = (p: Product) => {
//     setIsEditMode(true);
//     setEditingId(p.id);
//     setForm({
//       name: safeTrim(p.name) ?? String(p.name ?? ""),
//       grams: safeTrim(p.grams) ?? String(p.grams ?? ""),
//       category:
//         p.category && typeof p.category === "object"
//           ? String((p.category as any).id ?? (p.category as any).name ?? "")
//           : String(p.category ?? ""),
//       price: safeTrim(p.price) ?? String(p.price ?? ""),
//       discount_amount: safeTrim(p.discount_amount) ?? String(p.discount_amount ?? ""),
//       discount_price: safeTrim(p.discount_price) ?? String(p.discount_price ?? ""),
//       image: (p.image_url ?? p.image ?? "") as string,
//       // load actual description from product (if present)
//       description: safeTrim((p as any).description ?? (p as any).dscription ?? "") ?? "",
//     });
//     setImageFile(null);
//     setIsDrawerOpen(true);
//     setTimeout(() => firstInputRef.current?.focus(), 120);
//   };

//   const openView = (p: Product) => {
//     setSelectedProduct(p);
//     setIsViewOpen(true);
//     setTimeout(() => viewDrawerRef.current?.focus(), 120);
//   };

//   const resetForm = () => {
//     setForm({ ...defaultForm });
//     setImageFile(null);
//     setErrors({});
//     setIsEditMode(false);
//     setEditingId(null);
//   };

//   const validateForm = () => {
//     const e: Partial<Record<keyof typeof defaultForm, string>> = {};
//     if (!String(form.name ?? "").trim()) e.name = "Name is required";
//     if (!String(form.price ?? "").trim()) e.price = "Price is required";
//     if (!String(form.category ?? "").trim()) e.category = "Category is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
//     const file = ev.target.files?.[0] ?? null;
//     if (!file) return;
//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast.error("Image too large (max 5MB)");
//       return;
//     }
//     setImageFile(file);
//     setErrors((prev) => ({ ...prev, image: undefined })); // clear any prior image error
//     const reader = new FileReader();
//     reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
//     reader.readAsDataURL(file);
//   };

//   // ---------- submit (create/update) with optimistic UI ----------
//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     // clear image error at start
//     setErrors((prev) => ({ ...prev, image: undefined }));

//     if (!validateForm()) {
//       toast.error("Please fix the highlighted fields");
//       return;
//     }

//     // Client-side pre-check: when creating, ensure an image was provided (either a file or an existing data-url)
//     const hasImageOnClient = !!(imageFile || (form.image && String(form.image).trim()));
//     if (!isEditMode && !hasImageOnClient) {
//       setErrors((prev) => ({ ...prev, image: "Image is required" }));
//       toast.error("Image is required");
//       return;
//     }

//     const nameTrimmed = safeTrim(form.name) ?? "";
//     const priceTrimmed = safeTrim(form.price) ?? "";
//     const discount_price_trimmed = safeTrim(form.discount_price);
//     const discount_amount_trimmed = safeTrim(form.discount_amount);
//     const grams_trimmed = safeTrim(form.grams);
//     const descriptionTrimmed = safeTrim(form.description) ?? "";

//     let categoryToSend: string | number | undefined = undefined;
//     if (form.category !== "" && form.category != null) {
//       const trimmed = String(form.category).trim();
//       const asNum = Number(trimmed);
//       categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
//     }

//     const payload: Partial<Product> = {
//       name: nameTrimmed,
//       price: priceTrimmed,
//       discount_price: discount_price_trimmed,
//       discount_amount: discount_amount_trimmed,
//       grams: grams_trimmed,
//       category: categoryToSend as any,
//       // include description if present (this is the important fix)
//       ...(descriptionTrimmed ? { description: descriptionTrimmed } : {}),
//     };

//     setIsSubmitting(true);
//     setErrors({});

//     if (isEditMode && editingId != null) {
//       const prev = products;
//       const updatedLocal = normalizeProduct({ ...payload, id: editingId });
//       setProducts((cur) => cur.map((p) => (String(p.id) === String(editingId) ? { ...p, ...updatedLocal } : p)));

//       try {
//         const res = await updateProductApi(editingId, payload, imageFile);
//         const body = res.data ?? res;
//         if (body && body.status === false) {
//           const msg = body.message ?? "Update failed";
//           if (/image/i.test(String(msg))) setErrors((prev) => ({ ...prev, image: String(msg) }));
//           toast.error(String(msg));
//           setProducts(prev);
//           setIsSubmitting(false);
//           return;
//         }

//         const updatedRaw = body?.data ?? body?.product ?? body;
//         const updated = normalizeProduct(updatedRaw);
//         setProducts((cur) => {
//           const without = cur.filter((x) => String(x.id) !== String(updated.id));
//           return [updated, ...without];
//         });
//         await fetchCategories();
//         toast.success("Product updated");
//         setIsDrawerOpen(false);
//         resetForm();
//       } catch (err: any) {
//         console.error("handleSubmit (update) error:", err, err?.response?.data);
//         setProducts(prev); // rollback
//         const rdata = err?.response?.data;
//         if (rdata && typeof rdata === "object") {
//           if (rdata.errors && typeof rdata.errors === "object") {
//             const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
//             Object.keys(rdata.errors).forEach((k) => {
//               const val = rdata.errors[k];
//               mapped[k as keyof typeof defaultForm] = Array.isArray(val) ? String(val[0]) : String(val);
//             });
//             setErrors((p) => ({ ...p, ...mapped }));
//             toast.error("Fix validation errors");
//           } else if (rdata.status === false && rdata.message) {
//             const msg = String(rdata.message);
//             if (/image/i.test(msg)) setErrors((prev) => ({ ...prev, image: msg }));
//             toast.error(msg);
//           } else {
//             toast.error(rdata.message ?? rdata.error ?? err?.message ?? "Update failed");
//           }
//         } else {
//           toast.error(err?.message ?? "Update failed");
//         }
//       } finally {
//         setIsSubmitting(false);
//         setImageFile(null);
//       }
//     } else {
//       // Optimistic create: add a temporary product immediately
//       const tempId = `local-${Date.now()}`;
//       const tempProd: Product = normalizeProduct({ id: tempId, ...payload, image: form.image ?? undefined });
//       setProducts((prev) => [tempProd, ...prev]);

//       try {
//         const res = await createProductApi(payload, imageFile);
//         const body = res.data ?? res;

//         if (body && body.status === false) {
//           const msg = body.message ?? "Add failed";
//           if (/image/i.test(String(msg))) setErrors((prev) => ({ ...prev, image: String(msg) }));
//           toast.error(String(msg));
//           setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
//           setIsSubmitting(false);
//           return;
//         }

//         const createdRaw = body?.data ?? body?.product ?? body;
//         const created = normalizeProduct(createdRaw);

//         setProducts((cur) => {
//           const withoutTemp = cur.filter((p) => String(p.id) !== String(tempId));
//           return [created, ...withoutTemp];
//         });
//         await fetchCategories();
//         toast.success("Product added");
//         setIsDrawerOpen(false);
//         resetForm();
//       } catch (err: any) {
//         console.error("handleSubmit (create) error:", err, err?.response?.data);
//         setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
//         const rdata = err?.response?.data;
//         if (rdata && typeof rdata === "object") {
//           if (rdata.errors && typeof rdata.errors === "object") {
//             const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
//             Object.keys(rdata.errors).forEach((k) => {
//               const val = rdata.errors[k];
//               mapped[k as keyof typeof defaultForm] = Array.isArray(val) ? String(val[0]) : String(val);
//             });
//             setErrors((p) => ({ ...p, ...mapped }));
//             toast.error("Fix validation errors");
//           } else if (rdata.status === false && rdata.message) {
//             const msg = String(rdata.message);
//             if (/image/i.test(msg)) setErrors((prev) => ({ ...prev, image: msg }));
//             toast.error(msg);
//           } else {
//             toast.error(rdata.message ?? err?.message ?? "Add failed");
//           }
//         } else {
//           toast.error(err?.message ?? "Add failed");
//         }
//       } finally {
//         setIsSubmitting(false);
//         setImageFile(null);
//       }
//     }
//   };

//   const askDelete = (id: string | number) => {
//     setConfirmDeleteId(id);
//   };

//   const confirmDelete = async () => {
//     if (confirmDeleteId == null) return;
//     setIsDeleting(true);

//     // optimistic delete: remove locally and attempt API request; rollback on failure
//     const prev = products;
//     setProducts((cur) => cur.filter((p) => String(p.id) !== String(confirmDeleteId)));

//     try {
//       const res = await deleteProductApi(confirmDeleteId);
//       const body = res.data ?? res;
//       if (body && body.status === false) {
//         toast.error(body.message ?? "Delete failed");
//         setProducts(prev);
//       } else {
//         toast.success("Product deleted");
//         setSelectedProduct((s) => (s && String(s.id) === String(confirmDeleteId) ? null : s));
//       }
//     } catch (err: any) {
//       console.error("Delete error:", err, err?.response?.data);
//       const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
//       toast.error(message);
//       setProducts(prev);
//     } finally {
//       setIsDeleting(false);
//       setConfirmDeleteId(null);
//     }
//   };

//   const cancelDelete = () => {
//     setConfirmDeleteId(null);
//   };

//   const handleRefresh = async () => {
//     await fetchProducts();
//     await fetchCategories();
//     toast.success("Refreshed");
//   };

//   useEffect(() => {
//     const onKey = (ev: KeyboardEvent) => {
//       if (ev.key === "Escape") {
//         if (isDrawerOpen) setIsDrawerOpen(false);
//         if (isViewOpen) setIsViewOpen(false);
//         if (confirmDeleteId) setConfirmDeleteId(null);
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isDrawerOpen, isViewOpen, confirmDeleteId]);

//   // ---------------- Render ----------------
//   return (
//     <>
//       <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
//       {/* full width container */}
//       <div className="w-full px-4 md:px-6 lg:px-8">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 w-full">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
//           </div>
//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products" className="ml-2">
//               <RefreshCw className="h-4 w-4" />
//             </Button>

//             <Button onClick={() => openAddDrawer()} className="ml-2">
//               <Plus className="h-4 w-4 mr-2" /> Add Product
//             </Button>
//           </div>
//         </div>

//         <Card className="shadow-sm w-full">
//           {/* responsive wrapper */}
//           <div className="w-full overflow-x-auto">
//             <table className="w-full min-w-[700px] md:min-w-full divide-y divide-slate-200">
//               <thead className="bg-slate-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-sm font-medium w-12">S.no</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium w-20">Image</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Category (id)</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Grams</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Discount</th>
//                   <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Stock</th>
//                   <th className="px-4 py-3 text-right text-sm font-medium w-36">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="bg-white divide-y divide-slate-100">
//                 {isLoading ? (
//                   <tr>
//                     <td colSpan={9} className="p-6 text-center">
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
//                         <div className="text-sm text-slate-600">Loading products…</div>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : products.length === 0 ? (
//                   <tr>
//                     <td colSpan={9} className="p-6 text-center text-slate-500">
//                       No products found.
//                     </td>
//                   </tr>
//                 ) : (
//                   products.map((p, i) => (
//                     <tr key={String(p.id)}>
//                       <td className="px-4 py-3 text-sm align-middle">{i + 1}</td>

//                       <td className="px-4 py-3 align-middle">
//                         <div className="w-12 h-12 rounded-full overflow-hidden bg-white border">
//                           <img
//                             src={resolveImage(p)}
//                             alt={p.name ?? "product"}
//                             className="object-cover w-full h-full"
//                             onError={(e) => {
//                               (e.currentTarget as HTMLImageElement).onerror = null;
//                               (e.currentTarget as HTMLImageElement).src = IMAGES.DummyImage;
//                             }}
//                           />
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 align-middle">
//                         <div className="text-sm font-medium truncate max-w-[220px] sm:max-w-none">{p.name}</div>
//                         <div className="text-xs text-slate-400 mt-1">{p.slug ?? ""}</div>
//                       </td>

//                       <td className="px-4 py-3 text-sm text-slate-600 align-middle hidden sm:table-cell">
//                         {p.category && typeof p.category === "object"
//                           ? `${(p.category as any).name ?? "-"}`
//                           : `${p.category ?? "-"}`}
//                       </td>

//                       <td className="px-4 py-3 text-sm align-middle hidden md:table-cell">{p.grams ?? "-"}</td>

//                       <td className="px-4 py-3 text-sm align-middle">₹ {p.price}</td>

//                       <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">
//                         <div>{p.discount_price ? `₹ ${p.discount_price}` : "-"}</div>
//                         {p.discount_amount && <div className="text-xs text-slate-400">Saved {p.discount_amount}</div>}
//                       </td>

//                       <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.stock ?? "-"}</td>

//                       <td className="px-4 py-3 text-sm text-right align-middle">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => openEditDrawer(p)}
//                             title="Edit"
//                             className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"
//                             aria-label={`Edit ${p.name}`}
//                           >
//                             <Edit3 className="w-4 h-4" />
//                           </button>

//                           <button
//                             onClick={() => askDelete(p.id)}
//                             title="Delete"
//                             className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"
//                             aria-label={`Delete ${p.name}`}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>

//                           {/* optionally view on very small screens */}
//                           <button
//                             onClick={() => openView(p)}
//                             title="View"
//                             className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50 md:hidden"
//                             aria-label={`View ${p.name}`}
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* footer: summary */}
//           <div className="px-4 py-3 border-t flex items-center justify-between">
//             <div className="text-sm text-slate-600">Showing {products.length} products</div>
//             <div className="text-sm text-slate-800 font-medium">Total products: {products.length}</div>
//           </div>
//         </Card>

//         {/* ----------- Add / Edit Drawer ----------- */}
//         {isDrawerOpen && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit product" : "Add products"}>
//             <div
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//               onClick={() => {
//                 setIsDrawerOpen(false);
//                 resetForm();
//               }}
//               aria-hidden="true"
//             />

//             <aside
//               ref={drawerRef}
//               className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full"
//               style={{ transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
//             >
//               <div className="flex items-start justify-between p-6 border-b">
//                 <div>
//                   <h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setIsDrawerOpen(false);
//                     resetForm();
//                   }}
//                   aria-label="Close drawer"
//                   className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="p-6">
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Product Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       ref={firstInputRef}
//                       value={form.name}
//                       onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                       className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-slate-200"}`}
//                       placeholder="e.g. Shimla Apple"
//                     />
//                     {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
//                       <input
//                         value={form.price}
//                         onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
//                         className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-slate-200"}`}
//                         placeholder="1000.00"
//                       />
//                       {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
//                       <select
//                         value={form.category}
//                         onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
//                         className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-slate-200"}`}
//                       >
//                         <option value="">-- Select category (id) --</option>
//                         {categories.map((c) => (
//                           <option key={c.id} value={c.id}>
//                             {c.name} ({c.id})
//                           </option>
//                         ))}
//                       </select>
//                       {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">Grams</label>
//                       <input value={form.grams} onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="750" />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">Discount Price</label>
//                       <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Description<span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       ref={descInputRef}
//                       value={form.description}
//                       onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                       className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.description ? "border-red-400" : "border-slate-200"}`}
//                       placeholder="e.g. Description"
//                     />
//                     {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">Upload Image</label>
//                     <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
//                     <p className="text-xs text-slate-400 mt-1">If you don't upload, existing image_url will stay.</p>
//                     {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
//                   </div>

//                   <div className="flex items-center justify-end gap-3">
//                     <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>
//                       Cancel
//                     </Button>
//                     <Button type="submit" disabled={isSubmitting} className="bg-chart-primary hover:bg-chart-primary/90">
//                       {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save" : "Add Product"}
//                     </Button>
//                   </div>
//                 </form>
//               </div>
//             </aside>
//           </div>
//         )}

//         {isViewOpen && selectedProduct && (
//           <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product details">
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />

//             <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
//               <div className="flex items-start justify-between border-b pb-3 mb-4">
//                 <div>
//                   <h3 className="text-xl font-semibold">Product details</h3>
//                 </div>
//                 <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//               <div>
//                 <img
//                   src={resolveImage(selectedProduct)}
//                   alt={selectedProduct?.name ?? "product"}
//                   className="w-full h-44 object-cover rounded-md mb-4"
//                   onError={(e) => {
//                     (e.currentTarget as HTMLImageElement).onerror = null;
//                     (e.currentTarget as HTMLImageElement).src = IMAGES.DummyImage;
//                   }}
//                 />
//                 <div className="space-y-3">
//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Name</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Price</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Discount Price</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.discount_price ?? "-"}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Grams</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm font-medium text-slate-500">Category</div>
//                     <div className="mt-1 rounded-md border p-2 bg-gray-50">
//                       {selectedProduct.category && typeof selectedProduct.category === "object"
//                         ? ((selectedProduct.category as any).name ?? (selectedProduct.category as any).id ?? "-")
//                         : (selectedProduct.category ?? "-")}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-end mt-4">
//                   <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         )}

//         {/* ---------- Delete confirmation mini-modal ---------- */}
//         {confirmDeleteId != null && (
//           <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
//             <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
//             <div className="relative bg-white rounded shadow-lg w-full max-w-sm p-4">
//               <div className="flex items-start justify-between">
//                 <h4 className="text-lg font-semibold">Confirm delete</h4>
//                 <button onClick={cancelDelete} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
//               </div>
//               <div className="mt-3 text-sm">
//                 Are you sure you want to delete this product? This action cannot be undone.
//               </div>
//               <div className="mt-4 flex justify-end gap-2">
//                 <Button variant="ghost" onClick={cancelDelete} disabled={isDeleting}>Cancel</Button>
//                 <Button variant="destructive" onClick={() => void confirmDelete()} disabled={isDeleting}>
//                   {isDeleting ? "Deleting..." : "Delete"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Edit3, Eye, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import { IMAGES } from "../assets/images";

type Product = {
  id: string | number;
  name: string;
  price: string;
  grams?: string;
  discount_amount?: string;
  discount_price?: string;
  image?: string;
  image_url?: string;
  category?: { id?: number | string; name?: string } | string | null;
  stock?: number | string | null;
  slug?: string;
  [k: string]: any;
};

type CategoryItem = { id: string; name: string; image_url?: string | null };

const defaultForm = {
  name: "",
  grams: "",
  category: "",
  price: "",
  discount_amount: "",
  discount_price: "",
  image: "",
  description: "",
};

export default function Products(): JSX.Element {
  const basePath = "/admin/products";

  // state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // drawers & view
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // form
  const [form, setForm] = useState({ ...defaultForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirm modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const descInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const viewDrawerRef = useRef<HTMLDivElement | null>(null);

  // ---------- CATEGORY DRAWER state ----------
  const [isCatDrawerOpen, setIsCatDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState<{ name: string; imagePreview?: string }>({ name: "", imagePreview: "" });
  const [catEditingId, setCatEditingId] = useState<string | number | null>(null);
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [catFile, setCatFile] = useState<File | null>(null);
  const catFileRef = useRef<HTMLInputElement | null>(null);
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

  // ---------- PRODUCTS PAGINATION ----------
  const PER_PAGE = 10; // <--- show 10 products per page as requested
  const [page, setPage] = useState<number>(1);

  // ---------------- helpers ----------------
  const safeTrim = (v: unknown): string | undefined => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s === "" ? undefined : s;
  };

  const resolveImage = (p?: Product | string | undefined) => {
    if (!p) return IMAGES.DummyImage;
    if (typeof p === "string") {
      const str = p.trim();
      return str ? str : IMAGES.DummyImage;
    }
    const raw =
      (p as any).image_url ??
      (p as any).image ??
      (p as any).imageUrl ??
      (p as any).photo ??
      (p as any).thumbnail ??
      "";
    const str = String(raw ?? "").trim();
    if (!str) return IMAGES.DummyImage;
    if (/^https?:\/\//i.test(str)) return str;
    try {
      const base = (api as any)?.defaults?.baseURL ?? window.location.origin;
      const baseClean = base.endsWith("/") ? base : base + "/";
      return new URL(str.replace(/^\/+/, ""), baseClean).toString();
    } catch {
      return IMAGES.Nutz;
    }
  };

  function normalizeProduct(raw: any): Product {
    if (!raw) return { id: `local-${Date.now()}`, name: "Untitled", price: "0" };

    const id = raw.id ?? raw._id ?? raw.product_id ?? raw.slug ?? `local-${Date.now()}`;

    let catRaw = raw.category ?? raw.cat ?? raw.category_id ?? null;
    if (catRaw === "" || catRaw === 0) catRaw = null;
    const category =
      catRaw && typeof catRaw === "object"
        ? { id: catRaw.id ?? catRaw._id ?? catRaw.category_id, name: catRaw.name ?? catRaw.title ?? "" }
        : catRaw ?? null;

    const imageVal =
      raw.image ?? raw.image_url ?? raw.imageUrl ?? raw.photo ?? raw.thumbnail ?? undefined;

    const image_url_val = raw.image_url ?? raw.imageUrl ?? raw.image ?? undefined;

    return {
      id,
      name: String(raw.name ?? raw.title ?? "Untitled"),
      price: String(raw.price ?? raw.amount ?? raw.cost ?? "0"),
      grams: raw.grams ?? raw.gram ?? raw.weight ?? "",
      discount_amount: safeTrim(raw.discount_amount ?? raw.discountAmount) ?? "",
      discount_price: safeTrim(raw.discount_price ?? raw.discountPrice) ?? "",
      image: imageVal,
      image_url: image_url_val,
      category,
      stock: raw.stock ?? raw.qty ?? null,
      slug: raw.slug ?? "",
      ...raw,
    };
  }

  // ---------------- API ----------------
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get("/admin/categories/show");
      const body = res.data ?? res;
      let rows: any[] = [];
      if (Array.isArray(body)) rows = body;
      else if (Array.isArray(body.data)) rows = body.data;
      else {
        const arr = Object.values(body || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      const normalizedCats: CategoryItem[] = rows
        .map((r) => {
          const id = String(r.id ?? r._id ?? r.category_id ?? r.categoryId ?? r.id?.toString?.() ?? "").trim();
          const name = String(r.name ?? r.title ?? r.label ?? r.category_name ?? id ?? "");
          const image_url = (r.image_url ?? r.image ?? r.imageUrl ?? null) as string | null;
          return id ? { id, name, image_url } : null;
        })
        .filter(Boolean) as CategoryItem[];

      const dedup: Record<string, CategoryItem> = {};
      normalizedCats.forEach((c) => (dedup[c.id] = c));
      setCategories(Object.values(dedup));
    } catch (err: any) {
      console.error("fetchCategories failed:", err, err?.response?.data);
      toast.error("Failed to load categories (dropdown may be incomplete)");
    } finally {
      setCatLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${basePath}/show`);
      const body = res.data ?? res;
      if (!body || typeof body !== "object") throw new Error("Unexpected response from server");

      let rows: any[] = [];
      const payload = body.data ?? body;
      if (Array.isArray(payload)) rows = payload;
      else if (Array.isArray(payload.data)) rows = payload.data;
      else {
        const arr = Object.values(payload || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) rows = arr as any[];
      }

      const normalized = rows.map((r: any) => normalizeProduct(r));
      setProducts(normalized);
      setPage(1); // reset page on load
    } catch (err: any) {
      console.error("fetchProducts failed:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to load products";
      toast.error(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // category CRUD API (send FormData when image present)
  const createCategoryApi = async (payload: { name: string; file?: File | null }) => {
    if (payload.file) {
      const fd = new FormData();
      fd.append("name", String(payload.name));
      fd.append("image", payload.file, payload.file.name);
      const res = await api.post("/admin/categories/add", fd, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data ?? res;
    } else {
      const res = await api.post("/admin/categories/add", { name: payload.name });
      return res.data ?? res;
    }
  };

  const updateCategoryApi = async (id: string | number, payload: { name: string; file?: File | null }) => {
    // many backends accept FormData for update; use FormData to support image upload
    const fd = new FormData();
    fd.append("name", String(payload.name));
    // if backend expects a method override, uncomment next line:
    // fd.append("_method", "PUT");
    if (payload.file) fd.append("image", payload.file, payload.file.name);
    const res = await api.post(`/admin/categories/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data ?? res;
  };

  const deleteCategoryApi = async (id: string | number) => {
    const res = await api.delete(`/admin/categories/delete/${id}`);
    return res.data ?? res;
  };

  // create: append description correctly
  const createProductApi = async (payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if ((payload as any).description !== undefined) fd.append("description", String((payload as any).description));
    if (file) fd.append("image", file);
    const res = await api.post(`${basePath}/add`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data ?? res;
  };

  // update: append description as well
  const updateProductApi = async (id: string | number, payload: Partial<Product>, file?: File | null) => {
    const fd = new FormData();
    if (payload.name !== undefined) fd.append("name", String(payload.name));
    if (payload.price !== undefined) fd.append("price", String(payload.price));
    if (payload.discount_price !== undefined) fd.append("discount_price", String(payload.discount_price));
    if (payload.discount_amount !== undefined) fd.append("discount_amount", String(payload.discount_amount));
    if (payload.grams !== undefined) fd.append("grams", String(payload.grams));
    if (payload.category !== undefined && payload.category !== null) fd.append("category", String(payload.category));
    if ((payload as any).description !== undefined) fd.append("description", String((payload as any).description));
    if (file) fd.append("image", file);
    const res = await api.post(`${basePath}/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data ?? res;
  };

  const deleteProductApi = async (id: string | number) => {
    const res = await api.delete(`${basePath}/delete/${id}`);
    return res.data ?? res;
  };

  // ---------------- lifecycle ----------------
  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- form & drawers ----------------
  const openAddDrawer = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 100);
  };

  const openEditDrawer = (p: Product) => {
    setIsEditMode(true);
    setEditingId(p.id);
    setForm({
      name: safeTrim(p.name) ?? String(p.name ?? ""),
      grams: safeTrim(p.grams) ?? String(p.grams ?? ""),
      category:
        p.category && typeof p.category === "object"
          ? String((p.category as any).id ?? (p.category as any).name ?? "")
          : String(p.category ?? ""),
      price: safeTrim(p.price) ?? String(p.price ?? ""),
      discount_amount: safeTrim(p.discount_amount) ?? String(p.discount_amount ?? ""),
      discount_price: safeTrim(p.discount_price) ?? String(p.discount_price ?? ""),
      image: (p.image_url ?? p.image ?? "") as string,
      description: safeTrim((p as any).description ?? (p as any).dscription ?? "") ?? "",
    });
    setImageFile(null);
    setIsDrawerOpen(true);
    setTimeout(() => firstInputRef.current?.focus(), 120);
  };

  const openView = (p: Product) => {
    setSelectedProduct(p);
    setIsViewOpen(true);
    setTimeout(() => viewDrawerRef.current?.focus(), 120);
  };

  const resetForm = () => {
    setForm({ ...defaultForm });
    setImageFile(null);
    setErrors({});
    setIsEditMode(false);
    setEditingId(null);
  };

  const validateForm = () => {
    const e: Partial<Record<keyof typeof defaultForm, string>> = {};
    if (!String(form.name ?? "").trim()) e.name = "Name is required";
    if (!String(form.price ?? "").trim()) e.price = "Price is required";
    if (!String(form.category ?? "").trim()) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image too large (max 5MB)");
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // ---------- submit (create/update) with optimistic UI ----------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors((prev) => ({ ...prev, image: undefined }));

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const hasImageOnClient = !!(imageFile || (form.image && String(form.image).trim()));
    if (!isEditMode && !hasImageOnClient) {
      setErrors((prev) => ({ ...prev, image: "Image is required" }));
      toast.error("Image is required");
      return;
    }

    const nameTrimmed = safeTrim(form.name) ?? "";
    const priceTrimmed = safeTrim(form.price) ?? "";
    const discount_price_trimmed = safeTrim(form.discount_price);
    const discount_amount_trimmed = safeTrim(form.discount_amount);
    const grams_trimmed = safeTrim(form.grams);
    const descriptionTrimmed = safeTrim(form.description) ?? "";

    let categoryToSend: string | number | undefined = undefined;
    if (form.category !== "" && form.category != null) {
      const trimmed = String(form.category).trim();
      const asNum = Number(trimmed);
      categoryToSend = !Number.isNaN(asNum) && /^\d+$/.test(trimmed) ? asNum : trimmed;
    }

    const payload: Partial<Product> = {
      name: nameTrimmed,
      price: priceTrimmed,
      discount_price: discount_price_trimmed,
      discount_amount: discount_amount_trimmed,
      grams: grams_trimmed,
      category: categoryToSend as any,
      ...(descriptionTrimmed ? { description: descriptionTrimmed } : {}),
    };

    setIsSubmitting(true);
    setErrors({});

    if (isEditMode && editingId != null) {
      const prev = products;
      const updatedLocal = normalizeProduct({ ...payload, id: editingId });
      setProducts((cur) => cur.map((p) => (String(p.id) === String(editingId) ? { ...p, ...updatedLocal } : p)));

      try {
        const res = await updateProductApi(editingId, payload, imageFile);
        const body = res.data ?? res;
        if (body && body.status === false) {
          const msg = body.message ?? "Update failed";
          if (/image/i.test(String(msg))) setErrors((prev) => ({ ...prev, image: String(msg) }));
          toast.error(String(msg));
          setProducts(prev);
          setIsSubmitting(false);
          return;
        }

        const updatedRaw = body?.data ?? body?.product ?? body;
        const updated = normalizeProduct(updatedRaw);
        setProducts((cur) => {
          const without = cur.filter((x) => String(x.id) !== String(updated.id));
          return [updated, ...without];
        });
        await fetchCategories();
        toast.success("Product updated");
        setIsDrawerOpen(false);
        resetForm();
      } catch (err: any) {
        console.error("handleSubmit (update) error:", err, err?.response?.data);
        setProducts(prev);
        const rdata = err?.response?.data;
        if (rdata && typeof rdata === "object") {
          if (rdata.errors && typeof rdata.errors === "object") {
            const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
            Object.keys(rdata.errors).forEach((k) => {
              const val = rdata.errors[k];
              mapped[k as keyof typeof defaultForm] = Array.isArray(val) ? String(val[0]) : String(val);
            });
            setErrors((p) => ({ ...p, ...mapped }));
            toast.error("Fix validation errors");
          } else if (rdata.status === false && rdata.message) {
            const msg = String(rdata.message);
            if (/image/i.test(msg)) setErrors((prev) => ({ ...prev, image: msg }));
            toast.error(msg);
          } else {
            toast.error(rdata.message ?? rdata.error ?? err?.message ?? "Update failed");
          }
        } else {
          toast.error(err?.message ?? "Update failed");
        }
      } finally {
        setIsSubmitting(false);
        setImageFile(null);
      }
    } else {
      // Optimistic create
      const tempId = `local-${Date.now()}`;
      const tempProd: Product = normalizeProduct({ id: tempId, ...payload, image: form.image ?? undefined });
      setProducts((prev) => [tempProd, ...prev]);

      try {
        const res = await createProductApi(payload, imageFile);
        const body = res.data ?? res;

        if (body && body.status === false) {
          const msg = body.message ?? "Add failed";
          if (/image/i.test(String(msg))) setErrors((prev) => ({ ...prev, image: String(msg) }));
          toast.error(String(msg));
          setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
          setIsSubmitting(false);
          return;
        }

        const createdRaw = body?.data ?? body?.product ?? body;
        const created = normalizeProduct(createdRaw);

        setProducts((cur) => {
          const withoutTemp = cur.filter((p) => String(p.id) !== String(tempId));
          return [created, ...withoutTemp];
        });
        await fetchCategories();
        toast.success("Product added");
        setIsDrawerOpen(false);
        resetForm();
      } catch (err: any) {
        console.error("handleSubmit (create) error:", err, err?.response?.data);
        setProducts((cur) => cur.filter((p) => String(p.id) !== String(tempId)));
        const rdata = err?.response?.data;
        if (rdata && typeof rdata === "object") {
          if (rdata.errors && typeof rdata.errors === "object") {
            const mapped: Partial<Record<keyof typeof defaultForm, string>> = {};
            Object.keys(rdata.errors).forEach((k) => {
              const val = rdata.errors[k];
              mapped[k as keyof typeof defaultForm] = Array.isArray(val) ? String(val[0]) : String(val);
            });
            setErrors((p) => ({ ...p, ...mapped }));
            toast.error("Fix validation errors");
          } else if (rdata.status === false && rdata.message) {
            const msg = String(rdata.message);
            if (/image/i.test(msg)) setErrors((prev) => ({ ...prev, image: msg }));
            toast.error(msg);
          } else {
            toast.error(rdata.message ?? err?.message ?? "Add failed");
          }
        } else {
          toast.error(err?.message ?? "Add failed");
        }
      } finally {
        setIsSubmitting(false);
        setImageFile(null);
      }
    }
  };

  const askDelete = (id: string | number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId == null) return;
    setIsDeleting(true);

    const prev = products;
    setProducts((cur) => cur.filter((p) => String(p.id) !== String(confirmDeleteId)));

    try {
      const res = await deleteProductApi(confirmDeleteId);
      const body = res.data ?? res;
      if (body && body.status === false) {
        toast.error(body.message ?? "Delete failed");
        setProducts(prev);
      } else {
        toast.success("Product deleted");
        setSelectedProduct((s) => (s && String(s.id) === String(confirmDeleteId) ? null : s));
      }
    } catch (err: any) {
      console.error("Delete error:", err, err?.response?.data);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to delete product";
      toast.error(message);
      setProducts(prev);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleRefresh = async () => {
    await fetchProducts();
    await fetchCategories();
    toast.success("Refreshed");
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        if (isDrawerOpen) setIsDrawerOpen(false);
        if (isViewOpen) setIsViewOpen(false);
        if (confirmDeleteId) setConfirmDeleteId(null);
        if (isCatDrawerOpen) {
          setIsCatDrawerOpen(false);
          setCatEditingId(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, isViewOpen, confirmDeleteId, isCatDrawerOpen]);

  // ---------- Category Drawer handlers ----------
  const openCatDrawer = () => {
    setCatForm({ name: "", imagePreview: "" });
    setCatEditingId(null);
    setCatFile(null);
    if (catFileRef.current) catFileRef.current.value = "";
    setIsCatDrawerOpen(true);
  };

  const openCatEdit = (c: CategoryItem) => {
    setCatEditingId(c.id);
    setCatForm({ name: c.name ?? "", imagePreview: c.image_url ?? "" });
    setCatFile(null);
    if (catFileRef.current) catFileRef.current.value = "";
    setIsCatDrawerOpen(true);
  };

  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    if (!f.type || !f.type.startsWith("image/")) {
      toast.error("Selected file is not an image. Please choose a valid image file.");
      if (catFileRef.current) catFileRef.current.value = "";
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large (max 5MB). Please select a smaller file.");
      if (catFileRef.current) catFileRef.current.value = "";
      setCatFile(null);
      setCatForm((s) => ({ ...s, imagePreview: "" }));
      return;
    }
    setCatFile(f);
    const r = new FileReader();
    r.onload = () => setCatForm((s) => ({ ...s, imagePreview: String(r.result ?? "") }));
    r.readAsDataURL(f);
  };

  const submitCategory = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    const name = String(catForm.name ?? "").trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    setCatSubmitting(true);
    try {
      if (catEditingId) {
        const res = await updateCategoryApi(catEditingId, { name, file: catFile ?? undefined });
        const body = res.data ?? res;
        if (body && body.status === false) throw new Error(String(body.message ?? "Update failed"));
        toast.success("Category updated");
      } else {
        const res = await createCategoryApi({ name, file: catFile ?? undefined });
        const body = res.data ?? res;
        if (body && body.status === false) throw new Error(String(body.message ?? "Create failed"));
        toast.success("Category created");
      }
      await fetchCategories();
      setIsCatDrawerOpen(false);
      setCatForm({ name: "", imagePreview: "" });
      setCatEditingId(null);
      setCatFile(null);
      if (catFileRef.current) catFileRef.current.value = "";
    } catch (err: any) {
      console.error("category CRUD error:", err, err?.response?.data);
      const msg = err?.response?.data?.message ?? err?.message ?? "Category save failed";
      toast.error(String(msg));
    } finally {
      setCatSubmitting(false);
    }
  };

  const removeCategory = async (id: string | number) => {
    const ok = window.confirm("Delete this category? This action cannot be undone.");
    if (!ok) return;
    try {
      await deleteCategoryApi(id);
      toast.success("Category deleted");
      await fetchCategories();
    } catch (err: any) {
      console.error("delete category failed:", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      toast.error(String(msg));
    }
  };

  // ---------- Products client-side pagination helpers ----------
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const paginatedProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
    // scroll to top of list for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 7;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => void handleRefresh()} aria-label="Refresh products" className="ml-2">
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Add Category button beside Add Product */}
            <Button onClick={() => openCatDrawer()} className="ml-2">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>

            <Button onClick={() => openAddDrawer()} className="ml-2">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        <Card className="shadow-sm w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] md:min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium w-12">S.no</th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-20">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Category (id)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Grams</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Discount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-medium w-36">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-9 w-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <div className="text-sm text-slate-600">Loading products…</div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, i) => (
                    <tr key={String(p.id)}>
                      <td className="px-4 py-3 text-sm align-middle">{(page - 1) * PER_PAGE + i + 1}</td>

                      <td className="px-4 py-3 align-middle">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border">
                          <img
                            src={resolveImage(p)}
                            alt={p.name ?? "product"}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = IMAGES.DummyImage;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="text-sm font-medium truncate max-w-[220px] sm:max-w-none">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{p.slug ?? ""}</div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600 align-middle hidden sm:table-cell">
                        {p.category && typeof p.category === "object"
                          ? `${(p.category as any).name ?? "-"}`
                          : `${p.category ?? "-"}`}
                      </td>

                      <td className="px-4 py-3 text-sm align-middle hidden md:table-cell">{p.grams ?? "-"}</td>

                      <td className="px-4 py-3 text-sm align-middle">₹ {p.price}</td>

                      <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">
                        <div>{p.discount_price ? `₹ ${p.discount_price}` : "-"}</div>
                        {p.discount_amount && <div className="text-xs text-slate-400">Saved {p.discount_amount}</div>}
                      </td>

                      <td className="px-4 py-3 text-sm align-middle hidden lg:table-cell">{p.stock ?? "-"}</td>

                      <td className="px-4 py-3 text-sm text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditDrawer(p)}
                            title="Edit"
                            className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => askDelete(p.id)}
                            title="Delete"
                            className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openView(p)}
                            title="View"
                            className="inline-flex items-center justify-center p-2 rounded border hover:bg-slate-50 md:hidden"
                            aria-label={`View ${p.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* footer: summary + pagination */}
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-slate-600">Showing {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, products.length)} of {products.length} products</div>

            {/* Tailwind pagination */}
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {renderPageNumbers().map((p) => {
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 py-1 rounded ${isActive ? "bg-slate-800 text-white" : "bg-white border hover:bg-slate-50"}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <div className="sm:hidden text-sm text-slate-700 px-2">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </Card>

        {/* ----------- Add / Edit Product Drawer ----------- */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit product" : "Add products"}>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsDrawerOpen(false);
                resetForm();
              }}
              aria-hidden="true"
            />

            <aside
              ref={drawerRef}
              className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full"
              style={{ transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">{isEditMode ? "Edit Product" : "Add Product"}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    resetForm();
                  }}
                  aria-label="Close drawer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.name ? "border-red-400" : "border-slate-200"}`}
                      placeholder="e.g. Shimla Apple"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                      <input
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className={`block w-full border rounded-md p-2 ${errors.price ? "border-red-400" : "border-slate-200"}`}
                        placeholder="1000.00"
                      />
                      {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className={`block w-full border rounded-md p-2 ${errors.category ? "border-red-400" : "border-slate-200"}`}
                      >
                        <option value="">-- Select category (id) --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id})
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Grams</label>
                      <input value={form.grams} onChange={(e) => setForm((f) => ({ ...f, grams: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="750" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Price</label>
                      <input value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} className="block w-full border rounded-md p-2" placeholder="800.00" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={descInputRef}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className={`block w-full border rounded-md p-2 focus:outline-none focus:ring ${errors.description ? "border-red-400" : "border-slate-200"}`}
                      placeholder="e.g. Description"
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm" />
                    <p className="text-xs text-slate-400 mt-1">If you don't upload, existing image_url will stay.</p>
                    {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => { resetForm(); setIsDrawerOpen(false); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-chart-primary hover:bg-chart-primary/90">
                      {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : isEditMode ? "Save" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}

        {/* ---------- Category Drawer (full CRUD + image) ---------- */}
        {isCatDrawerOpen && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Category management">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsCatDrawerOpen(false);
                setCatEditingId(null);
                setCatForm({ name: "", imagePreview: "" });
                setCatFile(null);
                if (catFileRef.current) catFileRef.current.value = "";
              }}
              aria-hidden="true"
            />

            <aside
              className="fixed top-0 right-0 h-screen bg-white shadow-2xl overflow-auto rounded-l-2xl transform transition-transform duration-300 ease-in-out md:w-96 w-full"
              style={{ transform: isCatDrawerOpen ? "translateX(0)" : "translateX(100%)" }}
            >
              <div className="flex items-start justify-between p-6 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Categories</h3>
                </div>
                <button
                  onClick={() => {
                    setIsCatDrawerOpen(false);
                    setCatEditingId(null);
                    setCatForm({ name: "", imagePreview: "" });
                    setCatFile(null);
                    if (catFileRef.current) catFileRef.current.value = "";
                  }}
                  aria-label="Close category drawer"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Create / Edit form */}
                <form onSubmit={submitCategory} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      value={catForm.name}
                      onChange={(e) => setCatForm((s) => ({ ...s, name: e.target.value }))}
                      className="block w-full border rounded-md p-2"
                      placeholder="e.g. Beverages"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Image {catEditingId ? "(optional to replace)" : "(required)"}</label>
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-slate-100 border flex items-center justify-center">
                        {catForm.imagePreview ? (
                          <img src={catForm.imagePreview} alt={catForm.name || "preview"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xs text-slate-400">No image</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <input ref={catFileRef} type="file" accept="image/*" onChange={handleCatImageChange} className="block w-full text-sm" />
                        <p className="text-xs text-slate-400 mt-2">Max 5MB. Square images work best. {catEditingId ? "Leave empty to keep existing image." : ""}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {catEditingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatEditingId(null);
                          setCatForm({ name: "", imagePreview: "" });
                          setCatFile(null);
                          if (catFileRef.current) catFileRef.current.value = "";
                        }}
                        className="px-3 py-2 rounded-md border"
                      >
                        New
                      </button>
                    )}
                    <button type="submit" disabled={catSubmitting} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                      {catSubmitting ? (catEditingId ? "Saving..." : "Creating...") : catEditingId ? "Save" : "Create"}
                    </button>
                  </div>
                </form>

                {/* Categories list (compact, with thumbnails) */}
                <div>
                  <div className="text-sm text-slate-600 mb-3">Available categories</div>
                  <div className="space-y-2">
                    {catLoading ? (
                      <div className="text-sm text-slate-500">Loading categories…</div>
                    ) : categories.length === 0 ? (
                      <div className="text-sm text-slate-500">No categories yet.</div>
                    ) : (
                      categories.map((c) => (
                        <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded border">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white border flex-shrink-0">
                              <img
                                src={c.image_url ?? IMAGES.DummyImage}
                                alt={c.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).onerror = null;
                                  (e.currentTarget as HTMLImageElement).src = IMAGES.DummyImage;
                                }}
                              />
                            </div>
                            <div className="text-sm text-slate-800 truncate">{c.name}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => openCatEdit(c)} className="px-2 py-1 rounded border hover:bg-slate-50">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeCategory(c.id)} className="px-2 py-1 rounded border hover:bg-red-50">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {isViewOpen && selectedProduct && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Product details">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />

            <aside ref={viewDrawerRef} tabIndex={-1} className="fixed top-0 right-0 h-screen bg-white dark:bg-slate-900 shadow-2xl overflow-auto rounded-l-2xl md:w-96 w-full p-6">
              <div className="flex items-start justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Product details</h3>
                </div>
                <button onClick={() => setIsViewOpen(false)} className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <img
                  src={resolveImage(selectedProduct)}
                  alt={selectedProduct?.name ?? "product"}
                  className="w-full h-44 object-cover rounded-md mb-4"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).onerror = null;
                    (e.currentTarget as HTMLImageElement).src = IMAGES.DummyImage;
                  }}
                />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Name</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.name}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Price</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">₹ {selectedProduct.price}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Discount Price</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.discount_price ?? "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Grams</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">{selectedProduct.grams ?? "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-500">Category</div>
                    <div className="mt-1 rounded-md border p-2 bg-gray-50">
                      {selectedProduct.category && typeof selectedProduct.category === "object"
                        ? ((selectedProduct.category as any).name ?? (selectedProduct.category as any).id ?? "-")
                        : (selectedProduct.category ?? "-")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                  <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ---------- Delete confirmation mini-modal ---------- */}
        {confirmDeleteId != null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={cancelDelete} />
            <div className="relative bg-white rounded shadow-lg w-full max-w-sm p-4">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold">Confirm delete</h4>
                <button onClick={cancelDelete} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="mt-3 text-sm">
                Are you sure you want to delete this product? This action cannot be undone.
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={cancelDelete} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={() => void confirmDelete()} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}












