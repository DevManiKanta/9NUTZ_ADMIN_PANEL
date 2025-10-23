
// "use client";
// import React, { useMemo, useState } from "react";
// import { MetricCard } from "@/components/MetricCard";
// import { WeeklyChart } from "@/components/WeeklyChart";
// import { YearlyChart } from "@/components/YearlyChart";
// import { Eye, IndianRupee, ShoppingCart, Users } from "lucide-react";
// const STATIC_ORDERS = [
//   { id: 1, franchiseId: "F1", date: "2025-09-01", amount: 1200.5, items: 3 },
//   { id: 2, franchiseId: "F2", date: "2025-09-02", amount: 450.0, items: 1 },
//   { id: 3, franchiseId: "F1", date: "2025-09-03", amount: 800.0, items: 2 },
//   { id: 4, franchiseId: "F3", date: "2025-09-05", amount: 2100.0, items: 6 },
//   { id: 5, franchiseId: "F4", date: "2025-08-18", amount: 99.99, items: 1 },
//   { id: 6, franchiseId: "F2", date: "2025-07-25", amount: 550.0, items: 4 },
//   { id: 7, franchiseId: "F5", date: "2025-01-12", amount: 1800.0, items: 5 },
//   { id: 8, franchiseId: "F3", date: "2025-02-14", amount: 220.5, items: 1 },
//   { id: 9, franchiseId: "F6", date: "2024-12-29", amount: 999.0, items: 2 },
//   { id: 10, franchiseId: "F1", date: "2025-09-10", amount: 1499.5, items: 3 },
//   { id: 11, franchiseId: "F2", date: "2025-09-15", amount: 349.0, items: 1 },
//   { id: 12, franchiseId: "F4", date: "2025-09-18", amount: 679.25, items: 2 },
//   { id: 13, franchiseId: "F3", date: "2025-08-05", amount: 45.0, items: 1 },
//   { id: 14, franchiseId: "F5", date: "2025-06-21", amount: 1250.0, items: 7 },
//   { id: 15, franchiseId: "F6", date: "2025-03-03", amount: 85.0, items: 1 },
//   { id: 16, franchiseId: "F7", date: "2025-09-21", amount: 3000.0, items: 10 },
//   { id: 17, franchiseId: "F8", date: "2025-09-23", amount: 230.0, items: 1 },
//   { id: 18, franchiseId: "F1", date: "2025-09-24", amount: 129.99, items: 2 },
//   { id: 19, franchiseId: "F9", date: "2025-05-02", amount: 420.0, items: 2 },
//   { id: 20, franchiseId: "F2", date: "2025-09-26", amount: 750.0, items: 3 },
// ];

// function fmtNumber(n: number) {
//   return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
// }
// function fmtCurrency(n: number) {
//   return Number.isFinite(n) ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
// }

// const Dashboard: React.FC = () => {
//   // default range = last 30 days
//   const today = new Date();
//   const defaultTo = new Date(today);
//   const defaultFrom = new Date(today);
//   defaultFrom.setDate(today.getDate() - 29);

//   const toIso = (d: Date) => d.toISOString().slice(0, 10);

//   const [from, setFrom] = useState<string>(toIso(defaultFrom));
//   const [to, setTo] = useState<string>(toIso(defaultTo));
//   const [orders] = useState(STATIC_ORDERS);

//   // parse dates and filter (inclusive)
//   const filteredOrders = useMemo(() => {
//     const fromD = new Date(from + "T00:00:00");
//     const toD = new Date(to + "T23:59:59.999");
//     return orders.filter((o) => {
//       const od = new Date(o.date + (o.date.length === 10 ? "T00:00:00" : ""));
//       return od.getTime() >= fromD.getTime() && od.getTime() <= toD.getTime();
//     });
//   }, [orders, from, to]);

//   // Metrics
//   const franchiseCount = useMemo(() => new Set(filteredOrders.map((o) => o.franchiseId)).size, [filteredOrders]);
//   const revenue = useMemo(() => filteredOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0), [filteredOrders]);
//   const posOrders = useMemo(() => filteredOrders.length, [filteredOrders]);
//   const productsCount = useMemo(() => filteredOrders.reduce((s, o) => s + (Number(o.items) || 0), 0), [filteredOrders]);

//   const periodLabel = useMemo(() => {
//     const f = new Date(from);
//     const t = new Date(to);
//     if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth() && f.getDate() === t.getDate()) {
//       return f.toLocaleDateString("en-IN");
//     }
//     return `${f.toLocaleDateString("en-IN")} — ${t.toLocaleDateString("en-IN")}`;
//   }, [from, to]);

