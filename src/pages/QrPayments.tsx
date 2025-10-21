// import React, { useEffect, useMemo, useState } from "react";
// import api from "../api/axios";

// /** Dummy rows for Online; both tabs are replaced by API on load if available */
// const SAMPLE_PAYMENTS = [
//   // ONLINE (placeholder)
//   {
//     id: "PAY-1001",
//     date: "2025-09-12",
//     amount: 1250,
//     status: "Completed",
//     channel: "online" as const,
//     customerName: "Priya",
//     customerPhone: "9876500000",
//     payment: "upi",
//     address: "Hyderabad, TS",
//     items: [{ product_id: 1, name: "Sample A", qty: 1, price: 1250 }],
//   },
//   {
//     id: "PAY-1002",
//     date: "2025-09-11",
//     amount: 1200,
//     status: "Pending",
//     channel: "online" as const,
//     customerName: "Rahul",
//     customerPhone: "9876511111",
//     payment: "card",
//     address: "Bengaluru, KA",
//     items: [{ product_id: 2, name: "Sample B", qty: 1, price: 1200 }],
//   },

//   // OFFLINE (placeholder)
//   {
//     id: "PAY-1004",
//     date: "2025-09-10",
//     amount: 1800,
//     status: "Completed",
//     channel: "offline" as const,
//     customerName: "—",
//     customerPhone: "—",
//     payment: "cash",
//     address: "-",
//     items: [{ product_id: 3, name: "Placeholder", qty: 1, price: 1800 }],
//   },
//   {
//     id: "PAY-1005",
//     date: "2025-09-09",
//     amount: 1980,
//     status: "Completed",
//     channel: "offline" as const,
//     customerName: "—",
//     customerPhone: "—",
//     payment: "cash",
//     address: "-",
//     items: [{ product_id: 4, name: "Placeholder", qty: 1, price: 1980 }],
//   },
// ];

// type Item = { product_id?: number | string; name: string; qty: number; price: number };

// type Row = {
//   id: string;
//   date: string; // order_time_formatted or ISO
//   amount: number;
//   status: string; // kept internally for Accept/Reject, but NOT displayed
//   channel: "online" | "offline";
//   customerName?: string;
//   customerPhone?: string;
//   payment?: string;
//   address?: string | null;
//   items?: Item[];
//   subtotal?: number;
//   gst_percent?: number;
//   gst_amount?: number;
//   discount_type?: string;
//   discount_value?: number;
// };

// const formatCurrency = (n: number) =>
//   typeof n === "number" ? n.toLocaleString("en-IN") : (n as any) ?? "-";

// export default function QrPayments() {
//   const [rows, setRows] = useState<Row[]>(SAMPLE_PAYMENTS);
//   const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
//   const [selected, setSelected] = useState<Row | null>(null);

//   const [loadingOffline, setLoadingOffline] = useState(false);
//   const [offlineError, setOfflineError] = useState<string | null>(null);

//   const [loadingOnline, setLoadingOnline] = useState(false);
//   const [onlineError, setOnlineError] = useState<string | null>(null);

//   // safe JSON parser for "items" which may be a stringified array
//   const safeParseItems = (raw: any): Item[] => {
//     try {
//       if (Array.isArray(raw)) return raw as Item[];
//       if (typeof raw === "string") {
//         const parsed = JSON.parse(raw);
//         if (Array.isArray(parsed)) return parsed as Item[];
//       }
//     } catch {
//       // ignore
//     }
//     return [];
//   };

//   // ---- Fetch OFFLINE sales from API ----
//   useEffect(() => {
//     let mounted = true;

//     async function fetchOffline() {
//       setLoadingOffline(true);
//       setOfflineError(null);
//       try {
//         const res = await api.get("/admin/pos-orders");
//         // If your axios instance doesn't set auth:
//         // const res = await api.get("/admin/pos-orders", { headers: { Authorization: "Bearer <TOKEN>" } });

//         const apiRows: any[] = res?.data?.data?.data ?? [];
//         const offlineRows: Row[] = apiRows.map((o: any) => {
//           const items = safeParseItems(o.items);
//           return {
//             id: String(o.id),
//             date: o.order_time_formatted || o.order_time || "",
//             amount: Number(o.total ?? 0),
//             status: "Completed",
//             channel: "offline",
//             customerName: o.customer_name || "-",
//             customerPhone: o.customer_phone || "-",
//             payment: o.payment || "-",
//             address: o.address ?? "-",
//             items,
//             subtotal: Number(o.subtotal ?? 0),
//             gst_percent: Number(o.gst_percent ?? 0),
//             gst_amount: Number(o.gst_amount ?? 0),
//             discount_type: o.discount_type ?? undefined,
//             discount_value: Number(o.discount_value ?? 0),
//           };
//         });

//         if (!mounted) return;

