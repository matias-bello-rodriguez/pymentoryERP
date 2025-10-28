// Account model for accounting chart of accounts
export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parentId?: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum AccountCategory {
  // Assets
  CURRENT_ASSETS = 'CURRENT_ASSETS',
  FIXED_ASSETS = 'FIXED_ASSETS',
  CASH_AND_EQUIVALENTS = 'CASH_AND_EQUIVALENTS',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  
  // Liabilities
  CURRENT_LIABILITIES = 'CURRENT_LIABILITIES',
  LONG_TERM_LIABILITIES = 'LONG_TERM_LIABILITIES',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  
  // Equity
  OWNER_EQUITY = 'OWNER_EQUITY',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  
  // Revenue
  OPERATING_REVENUE = 'OPERATING_REVENUE',
  OTHER_REVENUE = 'OTHER_REVENUE',
  
  // Expenses
  OPERATING_EXPENSES = 'OPERATING_EXPENSES',
  ADMINISTRATIVE_EXPENSES = 'ADMINISTRATIVE_EXPENSES',
  FINANCIAL_EXPENSES = 'FINANCIAL_EXPENSES'
}

// Transaction model for journal entries
export interface Transaction {
  id: string;
  date: Date;
  description: string;
  reference: string;
  entries: TransactionEntry[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface TransactionEntry {
  id: string;
  accountId: string;
  account?: Account;
  debit: number;
  credit: number;
  description: string;
}

// Bank account model
export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: BankAccountType;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum BankAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_LINE = 'CREDIT_LINE',
  INVESTMENT = 'INVESTMENT'
}

// Bank movement model
export interface BankMovement {
  id: string;
  bankAccountId: string;
  bankAccount?: BankAccount;
  date: Date;
  description: string;
  reference: string;
  type: MovementType;
  amount: number;
  balance: number;
  isReconciled: boolean;
  transactionId?: string;
  createdAt: Date;
}

export enum MovementType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  FEE = 'FEE',
  INTEREST = 'INTEREST'
}

// Cash flow model
export interface CashFlowEntry {
  id: string;
  date: Date;
  description: string;
  category: CashFlowCategory;
  type: CashFlowType;
  amount: number;
  accountId?: string;
  account?: Account;
  reference: string;
  createdAt: Date;
}

export enum CashFlowType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW'
}

export enum CashFlowCategory {
  OPERATING = 'OPERATING',
  INVESTING = 'INVESTING',
  FINANCING = 'FINANCING'
}

// Balance sheet model
export interface BalanceSheet {
  id: string;
  date: Date;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  createdAt: Date;
}

export interface BalanceSheetSection {
  accounts: BalanceSheetAccount[];
  total: number;
}

export interface BalanceSheetAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
}

// Income statement model
export interface IncomeStatement {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  revenue: BalanceSheetSection;
  expenses: BalanceSheetSection;
  grossProfit: number;
  netProfit: number;
  createdAt: Date;
}