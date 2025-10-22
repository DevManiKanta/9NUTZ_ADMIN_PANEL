
// import React, { useEffect, useMemo, useState, useRef } from "react";
// import {
//   PlusCircle,
//   Search,
//   Download,
//   Calendar,
//   ChevronDown,
//   X,
//   Edit2,
//   Trash2,
//   Check,
//   Image as ImageIcon,
//   Loader2,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";

// /**
//  * Expenses page/component
//  *
//  * - API_BASE uses your provided URL
//  * - Endpoints used:
//  *    GET  /admin/expanses
//  *    POST /admin/expanses/add
//  *    POST /admin/expanses/update/:id
//  *    DELETE /admin/expanses/delete/:id
//  *
//  * - Token is read from localStorage 'token'
//  */

// const API_BASE = "http://192.168.29.100:8000/api";
// const TOKEN_KEY = "token";

// const getTokenHeader = () => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// const formatCurrency = (n) =>
//   n === null || n === undefined ? "-" : `₹ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// export default function ExpensesPage() {
//   const [expenses, setExpenses] = useState([]); // array of expense objects from server
//   const [loading, setLoading] = useState(false);
//   const [busy, setBusy] = useState(false); // busy indicator for create/update/delete
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const perPage = 10;

//   // Modal / form state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null); // null => create, object => edit
//   const [form, setForm] = useState({
//     date: new Date().toISOString().slice(0, 10),
//     category_id: "",
//     amount: "",
//     mode: "cash",
//     vendor_name: "", // backend field — UI label "Bill"
//     description: "",
//     proofFile: null,
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const fileInputRef = useRef(null);
//   const [previewUrl, setPreviewUrl] = useState("");

//   // categories (optional) — backend endpoint for categories may not exist, we attempt to fetch but it's non-fatal
//   const [categories, setCategories] = useState([]);
//   const [catModalOpen, setCatModalOpen] = useState(false);
//   const [newCategoryName, setNewCategoryName] = useState("");
//   const [creatingCategory, setCreatingCategory] = useState(false);

//   // fetch list on mount
//   useEffect(() => {
//     void fetchExpenses();
//     void fetchCategoriesSafe();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // fetch expenses
//   const fetchExpenses = async () => {
//     setLoading(true);
//     const id = toast.loading("Loading expenses...");
//     try {
//       const res = await fetch(`${API_BASE}/admin/expanses`, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           ...getTokenHeader(),
//         },
//       });
//       const data = await res.json().catch(() => null);
//       if (!res.ok) {
//         const msg = data?.message || data?.error || `Failed to load (${res.status})`;
//         toast.error(msg);
//         throw new Error(msg);
//       }
//       // API returns an object — we try to locate the array:
//       // Common shapes: data.data, data.expenses, data (array)
//       let list = [];
//       if (Array.isArray(data)) list = data;
//       else if (Array.isArray(data.data)) list = data.data;
//       else if (Array.isArray(data.expenses)) list = data.expenses;
//       else if (Array.isArray(data?.data?.data)) list = data.data.data; // nested pagination
//       else if (Array.isArray(data?.data?.rows)) list = data.data.rows;
//       else {
//         // try find first array
//         const arr = Object.values(data || {}).find((v) => Array.isArray(v));
//         if (Array.isArray(arr)) list = arr;
//       }

//       // Many backends stringify items array inside `items` field — normalize
//       const normalized = list.map((r) => {
//         // try parse items if string
//         let items = r.items;
//         if (typeof items === "string") {
//           try {
//             items = JSON.parse(r.items);
//           } catch (err) {
//             items = [];
//           }
//         }
//         return {
//           ...r,
//           id: r.id ?? r._id,
//           date: r.date ?? r.spent_on ?? r.created_at ?? r.order_time ?? r.order_time_formatted ?? r.order_date ?? r.createdAt ?? new Date().toISOString(),
//           category_id: r.category_id ?? r.category ?? null,
//           amount: Number(r.amount ?? r.amt ?? r.total ?? 0),
//           mode: r.mode ?? r.payment ?? r.type ?? "cash",
//           vendor_name: r.vendor_name ?? r.requestedBy ?? r.bill ?? r.customer_name ?? "",
//           description: r.description ?? r.remarks ?? r.note ?? "",
//           proof: r.proof ?? r.proof_url ?? r.image ?? null,
//           address: r.address ?? null,
//           items,
//         };
//       });

//       setExpenses(normalized);
//       toast.dismiss(id);
//       toast.success("Expenses loaded");
//     } catch (err) {
//       console.error("fetchExpenses error:", err);
//       toast.dismiss();
//       toast.error(err?.message || "Failed to load expenses");
//       setExpenses([]); // empty state (no dummy)
//     } finally {
//       setLoading(false);
//     }
//   };