//         setRows((prev) => {
//           const onlineOnly = prev.filter((r) => r.channel === "online");
//           return [...onlineOnly, ...offlineRows];
//         });
//       } catch (err: any) {
//         if (!mounted) return;
//         setOfflineError(err?.message || "Failed to load offline sales");
//       } finally {
//         if (mounted) setLoadingOffline(false);
//       }
//     }

//     fetchOffline();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ---- Fetch ONLINE orders from API ----
//   useEffect(() => {
//     let mounted = true;

//     async function fetchOnline() {
//       setLoadingOnline(true);
//       setOnlineError(null);
//       try {
//         const res = await api.get("/admin/online-orders");
//         // If your axios instance doesn't set auth:
//         // const res = await api.get("/admin/online-orders", { headers: { Authorization: "Bearer <TOKEN>" } });

//         // Assuming same shape as offline response (from your provided POS payload)
//         const apiRows: any[] = res?.data?.data?.data ?? res?.data?.data ?? [];

//         const onlineRows: Row[] = apiRows.map((o: any) => {
//           const items = safeParseItems(o.items);
//           return {
//             id: String(o.id),
//             date: o.order_time_formatted || o.order_time || "",
//             amount: Number(o.total ?? 0),
//             // keep status internally for Accept/Reject disable, but DO NOT display it in UI
//             status: "Pending",
//             channel: "online",
//             customerName: o.customer_name || "-",
//             customerPhone: o.customer_phone || "-",
//             payment: o.payment || "-",
//             address: o.address ?? "-",
//             items,
//             subtotal: Number(o.subtotal ?? 0),
//             gst_percent: Number(o.gst_percent ?? 0),
//             gst_amount: Number(o.gst_amount ?? 0),
//             discount_type: o.discount_type ?? undefined,
//             discount_value: Number(o.discount_value ?? 0),
//           };
//         });

//         if (!mounted) return;

//         setRows((prev) => {
//           const offlineOnly = prev.filter((r) => r.channel === "offline");
//           return [...onlineRows, ...offlineOnly];
//         });
//       } catch (err: any) {
//         if (!mounted) return;
//         setOnlineError(err?.message || "Failed to load online orders");
//       } finally {
//         if (mounted) setLoadingOnline(false);
//       }
//     }

//     fetchOnline();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const channelRows = useMemo(
//     () => rows.filter((r) => r.channel === activeTab),
//     [rows, activeTab]
//   );

//   const onlineCount = rows.filter((r) => r.channel === "online").length;
//   const offlineCount = rows.filter((r) => r.channel === "offline").length;

//   // Local Accept/Reject (no UI status shown; used only to disable buttons)
//   function updateStatus(id: string, nextStatus: "Accepted" | "Rejected") {
//     setRows((prev) =>
//       prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
//     );
//     setSelected((sel) => (sel && sel.id === id ? { ...sel, status: nextStatus } : sel));
//   }

//   const renderItemsSummary = (r: Row) => {
//     const items = r.items ?? [];
//     if (!items.length) return <span className="text-gray-400">No items</span>;
//     return (
//       <div className="text-xs text-gray-700 space-y-1 max-h-16 overflow-auto">
//         {items.map((it, idx) => (
//           <div key={`${r.id}-it-${idx}`} className="flex justify-between gap-2">
//             <span className="truncate">{it.name} × {it.qty}</span>
//             <span className="ml-2 whitespace-nowrap">₹{formatCurrency(Number(it.price || 0) * Number(it.qty || 0))}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
//       <div className="max-w-screen-2xl mx-auto">
//         {/* Tabs */}
//         <div className="mb-4">
//           <div className="inline-flex w-full sm:w-auto rounded-lg border bg-white overflow-hidden">
//             <button
//               onClick={() => setActiveTab("online")}
//               className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-r ${
//                 activeTab === "online"
//                   ? "bg-emerald-600 text-white"
//                   : "bg-white text-emerald-700 hover:bg-emerald-50"
//               }`}
//             >
//               Online ({onlineCount})
//             </button>
//             <button
//               onClick={() => setActiveTab("offline")}
//               className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
//                 activeTab === "offline"
//                   ? "bg-emerald-600 text-white"
//                   : "bg-white text-emerald-700 hover:bg-emerald-50"
//               }`}
//             >
//               Offline ({offlineCount})
//             </button>
//           </div>
//         </div>

//         {/* Table area */}
//         <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//           {/* Header */}
//           <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800">
//                 {activeTab === "online" ? "Online Payments" : "Offline Payments"}
//               </h3>
//               <div className="text-xs sm:text-sm text-gray-600">
//                 Showing <span className="font-medium">{channelRows.length}</span> records
//               </div>
//             </div>

