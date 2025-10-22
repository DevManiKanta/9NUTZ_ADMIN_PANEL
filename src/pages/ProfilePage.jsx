
// import React, { useEffect, useState, useRef } from "react";
// import {
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Lock,
//   X,
//   Edit3 as EditIcon,
//   Eye,
//   EyeOff,
// } from "lucide-react";
// import { toast } from "react-hot-toast";
// import BASE_URL_1 from "../api/axios"
// export default function ProfilePage({ initialUser = null, initialOrders = [] }) {
//   // user state (editable)
//   const [user, setUser] = useState(
//     initialUser || {
//       id: null,
//       name: "",
//       email: "",
//       phone: "",
//       address: "", // single-line address
//       createdAt: new Date().toISOString(),
//     }
//   );

//   const [userOrders] = useState(initialOrders);
//   const LOCAL_API_BASE="http://192.168.29.100:8000/api"
//   // Edit Details modal state
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     password: "", // NEW: optional password field
//   });
//   const [formError, setFormError] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);

//   // password visibility toggle state
//   const [showPassword, setShowPassword] = useState(false);

//   // focus + trigger refs
//   const modalRef = useRef(null);
//   const triggerRef = useRef(null);

//   // utility to get token (adjust if your key differs)
//   const getToken = () => localStorage.getItem("token") || "";

//   // --- Fetch profile on mount ---
//   useEffect(() => {
//     fetchProfile();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const fetchProfile = async () => {
//     const token = getToken();
//     if (!token) {
//       toast.error("Not logged in — token missing.");
//       return;
//     }
//     setIsFetching(true);
//     const loadingId = toast.loading("Loading profile...");
//     try {
//       const res = await fetch(`${LOCAL_API_BASE}/settings`, {
//         method: "GET",
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json().catch(() => null);
//       console.log()
//       if (!res.ok) {
//         // try to show server message
//         const msg = data?.message || `Failed to fetch profile (${res.status})`;
//         toast.error(msg);
//         throw new Error(msg);
//       }

//       // Expecting { status: true, profile: [ { ... } ] }
//       if (!data || !data.status || !Array.isArray(data.profile) || data.profile.length === 0) {
//         const msg = "Profile not found.";
//         toast.error(msg);
//         throw new Error(msg);
//       }

//       const p = data.profile[0];

//       // normalize fields: your API uses `contact` for phone
//       const normalized = {
//         id: p.id ?? null,
//         name: p.name ?? "",
//         email: p.email ?? "",
//         phone: p.contact ? String(p.contact) : p.contact ?? "",
//         address: p.address ?? "", // if API doesn't return address, keep empty
//         createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString(),
//       };

//       setUser((prev) => ({ ...prev, ...normalized }));

//       // update localStorage user if present
//       try {
//         const raw = localStorage.getItem("user");
//         if (raw) {
//           const u = JSON.parse(raw);
//           localStorage.setItem("user", JSON.stringify({ ...u, ...normalized }));
//         }
//       } catch (err) {
//         // non-fatal
//         console.warn("Failed to update localStorage user on fetch:", err);
//       }

//       toast.dismiss(loadingId);
//       toast.success("Profile loaded");
//     } catch (err) {
//       console.error("fetchProfile error:", err);
//       toast.dismiss();
//       // If toast already shown above, don't double toast; but ensure user sees something
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   // prevent background scroll when modal open
//   useEffect(() => {
//     if (showDetailsModal) {
//       const prev = document.body.style.overflow;
//       document.body.style.overflow = "hidden";
//       return () => {
//         document.body.style.overflow = prev;
//       };
//     }
//   }, [showDetailsModal]);

//   // Prefill form when modal opens and manage keyboard close / focus restoration
//   useEffect(() => {
//     if (showDetailsModal) {
//       setForm({
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         address: user.address || "",
//         password: "", // don't prefill password
//       });

//       setShowPassword(false);

//       // focus first input after render
//       const t = setTimeout(() => {
//         const input = modalRef.current?.querySelector("input[name='name']");
//         if (input) {
//           input.focus();
//           input.select?.();
//         }
//       }, 0);

