import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, RestaurantBill, HotelIncomeRow, RestaurantIncomeRow, PettyCashExpense, ManagersDailyReport, SystemSettings } from './types';

interface HotelStore {
  // Auth State
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // View State
  activeView: 'dashboard' | 'report' | 'restaurant' | 'rooms' | 'reports_archive' | 'settings';
  setActiveView: (view: 'dashboard' | 'report' | 'restaurant' | 'rooms' | 'reports_archive' | 'settings') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Core Data State
  rooms: Room[];
  restaurantBills: RestaurantBill[];
  reports: ManagersDailyReport[];
  settings: SystemSettings;

  // Active Report State
  currentReportDate: string;
  currentReport: ManagersDailyReport | null;

  // Actions
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  setRooms: (rooms: Room[]) => void;
  
  addRestaurantBill: (bill: Omit<RestaurantBill, 'id' | 'createdAt'>) => void;
  deleteRestaurantBill: (id: string) => void;

  setCurrentReportDate: (date: string) => void;
  initializeReportForDate: (date: string) => void;
  updateCurrentReport: (updated: Partial<ManagersDailyReport>) => void;
  saveCurrentReport: () => void;
  deleteReport: (id: string) => void;
  duplicateReport: (id: string, newDate: string) => void;

  updateSettings: (settings: Partial<SystemSettings>) => void;
}

// Helper to get day name of a date
export const getDayNameOfDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nepaliDays = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
  return `${nepaliDays[date.getDay()]} (${days[date.getDay()]})`;
};