//             {/* loader/error indicators per tab */}
//             {activeTab === "offline" && (
//               <div className="mt-1">
//                 {loadingOffline && <span className="text-xs text-gray-500">Loading offline sales…</span>}
//                 {!loadingOffline && offlineError && <span className="text-xs text-red-600">{offlineError}</span>}
//               </div>
//             )}
//             {activeTab === "online" && (
//               <div className="mt-1">
//                 {loadingOnline && <span className="text-xs text-gray-500">Loading online orders…</span>}
//                 {!loadingOnline && onlineError && <span className="text-xs text-red-600">{onlineError}</span>}
//               </div>
//             )}
//           </div>

//           {/* Desktop/Tablet Table (md+) */}
//           <div className="hidden md:block p-4 overflow-x-auto">
//             <table className="min-w-[960px] w-full table-auto divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                   {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th> */}
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
//                   <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>

//                   {/* ONLINE: Action | OFFLINE: Items */}
//                   {activeTab === "online" ? (
//                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//                   ) : (
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
//                   )}
//                 </tr>
//               </thead>

//               <tbody className="bg-white divide-y divide-gray-100">
//                 {channelRows.map((r, i) => (
//                   <tr key={r.id} className="odd:bg-white even:bg-gray-50 align-top">
//                     <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
//                     <td className="px-4 py-3 text-sm text-gray-800 font-medium break-all">{r.id}</td>
//                     <td className="px-4 py-3 text-sm text-gray-700">{r.customerName || "-"}</td>
//                     {/* <td className="px-4 py-3 text-sm text-gray-700">{r.customerPhone || "-"}</td> */}
//                     <td className="px-4 py-3 text-sm text-gray-700">{r.date}</td>
//                     <td className="px-4 py-3 text-sm text-gray-700 capitalize">{r.payment || "-"}</td>
//                     <td className="px-4 py-3 text-sm text-right text-gray-700">₹{formatCurrency(r.amount)}</td>

//                     {r.channel === "online" ? (
//                       <td className="px-4 py-3 text-sm">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             type="button"
//                             onClick={() => setSelected(r)}
//                             className="inline-flex items-center px-3 py-1 border border-gray-200 rounded text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none"
//                           >
//                             View
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => updateStatus(r.id, "Accepted")}
//                             disabled={r.status === "Accepted"}
//                             className={`inline-flex items-center px-3 py-1 rounded text-sm border focus:outline-none ${
//                               r.status === "Accepted"
//                                 ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
//                                 : "bg-green-600 text-white border-green-600 hover:bg-green-700"
//                             }`}
//                             title="Mark as Accepted"
//                           >
//                             Accept
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => updateStatus(r.id, "Rejected")}
//                             disabled={r.status === "Rejected"}
//                             className={`inline-flex items-center px-3 py-1 rounded text-sm border focus:outline-none ${
//                               r.status === "Rejected"
//                                 ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
//                                 : "bg-red-600 text-white border-red-600 hover:bg-red-700"
//                             }`}
//                             title="Mark as Rejected"
//                           >
//                             Reject
//                           </button>
//                         </div>
//                       </td>
//                     ) : (
//                       <td className="px-4 py-3 text-sm">
//                         {/* {renderItemsSummary(r)} */}
//                         <div className="mt-2">
//                           <button
//                             type="button"
//                             onClick={() => setSelected(r)}
//                             className="inline-flex items-center px-3 py-1 border border-gray-200 rounded text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none"
//                           >
//                             View
//                           </button>
//                         </div>
//                       </td>
//                     )}
//                   </tr>
//                 ))}

//                 {channelRows.length === 0 && (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
//                       No {activeTab} payments yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Card List (md:hidden) */}
//           <div className="md:hidden p-3 space-y-3">
//             {channelRows.map((r, i) => (
//               <div key={r.id} className="border rounded-lg p-3 bg-white shadow-sm">
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="min-w-0">
//                     <div className="text-xs text-gray-500">#{i + 1} • {r.payment || "-"}</div>
//                     <div className="text-sm font-semibold text-gray-900 break-all">{r.id}</div>
//                     <div className="text-xs text-gray-500 mt-0.5">{r.date}</div>
//                     <div className="text-xs text-gray-600 mt-1">
//                       <span className="font-medium">{r.customerName || "-"}</span>{" "}
//                       • {r.customerPhone || "-"}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-sm font-semibold">₹{formatCurrency(r.amount)}</div>
//                   </div>
//                 </div>