//       const onKey = (e) => {
//         if (e.key === "Escape") setShowDetailsModal(false);
//       };
//       document.addEventListener("keydown", onKey);
//       return () => {
//         clearTimeout(t);
//         document.removeEventListener("keydown", onKey);
//       };
//     } else {
//       // restore focus to trigger
//       triggerRef.current?.focus();
//     }
//   }, [showDetailsModal, user]);

//   // Validators
//   const validators = {
//     name: (v) => {
//       if (!v || !v.trim()) return "Name is required.";
//       if (v.trim().length < 2) return "Please enter at least 2 characters for name.";
//       return "";
//     },
//     email: (v) => {
//       if (!v || !v.trim()) return "Email is required.";
//       const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!re.test(v.trim())) return "Enter a valid email address.";
//       return "";
//     },
//     phone: (v) => {
//       if (!v || !String(v).trim()) return "Phone is required.";
//       const digits = String(v).replace(/\D/g, "");
//       if (digits.length < 10) return "Phone must be at least 10 digits.";
//       if (digits.length > 15) return "Phone must not exceed 15 digits.";
//       return "";
//     },
//     address: (v) => {
//       if (!v || !v.trim()) return "Address is required.";
//       if (v.trim().length < 5) return "Address looks too short.";
//       return "";
//     },
//     // Password validation: apply only if provided (optional)
//     password: (v) => {
//       if (!v) return ""; // optional field
//       if (v.length < 8) return "Password must be at least 8 characters.";
//       if (!/[0-9]/.test(v)) return "Password must contain at least one digit.";
//       return "";
//     },
//   };

//   const validateForm = () => {
//     const fields = ["name", "email", "phone", "address"];
//     for (const f of fields) {
//       const err = validators[f](form[f]);
//       if (err) return err;
//     }
//     // password optional — if present validate
//     const pwErr = validators.password(form.password);
//     if (pwErr) return pwErr;
//     return "";
//   };

//   // Input change handler
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//     if (formError) setFormError("");
//   };

//   // Submit single API call to update details (FormData to match curl)
//   const handleSubmitDetails = async (e) => {
//     e?.preventDefault();

//     const err = validateForm();
//     if (err) {
//       setFormError(err);
//       toast.error(err);
//       return;
//     }

//     const token = getToken();
//     if (!token) {
//       toast.error("Session expired — please login again.");
//       return;
//     }

//     setIsUpdating(true);
//     const loadingId = toast.loading("Updating profile...");
//     setFormError("");
//     try {
//       // Build FormData as per your curl
//       const fd = new FormData();
//       fd.append("name", form.name.trim());
//       fd.append("email", form.email.trim());
//       // send contact + phone to be safe
//       fd.append("contact", String(form.phone).trim());
//       fd.append("phone", String(form.phone).trim());
//       fd.append("address", form.address.trim());
//       // only include password if user provided one
//       if (form.password && String(form.password).trim().length > 0) {
//         fd.append("password", String(form.password));
//       }

//       const res = await fetch(`${LOCAL_API_BASE}/admin/profile/update`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           // DO NOT set Content-Type for FormData
//         },
//         body: fd,
//       });

//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         const serverMsg = data?.message || data?.error || `Update failed (${res.status})`;
//         toast.error(serverMsg);
//         throw new Error(serverMsg);
//       }

//       if (data && data.status === false) {
//         const msg = data.message || "Update failed.";
//         toast.error(msg);
//         throw new Error(msg);
//       }