// Initial Room List
const initialRooms: Room[] = [
  { id: 'r201', number: '201', type: 'Super Deluxe', baseRate: 4500, status: 'Vacant' },
  { id: 'r202', number: '202', type: 'Super Deluxe', baseRate: 4500, status: 'Vacant' },
  { id: 'r401', number: '401', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r402', number: '402', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r403', number: '403', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r404', number: '404', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r405', number: '405', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r406', number: '406', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r407', number: '407', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r408', number: '408', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r409', number: '409', type: 'Deluxe Suite', baseRate: 3500, status: 'Vacant' },
  { id: 'r501', number: '501', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r502', number: '502', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r503', number: '503', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r504', number: '504', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r505', number: '505', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r506', number: '506', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r507', number: '507', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r508', number: '508', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
  { id: 'r509', number: '509', type: 'Executive Suite', baseRate: 5000, status: 'Vacant' },
];

// Initial Restaurant Bills for demo
const initialBills: RestaurantBill[] = [
  { id: 'b1', billNumber: 'B-1001', kotAmount: 1200, botAmount: 350, paymentMethod: 'QR', amount: 1550, remarks: 'Table 4 Lunch', date: '2026-07-08', createdAt: new Date().toISOString() },
  { id: 'b2', billNumber: 'B-1002', kotAmount: 850, botAmount: 0, paymentMethod: 'Cash', amount: 850, remarks: 'Table 2 Coffee', date: '2026-07-08', createdAt: new Date().toISOString() },
  { id: 'b3', billNumber: 'B-1003', kotAmount: 2100, botAmount: 1150, paymentMethod: 'Card', amount: 3250, remarks: 'Table 1 Dinner', date: '2026-07-08', createdAt: new Date().toISOString() },
  { id: 'b4', billNumber: 'B-1004', kotAmount: 500, botAmount: 1500, paymentMethod: 'QR', amount: 2000, remarks: 'Room 102 Service', date: '2026-07-08', createdAt: new Date().toISOString() },
];

const createEmptyHotelIncomeRows = (): HotelIncomeRow[] => {
  return Array.from({ length: 19 }, (_, i) => ({
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
  }));
};

const createEmptyRestaurantIncomeRows = (): RestaurantIncomeRow[] => {
  return Array.from({ length: 2 }, (_, i) => ({
    sNo: i + 1,
    billNumber: '',
    kot: 0,
    bot: 0,
    card: 0,
    qr: 0,
    pqr: 0,
    cash: 0,
    remarks: ''
  }));
};

const createEmptyPettyCash = (): PettyCashExpense[] => {
  return [
    { sNo: 1, particulars: '', total: 0, remarks: '' }
  ];
};

export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      // Auth State
      isAuthenticated: false,
      username: null,
      login: (username, password) => {
        // Simple authentication (e.g. admin / admin or any login matches the prompt)
        if (username.toLowerCase() === 'admin' && password === 'admin') {
          set({ isAuthenticated: true, username: 'Hotel Manager' });
          return true;
        }
        // Let's also support any standard input for convenience, but check if correct
        if (username.trim() !== '' && password.trim() !== '') {
          set({ isAuthenticated: true, username: username });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, username: null, activeView: 'dashboard' }),

      // Navigation & Settings
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Core Data
      rooms: initialRooms,
      restaurantBills: initialBills,
      reports: [],
      settings: {
        hotelName: 'Hotel In N Out',
        logoText: 'Hotel IN N OUT',
        paymentMethods: ['Cash', 'QR', 'Card', 'PQR'],
        roomTypes: ['Standard Room', 'Deluxe Suite', 'Super Deluxe', 'Executive Suite'],
      },

      // Active Report Data
      currentReportDate: new Date().toISOString().split('T')[0],
      currentReport: null,

      // Room Management Actions
      addRoom: (newRoom) => set((state) => ({
        rooms: [...state.rooms, { ...newRoom, id: Math.random().toString(36).substr(2, 9) }]
      })),
      updateRoom: (id, updatedFields) => set((state) => ({
        rooms: state.rooms.map((room) => room.id === id ? { ...room, ...updatedFields } : room)
      })),
      deleteRoom: (id) => set((state) => ({
        rooms: state.rooms.filter((room) => room.id !== id)
      })),
      setRooms: (rooms) => set({ rooms }),

      // Restaurant Module Actions
      addRestaurantBill: (newBill) => set((state) => {
        const generatedId = 'bill_' + Math.random().toString(36).substr(2, 9);
        const bill: RestaurantBill = {
          ...newBill,
          id: generatedId,
          createdAt: new Date().toISOString()
        };
        return {
          restaurantBills: [bill, ...state.restaurantBills]
        };
      }),
      deleteRestaurantBill: (id) => set((state) => ({
        restaurantBills: state.restaurantBills.filter((bill) => bill.id !== id)
      })),

      // Report Operations
      setCurrentReportDate: (date) => set({ currentReportDate: date }),
      
      initializeReportForDate: (date) => {
        const { reports } = get();
        const existingReport = reports.find((rep) => rep.date === date);

        if (existingReport) {
          set({ currentReport: existingReport, currentReportDate: date });
        } else {
          // Setup a blank new report with preset rows matching the requested print form
          const newReport: ManagersDailyReport = {
            id: 'rep_' + date,
            date: date,
            day: getDayNameOfDate(date),
            hotelIncome: createEmptyHotelIncomeRows(),
            restaurantIncome: createEmptyRestaurantIncomeRows(),
            pettyCash: createEmptyPettyCash(),
            managerNote: '',
            totalSales: 0,
            managerSignature: '',
            createdAt: new Date().toISOString()
          };
          set({ currentReport: newReport, currentReportDate: date });
        }
      },

      updateCurrentReport: (updatedFields) => set((state) => {
        if (!state.currentReport) return {};
        return {
          currentReport: {
            ...state.currentReport,
            ...updatedFields
          }
        };
      }),

      saveCurrentReport: () => {
        const { currentReport, reports } = get();
        if (!currentReport) return;

        // Calculate Overall total sales & ensure consistency before saving
        // Update the reports list
        const exists = reports.some((rep) => rep.id === currentReport.id || rep.date === currentReport.date);
        let updatedReports = [];
        if (exists) {
          updatedReports = reports.map((rep) => 
            (rep.id === currentReport.id || rep.date === currentReport.date) ? currentReport : rep
          );
        } else {
          updatedReports = [...reports, currentReport];
        }

        set({ reports: updatedReports });
      },

      deleteReport: (id) => set((state) => ({
        reports: state.reports.filter((rep) => rep.id !== id),
        currentReport: state.currentReport?.id === id ? null : state.currentReport
      })),

      duplicateReport: (id, newDate) => set((state) => {
        const sourceReport = state.reports.find((rep) => rep.id === id);
        if (!sourceReport) return {};

        const duplicated: ManagersDailyReport = {
          ...sourceReport,
          id: 'rep_' + newDate,
          date: newDate,
          day: getDayNameOfDate(newDate),
          createdAt: new Date().toISOString()
        };

        // If duplicate has existing date, overwrite or append
        const filtered = state.reports.filter((rep) => rep.date !== newDate);
        return {
          reports: [...filtered, duplicated]
        };
      }),

      // Settings
      updateSettings: (updatedSettings) => set((state) => ({
        settings: { ...state.settings, ...updatedSettings }
      }))
    }),
    {
      name: 'hotel-in-n-out-storage',
    }
  )
);