//                 {/* OFFLINE: show items list; ONLINE: show actions */}
//                 {r.channel === "offline" ? (
//                   <div className="mt-3">
//                     <div className="text-xs font-semibold mb-1">Items</div>
//                     <div className="rounded border p-2 space-y-1 max-h-28 overflow-auto">
//                       {(r.items ?? []).length === 0 && (
//                         <div className="text-[11px] text-gray-400">No items</div>
//                       )}
//                       {(r.items ?? []).map((it, idx) => (
//                         <div key={`${r.id}-m-${idx}`} className="text-[11px] flex justify-between gap-2">
//                           <span className="truncate">{it.name} × {it.qty}</span>
//                           <span className="whitespace-nowrap">
//                             ₹{formatCurrency(Number(it.price || 0) * Number(it.qty || 0))}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="mt-2">
//                       <button
//                         type="button"
//                         onClick={() => setSelected(r)}
//                         className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded text-xs text-indigo-600 hover:bg-indigo-50 focus:outline-none w-full"
//                       >
//                         View
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="mt-3 grid grid-cols-3 gap-2">
//                     <button
//                       type="button"
//                       onClick={() => setSelected(r)}
//                       className="col-span-1 inline-flex items-center justify-center px-2 py-2 border border-gray-200 rounded text-xs text-indigo-600 hover:bg-indigo-50 focus:outline-none"
//                     >
//                       View
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => updateStatus(r.id, "Accepted")}
//                       disabled={r.status === "Accepted"}
//                       className={`col-span-1 inline-flex items-center justify-center px-2 py-2 rounded text-xs border focus:outline-none ${
//                         r.status === "Accepted"
//                           ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
//                           : "bg-green-600 text-white border-green-600 hover:bg-green-700"
//                       }`}
//                       title="Mark as Accepted"
//                     >
//                       Accept
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => updateStatus(r.id, "Rejected")}
//                       disabled={r.status === "Rejected"}
//                       className={`col-span-1 inline-flex items-center justify-center px-2 py-2 rounded text-xs border focus:outline-none ${
//                         r.status === "Rejected"
//                           ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
//                           : "bg-red-600 text-white border-red-600 hover:bg-red-700"
//                       }`}
//                       title="Mark as Rejected"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}

//             {channelRows.length === 0 && (
//               <div className="text-center text-sm text-gray-500 py-8">
//                 No {activeTab} payments yet.
//               </div>
//             )}
//           </div>

//           {/* Footer: total */}
//           <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//             <div className="text-xs sm:text-sm text-gray-600">
//               Channel: <span className="font-medium capitalize">{activeTab}</span>
//             </div>
//             <div className="text-xs sm:text-sm text-gray-600">
//               Total Amount:{" "}
//               <span className="font-semibold">
//                 ₹
//                 {formatCurrency(
//                   channelRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
//                 )}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {selected && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
//           <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 z-10">
//             <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
//               <h2 className="text-base sm:text-lg font-semibold">Payment Details</h2>
//               <button
//                 onClick={() => setSelected(null)}
//                 className="px-3 py-1 rounded border text-xs sm:text-sm hover:bg-gray-50"
//               >
//                 Close
//               </button>
//             </div>

//             {/* Top summary (no status displayed) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Payment ID</div>
//                 <div className="text-sm sm:text-base font-medium break-all">{selected.id}</div>
//               </div>
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Channel</div>
//                 <div className="text-sm sm:text-base font-medium capitalize">{selected.channel}</div>
//               </div>
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Date</div>
//                 <div className="text-sm sm:text-base font-medium">{selected.date}</div>
//               </div>
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Total Payment</div>
//                 <div className="text-sm sm:text-base font-semibold">₹{formatCurrency(selected.amount)}</div>
//               </div>
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Payment Method</div>
//                 <div className="text-sm sm:text-base font-medium capitalize">{selected.payment || "-"}</div>
//               </div>
//             </div>

//             {/* Customer & Address */}
//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <div className="text-[11px] sm:text-xs text-gray-500">Customer Name</div>
//                 <div className="text-sm sm:text-base font-medium">{selected.customerName || "-"}</div>
//               </div>
//               <div>
//                 {/* <div className="text-[11px] sm:text-xs text-gray-500">Phone</div> */}
//                 <div className="text-sm sm:text-base font-medium">{selected.customerPhone || "-"}</div>
//               </div>
//               <div className="sm:col-span-2">
//                 <div className="text-[11px] sm:text-xs text-gray-500">Address</div>
//                 <div className="text-sm sm:text-base">{selected.address || "-"}</div>
//               </div>
//             </div>

