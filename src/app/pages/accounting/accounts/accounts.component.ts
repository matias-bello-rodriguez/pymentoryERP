import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Account, AccountType, AccountCategory } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  accountForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  showForm = false;
  searchTerm = '';

  // Enums for template
  accountTypes = Object.values(AccountType);
  accountCategories = Object.values(AccountCategory);

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      category: ['', Validators.required],
      parentId: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    // Simulate loading accounts with sample data
    this.accounts = [
      {
        id: '1',
        code: '1000',
        name: 'Caja',
        type: AccountType.ASSET,
        category: AccountCategory.CASH_AND_EQUIVALENTS,
        balance: 50000,
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
        balance: 250000,
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
        balance: 150000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        code: '2000',
        name: 'Cuentas por Pagar',
        type: AccountType.LIABILITY,
        category: AccountCategory.ACCOUNTS_PAYABLE,
        balance: 80000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        code: '3000',
        name: 'Capital',
        type: AccountType.EQUITY,
        category: AccountCategory.OWNER_EQUITY,
        balance: 300000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.filteredAccounts = [...this.accounts];
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAccounts = [...this.accounts];
      return;
    }

    this.filteredAccounts = this.accounts.filter(account =>
      account.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSubmit() {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      
      if (this.isEditing && this.editingId) {
        this.updateAccount(this.editingId, formData);
      } else {
        this.createAccount(formData);
      }
    }
  }

  createAccount(accountData: any) {
    const newAccount: Account = {
      id: Date.now().toString(),
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      category: accountData.category,
      parentId: accountData.parentId || undefined,
      balance: 0,
      isActive: accountData.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.accounts.push(newAccount);
    this.filteredAccounts = [...this.accounts];
    this.resetForm();
    this.showForm = false;
  }

  updateAccount(id: string, accountData: any) {
    const index = this.accounts.findIndex(acc => acc.id === id);
    if (index !== -1) {
      this.accounts[index] = {
        ...this.accounts[index],
        ...accountData,
        updatedAt: new Date()
      };
      this.filteredAccounts = [...this.accounts];
      this.resetForm();
      this.showForm = false;
    }
  }

  editAccount(account: Account) {
    this.isEditing = true;
    this.editingId = account.id;
    this.showForm = true;
    
    this.accountForm.patchValue({
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      parentId: account.parentId || '',
      isActive: account.isActive
    });
  }

  deleteAccount(id: string) {
    if (confirm('¿Está seguro de eliminar esta cuenta?')) {
      this.accounts = this.accounts.filter(acc => acc.id !== id);
      this.filteredAccounts = [...this.accounts];
    }
  }

  toggleStatus(id: string) {
    const account = this.accounts.find(acc => acc.id === id);
    if (account) {
      account.isActive = !account.isActive;
      account.updatedAt = new Date();
      this.filteredAccounts = [...this.accounts];
    }
  }

  resetForm() {
    this.accountForm.reset({
      isActive: true
    });
    this.isEditing = false;
    this.editingId = null;
  }

  cancelEdit() {
    this.resetForm();
    this.showForm = false;
  }

  getAccountTypeName(type: AccountType): string {
    const typeNames = {
      [AccountType.ASSET]: 'Activo',
      [AccountType.LIABILITY]: 'Pasivo',
      [AccountType.EQUITY]: 'Patrimonio',
      [AccountType.REVENUE]: 'Ingresos',
      [AccountType.EXPENSE]: 'Gastos'
    };
    return typeNames[type];
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
      [AccountCategory.FINANCIAL_EXPENSES]: 'Gastos Financieros'
    };
    return categoryNames[category];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }
}