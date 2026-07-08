import React, { useEffect, useState } from 'react';
import { useHotelStore, getDayNameOfDate } from '../store';
import { HotelIncomeRow, RestaurantIncomeRow, PettyCashExpense, ManagersDailyReport } from '../types';
import { getUnicodeNepaliDate, getEnglishNepaliDate } from '../utils/nepaliDate';
import { 
  Printer, 
  Save, 
  Trash2, 
  Plus, 
  RotateCcw, 
  ArrowLeft, 
  Calendar, 
  Search, 
  User, 
  Sparkles, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportForm() {
  const { 
    currentReport, 
    currentReportDate, 
    updateCurrentReport, 
    saveCurrentReport, 
    setActiveView, 
    initializeReportForDate,
    rooms, 
    restaurantBills,
    settings 
  } = useHotelStore();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'print-preview'>('edit');
  const [billSearchStatus, setBillSearchStatus] = useState<Record<number, 'found' | 'not-found' | 'idle'>>({
    1: 'idle',
    2: 'idle'
  });

  // Load report when date changes or mount
  useEffect(() => {
    initializeReportForDate(currentReportDate);
  }, [currentReportDate]);

  if (!currentReport) {
    return (
      <div className="py-16 text-center bg-luxury-card border border-luxury-border/50 rounded-[18px] glow-card">
        <span className="w-8 h-8 border-2 border-luxury-accent border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs text-luxury-light/60 mt-3 font-medium">Loading today's report structure...</p>
      </div>
    );
  }

  const handleDateChange = (date: string) => {
    initializeReportForDate(date);
  };

  // Hotel Income editing helpers
  const handleHotelRowChange = (index: number, fields: Partial<HotelIncomeRow>) => {
    const updatedRows = [...currentReport.hotelIncome];
    
    // Check if room number was changed, if so, auto-fill base rate!
    if (fields.roomNo !== undefined) {
      const selectedRoom = rooms.find(r => r.number === fields.roomNo);
      if (selectedRoom) {
        fields.rate = selectedRoom.baseRate;
      }
    }

    // Check if payment fields were adjusted
    // If user enters custom direct columns: Card, QR, PQR, Cash
    // If payment method & paymentAmount are set, automatically populate the corresponding column
    const currentRow = { ...updatedRows[index], ...fields };

    if (fields.paymentMethod !== undefined || fields.paymentAmount !== undefined) {
      // Reset payment columns
      currentRow.card = 0;
      currentRow.qr = 0;
      currentRow.pqr = 0;
      currentRow.cash = 0;

      const method = currentRow.paymentMethod;
      const amt = currentRow.paymentAmount || 0;

      if (method === 'Card') currentRow.card = amt;
      else if (method === 'QR') currentRow.qr = amt;
      else if (method === 'PQR') currentRow.pqr = amt;
      else if (method === 'Cash') currentRow.cash = amt;
    }

    updatedRows[index] = { ...currentRow };
    updateCurrentReport({ hotelIncome: updatedRows });
  };

  // Restaurant Income editing helpers
  const handleRestaurantRowChange = (index: number, fields: Partial<RestaurantIncomeRow>) => {
    const updatedRows = [...currentReport.restaurantIncome];
    const currentRow = { ...updatedRows[index], ...fields };

    // If billNumber was updated, try to fetch from bills!
    if (fields.billNumber !== undefined) {
      const bNumber = fields.billNumber.trim().toUpperCase();
      const matchedBill = restaurantBills.find(b => b.billNumber.toUpperCase() === bNumber && b.date === currentReport.date);

      if (matchedBill) {
        currentRow.kot = matchedBill.kotAmount;
        currentRow.bot = matchedBill.botAmount;
        
        // Distribute amount based on payment method
        currentRow.card = 0;
        currentRow.qr = 0;
        currentRow.pqr = 0;
        currentRow.cash = 0;

        if (matchedBill.paymentMethod === 'Card') currentRow.card = matchedBill.amount;
        else if (matchedBill.paymentMethod === 'QR') currentRow.qr = matchedBill.amount;
        else if (matchedBill.paymentMethod === 'PQR') currentRow.pqr = matchedBill.amount;
        else if (matchedBill.paymentMethod === 'Cash') currentRow.cash = matchedBill.amount;

        currentRow.remarks = matchedBill.remarks;

        setBillSearchStatus(prev => ({ ...prev, [currentRow.sNo]: 'found' }));
      } else if (bNumber === '') {
        currentRow.kot = 0;
        currentRow.bot = 0;
        currentRow.card = 0;
        currentRow.qr = 0;
        currentRow.pqr = 0;
        currentRow.cash = 0;
        currentRow.remarks = '';
        setBillSearchStatus(prev => ({ ...prev, [currentRow.sNo]: 'idle' }));
      } else {
        // Not found, keep as zero or let them type but show alert label
        setBillSearchStatus(prev => ({ ...prev, [currentRow.sNo]: 'not-found' }));
      }
    }

    updatedRows[index] = { ...currentRow };
    updateCurrentReport({ restaurantIncome: updatedRows });
  };

  // Petty Cash row changing
  const handlePettyCashChange = (index: number, fields: Partial<PettyCashExpense>) => {
    const updatedRows = [...currentReport.pettyCash];
    updatedRows[index] = { ...updatedRows[index], ...fields };
    updateCurrentReport({ pettyCash: updatedRows });
  };

  // Calculations for Hotel Income Totals
  const hotelTotalRate = currentReport.hotelIncome.reduce((acc, row) => acc + (row.rate || 0), 0);
  const hotelTotalKOT = currentReport.hotelIncome.reduce((acc, row) => acc + (row.kot || 0), 0);
  const hotelTotalBOT = currentReport.hotelIncome.reduce((acc, row) => acc + (row.bot || 0), 0);
  const hotelTotalCard = currentReport.hotelIncome.reduce((acc, row) => acc + (row.card || 0), 0);
  const hotelTotalQR = currentReport.hotelIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
  const hotelTotalPQR = currentReport.hotelIncome.reduce((acc, row) => acc + (row.pqr || 0), 0);
  const hotelTotalCash = currentReport.hotelIncome.reduce((acc, row) => acc + (row.cash || 0), 0);

  // Calculations for Restaurant Income Totals
  const restTotalKOT = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.kot || 0), 0);
  const restTotalBOT = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.bot || 0), 0);
  const restTotalCard = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.card || 0), 0);
  const restTotalQR = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.qr || 0), 0);
  const restTotalPQR = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.pqr || 0), 0);
  const restTotalCash = currentReport.restaurantIncome.reduce((acc, row) => acc + (row.cash || 0), 0);

  // Petty Cash Total
  const pettyCashTotal = currentReport.pettyCash.reduce((acc, row) => acc + (row.total || 0), 0);

  // Overall Bottom Summary
  const totalHotelSalesSummary = hotelTotalCard + hotelTotalQR + hotelTotalPQR + hotelTotalCash;
  const totalRestSalesSummary = restTotalCard + restTotalQR + restTotalPQR + restTotalCash;
  const overallTotalSalesSummary = totalHotelSalesSummary + totalRestSalesSummary;

  const cardSummaryTotal = hotelTotalCard + restTotalCard;
  const qrSummaryTotal = hotelTotalQR + restTotalQR;
  const pqrSummaryTotal = hotelTotalPQR + restTotalPQR;
  const cashSummaryTotal = hotelTotalCash + restTotalCash;
  const bottomCombinedTotal = cardSummaryTotal + qrSummaryTotal + pqrSummaryTotal + cashSummaryTotal;

  // Save changes
  const handleSaveReport = () => {
    saveCurrentReport();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  // Reset report back to defaults
  const handleResetReport = () => {
    if (confirm('Are you sure you want to clear all inputs in this report? This will reset all rows back to blank.')) {
      updateCurrentReport({
        hotelIncome: Array.from({ length: 19 }, (_, i) => ({
          sNo: i + 1,
          roomNo: '',
          rate: 0,
          kot: 0,
          bot: 0,
          paymentMethod: '',
          paymentAmount: 0,
          card: 0,
          qr: 0,
          pqr: 0,
          cash: 0,
          remarks: ''
        })),
        restaurantIncome: Array.from({ length: 2 }, (_, i) => ({
          sNo: i + 1,
          billNumber: '',
          kot: 0,
          bot: 0,
          card: 0,
          qr: 0,
          pqr: 0,
          cash: 0,
          remarks: ''
        })),
        pettyCash: [{ sNo: 1, particulars: '', total: 0, remarks: '' }],
        managerNote: '',
        managerSignature: ''
      });
      setBillSearchStatus({ 1: 'idle', 2: 'idle' });
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans selection:bg-luxury-accent/30 selection:text-luxury-light">
      {/* Top Controls Banner (Hidden in Print) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-luxury-card/40 border border-luxury-border/50 p-8 rounded-[18px] backdrop-blur-md print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-3 border border-luxury-border/60 hover:bg-luxury-hover/50 rounded-xl transition-all text-luxury-light cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-luxury-light tracking-tight flex items-center gap-2">
              Daily Manager Sheet
            </h1>
            <p className="text-xs text-luxury-light/60 mt-1 font-medium">
              Automated sheet matching physical template for perfect bookkeeping.
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-luxury-bg/50 border border-luxury-border/60 px-5 py-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-luxury-accent animate-pulse" />
            <span className="text-xs font-bold text-luxury-light/60 uppercase tracking-widest">Date:</span>
            <input
              type="date"
              value={currentReport.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-extrabold focus:outline-none text-luxury-light font-mono cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap border-t sm:border-t-0 sm:border-l border-luxury-border/50 pt-2.5 sm:pt-0 sm:pl-4">
            <span className="text-[10px] px-3 py-1 bg-luxury-card border border-luxury-border/50 rounded-lg text-luxury-light font-extrabold uppercase tracking-wider">
              {currentReport.day}
            </span>
            <span className="text-[10px] px-3 py-1 bg-luxury-accent text-luxury-bg rounded-lg font-extrabold tracking-wider">
              BS: {getUnicodeNepaliDate(currentReport.date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetReport}
            title="Clear Form"
            className="px-4 py-3 border border-luxury-border/60 hover:bg-red-950/20 text-luxury-light/60 hover:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handleSaveReport}
            className="inline-flex items-center gap-2 px-5 py-3 bg-luxury-accent hover:bg-luxury-accent/90 text-luxury-bg font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-[0_4px_12px_rgba(142,182,155,0.2)] transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saveSuccess ? 'Saved!' : 'Save Report'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-3 bg-luxury-light hover:bg-luxury-light/90 text-luxury-bg font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Landscape A4
          </button>
        </div>
      </div>

      {/* Printing stylesheet injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide non-printable UI chrome, sidebars, headers, and buttons */
          .print\\:hidden, aside, header, button, .print-hide {
            display: none !important;
          }
          
          /* Force standard colors and backgrounds to be printed exact */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Reset viewport and parent element layout constraints for perfect printing flow */
          html, body, #root, .min-h-screen, main, .flex-1, .overflow-y-auto {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            display: block !important;
            box-shadow: none !important;
            border: none !important;
          }

          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            padding: 10px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            display: block !important;
          }

          @page {
            size: A4 landscape;
            margin: 0.3cm;
          }

          input, select, textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0px !important;
            appearance: none !important;
            -moz-appearance: none !important;
            -webkit-appearance: none !important;
            color: black !important;
            font-weight: bold !important;
          }
          input::placeholder {
            color: transparent !important;
          }
          /* Keep table cell inputs neat on paper */
          input[type="number"] {
            -moz-appearance: textfield;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          /* Custom grid print adjustments */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid black !important;
            color: black !important;
            padding: 2px 4px !important;
          }
          .print-border-black {
            border: 1px solid black !important;
          }
        }
      `}} />

      {/* Active Editor Instructions (Hidden in Print) */}
      <div className="bg-luxury-card/60 border border-luxury-border/50 p-6 rounded-[18px] flex items-start gap-4 print:hidden shadow-sm">
        <Info className="w-5 h-5 text-luxury-accent shrink-0 mt-0.5" />
        <div className="text-xs text-luxury-light/80 leading-relaxed font-medium">
          <p className="font-bold text-luxury-accent uppercase tracking-wider text-[10px] mb-2">Daily Manager Report Automation Engines Active:</p>
          <ul className="list-disc pl-4 space-y-1.5 text-luxury-light/60">
            <li><strong>Room Auto-Rates:</strong> Selecting a Room Number in the Hotel Income row automatically extracts and locks the standard category rate.</li>
            <li><strong>POS Bill Pull:</strong> Typing an active Bill Number (e.g. B-1001) in the Restaurant Income particulars auto-populates KOT, BOT, payment distribution, and notes directly from the POS module.</li>
            <li><strong>Direct Payment Distribution:</strong> Selecting a Payment Method (Cash, QR, Card, PQR) and typing the amount automatically routes it into the corresponding ledger column, recalculating Grand Totals instantly.</li>
          </ul>
        </div>
      </div>

      {/* PHYSICAL TEMPLATE GRID CANVAS - A4 Landscape Container */}
      <div className="print-area w-full mx-auto bg-white text-black p-8 rounded-[18px] border border-gray-200 shadow-xl overflow-x-auto min-w-[1050px]">
        {/* Document Frame styling */}
        <div className="space-y-4 text-black font-sans">
          
          {/* Header Block */}
          <div className="text-center relative">
            <h1 className="text-xl font-black uppercase tracking-wider">{settings.hotelName}</h1>
            <h2 className="text-sm font-bold tracking-widest mt-1">Managers Daily Report</h2>
            
            <div className="flex justify-between items-center mt-4 text-xs font-bold pb-2 px-1">
              <div className="flex items-center">
                <span>Day : </span>
                <span className="font-mono border-b border-dotted border-black pb-0.5 px-2 min-w-[220px] inline-block text-left ml-1">
                  {currentReport.day || '...................................'}
                </span>
              </div>
              <div className="flex items-center">
                <span>Date : </span>
                <span className="font-mono border-b border-dotted border-black pb-0.5 px-2 min-w-[280px] inline-block text-left ml-1">
                  {currentReport.date ? `${getUnicodeNepaliDate(currentReport.date)} BS (${new Date(currentReport.date).toLocaleDateString('en-GB')} AD)` : '...................................'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: HOTEL INCOME TABLE */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-center bg-gray-50/50 print:bg-transparent border border-black py-0.5">
              Hotel Income
            </h3>

            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100/50 print:bg-transparent font-bold">
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[40px]">S.No</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[80px]">Room No.</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[85px]">Rate</th>
                  <th colSpan={2} className="border border-black px-1.5 py-0.5 text-center w-[150px]">Restaurant</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[85px]">Card</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[85px]">QR</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[85px]">PQR</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-center w-[85px]">Cash</th>
                  <th rowSpan={2} className="border border-black px-1.5 py-1 text-left w-[85px]">Remarks</th>
                </tr>
                <tr className="bg-gray-100/50 print:bg-transparent font-bold">
                  <th className="border border-black px-1 py-0.5 text-center w-[75px]">KOT</th>
                  <th className="border border-black px-1 py-0.5 text-center w-[75px]">BOT</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.hotelIncome.map((row, idx) => (
                  <tr key={idx} className="h-[24px]">
                    <td className="border border-black text-center font-bold">{row.sNo}</td>
                    
                    {/* Room No Selector / Input */}
                    <td className="border border-black p-0 text-center">
                      <select
                        value={row.roomNo}
                        onChange={(e) => handleHotelRowChange(idx, { roomNo: e.target.value })}
                        className="w-full text-center h-full bg-transparent focus:outline-none border-none py-0.5 px-1 font-semibold cursor-pointer appearance-none"
                      >
                        <option value="">-</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.number}>{r.number}</option>
                        ))}
                      </select>
                    </td>

                    {/* Rate */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.rate || ''}
                        onChange={(e) => handleHotelRowChange(idx, { rate: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono font-medium"
                      />
                    </td>

                    {/* Restaurant KOT */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.kot || ''}
                        onChange={(e) => handleHotelRowChange(idx, { kot: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* Restaurant BOT */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.bot || ''}
                        onChange={(e) => handleHotelRowChange(idx, { bot: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* Card */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.card || ''}
                        onChange={(e) => handleHotelRowChange(idx, { card: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* QR */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.qr || ''}
                        onChange={(e) => handleHotelRowChange(idx, { qr: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* PQR */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.pqr || ''}
                        onChange={(e) => handleHotelRowChange(idx, { pqr: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* Cash */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.cash || ''}
                        onChange={(e) => handleHotelRowChange(idx, { cash: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono font-medium"
                      />
                    </td>

                    {/* Remarks Input (Print gets just remarks text) */}
                    <td className="border border-black p-0 text-left relative group w-[85px]">
                      <div className="flex items-center w-full h-full">
                        <input
                          type="text"
                          placeholder=""
                          value={row.remarks || ''}
                          onChange={(e) => handleHotelRowChange(idx, { remarks: e.target.value })}
                          className="flex-1 bg-transparent focus:outline-none border-none py-0.5 px-2 text-xs"
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Grand Total Row */}
                <tr className="bg-gray-100/50 print:bg-transparent font-bold text-center h-[26px]">
                  <td colSpan={2} className="border border-black text-left pl-4 uppercase tracking-wider">Grand Total</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalRate.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalKOT.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalBOT.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalCard.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalQR.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalPQR.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{hotelTotalCash.toLocaleString()}</td>
                  <td className="border border-black bg-gray-100/30 print:bg-transparent w-[85px]"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: RESTAURANT INCOME */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-center bg-gray-50/50 print:bg-transparent border border-black py-0.5">
              Restaurant Income
            </h3>

            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100/50 print:bg-transparent font-bold">
                  <th className="border border-black px-1.5 py-1 text-center w-[40px]">S.No</th>
                  <th className="border border-black px-1.5 py-1 text-left w-[200px]">Particulars</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">KOT</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">BOT</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">Card</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">QR</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">PQR</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[100px]">Cash</th>
                  <th className="border border-black px-1.5 py-1 text-left w-[100px]">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.restaurantIncome.map((row, idx) => (
                  <tr key={idx} className="h-[24px]">
                    <td className="border border-black text-center font-bold">{row.sNo}</td>
                    
                    {/* Particulars (Editable Bill Number Search) */}
                    <td className="border border-black p-0 relative">
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Enter particulars..."
                          value={row.billNumber || ''}
                          onChange={(e) => handleRestaurantRowChange(idx, { billNumber: e.target.value })}
                          className="w-full bg-transparent focus:outline-none border-none py-0.5 px-2 font-mono font-bold"
                        />
                        
                        {/* Bill search status indicator (hidden in print) */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 print:hidden">
                          {billSearchStatus[row.sNo] === 'found' && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-zinc-850 px-1 rounded flex items-center gap-0.5">
                              Synced
                            </span>
                          )}
                          {billSearchStatus[row.sNo] === 'not-found' && (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-zinc-850 px-1 rounded flex items-center gap-0.5" title="No matching bill found for this date. Enter manually.">
                              Not found
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* KOT */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.kot || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { kot: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* BOT */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.bot || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { bot: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* Card */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.card || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { card: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* QR */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.qr || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { qr: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* PQR */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.pqr || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { pqr: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono"
                      />
                    </td>

                    {/* Cash */}
                    <td className="border border-black p-0 text-center">
                      <input
                        type="number"
                        placeholder="."
                        value={row.cash || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { cash: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono font-medium"
                      />
                    </td>

                    {/* Remarks */}
                    <td className="border border-black p-0 text-left w-[100px]">
                      <input
                        type="text"
                        value={row.remarks || ''}
                        onChange={(e) => handleRestaurantRowChange(idx, { remarks: e.target.value })}
                        className="w-full bg-transparent focus:outline-none border-none py-0.5 px-2"
                      />
                    </td>
                  </tr>
                ))}

                {/* Grand Total Row */}
                <tr className="bg-gray-100/50 print:bg-transparent font-bold text-center h-[26px]">
                  <td colSpan={2} className="border border-black text-left pl-4 uppercase tracking-wider">Grand Total</td>
                  <td className="border border-black font-mono">Rs.{restTotalKOT.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{restTotalBOT.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{restTotalCard.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{restTotalQR.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{restTotalPQR.toLocaleString()}</td>
                  <td className="border border-black font-mono">Rs.{restTotalCash.toLocaleString()}</td>
                  <td className="border border-black bg-gray-100/30 print:bg-transparent w-[100px]"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 3: TOTAL EXPENCE BY PETTY CASH */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-center bg-gray-50/50 print:bg-transparent border border-black py-0.5">
              Total Expence By Petty Cash
            </h3>

            <table className="w-full text-[11px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100/50 print:bg-transparent font-bold">
                  <th className="border border-black px-1.5 py-1 text-center w-[40px]">S.No</th>
                  <th className="border border-black px-1.5 py-1 text-left w-[550px]">Particulars</th>
                  <th className="border border-black px-1.5 py-1 text-center w-[150px]">Total</th>
                  <th className="border border-black px-1.5 py-1 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.pettyCash.map((row, idx) => (
                  <tr key={idx} className="h-[24px]">
                    <td className="border border-black text-center font-bold">{row.sNo}</td>
                    
                    {/* Particulars */}
                    <td className="border border-black p-0">
                      <input
                        type="text"
                        placeholder="Enter Petty Cash expenses..."
                        value={row.particulars || ''}
                        onChange={(e) => handlePettyCashChange(idx, { particulars: e.target.value })}
                        className="w-full bg-transparent focus:outline-none border-none py-0.5 px-2"
                      />
                    </td>

                    {/* Total */}
                    <td className="border border-black p-0 text-center font-bold">
                      <input
                        type="number"
                        placeholder="0"
                        value={row.total || ''}
                        onChange={(e) => handlePettyCashChange(idx, { total: parseFloat(e.target.value) || 0 })}
                        className="w-full text-center bg-transparent focus:outline-none border-none py-0.5 px-1 font-mono font-bold"
                      />
                    </td>

                    {/* Remarks */}
                    <td className="border border-black p-0 text-left">
                      <input
                        type="text"
                        value={row.remarks || ''}
                        onChange={(e) => handlePettyCashChange(idx, { remarks: e.target.value })}
                        className="w-full bg-transparent focus:outline-none border-none py-0.5 px-2"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SECTION 4: MANAGER NOTE & SUMMARY BLOCK */}
          <div className="space-y-0 border border-black">
            {/* Header: Manager's Note: */}
            <div className="border-b border-black text-xs font-bold uppercase tracking-wider text-center bg-gray-50/50 py-1">
              Manager's Note:
            </div>
            {/* Note Text Area (Blank space where notes are entered) */}
            <div className="p-1">
              <textarea
                value={currentReport.managerNote || ''}
                onChange={(e) => updateCurrentReport({ managerNote: e.target.value })}
                className="w-full min-h-[60px] p-2 text-[11px] bg-transparent focus:outline-none resize-none border-none leading-relaxed font-sans"
                placeholder="Type daily note summaries here..."
              />
            </div>
            {/* Split row: Total PQR: and Total Card & QR: */}
            <div className="grid grid-cols-2 border-t border-black text-[11px] font-bold divide-x divide-black h-[28px]">
              <div className="px-3 flex items-center justify-between">
                <span>Total PQR:</span>
                <span className="font-mono text-amber-700 dark:text-zinc-800">Rs. {pqrSummaryTotal.toLocaleString()}</span>
              </div>
              <div className="px-3 flex items-center justify-between">
                <span>Total Card & QR:</span>
                <span className="font-mono text-amber-700 dark:text-zinc-800">Rs. {(cardSummaryTotal + qrSummaryTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: FINAL OVERALL SUMMARY LEDGER */}
          <table className="w-full text-[11px] border-collapse border border-black text-center font-bold">
            <thead>
              <tr className="bg-gray-100/50 print:bg-transparent">
                <th className="border border-black px-1.5 py-1">Total Hotel Sales</th>
                <th className="border border-black px-1.5 py-1">Rest. Sales</th>
                <th className="border border-black px-1.5 py-1">Total Sales</th>
                <th className="border border-black px-1.5 py-1">Card</th>
                <th className="border border-black px-1.5 py-1">QR</th>
                <th className="border border-black px-1.5 py-1">PQR</th>
                <th className="border border-black px-1.5 py-1">Cash</th>
                <th className="border border-black px-1.5 py-1 bg-gray-100/20 print:bg-transparent">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-[26px] font-mono text-xs">
                <td className="border border-black">Rs.{totalHotelSalesSummary.toLocaleString()}</td>
                <td className="border border-black">Rs.{totalRestSalesSummary.toLocaleString()}</td>
                <td className="border border-black text-amber-700 font-extrabold">Rs.{overallTotalSalesSummary.toLocaleString()}</td>
                <td className="border border-black">Rs.{cardSummaryTotal.toLocaleString()}</td>
                <td className="border border-black">Rs.{qrSummaryTotal.toLocaleString()}</td>
                <td className="border border-black">Rs.{pqrSummaryTotal.toLocaleString()}</td>
                <td className="border border-black">Rs.{cashSummaryTotal.toLocaleString()}</td>
                <td className="border border-black text-amber-700 font-extrabold bg-gray-100/10">
                  Rs.{bottomCombinedTotal.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Signature block */}
          <div className="flex justify-between items-center text-xs font-bold pt-4 px-1">
            <div className="flex items-center">
              <span>Total Sales : </span>
              <span className="font-mono text-sm border-b border-dotted border-black pb-0.5 px-2 min-w-[200px] inline-block text-left ml-1">
                Rs. {overallTotalSalesSummary.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center">
              <span>Manager : </span>
              <input
                type="text"
                placeholder="..................................."
                value={currentReport.managerSignature || ''}
                onChange={(e) => updateCurrentReport({ managerSignature: e.target.value })}
                className="font-mono bg-transparent border-b border-dotted border-black pb-0.5 focus:outline-none w-[200px] font-bold px-2 ml-1"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