//   // fetch categories if API exists (non-fatal)
//   const fetchCategoriesSafe = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/admin/expanses/categories`, {
//         method: "GET",
//         headers: { Accept: "application/json", ...getTokenHeader() },
//       });
//       if (!res.ok) return;
//       const data = await res.json().catch(() => null);
//       let list = [];
//       if (Array.isArray(data)) list = data;
//       else if (Array.isArray(data.data)) list = data.data;
//       if (Array.isArray(list)) {
//         setCategories(list.map((c) => ({ id: c.id ?? c._id, name: c.name ?? c.title ?? c })));
//       }
//     } catch (err) {
//       // ignore - optional feature
//       console.warn("fetchCategories failed:", err);
//     }
//   };

//   // client-side validation
//   const validateForm = (values) => {
//     const errs = {};
//     if (!values.date) errs.date = "Date is required";
//     if (!values.category_id) errs.category_id = "Category required";
//     if (!values.amount || Number(values.amount) <= 0) errs.amount = "Amount must be greater than 0";
//     if (!values.mode) errs.mode = "Payment mode required";
//     if (!values.vendor_name || !values.vendor_name.trim()) errs.vendor_name = "Bill is required";
//     // description optional
//     return errs;
//   };

//   // open create modal
//   const openCreateModal = () => {
//     setEditing(null);
//     setForm({
//       date: new Date().toISOString().slice(0, 10),
//       category_id: categories.length ? categories[0].id : "",
//       amount: "",
//       mode: "cash",
//       vendor_name: "",
//       description: "",
//       proofFile: null,
//     });
//     setPreviewUrl("");
//     setFormErrors({});
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     setIsModalOpen(true);
//   };

//   // open edit modal
//   const openEditModal = (exp) => {
//     setEditing(exp);
//     setForm({
//       date: exp.date ? exp.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
//       category_id: exp.category_id ?? "",
//       amount: exp.amount ?? "",
//       mode: exp.mode ?? "cash",
//       vendor_name: exp.vendor_name ?? "",
//       description: exp.description ?? "",
//       proofFile: null,
//     });
//     setPreviewUrl(exp.proof ?? "");
//     setFormErrors({});
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     setIsModalOpen(true);
//   };

//   // handle input changes
//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//     setFormErrors((prev) => ({ ...prev, [name]: undefined }));
//   };

//   // file change
//   const onFileChange = (e) => {
//     const f = e.target.files?.[0] ?? null;
//     setForm((p) => ({ ...p, proofFile: f }));
//     if (f) {
//       try {
//         const url = URL.createObjectURL(f);
//         setPreviewUrl(url);
//       } catch (err) {
//         setPreviewUrl("");
//       }
//     } else {
//       setPreviewUrl(editing?.proof ?? "");
//     }
//   };

//   // create or update submit
//   const handleSubmit = async (ev) => {
//     ev?.preventDefault();
//     const errs = validateForm(form);
//     if (Object.keys(errs).length) {
//       setFormErrors(errs);
//       toast.error("Please fix form errors");
//       return;
//     }

//     const tokenHeader = getTokenHeader();
//     if (!tokenHeader.Authorization) {
//       toast.error("Not logged in — token missing");
//       return;
//     }

//     setBusy(true);
//     const toastId = toast.loading(editing ? "Updating expense..." : "Creating expense...");

//     try {
//       // build FormData (curl examples used --form)
//       const fd = new FormData();
//       fd.append("date", form.date);
//       fd.append("category_id", String(form.category_id ?? ""));
//       fd.append("amount", String(form.amount ?? ""));
//       fd.append("mode", String(form.mode ?? "cash"));
//       fd.append("vendor_name", String(form.vendor_name ?? "")); // 'Bill' label -> vendor_name
//       fd.append("description", String(form.description ?? ""));
//       // append proof file only if provided
//       if (form.proofFile) fd.append("proof", form.proofFile);

//       let res;
//       if (editing) {
//         // update uses POST per your curl
//         res = await fetch(`${API_BASE}/admin/expanses/update/${editing.id}`, {
//           method: "POST",
//           headers: {
//             ...tokenHeader,
//             // do not set Content-Type for FormData
//           },
//           body: fd,
//         });
//       } else {
//         res = await fetch(`${API_BASE}/admin/expanses/add`, {
//           method: "POST",
//           headers: {
//             ...tokenHeader,
//           },
//           body: fd,
//         });
//       }

//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         const msg = data?.message || data?.error || `Request failed (${res.status})`;
//         toast.error(msg);
//         throw new Error(msg);
//       }
//       if (data && data.status === false) {
//         const msg = data.message || "Operation failed";
//         toast.error(msg);
//         throw new Error(msg);
//       }