//   const applyReset = (reset = false) => {
//     if (reset) {
//       const defFrom = new Date();
//       defFrom.setDate(defFrom.getDate() - 29);
//       setFrom(toIso(defFrom));
//       setTo(toIso(new Date()));
//       return;
//     }
//     // otherwise nothing special — filteredOrders recomputes via hooks
//   };
//   const Weekly = WeeklyChart as unknown as React.FC<any>;
//   const Yearly = YearlyChart as unknown as React.FC<any>;
//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground mb-2">Welcome!</h1>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <MetricCard
//           title="Online Sales"
//           value={fmtNumber(franchiseCount)}
//            icon={<IndianRupee className="h-8 w-8" />}
//           variant="visits"
//         />
//         <MetricCard
//           title="Offline Sales"
//           value={`${fmtCurrency(revenue)}`}
//           icon={<IndianRupee className="h-8 w-8" />}
//           variant="revenue"
//         />
//         <MetricCard
//           title="Categories"
//           value={fmtNumber(posOrders)}
//           icon={<ShoppingCart className="h-8 w-8" />}
//           variant="orders"
//         />
//         <MetricCard
//           title="Products"
//           value={fmtNumber(productsCount)}
//           icon={<Users className="h-8 w-8" />}
//           variant="users"
//         />
//       </div>
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//         <Weekly orders={filteredOrders} />
//         <Yearly orders={filteredOrders} toDate={new Date(to)} />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// src/app/dashboard/Dashboard.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { MetricCard } from "@/components/MetricCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { YearlyChart } from "@/components/YearlyChart";
import { Eye, IndianRupee, ShoppingCart, Users } from "lucide-react";
import {
  selectSalesRows,
  selectCountsAndRevenue,
  SaleRow,
} from "@/redux/slices/SalesSlice"; // adjust path if needed

function fmtNumber(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function fmtCurrency(n: number) {
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
}

const Dashboard: React.FC = () => {
  // default range = last 30 days
  const today = new Date();
  const defaultTo = new Date(today);
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 29);

  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  const [from, setFrom] = useState<string>(toIso(defaultFrom));
  const [to, setTo] = useState<string>(toIso(defaultTo));

  // read unified rows from redux
  const rows = useSelector(selectSalesRows) as SaleRow[];

  // Channel summary (counts & revenues)
  const { onlineCount, offlineCount, onlineRevenue, offlineRevenue } = useSelector(selectCountsAndRevenue);

  // compute combined & filtered orders for charts (inclusive date range)
  const combinedOrders = useMemo(() => rows || [], [rows]);

  const filteredOrders = useMemo(() => {
    const fromD = new Date(from + "T00:00:00");
    const toD = new Date(to + "T23:59:59.999");
    return combinedOrders.filter((o) => {
      const od = new Date((o.date ?? "").length === 10 ? `${o.date}T00:00:00` : (o.date ?? ""));
      return od.getTime() >= fromD.getTime() && od.getTime() <= toD.getTime();
    });
  }, [combinedOrders, from, to]);

  // Metrics derived from filteredOrders
  const franchiseCount = useMemo(() => new Set(filteredOrders.map((o) => o.franchiseId)).size, [filteredOrders]);
  const revenue = useMemo(() => filteredOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0), [filteredOrders]);
  const posOrders = useMemo(() => filteredOrders.length, [filteredOrders]);
  const productsCount = useMemo(() => filteredOrders.reduce((s, o) => s + (Number(o.items) || 0), 0), [filteredOrders]);

  // NEW: total payments = onlineCount + offlineCount
  const totalPaymentsCount = useMemo(() => (Number(onlineCount || 0) + Number(offlineCount || 0)), [onlineCount, offlineCount]);
  const totalPaymentsRevenue = useMemo(() => (Number(onlineRevenue || 0) + Number(offlineRevenue || 0)), [onlineRevenue, offlineRevenue]);

  const periodLabel = useMemo(() => {
    const f = new Date(from);
    const t = new Date(to);
    if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth() && f.getDate() === t.getDate()) {
      return f.toLocaleDateString("en-IN");
    }
    return `${f.toLocaleDateString("en-IN")} — ${t.toLocaleDateString("en-IN")}`;
  }, [from, to]);

  const applyReset = (reset = false) => {
    if (reset) {
      const defFrom = new Date();
      defFrom.setDate(defFrom.getDate() - 29);
      setFrom(toIso(defFrom));
      setTo(toIso(new Date()));
    }
  };

  const Weekly = WeeklyChart as unknown as React.FC<any>;
  const Yearly = YearlyChart as unknown as React.FC<any>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome!</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Online Orders"
          value={fmtNumber(onlineCount)}
          subtitle={`Revenue ₹${fmtCurrency(onlineRevenue)}`}
          icon={<IndianRupee className="h-8 w-8" />}
          variant="visits"
        />
        <MetricCard
          title="Offline Orders"
          value={fmtNumber(offlineCount)}
          subtitle={`Revenue ₹${fmtCurrency(offlineRevenue)}`}
          icon={<ShoppingCart className="h-8 w-8" />}
          variant="revenue"
        />
        <MetricCard
          title="Total Orders"
          value={fmtNumber(totalPaymentsCount)}                              // updated to show online+offline count
          subtitle={`Total Revenue ₹${fmtCurrency(totalPaymentsRevenue)}`}   // combined revenue subtitle
          icon={<Eye className="h-8 w-8" />}
          variant="orders"
        />
        {/* <MetricCard
          title="Products"
          value={fmtNumber(productsCount)}
          subtitle={`Total ₹${fmtCurrency(revenue)}`}
          icon={<Users className="h-8 w-8" />}
          variant="users"
        /> */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Weekly orders={filteredOrders} />
        <Yearly orders={filteredOrders} toDate={new Date(to)} />
      </div>
    </div>
  );
};

export default Dashboard;



