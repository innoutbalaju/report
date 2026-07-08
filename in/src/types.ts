export interface Room {
  id: string;
  number: string;
  type: string;
  baseRate: number;
  status: 'Occupied' | 'Vacant' | 'Cleaning' | 'Maintenance';
}

export interface RestaurantBill {
  id: string;
  billNumber: string;
  kotAmount: number;
  botAmount: number;
  paymentMethod: 'Cash' | 'QR' | 'Card' | 'PQR';
  amount: number;
  remarks: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface HotelIncomeRow {
  sNo: number;
  roomNo: string;
  rate: number;
  kot: number;
  bot: number;
  paymentMethod: 'Cash' | 'QR' | 'Card' | 'PQR' | '';
  paymentAmount: number;
  card: number;
  qr: number;
  pqr: number;
  cash: number;
  remarks: string;
}

export interface RestaurantIncomeRow {
  sNo: number;
  billNumber: string; // This is the 'Particulars' field
  kot: number;
  bot: number;
  card: number;
  qr: number;
  pqr: number;
  cash: number;
  remarks: string;
}

export interface PettyCashExpense {
  sNo: number;
  particulars: string;
  total: number;
  remarks: string;
}

export interface ManagersDailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  day: string; // e.g. "Wednesday"
  hotelIncome: HotelIncomeRow[]; // Exactly 19 rows
  restaurantIncome: RestaurantIncomeRow[]; // Exactly 2 rows
  pettyCash: PettyCashExpense[]; // Exactly 1 row in physical layout, but let's make it editable
  managerNote: string;
  totalSales: number;
  managerSignature: string;
  createdAt: string;
}

export interface SystemSettings {
  hotelName: string;
  logoText: string;
  paymentMethods: string[];
  roomTypes: string[];
}
