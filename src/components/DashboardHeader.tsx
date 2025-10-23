// // src/components/DashboardHeader.tsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Search,
//   Plus,
//   Bell,
//   LogOut,
//   Home,
//   Package,
//   Building2,
//   BarChart3,
//   Users,
//   Map
// } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { IMAGES } from "@/assets/Images";
// import { useAuth } from "@/components/contexts/AuthContext";
// import { useSelector } from "react-redux";

// interface HeaderProps {
//   onMenuToggle?: () => void;
//   searchValue: string;
//   onSearchChange: (value: string) => void;
// }

// type TabItem = {
//   key: string;
//   label: string;
//   path: string;
//   Icon?: React.ComponentType<any>;
// };

// export const DashboardHeader: React.FC<HeaderProps> = ({
//   onMenuToggle,
//   searchValue,
//   onSearchChange,
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//     const settings = useSelector((state) => state.sitesettings || {});
//     console.log("HELLO",settings)

//   const logoSrc = settings.logo_url 
//   const siteName = settings.site_name || "9nutz";
//   const { logout, user } = useAuth();

//   const [plusOpen, setPlusOpen] = useState(false);
//   const [userOpen, setUserOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);

//   const plusBtnRef = useRef<HTMLButtonElement | null>(null);
//   const plusPanelRef = useRef<HTMLDivElement | null>(null);

//   const userBtnRef = useRef<HTMLDivElement | null>(null);
//   const userPanelRef = useRef<HTMLDivElement | null>(null);

//   const notifBtnRef = useRef<HTMLButtonElement | null>(null);
//   const notifPanelRef = useRef<HTMLDivElement | null>(null);

//   // tabs to show in plus popover (icons included) — NOTE: use `Icon` property consistently
//   const tabs: TabItem[] = [
//     { key: "dashboard", label: "Dashboard", path: "/dashboard", Icon: Home },
//     { key: "products", label: "Products", path: "/products", Icon: Package },
//     { key: "customerSaleHistory", label: "Category", path: "/categorywisesale", Icon:BarChart3 },
//     { key: "franchise", label: "Franchise", path: "/franchise", Icon: Building2 },
//      { key: "customer", label: "Point of Sale", path: "/Customer", Icon: Users },
//     { key: "routemap", label: "Pos Details", path: "/routemap", Icon:Map },
//     // { key: "customer", label: "Customer", path: "/customer", Icon: Users },
//     // { key: "StockVariation", label: "Expenses Summary", path: "/stockvariation", Icon: Repeat },
//   ];
//   useEffect(() => {
//     function handleDocClick(e: MouseEvent | TouchEvent | KeyboardEvent) {
//       const target = (e as MouseEvent).target as Node | null;

//       // ESC handling
//       if ((e as KeyboardEvent).key === "Escape") {
//         setPlusOpen(false);
//         setUserOpen(false);
//         setNotifOpen(false);
//         return;
//       }

//       if (!target) return;

//       if (plusOpen && plusPanelRef.current && plusBtnRef.current) {
//         if (!plusPanelRef.current.contains(target) && !plusBtnRef.current.contains(target)) {
//           setPlusOpen(false);
//         }
//       }

//       if (userOpen && userPanelRef.current && userBtnRef.current) {
//         if (!userPanelRef.current.contains(target) && !userBtnRef.current.contains(target)) {
//           setUserOpen(false);
//         }
//       }

//       if (notifOpen && notifPanelRef.current && notifBtnRef.current) {
//         if (!notifPanelRef.current.contains(target) && !notifBtnRef.current.contains(target)) {
//           setNotifOpen(false);
//         }
//       }
//     }