//             {/* Items */}
//             <div className="mt-4">
//               <div className="text-sm sm:text-base font-semibold mb-2">Items</div>
//               <div className="rounded-lg border overflow-hidden">
//                 <table className="w-full text-xs sm:text-sm">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="text-left px-3 py-2">Name</th>
//                       <th className="text-left px-3 py-2">Qty</th>
//                       <th className="text-right px-3 py-2">Price (₹)</th>
//                       <th className="text-right px-3 py-2">Total (₹)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {(selected.items ?? []).map((it, idx) => (
//                       <tr key={`${selected.id}-it-${idx}`} className="border-t">
//                         <td className="px-3 py-2">{it.name}</td>
//                         <td className="px-3 py-2">{it.qty}</td>
//                         <td className="px-3 py-2 text-right">₹{formatCurrency(Number(it.price || 0))}</td>
//                         <td className="px-3 py-2 text-right">₹{formatCurrency(Number(it.price || 0) * Number(it.qty || 0))}</td>
//                       </tr>
//                     ))}
//                     {(selected.items ?? []).length === 0 && (
//                       <tr>
//                         <td colSpan={4} className="px-3 py-4 text-center text-gray-500">No items found</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Optional breakdown if present */}
//               {(typeof selected.subtotal === "number" ||
//                 typeof selected.gst_amount === "number" ||
//                 typeof selected.discount_value === "number") && (
//                 <div className="mt-3 text-xs sm:text-sm text-gray-700">
//                   <div className="flex items-center justify-between">
//                     <span>Subtotal</span>
//                     <span>₹{formatCurrency(Number(selected.subtotal || 0))}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>GST {selected.gst_percent ? `(${selected.gst_percent}%)` : ""}</span>
//                     <span>₹{formatCurrency(Number(selected.gst_amount || 0))}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Discount {selected.discount_type ? `(${selected.discount_type})` : ""}</span>
//                     <span>- ₹{formatCurrency(Number(selected.discount_value || 0))}</span>
//                   </div>
//                   <div className="flex items-center justify-between font-semibold mt-1">
//                     <span>Total</span>
//                     <span>₹{formatCurrency(Number(selected.amount || 0))}</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Admin actions inside modal — ONLY for ONLINE (status not shown anywhere) */}
//             {selected.channel === "online" && (
//               <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={() => updateStatus(selected.id, "Rejected")}
//                   disabled={selected.status === "Rejected"}
//                   className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm border focus:outline-none ${
//                     selected.status === "Rejected"
//                       ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
//                       : "bg-red-600 text-white border-red-600 hover:bg-red-700"
//                   }`}
//                 >
//                   Reject
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => updateStatus(selected.id, "Accepted")}
//                   disabled={selected.status === "Accepted"}
//                   className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm border focus:outline-none ${
//                     selected.status === "Accepted"
//                       ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
//                       : "bg-green-600 text-white border-green-600 hover:bg-green-700"
//                   }`}
//                 >
//                   Accept
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

/** Dummy rows for Online; both tabs are replaced by API on load if available */
const SAMPLE_PAYMENTS = [
  // ONLINE (placeholder)
  {
    id: "PAY-1001",
    date: "2025-09-12",
    amount: 1250,
    status: "Completed",
    channel: "online" as const,
    customerName: "Priya",
    customerPhone: "9876500000",
    payment: "upi",
    address: "Hyderabad, TS",
    items: [{ product_id: 1, name: "Sample A", qty: 1, price: 1250 }],
  },
  {
    id: "PAY-1002",
    date: "2025-09-11",
    amount: 1200,
    status: "Pending",
    channel: "online" as const,
    customerName: "Rahul",
    customerPhone: "9876511111",
    payment: "card",
    address: "Bengaluru, KA",
    items: [{ product_id: 2, name: "Sample B", qty: 1, price: 1200 }],
  },

  // OFFLINE (placeholder)
  {
    id: "PAY-1004",
    date: "2025-09-10",
    amount: 1800,
    status: "Completed",
    channel: "offline" as const,
    customerName: "—",
    customerPhone: "—",
    payment: "cash",
    address: "-",
    items: [{ product_id: 3, name: "Placeholder", qty: 1, price: 1800 }],
  },
  {
    id: "PAY-1005",
    date: "2025-09-09",
    amount: 1980,
    status: "Completed",
    channel: "offline" as const,
    customerName: "—",
    customerPhone: "—",
    payment: "cash",
    address: "-",
    items: [{ product_id: 4, name: "Placeholder", qty: 1, price: 1980 }],
  },
];

type Item = { product_id?: number | string; name: string; qty: number; price: number };

type Row = {
  id: string;
  date: string; // order_time_formatted or ISO
  amount: number;
  status: string; // kept internally for Accept/Reject, but NOT displayed
  channel: "online" | "offline";
  customerName?: string;
  customerPhone?: string;
  payment?: string;
  address?: string | null;
  items?: Item[];
  subtotal?: number;
  gst_percent?: number;
  gst_amount?: number;
  discount_type?: string;
  discount_value?: number;
};

const formatCurrency = (n: number) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : (n as any) ?? "-";

/* ---------------------- NEW: resilient item parsing ---------------------- */

const toNumber = (v: any): number => {
  const n = Number(
    typeof v === "string" ? v.replace?.(/[,₹\s]/g, "") : v
  );
  return Number.isFinite(n) ? n : 0;
};

const ensureArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed);
    } catch {
      return [];
    }
  }
  if (val && typeof val === "object") return Object.values(val);
  return [];
};

