import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BankAccount, BankMovement, BankAccountType, MovementType } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './banks.component.html',
  styleUrls: ['./banks.component.css']
})
export class BanksComponent implements OnInit {
  bankAccounts: BankAccount[] = [];
  bankMovements: BankMovement[] = [];
  filteredMovements: BankMovement[] = [];
  
  bankForm: FormGroup;
  movementForm: FormGroup;
  
  isEditingBank = false;
  editingBankId: string | null = null;
  showBankForm = false;
  
  isEditingMovement = false;
  editingMovementId: string | null = null;
  showMovementForm = false;
  
  selectedBankId = '';
  filterType: MovementType | '' = '';
  filterDateFrom = '';
  filterDateTo = '';

  // Enums for template
  bankAccountTypes = Object.values(BankAccountType);
  movementTypes = Object.values(MovementType);

  constructor(private fb: FormBuilder) {
    this.bankForm = this.fb.group({
      bankName: ['', [Validators.required, Validators.minLength(3)]],
      accountName: ['', [Validators.required, Validators.minLength(3)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9-]+$/)]],
      accountType: ['', Validators.required],
      currency: ['COP', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });

    this.movementForm = this.fb.group({
      bankAccountId: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      reference: [''],
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      isReconciled: [false]
    });
  }

  ngOnInit() {
    this.loadBankAccounts();
    this.loadBankMovements();
  }

  loadBankAccounts() {
    // Simulate loading bank accounts with sample data
    this.bankAccounts = [
      {
        id: '1',
        bankName: 'Banco de Bogotá',
        accountName: 'Cuenta Corriente Principal',
        accountNumber: '001-123456-78',
        accountType: BankAccountType.CHECKING,
        currency: 'COP',
        balance: 5000000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        bankName: 'Bancolombia',
        accountName: 'Cuenta de Ahorros',
        accountNumber: '002-987654-32',
        accountType: BankAccountType.SAVINGS,
        currency: 'COP',
        balance: 2500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        bankName: 'Banco Popular',
        accountName: 'Línea de Crédito',
        accountNumber: '003-456789-01',
        accountType: BankAccountType.CREDIT_LINE,
        currency: 'COP',
        balance: -500000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  loadBankMovements() {
    // Simulate loading bank movements with sample data
    this.bankMovements = [
      {
        id: '1',
        bankAccountId: '1',
        date: new Date('2024-10-01'),
        description: 'Depósito inicial',
        reference: 'DEP-001',
        type: MovementType.DEPOSIT,
        amount: 5000000,
        balance: 5000000,
        isReconciled: true,
        createdAt: new Date()
      },
      {
        id: '2',
        bankAccountId: '1',
        date: new Date('2024-10-02'),
        description: 'Pago a proveedor',
        reference: 'CHK-001',
        type: MovementType.WITHDRAWAL,
        amount: 150000,
        balance: 4850000,
        isReconciled: false,
        createdAt: new Date()
      },
      {
        id: '3',
        bankAccountId: '2',
        date: new Date('2024-10-03'),
        description: 'Transferencia recibida',
        reference: 'TRF-001',
        type: MovementType.TRANSFER_IN,
        amount: 200000,
        balance: 2500000,
        isReconciled: true,
        createdAt: new Date()
      },
      {
        id: '4',
        bankAccountId: '1',
        date: new Date('2024-10-04'),
        description: 'Comisión bancaria',
        reference: 'FEE-001',
        type: MovementType.FEE,
        amount: 15000,
        balance: 4835000,
        isReconciled: false,
        createdAt: new Date()
      }
    ];
    this.applyMovementFilters();
  }

  applyMovementFilters() {
    this.filteredMovements = this.bankMovements.filter(movement => {
      let matchesBank = !this.selectedBankId || movement.bankAccountId === this.selectedBankId;
      let matchesType = !this.filterType || movement.type === this.filterType;
      let matchesDateFrom = !this.filterDateFrom || movement.date >= new Date(this.filterDateFrom);
      let matchesDateTo = !this.filterDateTo || movement.date <= new Date(this.filterDateTo);

      return matchesBank && matchesType && matchesDateFrom && matchesDateTo;
    });
  }

  onSubmitBank() {
    if (this.bankForm.valid) {
      const formData = this.bankForm.value;
      
      if (this.isEditingBank && this.editingBankId) {
        this.updateBankAccount(this.editingBankId, formData);
      } else {
        this.createBankAccount(formData);
      }
    }
  }

  onSubmitMovement() {
    if (this.movementForm.valid) {
      const formData = this.movementForm.value;
      
      if (this.isEditingMovement && this.editingMovementId) {
        this.updateMovement(this.editingMovementId, formData);
      } else {
        this.createMovement(formData);
      }
    }
  }

  createBankAccount(accountData: any) {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      bankName: accountData.bankName,
      accountName: accountData.accountName,
      accountNumber: accountData.accountNumber,
      accountType: accountData.accountType,
      currency: accountData.currency,
      balance: parseFloat(accountData.balance),
      isActive: accountData.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.bankAccounts.push(newAccount);
    this.resetBankForm();
    this.showBankForm = false;
  }

  updateBankAccount(id: string, accountData: any) {
    const index = this.bankAccounts.findIndex(acc => acc.id === id);
    if (index !== -1) {
      this.bankAccounts[index] = {
        ...this.bankAccounts[index],
        ...accountData,
        balance: parseFloat(accountData.balance),
        updatedAt: new Date()
      };
      this.resetBankForm();
      this.showBankForm = false;
    }
  }

  createMovement(movementData: any) {
    const bankAccount = this.bankAccounts.find(acc => acc.id === movementData.bankAccountId);
    if (!bankAccount) return;

    let newBalance = bankAccount.balance;
    const amount = parseFloat(movementData.amount);

    // Calculate new balance based on movement type
    switch (movementData.type) {
      case MovementType.DEPOSIT:
      case MovementType.TRANSFER_IN:
      case MovementType.INTEREST:
        newBalance += amount;
        break;
      case MovementType.WITHDRAWAL:
      case MovementType.TRANSFER_OUT:
      case MovementType.FEE:
        newBalance -= amount;
        break;
    }

    const newMovement: BankMovement = {
      id: Date.now().toString(),
      bankAccountId: movementData.bankAccountId,
      date: new Date(movementData.date),
      description: movementData.description,
      reference: movementData.reference || `MOV-${Date.now()}`,
      type: movementData.type,
      amount: amount,
      balance: newBalance,
      isReconciled: movementData.isReconciled,
      createdAt: new Date()
    };

    // Update bank account balance
    bankAccount.balance = newBalance;
    bankAccount.updatedAt = new Date();

    this.bankMovements.push(newMovement);
    this.applyMovementFilters();
    this.resetMovementForm();
    this.showMovementForm = false;
  }

  updateMovement(id: string, movementData: any) {
    const index = this.bankMovements.findIndex(mov => mov.id === id);
    if (index !== -1) {
      // Recalculate balances if needed (simplified for demo)
      this.bankMovements[index] = {
        ...this.bankMovements[index],
        date: new Date(movementData.date),
        description: movementData.description,
        reference: movementData.reference,
        type: movementData.type,
        amount: parseFloat(movementData.amount),
        isReconciled: movementData.isReconciled
      };
      this.applyMovementFilters();
      this.resetMovementForm();
      this.showMovementForm = false;
    }
  }

  editBankAccount(account: BankAccount) {
    this.isEditingBank = true;
    this.editingBankId = account.id;
    this.showBankForm = true;
    
    this.bankForm.patchValue({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      balance: account.balance,
      isActive: account.isActive
    });
  }

  editMovement(movement: BankMovement) {
    this.isEditingMovement = true;
    this.editingMovementId = movement.id;
    this.showMovementForm = true;
    
    this.movementForm.patchValue({
      bankAccountId: movement.bankAccountId,
      date: movement.date.toISOString().split('T')[0],
      description: movement.description,
      reference: movement.reference,
      type: movement.type,
      amount: movement.amount,
      isReconciled: movement.isReconciled
    });
  }

  deleteBankAccount(id: string) {
    if (confirm('¿Está seguro de eliminar esta cuenta bancaria?')) {
      this.bankAccounts = this.bankAccounts.filter(acc => acc.id !== id);
    }
  }

  deleteMovement(id: string) {
    if (confirm('¿Está seguro de eliminar este movimiento?')) {
      this.bankMovements = this.bankMovements.filter(mov => mov.id !== id);
      this.applyMovementFilters();
    }
  }

  toggleAccountStatus(id: string) {
    const account = this.bankAccounts.find(acc => acc.id === id);
    if (account) {
      account.isActive = !account.isActive;
      account.updatedAt = new Date();
    }
  }

  toggleReconciliation(id: string) {
    const movement = this.bankMovements.find(mov => mov.id === id);
    if (movement) {
      movement.isReconciled = !movement.isReconciled;
      this.applyMovementFilters();
    }
  }

  resetBankForm() {
    this.bankForm.reset({
      currency: 'COP',
      balance: 0,
      isActive: true
    });
    this.isEditingBank = false;
    this.editingBankId = null;
  }

  resetMovementForm() {
    this.movementForm.reset({
      isReconciled: false
    });
    this.isEditingMovement = false;
    this.editingMovementId = null;
  }

  cancelBankEdit() {
    this.resetBankForm();
    this.showBankForm = false;
  }

  cancelMovementEdit() {
    this.resetMovementForm();
    this.showMovementForm = false;
  }

  getBankAccountTypeName(type: BankAccountType): string {
    const typeNames = {
      [BankAccountType.CHECKING]: 'Corriente',
      [BankAccountType.SAVINGS]: 'Ahorros',
      [BankAccountType.CREDIT_LINE]: 'Línea de Crédito',
      [BankAccountType.INVESTMENT]: 'Inversión'
    };
    return typeNames[type];
  }

  getMovementTypeName(type: MovementType): string {
    const typeNames = {
      [MovementType.DEPOSIT]: 'Depósito',
      [MovementType.WITHDRAWAL]: 'Retiro',
      [MovementType.TRANSFER_IN]: 'Transferencia Entrada',
      [MovementType.TRANSFER_OUT]: 'Transferencia Salida',
      [MovementType.FEE]: 'Comisión',
      [MovementType.INTEREST]: 'Interés'
    };
    return typeNames[type];
  }

  getBankAccountName(id: string): string {
    const account = this.bankAccounts.find(acc => acc.id === id);
    return account ? `${account.bankName} - ${account.accountNumber}` : 'Cuenta no encontrada';
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
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getTotalBalance(): number {
    return this.bankAccounts
      .filter(acc => acc.isActive)
      .reduce((total, acc) => total + acc.balance, 0);
  }

  getUnreconciledCount(): number {
    return this.filteredMovements.filter(mov => !mov.isReconciled).length;
  }
}