//       toast.dismiss(toastId);
//       toast.success(editing ? "Expense updated" : "Expense created");

//       // refresh list after success
//       await fetchExpenses();
//       setIsModalOpen(false);
//     } catch (err) {
//       console.error("save expense error:", err);
//       toast.dismiss();
//       toast.error(err?.message || "Failed to save expense");
//     } finally {
//       setBusy(false);
//     }
//   };

//   // delete
//   const handleDelete = async (row) => {
//     if (!row || !row.id) {
//       toast.error("Invalid expense");
//       return;
//     }
//     if (!confirm("Delete this expense? This action cannot be undone.")) return;

//     const tokenHeader = getTokenHeader();
//     if (!tokenHeader.Authorization) {
//       toast.error("Not logged in — token missing");
//       return;
//     }

//     setBusy(true);
//     const id = toast.loading("Deleting...");
//     try {
//       const res = await fetch(`${API_BASE}/admin/expanses/delete/${row.id}`, {
//         method: "DELETE",
//         headers: {
//           ...tokenHeader,
//         },
//       });
//       const data = await res.json().catch(() => null);
//       if (!res.ok) {
//         const msg = data?.message || data?.error || `Delete failed (${res.status})`;
//         toast.error(msg);
//         throw new Error(msg);
//       }
//       toast.dismiss(id);
//       toast.success("Deleted");
//       // refresh list
//       await fetchExpenses();
//     } catch (err) {
//       console.error("delete error:", err);
//       toast.dismiss();
//       toast.error(err?.message || "Failed to delete expense");
//     } finally {
//       setBusy(false);
//     }
//   };

//   // attempt create category (non-fatal) - backend categories endpoint may differ; this tries a reasonable path
//   const createCategory = async (name) => {
//     if (!name || !name.trim()) {
//       toast.error("Category name required");
//       return null;
//     }
//     setCreatingCategory(true);
//     try {
//       const res = await fetch(`${API_BASE}/admin/expanses/categories/add`, {
//         method: "POST",
//         headers: { ...getTokenHeader() },
//         body: (() => {
//           const f = new FormData();
//           f.append("name", name.trim());
//           return f;
//         })(),
//       });
//       const data = await res.json().catch(() => null);
//       if (!res.ok) {
//         const msg = data?.message || data?.error || `Create failed (${res.status})`;
//         toast.error(msg);
//         throw new Error(msg);
//       }
//       // refresh categories list
//       await fetchCategoriesSafe();
//       toast.success("Category created");
//       setCatModalOpen(false);
//       return data;
//     } catch (err) {
//       console.error("createCategory error:", err);
//       toast.error(err?.message || "Failed to create category");
//       return null;
//     } finally {
//       setCreatingCategory(false);
//     }
//   };

//   // search + pagination
//   const filtered = useMemo(() => {
//     const q = (search || "").trim().toLowerCase();
//     if (!q) return expenses;
//     return expenses.filter((r) => {
//       return (
//         String(r.vendor_name ?? "").toLowerCase().includes(q) ||
//         String(r.description ?? "").toLowerCase().includes(q) ||
//         String(r.amount ?? "").toLowerCase().includes(q) ||
//         String(r.id ?? "").toLowerCase().includes(q)
//       );
//     });
//   }, [expenses, search]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
//   const pageRows = useMemo(() => {
//     const s = (page - 1) * perPage;
//     return filtered.slice(s, s + perPage);
//   }, [filtered, page, perPage]);

//   useEffect(() => {
//     if (page > totalPages) setPage(1);
//   }, [totalPages, page]);

//   const exportCsv = () => {
//     const cols = ["#", "Date", "Bill", "Amount", "Category", "Mode", "Description", "Address"];
//     const lines = [cols.join(",")];
//     filtered.forEach((r, idx) => {
//       const row = [
//         idx + 1,
//         `"${(r.date ?? "").replace(/"/g, '""')}"`,
//         `"${(r.vendor_name ?? "").replace(/"/g, '""')}"`,
//         r.amount ?? 0,
//         `"${String(r.category_id ?? "").replace(/"/g, '""')}"`,
//         `"${String(r.mode ?? "").replace(/"/g, '""')}"`,
//         `"${String(r.description ?? "").replace(/"/g, '""')}"`,
//         `"${String(r.address ?? "").replace(/"/g, '""')}"`,
//       ];
//       lines.push(row.join(","));
//     });
//     const csv = lines.join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold">Expenses</h1>
//           <p className="text-sm text-gray-500">Manage expenses — add/update/delete receipts and details</p>
//         </div>

//         <div className="flex items-center gap-3 w-full md:w-auto">
//           <div className="relative hidden md:block">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by bill, description, amount..."
//               className="pl-10 pr-3 py-2 border rounded-lg w-64"
//             />
//           </div>