//       // Success path: build updatedUser from returned profile or fallback to request payload
//       let updatedUser = { ...user };
//       if (data) {
//         if (Array.isArray(data.profile) && data.profile.length > 0) {
//           const p = data.profile[0];
//           updatedUser = {
//             ...updatedUser,
//             id: p.id ?? updatedUser.id,
//             name: p.name ?? updatedUser.name,
//             email: p.email ?? updatedUser.email,
//             phone: p.contact ? String(p.contact) : p.contact ?? updatedUser.phone,
//             address: p.address ?? updatedUser.address,
//             createdAt: p.created_at ?? p.createdAt ?? updatedUser.createdAt,
//           };
//         } else if (data.profile && typeof data.profile === "object") {
//           const p = data.profile;
//           updatedUser = {
//             ...updatedUser,
//             id: p.id ?? updatedUser.id,
//             name: p.name ?? updatedUser.name,
//             email: p.email ?? updatedUser.email,
//             phone: p.contact ? String(p.contact) : p.contact ?? updatedUser.phone,
//             address: p.address ?? updatedUser.address,
//             createdAt: p.created_at ?? p.createdAt ?? updatedUser.createdAt,
//           };
//         } else if (data.user && typeof data.user === "object") {
//           const p = data.user;
//           updatedUser = {
//             ...updatedUser,
//             id: p.id ?? updatedUser.id,
//             name: p.name ?? updatedUser.name,
//             email: p.email ?? updatedUser.email,
//             phone: p.contact ? String(p.contact) : p.contact ?? updatedUser.phone,
//             address: p.address ?? updatedUser.address,
//             createdAt: p.created_at ?? p.createdAt ?? updatedUser.createdAt,
//           };
//         } else {
//           // fallback: use our request payload
//           updatedUser = {
//             ...updatedUser,
//             name: form.name.trim(),
//             email: form.email.trim(),
//             phone: String(form.phone).trim(),
//             address: form.address.trim(),
//           };
//         }
//       }

//       // Update state & cache
//       setUser(updatedUser);
//       try {
//         const raw = localStorage.getItem("user");
//         if (raw) {
//           const u = JSON.parse(raw);
//           localStorage.setItem("user", JSON.stringify({ ...u, ...updatedUser }));
//         }
//       } catch (err) {
//         console.warn("Could not update localStorage user cache:", err);
//       }

//       toast.dismiss(loadingId);
//       toast.success("Profile updated successfully");
//       setShowDetailsModal(false);
//     } catch (err) {
//       console.error("handleSubmitDetails error:", err);
//       toast.dismiss();
//       if (!toast.isActive?.(err?.message)) {
//         toast.error(err?.message || "Failed to update profile");
//       }
//       setFormError(err?.message || "Failed to update profile.");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const displayName = user?.name || user?.fullName || user?.username || "User";

//   return (
//     <div className="space-y-8">
//       {/* Top: Personal Details + Quick Stats */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Personal Info */}
//         <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <User className="h-5 w-5" /> Personal Details
//           </h3>

//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* Name */}
//             <div className="p-4 bg-white rounded-lg border flex items-start justify-between gap-4">
//               <div>
//                 <div className="text-xs uppercase text-gray-500">Name</div>
//                 <div className="mt-1 font-medium text-gray-900">{displayName}</div>
//               </div>
//             </div>

//             {/* Email */}
//             <div className="p-4 bg-white rounded-lg border">
//               <div className="text-xs uppercase text-gray-500">Email</div>
//               <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
//                 <Mail className="h-4 w-4 text-gray-400" />
//                 {user?.email ?? "—"}
//               </div>
//             </div>

//             {/* Phone */}
//             <div className="p-4 bg-white rounded-lg border flex items-start justify-between gap-4">
//               <div>
//                 <div className="text-xs uppercase text-gray-500">Phone</div>
//                 <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-gray-400" /> {user?.phone || "—"}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Edit Details card */}
//         <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <Lock className="h-5 w-5" /> Edit Details
//           </h3>
//           <div className="space-y-3">
//             <div className="flex gap-2">
//               <button
//                 ref={triggerRef}
//                 type="button"
//                 onClick={() => setShowDetailsModal(true)}
//                 className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors border"
//               >
//                 <EditIcon className="h-4 w-4" />
//                 Edit Details
//               </button>
//             </div>
//             {isFetching && <div className="text-sm text-gray-500">Loading profile…</div>}
//           </div>
//         </div>
//       </div>

//       {/* Unified Edit Details Modal */}
//       {showDetailsModal && (
//         <div
//           className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
//           aria-hidden={!showDetailsModal}
//         >
//           {/* Backdrop - z lower than modal */}
//           <div
//             className="fixed inset-0 bg-black/40 z-[9998]"
//             aria-hidden="true"
//             onClick={() => setShowDetailsModal(false)}
//           />

//           <div
//             ref={modalRef}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="edit-details-title"
//             className="relative z-[9999] w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h4 id="edit-details-title" className="text-lg font-semibold">
//                 Edit Details
//               </h4>
//               <button
//                 type="button"
//                 aria-label="Close"
//                 onClick={() => setShowDetailsModal(false)}
//                 className="rounded-md p-1 hover:bg-gray-100"
//               >
//                 <X className="h-5 w-5 text-gray-600" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmitDetails} className="space-y-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                 <input
//                   name="name"
//                   type="text"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="Full name"
//                   className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     formError && validators.name(form.name) ? "border-red-400" : "border-gray-300"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input
//                   name="email"
//                   type="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="Email address"
//                   className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     formError && validators.email(form.email) ? "border-red-400" : "border-gray-300"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Phone */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                 <input
//                   name="phone"
//                   type="tel"
//                   value={form.phone}
//                   onChange={handleChange}
//                   placeholder="Phone number"
//                   className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     formError && validators.phone(form.phone) ? "border-red-400" : "border-gray-300"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* Address */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                 <textarea
//                   name="address"
//                   value={form.address}
//                   onChange={handleChange}
//                   placeholder="Enter your address"
//                   className={`w-full border rounded-lg px-3 py-2 h-24 resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                     formError && validators.address(form.address) ? "border-red-400" : "border-gray-300"
//                   }`}
//                   required
//                 />
//               </div>

//               {/* NEW: Password (optional) */}
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                 <div className="relative">
//                   <input
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={form.password}
//                     onChange={handleChange}
//                     placeholder="Enter new password (leave blank to keep current)"
//                     className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
//                       formError && validators.password(form.password) ? "border-red-400" : "border-gray-300"
//                     }`}
//                     aria-describedby={formError && validators.password(form.password) ? "password-error" : undefined}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((s) => !s)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                   >
//                     {showPassword ? <EyeOff className="h-5 w-5 text-gray-600" /> : <Eye className="h-5 w-5 text-gray-600" />}
//                   </button>
//                 </div>
//                 {formError && validators.password(form.password) && (
//                   <p id="password-error" className="text-xs text-red-600 mt-1">
//                     {validators.password(form.password)}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters and include a digit (only required if you enter a new password).</p>
//               </div>

//               {/* Error */}
//               {formError && !validators.password(form.password) && (
//                 <p className="text-xs text-red-600" role="alert">
//                   {formError}
//                 </p>
//               )}

//               <div className="flex items-center justify-end gap-2 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowDetailsModal(false)}
//                   className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isUpdating}
//                   className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
//                 >
//                   {isUpdating ? "Updating..." : "Save Changes"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  X,
  Edit3 as EditIcon,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * ProfilePage
 *
 * - Fetches settings/profile from GET `${LOCAL_API_BASE}/settings`
 * - Updates data via POST `${LOCAL_API_BASE}/admin/settings/update` using FormData (matches your curl).
 * - Persists user/settings to localStorage to avoid flashing empty UI after navigation.
 *
 * NOTE: Do not change API endpoints unless your backend differs.
 */

const LOCAL_API_BASE ="http://192.168.29.100:8000/api/"; // adjust if needed
const TOKEN_KEY = "token"; // adjust if your app uses a different key

export default function ProfilePage({ initialUser = null, initialOrders = [] }) {
  // --- hydrate helpers ---
  const getSavedUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id ?? null,
        name: parsed.name ?? parsed.fullName ?? parsed.username ?? "",
        email: parsed.email ?? "",
        phone: parsed.phone ?? parsed.contact ?? parsed.mobile ?? "",
        address: parsed.address ?? "",
        createdAt: parsed.createdAt ?? parsed.created_at ?? new Date().toISOString(),
      };
    } catch (err) {
      console.warn("parse local user failed:", err);
      return null;
    }
  };
  const getSavedSettings = () => {
    try {
      const raw = localStorage.getItem("settings");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn("parse local settings failed:", err);
      return null;
    }
  };

  const savedUser = getSavedUser();
  const savedSettings = getSavedSettings();

  // --- component state ---
  const [user, setUser] = useState(
    initialUser ||
      savedUser || {
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        createdAt: new Date().toISOString(),
      }
  );

  const [settings, setSettings] = useState(
    savedSettings || {
      site_name: "",
      logo_url: "",
      favicon_url: "",
      phone: "",
      altphone: "",
      whatappnumber: "",
      address: "",
      email: "",
    }
  );

  const [userOrders] = useState(initialOrders);

  // modal / form state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [form, setForm] = useState({
    // user fields
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    // settings fields
    site_name: "",
    altphone: "",
    whatappnumber: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  const [formError, setFormError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // refs
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // token helper
  const getToken = () => localStorage.getItem(TOKEN_KEY) || "";

  // --- validators ---
  const validators = {
    name: (v) => {
      if (!v || !v.trim()) return "Name is required.";
      if (v.trim().length < 2) return "Please enter at least 2 characters for name.";
      return "";
    },
    email: (v) => {
      if (!v || !v.trim()) return "Email is required.";
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(v.trim())) return "Enter a valid email address.";
      return "";
    },
    phone: (v) => {
      if (!v || !String(v).trim()) return "Phone is required.";
      const digits = String(v).replace(/\D/g, "");
      if (digits.length < 10) return "Phone must be at least 10 digits.";
      if (digits.length > 15) return "Phone must not exceed 15 digits.";
      return "";
    },
    address: (v) => {
      if (!v || !v.trim()) return "Address is required.";
      if (v.trim().length < 5) return "Address looks too short.";
      return "";
    },
    password: (v) => {
      if (!v) return ""; // optional
      if (v.length < 8) return "Password must be at least 8 characters.";
      if (!/[0-9]/.test(v)) return "Password must contain at least one digit.";
      return "";
    },
    site_name: (v) => {
      if (!v || !v.trim()) return "Site name is required.";
      return "";
    },
    altphone: (v) => {
      if (!v) return "";
      return "";
    },
    whatappnumber: (v) => {
      if (!v) return "";
      return "";
    },
  };

  const validateForm = () => {
    // required fields: name, email, phone, address, site_name
    const required = ["name", "email", "phone", "address", "site_name"];
    for (const f of required) {
      const err = validators[f](form[f]);
      if (err) return err;
    }
    const pwErr = validators.password(form.password);
    if (pwErr) return pwErr;
    return "";
  };

  // --- fetch settings/profile (mount) ---
  useEffect(() => {
    void fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Not logged in — token missing.");
      return;
    }

    setIsFetching(true);
    const loadingId = toast.loading("Loading settings...");
    try {
      // GET /settings
      const res = await fetch(`${LOCAL_API_BASE}settings`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Failed to fetch settings (${res.status})`;
        toast.error(msg);
        // keep local data (hydrated from localStorage) rather than overwriting
        return;
      }

      // many backends return status + settings/profile
      // possible shapes:
      // { status: true, profile: [...] } or { status:true, data: {...} } or {status:true, settings: {...}}
      // We'll attempt to read both profile and settings with a few fallbacks.

      // 1) Profile-like response (array)
      if (data?.status && Array.isArray(data.profile) && data.profile.length > 0) {
        const p = data.profile[0];
        const normalizedUser = {
          id: p.id ?? null,
          name: p.name ?? "",
          email: p.email ?? "",
          phone: p.contact ? String(p.contact) : p.contact ?? "",
          address: p.address ?? "",
          createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString(),
        };
        setUser((prev) => ({ ...prev, ...normalizedUser }));
        // update localStorage
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const u = JSON.parse(raw);
            localStorage.setItem("user", JSON.stringify({ ...u, ...normalizedUser }));
          } else {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          }
        } catch (e) {
          console.warn("localStorage update user failed:", e);
        }
      }

      // 2) Settings-like response (object)
      // try several common locations
      const settingsObj =
        data?.data?.settings ??
        data?.data ??
        data?.settings ??
        (data?.status && typeof data === "object" ? data : null);

      if (settingsObj && typeof settingsObj === "object") {
        // normalize keys used in your curl: site_name, email, phone, altphone, whatappnumber, address, logo, favicon
        const normalizedSettings = {
          site_name: settingsObj.site_name ?? settingsObj.siteName ?? settingsObj.name ?? settings.site_name ?? "",
          email: settingsObj.email ?? settings.email ?? "",
          phone: settingsObj.phone ?? settings.phone ?? "",
          altphone: settingsObj.altphone ?? settingsObj.alt_phone ?? "",
          whatappnumber: settingsObj.whatappnumber ?? settingsObj.whatsapp ?? settingsObj.whatsapp_number ?? "",
          address: settingsObj.address ?? settingsObj.addr ?? "",
          logo_url: settingsObj.logo ?? settingsObj.logo_url ?? settings.logo_url ?? "",
          favicon_url: settingsObj.favicon ?? settingsObj.favicon_url ?? settings.favicon_url ?? "",
        };
        setSettings((prev) => ({ ...prev, ...normalizedSettings }));
        // persist
        try {
          localStorage.setItem("settings", JSON.stringify({ ...settings, ...normalizedSettings }));
        } catch (e) {
          console.warn("localStorage update settings failed:", e);
        }
      }

      toast.dismiss(loadingId);
      toast.success("Settings loaded");
    } catch (err) {
      console.error("fetchSettings error:", err);
      toast.dismiss();
      toast.error("Network error while loading settings. Using cached values.");
    } finally {
      setIsFetching(false);
    }
  };

  // keep background locked when modal open
  useEffect(() => {
    if (showDetailsModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showDetailsModal]);

  // fill form when modal opens (use latest user & settings)
  useEffect(() => {
    if (showDetailsModal) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
        password: "",
        site_name: settings.site_name ?? "",
        altphone: settings.altphone ?? "",
        whatappnumber: settings.whatappnumber ?? "",
      });
      setLogoFile(null);
      setFaviconFile(null);
      setShowPassword(false);

      const t = setTimeout(() => {
        const input = modalRef.current?.querySelector("input[name='name']");
        input?.focus?.();
        input?.select?.();
      }, 0);

      const onKey = (e) => {
        if (e.key === "Escape") setShowDetailsModal(false);
      };
      document.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(t);
        document.removeEventListener("keydown", onKey);
      };
    } else {
      triggerRef.current?.focus?.();
    }
  }, [showDetailsModal, user, settings]);

  // input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (formError) setFormError("");
  };

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setLogoFile(f);
  };
  const handleFaviconChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFaviconFile(f);
  };

  // submit handler -> POST /admin/settings/update (FormData)
  const handleSubmitDetails = async (ev) => {
    ev?.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      toast.error(err);
      return;
    }
    const token = getToken();
    if (!token) {
      toast.error("Session expired — please login again.");
      return;
    }

    setIsUpdating(true);
    const loadingId = toast.loading("Updating settings...");
    try {
      const fd = new FormData();

      // user fields
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("contact", String(form.phone).trim()); // server might expect contact
      fd.append("phone", String(form.phone).trim());
      fd.append("address", form.address.trim());
      if (form.password && form.password.trim().length > 0) {
        fd.append("password", String(form.password));
      }

      // settings fields per your curl
      fd.append("site_name", form.site_name.trim());
      fd.append("email", form.email.trim()); // sometimes settings want email too
      fd.append("phone", form.phone.trim());
      if (form.altphone && form.altphone.trim() !== "") fd.append("altphone", form.altphone.trim());
      if (form.whatappnumber && form.whatappnumber.trim() !== "") fd.append("whatappnumber", form.whatappnumber.trim());
      fd.append("address", form.address.trim());

      // files: append only if selected
      if (logoFile) fd.append("logo", logoFile);
      if (faviconFile) fd.append("favicon", faviconFile);

      const res = await fetch(`${LOCAL_API_BASE}admin/settings/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // do NOT set Content-Type when using FormData
        },
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const serverMsg = data?.message || data?.error || `Update failed (${res.status})`;
        toast.error(serverMsg);
        throw new Error(serverMsg);
      }

      if (data && data.status === false) {
        const serverMsg = data.message || "Update failed.";
        toast.error(serverMsg);
        throw new Error(serverMsg);
      }

      // success: try to extract returned settings/profile
      const updatedSettings = {
        site_name: data?.site_name ?? data?.settings?.site_name ?? data?.data?.site_name ?? form.site_name,
        email: data?.email ?? data?.settings?.email ?? form.email,
        phone: data?.phone ?? data?.settings?.phone ?? form.phone,
        altphone: data?.altphone ?? data?.settings?.altphone ?? form.altphone ?? "",
        whatappnumber: data?.whatappnumber ?? data?.settings?.whatappnumber ?? form.whatappnumber ?? "",
        address: data?.address ?? data?.settings?.address ?? form.address,
        logo_url:
          data?.logo ??
          data?.settings?.logo ??
          (data?.data && (data.data.logo || data.data.logo_url)) ??
          settings.logo_url ??
          "",
        favicon_url:
          data?.favicon ??
          data?.settings?.favicon ??
          (data?.data && (data.data.favicon || data.data.favicon_url)) ??
          settings.favicon_url ??
          "",
      };

      // user updates (if server returned profile)
      let updatedUser = { ...user };
      if (Array.isArray(data?.profile) && data.profile.length > 0) {
        const p = data.profile[0];
        updatedUser = {
          ...updatedUser,
          id: p.id ?? updatedUser.id,
          name: p.name ?? updatedUser.name,
          email: p.email ?? updatedUser.email,
          phone: p.contact ? String(p.contact) : p.contact ?? updatedUser.phone,
          address: p.address ?? updatedUser.address,
          createdAt: p.created_at ?? p.createdAt ?? updatedUser.createdAt,
        };
      } else if (data?.user && typeof data.user === "object") {
        const p = data.user;
        updatedUser = {
          ...updatedUser,
          id: p.id ?? updatedUser.id,
          name: p.name ?? updatedUser.name,
          email: p.email ?? updatedUser.email,
          phone: p.contact ? String(p.contact) : p.contact ?? updatedUser.phone,
          address: p.address ?? updatedUser.address,
          createdAt: p.created_at ?? p.createdAt ?? updatedUser.createdAt,
        };
      } else {
        // fallback to our form
        updatedUser = {
          ...updatedUser,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: String(form.phone).trim(),
          address: form.address.trim(),
        };
      }

      // update local state and caches
      setSettings((prev) => ({ ...prev, ...updatedSettings }));
      setUser(updatedUser);

      try {
        const rawU = localStorage.getItem("user");
        if (rawU) {
          const u = JSON.parse(rawU);
          localStorage.setItem("user", JSON.stringify({ ...u, ...updatedUser }));
        } else {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.warn("update localStorage user failed:", e);
      }

      try {
        const rawS = localStorage.getItem("settings");
        if (rawS) {
          const s = JSON.parse(rawS);
          localStorage.setItem("settings", JSON.stringify({ ...s, ...updatedSettings }));
        } else {
          localStorage.setItem("settings", JSON.stringify(updatedSettings));
        }
      } catch (e) {
        console.warn("update localStorage settings failed:", e);
      }

      toast.dismiss(loadingId);
      toast.success("Updated successfully");
      setShowDetailsModal(false);
    } catch (err) {
      console.error("update error:", err);
      toast.dismiss();
      toast.error(err?.message || "Failed to update settings");
      setFormError(err?.message || "Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  // display name helper
  const displayName = user?.name || user?.fullName || user?.username || "User";

  return (
    <div className="space-y-8">
      {/* Top: Personal Details + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5" /> Site Settings
            </h3>
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="logo" className="h-8 object-contain" />
            ) : (
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> No logo
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-xs uppercase text-gray-500">Name</div>
              <div className="mt-1 font-medium text-gray-900">{displayName}</div>
            </div>

            {/* Email */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-xs uppercase text-gray-500">Email</div>
              <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {user?.email ?? "—"}
              </div>
            </div>

            {/* Phone */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-xs uppercase text-gray-500">Phone</div>
              <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                {user?.phone || "—"}
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-xs uppercase text-gray-500">Address</div>
              <div className="mt-1 font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {user?.address || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Settings / Edit Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" /> Edit Setting Details
          </h3>

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Site: <span className="font-medium text-gray-800">{settings?.site_name || "—"}</span>
            </div>
            <div className="text-sm text-gray-600">
              Site Email: <span className="font-medium text-gray-800">{settings?.email || "—"}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors border"
              >
                <EditIcon className="h-4 w-4" />
                Edit Details
              </button>
              {isFetching && <div className="text-sm text-gray-500">Refreshing…</div>}
            </div>
            {/* quick settings preview */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div>Phone: {settings?.phone || "—"}</div>
              <div>Alt Phone: {settings?.altphone || "—"}</div>
              <div>WhatsApp: {settings?.whatappnumber || "—"}</div>
              <div>Address: {settings?.address || "—"}</div>
              <div>Favicon: {settings?.favicon_url ? <img src={settings.favicon_url} alt="favicon" className="inline-block h-5 w-5" /> : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" aria-hidden={!showDetailsModal}>
          <div className="fixed inset-0 bg-black/40 z-[9998]" aria-hidden="true" onClick={() => setShowDetailsModal(false)} />
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="edit-details-title" className="relative z-[9999] w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 id="edit-details-title" className="text-lg font-semibold">Edit Setting Details</h4>
              <button type="button" aria-label="Close" onClick={() => setShowDetailsModal(false)} className="rounded-md p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* User fields */}
                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Full name</div>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Full name" required />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Email</div>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" placeholder="you@example.com" required />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Phone</div>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" placeholder="10-15 digits" required />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Address</div>
                  <input name="address" value={form.address} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Address line" required />
                </label>

                {/* Password */}
                <label className="space-y-1 md:col-span-2 relative">
                  <div className="text-sm text-gray-600">Password (leave blank to keep current)</div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded pr-10"
                      placeholder="New password (optional)"
                    />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">If you enter a password it must be at least 8 chars and include a digit.</div>
                </label>

                {/* Settings fields */}
                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Site name</div>
                  <input name="site_name" value={form.site_name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Site name (required)" required />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-gray-600">Alt phone</div>
                  <input name="altphone" value={form.altphone} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Alternate contact (optional)" />
                </label>

                <label className="space-y-1">
                  <div className="text-sm text-gray-600">WhatsApp number</div>
                  <input name="whatappnumber" value={form.whatappnumber} onChange={handleChange} className="w-full p-2 border rounded" placeholder="WhatsApp number (optional)" />
                </label>

                {/* Logo + Favicon file inputs (optional) */}
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <div className="text-sm text-gray-600">Logo (optional)</div>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full p-2 border rounded" />
                    {settings.logo_url ? <img src={settings.logo_url} alt="logo preview" className="h-12 mt-2 object-contain" /> : null}
                  </label>

                  <label className="space-y-1">
                    <div className="text-sm text-gray-600">Favicon (optional)</div>
                    <input type="file" accept="image/*" onChange={handleFaviconChange} className="w-full p-2 border rounded" />
                    {settings.favicon_url ? <img src={settings.favicon_url} alt="favicon preview" className="h-8 mt-2 object-contain" /> : null}
                  </label>
                </div>
              </div>

              {formError && <div className="text-sm text-red-600">{formError}</div>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDetailsModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 rounded bg-blue-600 text-white">
                  {isUpdating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