//     document.addEventListener("mousedown", handleDocClick);
//     document.addEventListener("touchstart", handleDocClick);
//     document.addEventListener("keydown", handleDocClick);
//     return () => {
//       document.removeEventListener("mousedown", handleDocClick);
//       document.removeEventListener("touchstart", handleDocClick);
//       document.removeEventListener("keydown", handleDocClick);
//     };
//   }, [plusOpen, userOpen, notifOpen]);

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (err) {
//       console.error("Logout failed", err);
//     } finally {
//       setUserOpen(false);
//       navigate("/login", { replace: true });
//     }
//   };

//   const onPlusNavigate = (path: string) => {
//     setPlusOpen(false);
//     navigate(path);
//   };

//   return (
//     <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//       {/* Left: Logo + Search */}
//       <div className="flex items-center gap-4 flex-1 max-w-3xl">
//         <div className="w-25 h-10 flex items-center justify-center overflow-hidden">
//           <img src={IMAGES.Nutz} alt="Logo" className="w-full h-full object-contain" />
//         </div>
//         {/* <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             type="text"
//             placeholder="Search..."
//             value={searchValue}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full h-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
//             aria-label="Search"
//           />
//         </div> */}
//       </div>

//       {/* Right: Plus popup, Notifications, Settings, User */}
//       <div className="flex items-center gap-4">
//         {/* Plus / quick tabs */}
//         <div className="relative">
//           <button
//             ref={plusBtnRef}
//             type="button"
//             aria-haspopup="menu"
//             aria-expanded={plusOpen}
//             onClick={() => {
//               setPlusOpen((s) => !s);
//               setUserOpen(false);
//               setNotifOpen(false);
//             }}
//             className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//             title="Quick create / go to"
//           >
//             <Plus className="h-5 w-5 text-gray-700" />
//           </button>

//           {plusOpen && (
//             <div
//               ref={plusPanelRef}
//               role="menu"
//               aria-label="Quick tabs"
//               className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
//             >
//               <div className="p-2">
//                 {tabs.map((t) => {
//                   const Icon = t.Icon;
//                   const isActive = location.pathname === t.path;
//                   return (
//                     <button
//                       key={t.key}
//                       onClick={() => onPlusNavigate(t.path)}
//                       className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm ${
//                         isActive ? "bg-indigo-50" : "hover:bg-gray-50"
//                       }`}
//                       role="menuitem"
//                       title={t.label}
//                     >
//                       <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center">
//                         {Icon ? <Icon className="w-4 h-4 text-indigo-600" /> : null}
//                       </div>
//                       <div>
//                         <div className="font-medium text-sm">{t.label}</div>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Notifications */}
//         <div className="relative">
//           <button
//             ref={notifBtnRef}
//             type="button"
//             aria-haspopup="menu"
//             aria-expanded={notifOpen}
//             onClick={() => {
//               setNotifOpen((s) => !s);
//               setPlusOpen(false);
//               setUserOpen(false);
//             }}
//             className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 relative"
//             title="Notifications"
//           >
//             <Bell className="h-5 w-5 text-gray-700" />
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
//           </button>

//           {notifOpen && (
//             <div
//               ref={notifPanelRef}
//               className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
//             >
//               <div className="p-3">
//                 <div className="text-sm font-semibold mb-2">Notifications</div>
//                 <ul className="space-y-2 text-sm text-gray-700">
//                   <li className="p-2 rounded-md hover:bg-gray-50">New order received</li>
//                   <li className="p-2 rounded-md hover:bg-gray-50">Stock update</li>
//                   <li className="p-2 rounded-md hover:bg-gray-50">Employee request pending</li>
//                 </ul>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* User dropdown */}
//         <div className="relative">
//           <div
//             ref={userBtnRef}
//             tabIndex={0}
//             role="button"
//             aria-haspopup="menu"
//             aria-expanded={userOpen}
//             onClick={() => {
//               setUserOpen((s) => !s);
//               setPlusOpen(false);
//               setNotifOpen(false);
//             }}
//             className="flex items-center gap-2 ml-2 cursor-pointer select-none"
//           >
//             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
//               <span className="text-sm font-medium text-white">{(user?.name ?? user?.username ?? "A")[0]}</span>
//             </div>
//             <span className="text-sm font-medium text-gray-800 hidden sm:inline">{user?.name ?? user?.username ?? "Admin"}</span>
//           </div>

//           {userOpen && (
//             <div
//               ref={userPanelRef}
//               role="menu"
//               aria-label="User menu"
//               className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
//             >
//               <div className="p-3">
//                 <div className="flex items-center gap-3 px-1 py-2">
//                   <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-medium text-white">{(user?.name ?? user?.username ?? "A")[0]}</span>
//                   </div>
//                   <div className="text-sm">
//                     <div className="font-medium" onClick={()=>navigate("/AdminProfilepage")}>{user?.name ?? user?.username ?? "Admin"}</div>
//                     <div className="text-xs text-gray-500">{user?.username ?? ""}</div>
//                   </div>
//                 </div>
//                 <div className="mt-2 border-t border-gray-100 pt-2">
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
//                     role="menuitem"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default DashboardHeader;


// src/components/DashboardHeader.tsx
// src/components/DashboardHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Bell,
  LogOut,
  Home,
  Package,
  Building2,
  BarChart3,
  Users,
  Map,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { IMAGES } from "@/assets/Images";
import { useAuth } from "@/components/contexts/AuthContext";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

/**
 * NOTE:
 * - This component DOES NOT call the API.
 * - It reads settings from Redux: state.sitesettings
 * - Make sure your reducer key is `sitesettings` in src/redux/store.ts
 */

interface HeaderProps {
  onMenuToggle?: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

type TabItem = {
  key: string;
  label: string;
  path: string;
  Icon?: React.ComponentType<any>;
};

const API_BASE = "https://9nutsapi.nearbydoctors.in/public/api/"; // used only to build absolute URLs if slice returns relative paths

const DashboardHeader: React.FC<HeaderProps> = ({ onMenuToggle, searchValue, onSearchChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // If you have RootState typed in your project, the line below is ideal.
  // If not, change to `useSelector((s: any) => s.sitesettings || {})`.
  const settings = useSelector((state: RootState | any) => (state as any).sitesettings || {});

  // Helpful debug: shows raw slice content in console so you can inspect when it's empty.
  useEffect(() => {
    console.debug("[DashboardHeader] sitesettings slice:", settings);
    if (!settings || Object.keys(settings).length === 0) {
      console.info("[DashboardHeader] sitesettings appears empty — ensure your store mounts the reducer under the key `sitesettings` and the settings thunk has run.");
    }
  }, [settings]);
  const logoRaw = (settings && (settings.logo_url ?? settings.logo ?? "")) || "";
  // Build absolute URL only if needed. We DON'T fetch here.
  const buildLogoUrl = (logo: string) => {
    if (!logo) return "";
    const trimmed = logo.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // If server returns relative path like "/uploads/logo.png" or "uploads/logo.png"
    if (trimmed.startsWith("/")) return `${API_BASE.replace(/\/+$/, "")}${trimmed}`;
    return `${API_BASE.replace(/\/+$/, "")}/${trimmed}`;
  };

  const logoSrc = buildLogoUrl(logoRaw) || IMAGES.Nutz;
  const siteName = settings?.site_name || "9nutz";

  const { logout, user } = useAuth();

  const [plusOpen, setPlusOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const plusBtnRef = useRef<HTMLButtonElement | null>(null);
  const plusPanelRef = useRef<HTMLDivElement | null>(null);

  const userBtnRef = useRef<HTMLDivElement | null>(null);
  const userPanelRef = useRef<HTMLDivElement | null>(null);

  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);

  const tabs: TabItem[] = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", Icon: Home },
    { key: "products", label: "Products", path: "/products", Icon: Package },
    { key: "customerSaleHistory", label: "Category", path: "/categorywisesale", Icon: BarChart3 },
    { key: "franchise", label: "Franchise", path: "/franchise", Icon: Building2 },
    { key: "customer", label: "Point of Sale", path: "/Customer", Icon: Users },
    { key: "routemap", label: "Pos Details", path: "/routemap", Icon: Map },
  ];

  useEffect(() => {
    function handleDocClick(e: MouseEvent | TouchEvent | KeyboardEvent) {
      const target = (e as MouseEvent).target as Node | null;

      // ESC handling
      if ((e as KeyboardEvent).key === "Escape") {
        setPlusOpen(false);
        setUserOpen(false);
        setNotifOpen(false);
        return;
      }

      if (!target) return;

      if (plusOpen && plusPanelRef.current && plusBtnRef.current) {
        if (!plusPanelRef.current.contains(target) && !plusBtnRef.current.contains(target)) {
          setPlusOpen(false);
        }
      }

      if (userOpen && userPanelRef.current && userBtnRef.current) {
        if (!userPanelRef.current.contains(target) && !userBtnRef.current.contains(target)) {
          setUserOpen(false);
        }
      }

      if (notifOpen && notifPanelRef.current && notifBtnRef.current) {
        if (!notifPanelRef.current.contains(target) && !notifBtnRef.current.contains(target)) {
          setNotifOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    document.addEventListener("keydown", handleDocClick);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
      document.removeEventListener("keydown", handleDocClick);
    };
  }, [plusOpen, userOpen, notifOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Logout failed", err);
    } finally {
      setUserOpen(false);
      navigate("/login", { replace: true });
    }
  };
  const onPlusNavigate = (path: string) => {
    setPlusOpen(false);
    navigate(path);
  };
  const avatarInitial = (user?.name ?? user?.username ?? "A").toString().charAt(0).toUpperCase();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-3xl">
        <div className="w-25 h-10 flex items-center justify-center overflow-hidden">
          {/* <img
            src={logoSrc}
            alt={siteName}
            className="w-full h-full object-contain"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              // final fallback to bundled image
              if (el.src !== IMAGES.Nutz) el.src = IMAGES.Nutz;
            }}
          /> */}
          <h1>{settings.site_name}</h1>
        </div>

        {/* Search - kept commented as in original */}
        {/* <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full h-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
            aria-label="Search"
          />
        </div> */}
      </div>

      {/* Right: Plus popup, Notifications, Settings, User */}
      <div className="flex items-center gap-4">
        {/* Plus / quick tabs */}
        <div className="relative">
          <button
            ref={plusBtnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={plusOpen}
            onClick={() => {
              setPlusOpen((s) => !s);
              setUserOpen(false);
              setNotifOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            title="Quick create / go to"
          >
            <Plus className="h-5 w-5 text-gray-700" />
          </button>

          {plusOpen && (
            <div
              ref={plusPanelRef}
              role="menu"
              aria-label="Quick tabs"
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50"
            >
              <div className="p-2">
                {tabs.map((t) => {
                  const Icon = t.Icon;
                  const isActive = location.pathname === t.path;
                  return (
                    <button
                      key={t.key}
                      onClick={() => onPlusNavigate(t.path)}
                      className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 text-sm ${
                        isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                      }`}
                      role="menuitem"
                      title={t.label}
                    >
                      <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center">
                        {Icon ? <Icon className="w-4 h-4 text-indigo-600" /> : null}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{t.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifBtnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((s) => !s);
              setPlusOpen(false);
              setUserOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {notifOpen && (
            <div ref={notifPanelRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50">
              <div className="p-3">
                <div className="text-sm font-semibold mb-2">Notifications</div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="p-2 rounded-md hover:bg-gray-50">New order received</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Stock update</li>
                  <li className="p-2 rounded-md hover:bg-gray-50">Employee request pending</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <div
            ref={userBtnRef}
            tabIndex={0}
            role="button"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((s) => !s);
              setPlusOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 ml-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{avatarInitial}</span>
            </div>
            <span className="text-sm font-medium text-gray-800 hidden sm:inline">
              {user?.name ?? user?.username ?? "Admin"}
            </span>
          </div>

          {userOpen && (
            <div ref={userPanelRef} role="menu" aria-label="User menu" className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 z-50">
              <div className="p-3">
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{avatarInitial}</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium" onClick={() => navigate("/AdminProfilepage")}>
                      {user?.name ?? user?.username ?? "Admin"}
                    </div>
                    <div className="text-xs text-gray-500">{user?.username ?? ""}</div>
                  </div>
                </div>
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-50" role="menuitem">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;