//           <button onClick={exportCsv} className="px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 inline-flex items-center gap-2">
//             <Download className="w-4 h-4" />
//             Export
//           </button>

//           <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-flex items-center gap-2">
//             <PlusCircle className="w-4 h-4" />
//             Add Expense
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
//           <div className="md:col-span-2">
//             <label className="block text-sm text-gray-600 mb-1">From</label>
//             <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full p-2 border rounded" onChange={() => {}} />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm text-gray-600 mb-1">To</label>
//             <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full p-2 border rounded" onChange={() => {}} />
//           </div>
//           <div className="md:col-span-3">
//             <label className="block text-sm text-gray-600 mb-1">DC</label>
//             <select className="w-full p-2 border rounded">
//               <option>TS_MAHBADX</option>
//               <option>TS_OTHER</option>
//             </select>
//           </div>
//           <div className="md:col-span-1">
//             <button onClick={() => { setPage(1); void fetchExpenses(); }} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Apply</button>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="overflow-auto">
//           <table className="min-w-full text-left">
//             <thead className="bg-gray-100 text-sm text-gray-700">
//               <tr>
//                 <th className="px-4 py-3">#</th>
//                 <th className="px-4 py-3">Date</th>
//                 <th className="px-4 py-3">Bill</th>
//                 <th className="px-4 py-3">Amount</th>
//                 <th className="px-4 py-3">Category</th>
//                 <th className="px-4 py-3">Mode</th>
//                 <th className="px-4 py-3">Description</th>
//                 <th className="px-4 py-3">Address</th>
//                 <th className="px-4 py-3">Proof</th>
//                 <th className="px-4 py-3">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="text-sm">
//               {loading ? (
//                 <tr>
//                   <td colSpan={10} className="p-8 text-center text-gray-500">
//                     <Loader2 className="animate-spin inline-block mr-2" /> Loading...
//                   </td>
//                 </tr>
//               ) : pageRows.length === 0 ? (
//                 <tr>
//                   <td colSpan={10} className="p-8 text-center text-gray-500">
//                     No expenses found
//                   </td>
//                 </tr>
//               ) : (
//                 pageRows.map((r, idx) => (
//                   <tr key={r.id ?? idx} className="odd:bg-white even:bg-gray-50">
//                     <td className="px-4 py-3">{(page - 1) * perPage + idx + 1}</td>
//                     <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
//                     <td className="px-4 py-3 font-medium">{r.vendor_name ?? "—"}</td>
//                     <td className="px-4 py-3">{formatCurrency(r.amount)}</td>
//                     <td className="px-4 py-3">{r.category_id ?? "—"}</td>
//                     <td className="px-4 py-3">{r.mode ?? "—"}</td>
//                     <td className="px-4 py-3">{r.description ?? "—"}</td>
//                     <td className="px-4 py-3">{r.address ?? "—"}</td>
//                     <td className="px-4 py-3">
//                       {r.proof ? (
//                         // eslint-disable-next-line @next/next/no-img-element
//                         <img src={r.proof} alt="proof" className="h-12 w-20 object-cover rounded border" />
//                       ) : (
//                         <div className="flex items-center gap-2 text-gray-400">
//                           <ImageIcon className="w-4 h-4" />
//                           No proof
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <button onClick={() => openEditModal(r)} disabled={busy} className="p-2 rounded hover:bg-gray-100" title="Edit">
//                           <Edit2 className="w-4 h-4" />
//                         </button>
//                         <button onClick={() => handleDelete(r)} disabled={busy} className="p-2 rounded hover:bg-gray-100 text-red-600" title="Delete">
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         {r.verified && (
//                           <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 flex items-center gap-1">
//                             <Check className="w-3 h-3" /> Verified
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="p-4 flex items-center justify-between">
//           <div className="text-sm text-gray-600">
//             Showing {filtered.length} records — page {page} of {totalPages}
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
//             <div className="px-3 py-1 border rounded">{page}</div>
//             <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
//           </div>
//         </div>
//       </div>

//       {/* Create / Edit Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
//           <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-auto">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold">{editing ? "Edit Expense" : "Add Expense"}</h3>
//               <div className="flex items-center gap-2">
//                 {busy && <div className="text-sm text-gray-500">Processing…</div>}
//                 <button onClick={() => setIsModalOpen(false)} className="p-2 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//               <label className="space-y-1">
//                 <div className="text-sm text-gray-600">Date</div>
//                 <input name="date" type="date" value={form.date} onChange={onChange} className="w-full p-2 border rounded" />
//                 {formErrors.date && <p className="text-xs text-red-600">{formErrors.date}</p>}
//               </label>

//               <label className="space-y-1">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-gray-600">Category</div>
//                   <button type="button" onClick={() => setCatModalOpen(true)} className="text-xs text-indigo-600 hover:underline">+ Add Category</button>
//                 </div>
//                 <div className="relative">
//                   <select name="category_id" value={form.category_id} onChange={onChange} className="w-full p-2 border rounded bg-white">
//                     <option value="">Select category</option>
//                     {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//                 </div>
//                 {formErrors.category_id && <p className="text-xs text-red-600">{formErrors.category_id}</p>}
//               </label>

//               <label className="space-y-1">
//                 <div className="text-sm text-gray-600">Amount</div>
//                 <input name="amount" type="number" value={form.amount} onChange={onChange} className="w-full p-2 border rounded" />
//                 {formErrors.amount && <p className="text-xs text-red-600">{formErrors.amount}</p>}
//               </label>

//               <label className="space-y-1">
//                 <div className="text-sm text-gray-600">Mode</div>
//                 <select name="mode" value={form.mode} onChange={onChange} className="w-full p-2 border rounded">
//                   <option value="cash">Cash</option>
//                   <option value="upi">UPI</option>
//                   <option value="card">Card</option>
//                   <option value="bank">Bank Transfer</option>
//                 </select>
//                 {formErrors.mode && <p className="text-xs text-red-600">{formErrors.mode}</p>}
//               </label>

//               <label className="md:col-span-2 space-y-1">
//                 <div className="text-sm text-gray-600">Bill (vendor name)</div>
//                 <input name="vendor_name" value={form.vendor_name} onChange={onChange} className="w-full p-2 border rounded" placeholder="Bill / vendor name" />
//                 {formErrors.vendor_name && <p className="text-xs text-red-600">{formErrors.vendor_name}</p>}
//               </label>

//               <label className="md:col-span-2 space-y-1">
//                 <div className="text-sm text-gray-600">Description</div>
//                 <textarea name="description" value={form.description} onChange={onChange} className="w-full p-2 border rounded" rows={3} />
//               </label>

//               <label className="space-y-1">
//                 <div className="text-sm text-gray-600">Proof (image / receipt)</div>
//                 <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} className="w-full" />
//                 {previewUrl ? (
//                   <div className="mt-2 flex items-center gap-3">
//                     {previewUrl.endsWith(".pdf") ? (
//                       <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Open file</a>
//                     ) : (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img src={previewUrl} alt="preview" className="h-24 w-36 object-cover rounded border" />
//                     )}
//                     <button type="button" onClick={() => { setPreviewUrl(""); setForm((p)=>({ ...p, proofFile: null })); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-sm text-red-600">Clear</button>
//                   </div>
//                 ) : (
//                   <div className="mt-2 text-sm text-gray-500 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> No proof chosen</div>
//                 )}
//               </label>

//               <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 border-t mt-3">
//                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
//                 <button disabled={busy} type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">{busy ? "Saving…" : editing ? "Update" : "Create"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Category Modal (optional) */}
//       {catModalOpen && (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
//           <div className="w-full max-w-md bg-white rounded-lg shadow">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h3 className="text-lg font-semibold">Add Category</h3>
//               <button onClick={() => setCatModalOpen(false)} className="p-2 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
//             </div>

//             <div className="p-4">
//               <label className="block text-sm text-gray-600 mb-2">Category name</label>
//               <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="e.g. Fuel, Toll" />

//               <div className="flex justify-end gap-2">
//                 <button onClick={() => setCatModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
//                 <button onClick={async () => { await createCategory(newCategoryName); setNewCategoryName(""); }} disabled={creatingCategory || !newCategoryName.trim()} className="px-4 py-2 rounded bg-indigo-600 text-white">
//                   {creatingCategory ? "Creating…" : "Create"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// components/ExpensesPage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  PlusCircle,
  Search,
  Download,
  Calendar,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Check,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/**
 * ExpensesPage.jsx
 *
 * Uses your API base and the exact endpoints/curl shapes you provided:
 *  - GET  /admin/expanses
 *  - POST /admin/expanses/add
 *  - POST /admin/expanses/update/:id
 *  - DELETE /admin/expanses/delete/:id
 *
 * Token is read from localStorage key "token".
 *
 * This component expects backend responses like:
 * { status: true, data: [ { id, date, category_id, amount, mode, vendor_name, description, proof, created_at, updated_at, category: {...} } ] }
 */

const API_BASE = "http://192.168.29.100:8000/api";
const TOKEN_KEY = "token";

/** derive public file base (strip trailing /api if present) */
const FILE_BASE = API_BASE.replace(/\/api\/?$/, "");

const getTokenHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatCurrency = (n) =>
  n === null || n === undefined ? "-" : `₹ ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ExpensesSummary() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category_id: "",
    amount: "",
    mode: "cash",
    vendor_name: "",
    description: "",
    proofFile: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // categories (optional)
  const [categories, setCategories] = useState([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    void fetchExpenses();
    void fetchCategoriesSafe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Fetch expenses (parses your `status/data` shape) ----------
  const fetchExpenses = async () => {
    setLoading(true);
    const tId = toast.loading("Loading expenses...");
    try {
      const res = await fetch(`${API_BASE}/admin/expanses`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...getTokenHeader(),
        },
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message || json?.error || `Failed to load (${res.status})`;
        toast.error(msg);
        throw new Error(msg);
      }

      // Expect { status: true, data: [...] }
      let list = [];
      if (Array.isArray(json)) list = json;
      else if (Array.isArray(json.data)) list = json.data;
      else {
        // Find first array property if shape differs
        const arr = Object.values(json || {}).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) list = arr;
      }

      // Normalize each item and build full proof URL if necessary
      const normalized = list.map((r) => {
        const proofRaw = r.proof_url ?? r.proof ?? null;
        let proof = null;
        if (proofRaw) {
          // if it's already a full url (starts with http), keep it
          if (/^https?:\/\//.test(proofRaw)) proof = proofRaw;
          else {
            // join to file base e.g. http://host/uploads/...
            const clean = proofRaw.replace(/^\/+/, "");
            proof = `${FILE_BASE}/${clean}`;
          }
        }
        return {
          raw: r,
          id: r.id ?? r._id ?? null,
          date: r.date ?? r.spent_on ?? null,
          category_id: r.category_id ?? r.category?.id ?? null,
          category_name: r.category?.name ?? (r.category ?? null) ? String(r.category?.name ?? r.category) : null,
          amount: Number(r.amount ?? r.amt ?? 0),
          mode: r.mode ?? r.payment ?? null,
          vendor_name: r.vendor_name ?? r.requestedBy ?? r.bill ?? r.vendor ?? "",
          description: r.description ?? r.note ?? r.remarks ?? "",
          proof,
          proof_raw: proofRaw,
          created_at: r.created_at ?? r.createdAt ?? null,
          updated_at: r.updated_at ?? r.updatedAt ?? null,
        };
      });

      setExpenses(normalized);
      toast.dismiss(tId);
      toast.success("Expenses loaded");
    } catch (err) {
      console.error("fetchExpenses:", err);
      toast.dismiss();
      toast.error(err?.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Fetch categories (optional, non-fatal) -----------------
  const fetchCategoriesSafe = async () => {
    try {
      // if endpoint differs, adjust accordingly
      const res = await fetch(`${API_BASE}/admin/expanses/categories`, {
        method: "GET",
        headers: { Accept: "application/json", ...getTokenHeader() },
      });
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      if (Array.isArray(list)) {
        setCategories(list.map((c) => ({ id: c.id ?? c._id, name: c.name ?? c.title ?? String(c) })));
      }
    } catch (err) {
      // ignore - optional
      console.warn("fetchCategoriesSafe error:", err);
    }
  };

  // ---------------- client-side validation ----------------
  const validateForm = (values) => {
    const errs = {};
    if (!values.date) errs.date = "Date is required";
    if (!values.category_id) errs.category_id = "Category required";
    if (!values.amount || Number(values.amount) <= 0) errs.amount = "Amount must be greater than 0";
    if (!values.mode) errs.mode = "Mode required";
    if (!values.vendor_name || !values.vendor_name.trim()) errs.vendor_name = "Bill is required";
    return errs;
  };

  // ---------------- open create / edit ----------------
  const openCreateModal = () => {
    setEditing(null);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      category_id: categories.length ? categories[0].id : "",
      amount: "",
      mode: "cash",
      vendor_name: "",
      description: "",
      proofFile: null,
    });
    setPreviewUrl("");
    setFormErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditing(row);
    setForm({
      date: row.date ? row.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      category_id: row.category_id ?? "",
      amount: row.amount ?? "",
      mode: row.mode ?? "cash",
      vendor_name: row.vendor_name ?? "",
      description: row.description ?? "",
      proofFile: null,
    });
    setPreviewUrl(row.proof ?? "");
    setFormErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  // --------------- form handlers ----------------
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, proofFile: f }));
    if (f) {
      try {
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);
      } catch (err) {
        setPreviewUrl("");
      }
    } else {
      setPreviewUrl(editing?.proof ?? "");
    }
  };

  // --------------- create / update ----------------
  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      toast.error("Please fix form errors");
      return;
    }

    const tokenHeader = getTokenHeader();
    if (!tokenHeader.Authorization) {
      toast.error("Not logged in — please login and try again.");
      return;
    }

    setBusy(true);
    const toastId = toast.loading(editing ? "Updating expense..." : "Creating expense...");

    try {
      const fd = new FormData();
      fd.append("date", form.date);
      fd.append("category_id", String(form.category_id ?? ""));
      fd.append("amount", String(form.amount ?? ""));
      fd.append("mode", String(form.mode ?? "cash"));
      fd.append("vendor_name", String(form.vendor_name ?? ""));
      fd.append("description", String(form.description ?? ""));
      if (form.proofFile) fd.append("proof", form.proofFile);

      let res;
      if (editing) {
        // your curl uses POST for update
        res = await fetch(`${API_BASE}/admin/expanses/update/${editing.id}`, {
          method: "POST",
          headers: { ...tokenHeader },
          body: fd,
        });
      } else {
        res = await fetch(`${API_BASE}/admin/expanses/add`, {
          method: "POST",
          headers: { ...tokenHeader },
          body: fd,
        });
      }

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || json?.error || `Request failed (${res.status})`;
        toast.error(msg);
        throw new Error(msg);
      }
      if (json && json.status === false) {
        const msg = json.message || "Operation failed";
        toast.error(msg);
        throw new Error(msg);
      }

      toast.dismiss(toastId);
      toast.success(editing ? "Expense updated" : "Expense created");
      await fetchExpenses();
      setIsModalOpen(false);
    } catch (err) {
      console.error("handleSubmit:", err);
      toast.dismiss();
      toast.error(err?.message || "Failed to save expense");
    } finally {
      setBusy(false);
    }
  };

  // --------------- delete ----------------
  const handleDelete = async (row) => {
    if (!row?.id) {
      toast.error("Invalid expense selected");
      return;
    }
    if (!confirm("Delete this expense? This action cannot be undone.")) return;
    const tokenHeader = getTokenHeader();
    if (!tokenHeader.Authorization) {
      toast.error("Not logged in — please login and try again.");
      return;
    }
    setBusy(true);
    const tId = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_BASE}/admin/expanses/delete/${row.id}`, {
        method: "DELETE",
        headers: { ...tokenHeader },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || json?.error || `Delete failed (${res.status})`;
        toast.error(msg);
        throw new Error(msg);
      }
      toast.dismiss(tId);
      toast.success("Deleted");
      await fetchExpenses();
    } catch (err) {
      console.error("handleDelete:", err);
      toast.dismiss();
      toast.error(err?.message || "Failed to delete");
    } finally {
      setBusy(false);
    }
  };

  // --------------- categories create (optional) ----------------
  const createCategory = async (name) => {
    if (!name || !name.trim()) {
      toast.error("Category name required");
      return null;
    }
    setCreatingCategory(true);
    try {
      // best-effort endpoint - change if your backend differs
      const f = new FormData();
      f.append("name", name.trim());
      const res = await fetch(`${API_BASE}/admin/expanses/categories/add`, {
        method: "POST",
        headers: { ...getTokenHeader() },
        body: f,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || json?.error || `Create category failed (${res.status})`;
        toast.error(msg);
        throw new Error(msg);
      }
      await fetchCategoriesSafe();
      setCatModalOpen(false);
      toast.success("Category created");
      return json;
    } catch (err) {
      console.error("createCategory:", err);
      toast.error(err?.message || "Failed to create category");
      return null;
    } finally {
      setCreatingCategory(false);
    }
  };

  // --------------- search/pagination helpers ----------------
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((r) => {
      return (
        String(r.vendor_name ?? "").toLowerCase().includes(q) ||
        String(r.description ?? "").toLowerCase().includes(q) ||
        String(r.amount ?? "").toLowerCase().includes(q) ||
        String(r.id ?? "").toLowerCase().includes(q)
      );
    });
  }, [expenses, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const exportCsv = () => {
    const cols = ["#", "Date", "Category", "Category ID", "Amount", "Mode", "Bill", "Description", "Proof", "Created At", "Updated At"];
    const lines = [cols.join(",")];
    filtered.forEach((r, i) => {
      const row = [
        i + 1,
        `"${r.date ?? ""}"`,
        `"${(r.category_name ?? "").replace(/"/g, '""')}"`,
        `"${String(r.category_id ?? "")}"`,
        r.amount ?? 0,
        `"${String(r.mode ?? "").replace(/"/g, '""')}"`,
        `"${(r.vendor_name ?? "").replace(/"/g, '""')}"`,
        `"${(r.description ?? "").replace(/"/g, '""')}"`,
        `"${String(r.proof_raw ?? "").replace(/"/g, '""')}"`,
        `"${r.created_at ?? ""}"`,
        `"${r.updated_at ?? ""}"`,
      ];
      lines.push(row.join(","));
    });
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------------------------------ render --------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-sm text-gray-500">Manage expenses — add/update/delete receipts and details</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bill, description, amount..."
              className="pl-10 pr-3 py-2 border rounded-lg w-64"
            />
          </div>

          <button onClick={exportCsv} className="px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>

          <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters (kept simple) */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">From</label>
            <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full p-2 border rounded" onChange={() => {}} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">To</label>
            <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full p-2 border rounded" onChange={() => {}} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-1">DC</label>
            <select className="w-full p-2 border rounded">
              <option>TS_MAHBADX</option>
              <option>TS_OTHER</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <button onClick={() => { setPage(1); void fetchExpenses(); }} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Apply</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Category ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Bill</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                pageRows.map((r, idx) => (
                  <tr key={r.id ?? idx} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-3">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">{r.category_name ?? "—"}</td>
                    <td className="px-4 py-3">{r.category_id ?? "—"}</td>
                    <td className="px-4 py-3">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-3">{r.mode ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.vendor_name ?? "—"}</td>
                    <td className="px-4 py-3">{r.description ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.proof ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.proof} alt="proof" className="h-12 w-20 object-cover rounded border" />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400"><ImageIcon className="w-4 h-4" /> No proof</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">{r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(r)} disabled={busy} className="p-2 rounded hover:bg-gray-100" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r)} disabled={busy} className="p-2 rounded hover:bg-gray-100 text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {r.raw?.verified && (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filtered.length} records — page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
            <div className="px-3 py-1 border rounded">{page}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{editing ? "Edit Expense" : "Add Expense"}</h3>
              <div className="flex items-center gap-2">
                {busy && <div className="text-sm text-gray-500">Processing…</div>}
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm text-gray-600">Date</div>
                <input name="date" type="datetime-local" value={form.date + "T00:00"} onChange={onChange} className="w-full p-2 border rounded" />
                {formErrors.date && <p className="text-xs text-red-600">{formErrors.date}</p>}
              </label>

              <label className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Category</div>
                  <button type="button" onClick={() => setCatModalOpen(true)} className="text-xs text-indigo-600 hover:underline">+ Add Category</button>
                </div>
                <div className="relative">
                  <select name="category_id" value={form.category_id} onChange={onChange} className="w-full p-2 border rounded bg-white">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {formErrors.category_id && <p className="text-xs text-red-600">{formErrors.category_id}</p>}
              </label>

              <label className="space-y-1">
                <div className="text-sm text-gray-600">Amount</div>
                <input name="amount" type="number" step="0.01" value={form.amount} onChange={onChange} className="w-full p-2 border rounded" />
                {formErrors.amount && <p className="text-xs text-red-600">{formErrors.amount}</p>}
              </label>

              <label className="space-y-1">
                <div className="text-sm text-gray-600">Mode</div>
                <select name="mode" value={form.mode} onChange={onChange} className="w-full p-2 border rounded">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                {formErrors.mode && <p className="text-xs text-red-600">{formErrors.mode}</p>}
              </label>

              <label className="md:col-span-2 space-y-1">
                <div className="text-sm text-gray-600">Bill (vendor name)</div>
                <input name="vendor_name" value={form.vendor_name} onChange={onChange} className="w-full p-2 border rounded" placeholder="Bill / vendor name" />
                {formErrors.vendor_name && <p className="text-xs text-red-600">{formErrors.vendor_name}</p>}
              </label>

              <label className="md:col-span-2 space-y-1">
                <div className="text-sm text-gray-600">Description</div>
                <textarea name="description" value={form.description} onChange={onChange} className="w-full p-2 border rounded" rows={3} />
              </label>

              <label className="space-y-1">
                <div className="text-sm text-gray-600">Proof (image / receipt)</div>
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={onFileChange} className="w-full" />
                {previewUrl ? (
                  <div className="mt-2 flex items-center gap-3">
                    {String(previewUrl).toLowerCase().endsWith(".pdf") ? (
                      <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Open file</a>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="preview" className="h-24 w-36 object-cover rounded border" />
                    )}
                    <button type="button" onClick={() => { setPreviewUrl(""); setForm((p) => ({ ...p, proofFile: null })); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-sm text-red-600">Clear</button>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> No proof chosen</div>
                )}
              </label>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 border-t mt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button disabled={busy} type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">{busy ? "Saving…" : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal (optional) */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Category</h3>
              <button onClick={() => setCatModalOpen(false)} className="p-2 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4">
              <label className="block text-sm text-gray-600 mb-2">Category name</label>
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="e.g. Fuel, Toll" />

              <div className="flex justify-end gap-2">
                <button onClick={() => setCatModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={async () => { await createCategory(newCategoryName); setNewCategoryName(""); }} disabled={creatingCategory || !newCategoryName.trim()} className="px-4 py-2 rounded bg-indigo-600 text-white">
                  {creatingCategory ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesSummary


