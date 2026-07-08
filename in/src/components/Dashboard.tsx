import React from 'react';
import { useHotelStore } from '../store';
import { getUnicodeNepaliDate } from '../utils/nepaliDate';
import { 
  Building2, 
  Utensils, 
  CircleDollarSign, 
  Coins, 
  CreditCard, 
  QrCode, 
  TrendingUp, 
  Clipboard, 
  DoorClosed, 
  Sparkles,
  Settings,
  FolderKanban,
  FileSpreadsheet,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Dashboard() {
  const { 
    rooms, 
    restaurantBills, 
    reports, 
    setActiveView, 
    initializeReportForDate,
    settings 
  } = useHotelStore();

  const todayDate = new Date().toISOString().split('T')[0];

  // Dynamic calculations for "Today" (current local date)
  const todayReport = reports.find(r => r.date === todayDate);
  const todayBills = restaurantBills.filter(b => b.date === todayDate);

  // Today's Restaurant Sales from the bills module
  const todayRestSales = todayBills.reduce((acc, bill) => acc + bill.amount, 0);

  // Today's Hotel Sales (from the active report or 0 if not generated yet)
  let todayHotelSales = 0;
  let todayHotelCash = 0;
  let todayHotelCard = 0;
  let todayHotelQr = 0;
  let todayHotelPqr = 0;

  if (todayReport) {
    todayHotelCash = todayReport.hotelIncome.reduce((acc, row) => acc + (row.cash || 0), 0);
    todayHotelCard = todayReport.hotelIncome.reduce((acc, row) => acc + (row.card || 0), 0);
    todayHotelQr = todayReport.hotelIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
    todayHotelPqr = todayReport.hotelIncome.reduce((acc, row) => acc + (row.pqr || 0), 0);
    todayHotelSales = todayHotelCash + todayHotelCard + todayHotelQr + todayHotelPqr;
  }

  // Combine cash, card, qr, pqr from both hotel and restaurant
  const todayRestCash = todayBills.filter(b => b.paymentMethod === 'Cash').reduce((acc, b) => acc + b.amount, 0);
  const todayRestCard = todayBills.filter(b => b.paymentMethod === 'Card').reduce((acc, b) => acc + b.amount, 0);
  const todayRestQr = todayBills.filter(b => b.paymentMethod === 'QR').reduce((acc, b) => acc + b.amount, 0);
  const todayRestPqr = todayBills.filter(b => b.paymentMethod === 'PQR').reduce((acc, b) => acc + b.amount, 0);

  const totalCash = todayHotelCash + todayRestCash;
  const totalCard = todayHotelCard + todayRestCard;
  const totalQr = todayHotelQr + todayRestQr;
  const totalPqr = todayHotelPqr + todayRestPqr;

  const totalSales = todayHotelSales + todayRestSales;

  // Occupancy metrics
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'Occupied').length;
  const vacantRoomsCount = rooms.filter(r => r.status === 'Vacant').length;
  const cleaningRoomsCount = rooms.filter(r => r.status === 'Cleaning').length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === 'Maintenance').length;

  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

  const handleOpenTodayReport = () => {
    initializeReportForDate(todayDate);
    setActiveView('report');
  };

  // Luxury Stat Cards Setup
  const statCards = [
    {
      title: "Today's Hotel Sales",
      value: `Rs. ${todayHotelSales.toLocaleString()}`,
      description: todayReport ? "Calculated from active daily report" : "Report not created for today yet",
      icon: Building2,
      accent: "#8EB69B"
    },
    {
      title: "Today's Restaurant Sales",
      value: `Rs. ${todayRestSales.toLocaleString()}`,
      description: `${todayBills.length} guest receipts generated today`,
      icon: Utensils,
      accent: "#8EB69B"
    },
    {
      title: "Today's Total Sales",
      value: `Rs. ${totalSales.toLocaleString()}`,
      description: "Aggregated PMS & POS Revenue",
      icon: CircleDollarSign,
      accent: "#DAF1DE",
      isPremium: true
    },
    {
      title: "Cash Drawer",
      value: `Rs. ${totalCash.toLocaleString()}`,
      description: "Direct cash in hand",
      icon: Coins,
      accent: "#8EB69B"
    },
    {
      title: "Card Terminal",
      value: `Rs. ${totalCard.toLocaleString()}`,
      description: "POS swipe payments",
      icon: CreditCard,
      accent: "#8EB69B"
    },
    {
      title: "QR Code Pay",
      value: `Rs. ${totalQr.toLocaleString()}`,
      description: "Mobile e-banking transfers",
      icon: QrCode,
      accent: "#8EB69B"
    },
    {
      title: "Partner QR / PQR",
      value: `Rs. ${totalPqr.toLocaleString()}`,
      description: "Consolidated portal entries",
      icon: TrendingUp,
      accent: "#8EB69B"
    },
    {
      title: "Occupied Rooms",
      value: `${occupiedRoomsCount} / ${totalRoomsCount}`,
      description: `${occupancyRate}% current occupancy`,
      icon: DoorClosed,
      accent: "#8EB69B"
    },
    {
      title: "Vacant Rooms",
      value: `${vacantRoomsCount} Rooms`,
      description: `${cleaningRoomsCount} cleaning, ${maintenanceRoomsCount} offline`,
      icon: Sparkles,
      accent: "#8EB69B"
    }
  ];

  const menuButtons = [
    {
      label: "Manager Daily Report",
      description: "Review, sign, and print the official hotel & restaurant manager daily records.",
      icon: Clipboard,
      action: handleOpenTodayReport
    },
    {
      label: "Reports Archive",
      description: "Query and filter historically compiled financial audits and business metrics.",
      icon: FileSpreadsheet,
      action: () => setActiveView('reports_archive')
    },
    {
      label: "System Settings",
      description: "Configure room metadata, active payment credentials, and property branding.",
      icon: Settings,
      action: () => setActiveView('settings')
    }
  ];

  // Sales Trend Chart Data (Last 7 reports or padded)
  const chartData = reports.slice(-7).map(rep => {
    const hotelCash = rep.hotelIncome.reduce((acc, row) => acc + (row.cash || 0), 0);
    const hotelCard = rep.hotelIncome.reduce((acc, row) => acc + (row.card || 0), 0);
    const hotelQr = rep.hotelIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
    const hSales = hotelCash + hotelCard + hotelQr;
    
    const rBills = restaurantBills.filter(b => b.date === rep.date);
    const rSales = rBills.reduce((acc, b) => acc + b.amount, 0);
    
    return {
      date: rep.date,
      Hotel: hSales,
      Restaurant: rSales,
      Total: hSales + rSales
    };
  });

  // If chart data is too short, provide a premium mock curve to visualize beautifully
  const renderChartData = chartData.length > 0 ? chartData : [
    { date: '2026-07-02', Hotel: 45000, Restaurant: 12000, Total: 57000 },
    { date: '2026-07-03', Hotel: 52000, Restaurant: 15400, Total: 67400 },
    { date: '2026-07-04', Hotel: 39000, Restaurant: 11000, Total: 50000 },
    { date: '2026-07-05', Hotel: 61000, Restaurant: 18500, Total: 79500 },
    { date: '2026-07-06', Hotel: 55000, Restaurant: 22000, Total: 77000 },
    { date: '2026-07-07', Hotel: 70000, Restaurant: 25000, Total: 95000 },
    { date: todayDate, Hotel: todayHotelSales, Restaurant: todayRestSales, Total: totalSales }
  ];

  return (
    <div className="space-y-10 pb-12 font-sans selection:bg-luxury-accent/30 selection:text-luxury-light">
      {/* Header Banner - Glassmorphism */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-luxury-card/40 border border-luxury-border/50 p-8 rounded-[18px] shadow-[0_12px_40px_rgba(5,31,32,0.4)] relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-luxury-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-luxury-light tracking-tight flex items-center gap-2">
            Control Console
          </h1>
          <p className="text-sm text-luxury-light/70 mt-2 font-medium">
            Welcome back to the corporate command center of <span className="font-semibold text-luxury-accent">{settings.hotelName}</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex flex-col items-end gap-1.5 px-5 py-3 bg-luxury-bg/50 border border-luxury-border/60 rounded-xl shadow-inner">
            <span className="text-[10px] uppercase tracking-widest font-bold text-luxury-accent/80">AD Operational Calendar</span>
            <span className="text-sm font-extrabold font-mono text-luxury-light">{todayDate}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5 px-5 py-3 bg-luxury-accent text-luxury-bg rounded-xl shadow-[0_4px_12px_rgba(142,182,155,0.2)]">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-luxury-bg/70">BS Nepal Calendar</span>
            <span className="text-sm font-extrabold font-mono">{getUnicodeNepaliDate(todayDate)}</span>
          </div>
        </div>
      </div>

      {/* Grid statistics - Luxury Bento Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.03 }}
            className={`p-6 rounded-[16px] border ${
              card.isPremium 
                ? 'border-luxury-accent bg-luxury-card shadow-[0_8px_32px_rgba(142,182,155,0.08)]' 
                : 'border-luxury-border/50 bg-luxury-card/75 hover:bg-luxury-hover/50'
            } transition-all duration-300 flex flex-col justify-between glow-card relative group`}
          >
            {card.isPremium && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-luxury-accent text-luxury-bg font-bold text-[9px] uppercase tracking-widest rounded-bl-xl rounded-tr-[14px]">
                Total Revenue
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-luxury-light/60 uppercase tracking-widest">{card.title}</p>
                <h3 className={`text-2xl font-extrabold text-luxury-light mt-2.5 font-mono ${card.isPremium ? 'text-luxury-accent' : ''}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl border ${
                card.isPremium 
                  ? 'bg-luxury-accent/10 border-luxury-accent/40 text-luxury-accent' 
                  : 'bg-luxury-bg/50 border-luxury-border/60 text-luxury-light/70 group-hover:text-luxury-accent group-hover:border-luxury-accent/30'
              } transition-colors duration-300`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-luxury-light/50 mt-5 border-t border-luxury-border/40 pt-3 flex items-center justify-between font-medium">
              <span>{card.description}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section - Professional Line Chart */}
      <div className="bg-luxury-card border border-luxury-border/50 p-6 md:p-8 rounded-[18px] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-luxury-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-luxury-hover rounded-xl border border-luxury-border/60">
              <Activity className="w-5 h-5 text-luxury-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-luxury-light tracking-tight">Financial Performance Curve</h2>
              <p className="text-xs text-luxury-light/55 mt-0.5">Hotel vs. Restaurant dynamic billing trends over time</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8EB69B]"></span>
              <span className="text-luxury-light/70">Hotel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DAF1DE]"></span>
              <span className="text-luxury-light/70">Restaurant</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={renderChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHotel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8EB69B" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8EB69B" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DAF1DE" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#DAF1DE" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#235347" opacity={0.25} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(218,241,222,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(218,241,222,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `Rs. ${val >= 1000 ? (val / 1000) + 'k' : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B2B26',
                  borderColor: '#235347',
                  borderRadius: '12px',
                  color: '#DAF1DE',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 8px 24px rgba(5,31,32,0.5)'
                }}
                itemStyle={{ color: '#DAF1DE' }}
                labelStyle={{ color: 'rgba(218,241,222,0.5)', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="Hotel" 
                stroke="#8EB69B" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorHotel)" 
              />
              <Area 
                type="monotone" 
                dataKey="Restaurant" 
                stroke="#DAF1DE" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorRest)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main navigation buttons / Quick Launch */}
      <div className="bg-luxury-card/50 border border-luxury-border/50 p-6 md:p-8 rounded-[18px] shadow-lg">
        <h2 className="text-lg font-bold text-luxury-light tracking-tight mb-6 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-luxury-accent" />
          Enterprise Gateways
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className="text-left p-6 rounded-xl border border-luxury-border/50 bg-luxury-card/30 hover:bg-luxury-hover/40 hover:border-luxury-accent/50 group transition-all duration-300 relative overflow-hidden active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-xl bg-luxury-hover border border-luxury-border/60 text-luxury-accent group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <btn.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-luxury-light group-hover:text-luxury-accent transition-colors flex items-center justify-between">
                    <span>{btn.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-luxury-light/20 group-hover:text-luxury-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h4>
                  <p className="text-xs text-luxury-light/60 mt-1.5 leading-relaxed">
                    {btn.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
