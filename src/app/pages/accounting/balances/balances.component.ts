import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BalanceSheet, IncomeStatement, Account, AccountType, AccountCategory } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-balances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css']
})
export class BalancesComponent implements OnInit {
  balanceSheet: BalanceSheet | null = null;
  incomeStatement: IncomeStatement | null = null;
  accounts: Account[] = [];
  
  reportForm: FormGroup;
  selectedReport = 'balance-sheet';
  isGenerating = false;

  // Expose enums to template
  AccountCategory = AccountCategory;

  constructor(private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      reportType: ['balance-sheet', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      periodStart: ['', Validators.required],
      periodEnd: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAccounts();
    this.generateBalanceSheet();
  }

  loadAccounts() {
    // Simulate loading accounts with sample data
    this.accounts = [
      // Assets
      {
        id: '1',
        code: '1000',
        name: 'Caja',
        type: AccountType.ASSET,
        category: AccountCategory.CASH_AND_EQUIVALENTS,
        balance: 500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: '1100',
        name: 'Bancos',
        type: AccountType.ASSET,
        category: AccountCategory.CASH_AND_EQUIVALENTS,
        balance: 2500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        code: '1200',
        name: 'Cuentas por Cobrar',
        type: AccountType.ASSET,
        category: AccountCategory.ACCOUNTS_RECEIVABLE,
        balance: 1800000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        code: '1300',
        name: 'Inventarios',
        type: AccountType.ASSET,
        category: AccountCategory.INVENTORY,
        balance: 3200000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        code: '1500',
        name: 'Equipos de Oficina',
        type: AccountType.ASSET,
        category: AccountCategory.FIXED_ASSETS,
        balance: 1500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Liabilities
      {
        id: '6',
        code: '2000',
        name: 'Cuentas por Pagar',
        type: AccountType.LIABILITY,
        category: AccountCategory.ACCOUNTS_PAYABLE,
        balance: 800000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '7',
        code: '2100',
        name: 'Préstamos por Pagar',
        type: AccountType.LIABILITY,
        category: AccountCategory.LONG_TERM_LIABILITIES,
        balance: 2000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Equity
      {
        id: '8',
        code: '3000',
        name: 'Capital',
        type: AccountType.EQUITY,
        category: AccountCategory.OWNER_EQUITY,
        balance: 5000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '9',
        code: '3100',
        name: 'Utilidades Retenidas',
        type: AccountType.EQUITY,
        category: AccountCategory.RETAINED_EARNINGS,
        balance: 1200000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Revenue
      {
        id: '10',
        code: '4000',
        name: 'Ventas',
        type: AccountType.REVENUE,
        category: AccountCategory.OPERATING_REVENUE,
        balance: 8500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '11',
        code: '4100',
        name: 'Otros Ingresos',
        type: AccountType.REVENUE,
        category: AccountCategory.OTHER_REVENUE,
        balance: 350000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Expenses
      {
        id: '12',
        code: '5000',
        name: 'Costo de Ventas',
        type: AccountType.EXPENSE,
        category: AccountCategory.OPERATING_EXPENSES,
        balance: 4200000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '13',
        code: '5100',
        name: 'Gastos Administrativos',
        type: AccountType.EXPENSE,
        category: AccountCategory.ADMINISTRATIVE_EXPENSES,
        balance: 1800000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '14',
        code: '5200',
        name: 'Gastos Financieros',
        type: AccountType.EXPENSE,
        category: AccountCategory.FINANCIAL_EXPENSES,
        balance: 120000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  generateReport() {
    this.isGenerating = true;
    const reportType = this.reportForm.get('reportType')?.value;
    
    setTimeout(() => {
      if (reportType === 'balance-sheet') {
        this.generateBalanceSheet();
      } else if (reportType === 'income-statement') {
        this.generateIncomeStatement();
      }
      this.isGenerating = false;
    }, 1000);
  }

  generateBalanceSheet() {
    const assetAccounts = this.accounts.filter(acc => acc.type === AccountType.ASSET);
    const liabilityAccounts = this.accounts.filter(acc => acc.type === AccountType.LIABILITY);
    const equityAccounts = this.accounts.filter(acc => acc.type === AccountType.EQUITY);

    const assets = {
      accounts: assetAccounts.map(acc => ({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        balance: acc.balance
      })),
      total: assetAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    const liabilities = {
      accounts: liabilityAccounts.map(acc => ({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        balance: acc.balance
      })),
      total: liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    const equity = {
      accounts: equityAccounts.map(acc => ({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        balance: acc.balance
      })),
      total: equityAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    this.balanceSheet = {
      id: Date.now().toString(),
      date: new Date(),
      assets,
      liabilities,
      equity,
      totalAssets: assets.total,
      totalLiabilitiesAndEquity: liabilities.total + equity.total,
      createdAt: new Date()
    };

    this.incomeStatement = null;
  }

  generateIncomeStatement() {
    const revenueAccounts = this.accounts.filter(acc => acc.type === AccountType.REVENUE);
    const expenseAccounts = this.accounts.filter(acc => acc.type === AccountType.EXPENSE);

    const revenue = {
      accounts: revenueAccounts.map(acc => ({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        balance: acc.balance
      })),
      total: revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    const expenses = {
      accounts: expenseAccounts.map(acc => ({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        balance: acc.balance
      })),
      total: expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    const grossProfit = revenue.total - expenses.accounts
      .filter(acc => acc.accountCode.startsWith('5000'))
      .reduce((sum, acc) => sum + acc.balance, 0);

    this.incomeStatement = {
      id: Date.now().toString(),
      periodStart: new Date(this.reportForm.get('periodStart')?.value || new Date()),
      periodEnd: new Date(this.reportForm.get('periodEnd')?.value || new Date()),
      revenue,
      expenses,
      grossProfit,
      netProfit: revenue.total - expenses.total,
      createdAt: new Date()
    };

    this.balanceSheet = null;
  }

  onReportTypeChange() {
    this.selectedReport = this.reportForm.get('reportType')?.value;
    if (this.selectedReport === 'income-statement') {
      this.reportForm.get('periodStart')?.setValidators([Validators.required]);
      this.reportForm.get('periodEnd')?.setValidators([Validators.required]);
    } else {
      this.reportForm.get('periodStart')?.clearValidators();
      this.reportForm.get('periodEnd')?.clearValidators();
    }
    this.reportForm.get('periodStart')?.updateValueAndValidity();
    this.reportForm.get('periodEnd')?.updateValueAndValidity();
  }

  exportReport() {
    if (this.balanceSheet) {
      this.exportBalanceSheet();
    } else if (this.incomeStatement) {
      this.exportIncomeStatement();
    }
  }

  exportBalanceSheet() {
    // Simulate export functionality
    console.log('Exporting Balance Sheet:', this.balanceSheet);
    alert('Balance General exportado exitosamente');
  }

  exportIncomeStatement() {
    // Simulate export functionality
    console.log('Exporting Income Statement:', this.incomeStatement);
    alert('Estado de Resultados exportado exitosamente');
  }

  printReport() {
    window.print();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  getAccountsByCategory(accounts: any[], category: AccountCategory) {
    return accounts.filter(acc => {
      const fullAccount = this.accounts.find(a => a.id === acc.accountId);
      return fullAccount?.category === category;
    });
  }

  getCategoryTotal(accounts: any[], category: AccountCategory): number {
    return this.getAccountsByCategory(accounts, category)
      .reduce((sum, acc) => sum + acc.balance, 0);
  }

  getCategoryName(category: AccountCategory): string {
    const categoryNames = {
      [AccountCategory.CURRENT_ASSETS]: 'Activos Corrientes',
      [AccountCategory.FIXED_ASSETS]: 'Activos Fijos',
      [AccountCategory.CASH_AND_EQUIVALENTS]: 'Efectivo y Equivalentes',
      [AccountCategory.ACCOUNTS_RECEIVABLE]: 'Cuentas por Cobrar',
      [AccountCategory.INVENTORY]: 'Inventario',
      [AccountCategory.CURRENT_LIABILITIES]: 'Pasivos Corrientes',
      [AccountCategory.LONG_TERM_LIABILITIES]: 'Pasivos a Largo Plazo',
      [AccountCategory.ACCOUNTS_PAYABLE]: 'Cuentas por Pagar',
      [AccountCategory.OWNER_EQUITY]: 'Patrimonio del Propietario',
      [AccountCategory.RETAINED_EARNINGS]: 'Utilidades Retenidas',
      [AccountCategory.OPERATING_REVENUE]: 'Ingresos Operacionales',
      [AccountCategory.OTHER_REVENUE]: 'Otros Ingresos',
      [AccountCategory.OPERATING_EXPENSES]: 'Gastos Operacionales',
      [AccountCategory.ADMINISTRATIVE_EXPENSES]: 'Gastos Administrativos',
      [AccountCategory.FINANCIAL_EXPENSES]: 'Gastos Financieros',
    };
    return categoryNames[category];
  }
}