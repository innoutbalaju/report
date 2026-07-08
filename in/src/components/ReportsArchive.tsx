import React, { useState } from 'react';
import { useHotelStore, getDayNameOfDate } from '../store';
import { ManagersDailyReport } from '../types';
import { getUnicodeNepaliDate } from '../utils/nepaliDate';
import { Search, Eye, Printer, Copy, Trash2, FileSpreadsheet, Calendar, CalendarCheck2, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportsArchive() {
  const { reports, deleteReport, duplicateReport, initializeReportForDate, setActiveView } = useHotelStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');

  // Duplicate Modal state
  const [duplicateReportId, setDuplicateReportId] = useState<string | null>(null);
  const [duplicateDateInput, setDuplicateDateInput] = useState(new Date().toISOString().split('T')[0]);

  const months = [
    { label: 'January', val: '01' },
    { label: 'February', val: '02' },
    { label: 'March', val: '03' },
    { label: 'April', val: '04' },
    { label: 'May', val: '05' },
    { label: 'June', val: '06' },
    { label: 'July', val: '07' },
    { label: 'August', val: '08' },
    { label: 'September', val: '09' },
    { label: 'October', val: '10' },
    { label: 'November', val: '11' },
    { label: 'December', val: '12' },
  ];

  const handleOpenDuplicate = (id: string, date: string) => {
    setDuplicateReportId(id);
    setDuplicateDateInput(date);
  };

  const handleConfirmDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateReportId || !duplicateDateInput) return;

    // Check if report already exists for that date
    const exists = reports.some(r => r.date === duplicateDateInput);
    if (exists) {
      if (!confirm(`A report already exists for ${duplicateDateInput}. Overwrite it?`)) {
        return;
      }
    }

    duplicateReport(duplicateReportId, duplicateDateInput);
    setDuplicateReportId(null);
    alert(`Report duplicated successfully to ${duplicateDateInput} (${getDayNameOfDate(duplicateDateInput)})`);
  };

  const handleViewReport = (date: string) => {
    initializeReportForDate(date);
    setActiveView('report');
  };

  const handleDeleteReport = (id: string, date: string) => {
    if (confirm(`Are you sure you want to delete the daily report for ${date}? This action cannot be undone.`)) {
      deleteReport(id);
    }
  };

  // Filter archived reports
  const filteredReports = reports.filter((rep) => {
    // Check search query (date, day name)
    const matchesSearch = rep.date.includes(searchQuery) || 
                          rep.day.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check Month filter
    const monthOfRep = rep.date.split('-')[1]; // YYYY-MM-DD
    const matchesMonth = filterMonth === 'ALL' || monthOfRep === filterMonth;

    // Check Year filter
    const yearOfRep = rep.date.split('-')[0];
    const matchesYear = filterYear === 'ALL' || yearOfRep === filterYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Unique years list for filter dropdown
  const uniqueYears = Array.from(new Set(reports.map(r => r.date.split('-')[0]))).sort();

  // Helper to calculate total revenue for row summary
  const getReportSalesTotals = (rep: ManagersDailyReport) => {
    const hotelCash = rep.hotelIncome.reduce((acc, row) => acc + (row.cash || 0), 0);
    const hotelCard = rep.hotelIncome.reduce((acc, row) => acc + (row.card || 0), 0);
    const hotelQr = rep.hotelIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
    const hotelPqr = rep.hotelIncome.reduce((acc, row) => acc + (row.pqr || 0), 0);
    const hotelSales = hotelCash + hotelCard + hotelQr + hotelPqr;

    const restCash = rep.restaurantIncome.reduce((acc, row) => acc + (row.cash || 0), 0);
    const restCard = rep.restaurantIncome.reduce((acc, row) => acc + (row.card || 0), 0);
    const restQr = rep.restaurantIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
    const restPqr = rep.restaurantIncome.reduce((acc, row) => acc + (row.pqr || 0), 0);
    const restSales = restCash + restCard + restQr + restPqr;

    return {
      hotel: hotelSales,
      restaurant: restSales,
      total: hotelSales + restSales
    };
  };

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-luxury-accent/30 selection:text-luxury-light">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-luxury-card/40 border border-luxury-border/50 p-8 rounded-[18px] backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-extrabold text-luxury-light tracking-tight">
            Daily Reports Archive
          </h1>
          <p className="text-xs text-luxury-light/60 mt-1.5 font-medium">
            Browse, search, duplicate, print, and audit historically saved daily manager sheets.
          </p>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-luxury-card border border-luxury-border/50 p-6 rounded-[18px] shadow-lg space-y-4 glow-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Query Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-luxury-light/45 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by date or day (e.g. Wednesday)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light placeholder-luxury-light/35 transition-all font-medium"
            />
          </div>

          {/* Month select */}
          <div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light transition-all font-medium"
            >
              <option value="ALL" className="bg-luxury-card text-luxury-light">All Months</option>
              {months.map(m => (
                <option key={m.val} value={m.val} className="bg-luxury-card text-luxury-light">{m.label}</option>
              ))}
            </select>
          </div>

          {/* Year select */}
          <div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light transition-all font-medium"
            >
              <option value="ALL" className="bg-luxury-card text-luxury-light">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year} className="bg-luxury-card text-luxury-light">{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-xs font-bold text-luxury-accent">
            Found {filteredReports.length} reports
          </div>
        </div>
      </div>

      {/* Duplicate Modal Dialog */}
      {duplicateReportId && (
        <div className="fixed inset-0 bg-luxury-bg/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-luxury-card border border-luxury-border/60 rounded-[18px] p-8 shadow-[0_25px_60px_-15px_rgba(5,31,32,0.9)] relative glow-card"
          >
            <button 
              onClick={() => setDuplicateReportId(null)}
              className="absolute top-4 right-4 text-luxury-light/40 hover:text-luxury-light transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-base font-bold text-luxury-light mb-3 flex items-center gap-2">
              <Copy className="w-4 h-4 text-luxury-accent" />
              Duplicate Report
            </h3>
            
            <p className="text-xs text-luxury-light/60 leading-relaxed mb-5 font-medium">
              Copies all hotel entries, restaurant rows, and custom settings of this sheet into a clean report for a different day.
            </p>

            <form onSubmit={handleConfirmDuplicate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-luxury-light/50 uppercase tracking-widest mb-2">
                  Target Report Date
                </label>
                <input
                  type="date"
                  value={duplicateDateInput}
                  onChange={(e) => setDuplicateDateInput(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-sm bg-luxury-bg/50 border border-luxury-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent focus:border-luxury-accent text-luxury-light placeholder-luxury-light/35 transition-all font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-luxury-bg/50 border border-luxury-border/60 rounded-xl">
                <p className="text-[10px] text-luxury-accent font-bold uppercase tracking-wider leading-tight">
                  Calculated Day Of Week: <strong className="text-luxury-light">{getDayNameOfDate(duplicateDateInput)}</strong>
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setDuplicateReportId(null)}
                  className="flex-1 py-3 border border-luxury-border/60 rounded-xl text-xs font-bold uppercase tracking-wider text-luxury-light/70 hover:bg-luxury-hover/50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-luxury-accent hover:bg-luxury-accent/90 text-luxury-bg rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(142,182,155,0.2)] cursor-pointer"
                >
                  Confirm Duplicate
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Reports Table Grid */}
      <div className="bg-luxury-card/85 border border-luxury-border/50 rounded-[18px] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-luxury-bg/40 text-luxury-light/50 uppercase tracking-widest text-[9px] font-bold border-b border-luxury-border/40">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Day</th>
                <th className="py-4 px-6">Hotel Sales</th>
                <th className="py-4 px-6">Restaurant Sales</th>
                <th className="py-4 px-6">Combined Revenue</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/30 text-luxury-light/85 font-medium">
              {filteredReports.map((rep) => {
                const sales = getReportSalesTotals(rep);
                return (
                  <tr key={rep.id} className="hover:bg-luxury-hover/35 transition-colors">
                    <td className="py-4 px-6 text-luxury-light">
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5 text-luxury-accent" />
                        {rep.date}
                      </div>
                      <div className="text-[10px] text-luxury-light/45 font-bold pl-5 mt-1 uppercase tracking-wider">
                        BS: {getUnicodeNepaliDate(rep.date)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-luxury-bg text-luxury-accent border border-luxury-border/60">
                        {rep.day}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-luxury-light/70">Rs. {sales.hotel.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-luxury-light/70">Rs. {sales.restaurant.toLocaleString()}</td>
                    <td className="py-4 px-6 font-extrabold font-mono text-luxury-accent">
                      Rs. {sales.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleViewReport(rep.date)}
                          title="Open & Edit Report"
                          className="p-2 text-luxury-light/45 hover:text-luxury-accent hover:bg-luxury-hover rounded-xl transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleViewReport(rep.date)} // Viewing will trigger the sheet where they can print!
                          title="Print Report Layout"
                          className="p-2 text-luxury-light/45 hover:text-luxury-accent hover:bg-luxury-hover rounded-xl transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDuplicate(rep.id, rep.date)}
                          title="Duplicate/Copy Report"
                          className="p-2 text-luxury-light/45 hover:text-luxury-accent hover:bg-luxury-hover rounded-xl transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(rep.id, rep.date)}
                          title="Delete Report"
                          className="p-2 text-luxury-light/45 hover:text-red-400 hover:bg-red-950/10 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-luxury-light/40">
                    <FileSpreadsheet className="w-10 h-10 text-luxury-light/30 mx-auto mb-3 animate-pulse" />
                    <h3 className="font-bold text-sm text-luxury-light/70">No archived sheets</h3>
                    <p className="text-xs text-luxury-light/40 mt-1.5 leading-relaxed">
                      You can generate new records from the Dashboard or by selecting an operational date.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