/** Normalize any item shape to { name, qty, price } */
const normalizeItem = (raw: any): Item => {
  const name =
    raw?.name ??
    raw?.product_name ??
    raw?.title ??
    raw?.product ??
    "Item";

  const qty = toNumber(
    raw?.qty ?? raw?.quantity ?? raw?.qty_count ?? raw?.count ?? 1
  );

  // Prefer explicit unit price; otherwise infer from total/amount ÷ qty
  let price = toNumber(
    raw?.price ??
      raw?.unit_price ??
      raw?.rate ??
      raw?.price_per_unit ??
      undefined
  );
  if (!price) {
    const totalLike = toNumber(raw?.total ?? raw?.amount ?? raw?.line_total);
    price = qty ? totalLike / qty : totalLike;
  }

  return {
    product_id: raw?.product_id ?? raw?.id,
    name: String(name),
    qty: qty || 1,
    price: price || 0,
  };
};

/** Extract & normalize items from an order object that might use different keys */
const extractItems = (o: any): Item[] => {
  const candidates = [
    o?.items,
    o?.order_items,
    o?.products,
    o?.lines,
    o?.details,
    o?.cart,
  ];

  for (const c of candidates) {
    const arr = ensureArray(c);
    if (arr.length) return arr.map(normalizeItem);
  }
  return [];
};

/* ----------------------------------------------------------------------- */

export default function QrPayments() {
  const [rows, setRows] = useState<Row[]>(SAMPLE_PAYMENTS);
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online");
  const [selected, setSelected] = useState<Row | null>(null);

  const [loadingOffline, setLoadingOffline] = useState(false);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  const [loadingOnline, setLoadingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  // ---- Fetch OFFLINE sales from API ----
  useEffect(() => {
    let mounted = true;

    async function fetchOffline() {
      setLoadingOffline(true);
      setOfflineError(null);
      try {
        const res = await api.get("/admin/pos-orders");

        const apiRows: any[] = res?.data?.data?.data ?? [];
        const offlineRows: Row[] = apiRows.map((o: any) => {
          const items = extractItems(o);
          return {
            id: String(o.id),
            date: o.order_time_formatted || o.order_time || "",
            amount: toNumber(o.total ?? 0),
            status: "Completed",
            channel: "offline",
            customerName: o.customer_name || "-",
            customerPhone: o.customer_phone || "-",
            payment: o.payment || "-",
            address: o.address ?? "-",
            items,
            subtotal: toNumber(o.subtotal ?? 0),
            gst_percent: toNumber(o.gst_percent ?? 0),
            gst_amount: toNumber(o.gst_amount ?? 0),
            discount_type: o.discount_type ?? undefined,
            discount_value: toNumber(o.discount_value ?? 0),
          };
        });

        if (!mounted) return;

        setRows((prev) => {
          const onlineOnly = prev.filter((r) => r.channel === "online");
          return [...onlineOnly, ...offlineRows];
        });
      } catch (err: any) {
        if (!mounted) return;
        setOfflineError(err?.message || "Failed to load offline sales");
      } finally {
        if (mounted) setLoadingOffline(false);
      }
    }

    fetchOffline();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Fetch ONLINE orders from API ----
  useEffect(() => {
    let mounted = true;

    async function fetchOnline() {
      setLoadingOnline(true);
      setOnlineError(null);
      try {
        const res = await api.get("/admin/online-orders");

        const apiRows: any[] = res?.data?.data?.data ?? res?.data?.data ?? [];

        const onlineRows: Row[] = apiRows.map((o: any) => {
          const items = extractItems(o);
          return {
            id: String(o.id),
            date: o.order_time_formatted || o.order_time || "",
            amount: toNumber(o.total ?? 0),
            status: "Pending",
            channel: "online",
            customerName: o.customer_name || "-",
            customerPhone: o.customer_phone || "-",
            payment: o.payment || "-",
            address: o.address ?? "-",
            items,
            subtotal:
              toNumber(o.subtotal) ||
              items.reduce((s, it) => s + (toNumber(it.price) * toNumber(it.qty)), 0),
            gst_percent: toNumber(o.gst_percent ?? 0),
            gst_amount: toNumber(o.gst_amount ?? 0),
            discount_type: o.discount_type ?? undefined,
            discount_value: toNumber(o.discount_value ?? 0),
          };
        });

        if (!mounted) return;

        setRows((prev) => {
          const offlineOnly = prev.filter((r) => r.channel === "offline");
          return [...onlineRows, ...offlineOnly];
        });
      } catch (err: any) {
        if (!mounted) return;
        setOnlineError(err?.message || "Failed to load online orders");
      } finally {
        if (mounted) setLoadingOnline(false);
      }
    }

    fetchOnline();
    return () => {
      mounted = false;
    };
  }, []);

  const channelRows = useMemo(
    () => rows.filter((r) => r.channel === activeTab),
    [rows, activeTab]
  );

  const onlineCount = rows.filter((r) => r.channel === "online").length;
  const offlineCount = rows.filter((r) => r.channel === "offline").length;

  // Local Accept/Reject (no UI status shown; used only to disable buttons)
  function updateStatus(id: string, nextStatus: "Accepted" | "Rejected") {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
    setSelected((sel) => (sel && sel.id === id ? { ...sel, status: nextStatus } : sel));
  }

  const renderItemsSummary = (r: Row) => {
    const items = r.items ?? [];
    if (!items.length) return <span className="text-gray-400">No items</span>;
    return (
      <div className="text-xs text-gray-700 space-y-1 max-h-16 overflow-auto">
        {items.map((it, idx) => (
          <div key={`${r.id}-it-${idx}`} className="flex justify-between gap-2">
            <span className="truncate">{it.name} × {it.qty}</span>
            <span className="ml-2 whitespace-nowrap">₹{formatCurrency(toNumber(it.price) * toNumber(it.qty))}</span>
          </div>
        ))}
      </div>
    );
  };

  /* -------------------------- UI BELOW UNCHANGED -------------------------- */

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto">
        {/* Tabs */}
        <div className="mb-4">
          <div className="inline-flex w-full sm:w-auto rounded-lg border bg-white overflow-hidden">
            <button
              onClick={() => setActiveTab("online")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-r ${
                activeTab === "online"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Online ({onlineCount})
            </button>
            <button
              onClick={() => setActiveTab("offline")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
                activeTab === "offline"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Offline ({offlineCount})
            </button>
          </div>
        </div>

        {/* Table area */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {activeTab === "online" ? "Online Payments" : "Offline Payments"}
              </h3>
              <div className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-medium">{channelRows.length}</span> records
              </div>
            </div>

            {/* loader/error indicators per tab */}
            {activeTab === "offline" && (
              <div className="mt-1">
                {loadingOffline && <span className="text-xs text-gray-500">Loading offline sales…</span>}
                {!loadingOffline && offlineError && <span className="text-xs text-red-600">{offlineError}</span>}
              </div>
            )}
            {activeTab === "online" && (
              <div className="mt-1">
                {loadingOnline && <span className="text-xs text-gray-500">Loading online orders…</span>}
                {!loadingOnline && onlineError && <span className="text-xs text-red-600">{onlineError}</span>}
              </div>
            )}
          </div>

          {/* Desktop/Tablet Table (md+) */}
          <div className="hidden md:block p-4 overflow-x-auto">
            <table className="min-w-[960px] w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>

                  {/* ONLINE: Action | OFFLINE: Items */}
                  {activeTab === "online" ? (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  ) : (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {channelRows.map((r, i) => (
                  <tr key={r.id} className="odd:bg-white even:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium break-all">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.customerName || "-"}</td>
                    {/* <td className="px-4 py-3 text-sm text-gray-700">{r.customerPhone || "-"}</td> */}
                    <td className="px-4 py-3 text-sm text-gray-700">{r.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{r.payment || "-"}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">₹{formatCurrency(r.amount)}</td>

                    {r.channel === "online" ? (
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelected(r)}
                            className="inline-flex items-center px-3 py-1 border border-gray-200 rounded text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(r.id, "Accepted")}
                            disabled={r.status === "Accepted"}
                            className={`inline-flex items-center px-3 py-1 rounded text-sm border focus:outline-none ${
                              r.status === "Accepted"
                                ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
                                : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                            }`}
                            title="Mark as Accepted"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(r.id, "Rejected")}
                            disabled={r.status === "Rejected"}
                            className={`inline-flex items-center px-3 py-1 rounded text-sm border focus:outline-none ${
                              r.status === "Rejected"
                                ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                                : "bg-red-600 text-white border-red-600 hover:bg-red-700"
                            }`}
                            title="Mark as Rejected"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-3 text-sm">
                        {/* {renderItemsSummary(r)} */}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setSelected(r)}
                            className="inline-flex items-center px-3 py-1 border border-gray-200 rounded text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {channelRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                      No {activeTab} payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden p-3 space-y-3">
            {channelRows.map((r, i) => (
              <div key={r.id} className="border rounded-lg p-3 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">#{i + 1} • {r.payment || "-"}</div>
                    <div className="text-sm font-semibold text-gray-900 break-all">{r.id}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.date}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">{r.customerName || "-"}</span>{" "}
                      • {r.customerPhone || "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{formatCurrency(r.amount)}</div>
                  </div>
                </div>

                {/* OFFLINE: show items list; ONLINE: show actions */}
                {r.channel === "offline" ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold mb-1">Items</div>
                    <div className="rounded border p-2 space-y-1 max-h-28 overflow-auto">
                      {(r.items ?? []).length === 0 && (
                        <div className="text-[11px] text-gray-400">No items</div>
                      )}
                      {(r.items ?? []).map((it, idx) => (
                        <div key={`${r.id}-m-${idx}`} className="text-[11px] flex justify-between gap-2">
                          <span className="truncate">{it.name} × {it.qty}</span>
                          <span className="whitespace-nowrap">
                            ₹{formatCurrency(toNumber(it.price) * toNumber(it.qty))}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded text-xs text-indigo-600 hover:bg-indigo-50 focus:outline-none w-full"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="col-span-1 inline-flex items-center justify-center px-2 py-2 border border-gray-200 rounded text-xs text-indigo-600 hover:bg-indigo-50 focus:outline-none"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, "Accepted")}
                      disabled={r.status === "Accepted"}
                      className={`col-span-1 inline-flex items-center justify-center px-2 py-2 rounded text-xs border focus:outline-none ${
                        r.status === "Accepted"
                          ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
                          : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                      }`}
                      title="Mark as Accepted"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(r.id, "Rejected")}
                      disabled={r.status === "Rejected"}
                      className={`col-span-1 inline-flex items-center justify-center px-2 py-2 rounded text-xs border focus:outline-none ${
                        r.status === "Rejected"
                          ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                          : "bg-red-600 text-white border-red-600 hover:bg-red-700"
                      }`}
                      title="Mark as Rejected"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}

            {channelRows.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">
                No {activeTab} payments yet.
              </div>
            )}
          </div>

          {/* Footer: total */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm text-gray-600">
              Channel: <span className="font-medium capitalize">{activeTab}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Total Amount:{" "}
              <span className="font-semibold">
                ₹
                {formatCurrency(
                  channelRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 z-10">
            <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Payment Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 rounded border text-xs sm:text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Top summary (no status displayed) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Payment ID</div>
                <div className="text-sm sm:text-base font-medium break-all">{selected.id}</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Channel</div>
                <div className="text-sm sm:text-base font-medium capitalize">{selected.channel}</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Date</div>
                <div className="text-sm sm:text-base font-medium">{selected.date}</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Total Payment</div>
                <div className="text-sm sm:text-base font-semibold">₹{formatCurrency(selected.amount)}</div>
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Payment Method</div>
                <div className="text-sm sm:text-base font-medium capitalize">{selected.payment || "-"}</div>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] sm:text-xs text-gray-500">Customer Name</div>
                <div className="text-sm sm:text-base font-medium">{selected.customerName || "-"}</div>
              </div>
              <div>
                {/* <div className="text-[11px] sm:text-xs text-gray-500">Phone</div> */}
                <div className="text-sm sm:text-base font-medium">{selected.customerPhone || "-"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[11px] sm:text-xs text-gray-500">Address</div>
                <div className="text-sm sm:text-base">{selected.address || "-"}</div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4">
              <div className="text-sm sm:text-base font-semibold mb-2">Items</div>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Qty</th>
                      <th className="text-right px-3 py-2">Price (₹)</th>
                      <th className="text-right px-3 py-2">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items ?? []).map((it, idx) => (
                      <tr key={`${selected.id}-it-${idx}`} className="border-t">
                        <td className="px-3 py-2">{it.name}</td>
                        <td className="px-3 py-2">{toNumber(it.qty)}</td>
                        <td className="px-3 py-2 text-right">₹{formatCurrency(toNumber(it.price))}</td>
                        <td className="px-3 py-2 text-right">₹{formatCurrency(toNumber(it.price) * toNumber(it.qty))}</td>
                      </tr>
                    ))}
                    {(selected.items ?? []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-gray-500">No items found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(typeof selected.subtotal === "number" ||
                typeof selected.gst_amount === "number" ||
                typeof selected.discount_value === "number") && (
                <div className="mt-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>₹{formatCurrency(toNumber(selected.subtotal || 0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST {selected.gst_percent ? `(${selected.gst_percent}%)` : ""}</span>
                    <span>₹{formatCurrency(toNumber(selected.gst_amount || 0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Discount {selected.discount_type ? `(${selected.discount_type})` : ""}</span>
                    <span>- ₹{formatCurrency(toNumber(selected.discount_value || 0))}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold mt-1">
                    <span>Total</span>
                    <span>₹{formatCurrency(toNumber(selected.amount || 0))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Admin actions inside modal — ONLY for ONLINE (status not shown anywhere) */}
            {selected.channel === "online" && (
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(selected.id, "Rejected")}
                  disabled={selected.status === "Rejected"}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm border focus:outline-none ${
                    selected.status === "Rejected"
                      ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                      : "bg-red-600 text-white border-red-600 hover:bg-red-700"
                  }`}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(selected.id, "Accepted")}
                  disabled={selected.status === "Accepted"}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm border focus:outline-none ${
                    selected.status === "Accepted"
                      ? "bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
                      : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  }`}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
