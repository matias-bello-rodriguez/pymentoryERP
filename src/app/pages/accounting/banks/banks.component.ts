import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BankAccount, BankMovement, BankAccountType, MovementType } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: 'Editar Cuenta Bancaria',
      html: `
        <form id="editBankForm">
          <div class="mb-3 text-start">
            <label for="editBankName" class="form-label">Banco *</label>
            <input type="text" id="editBankName" class="form-control" value="${account.bankName}" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="editAccountName" class="form-label">Nombre de la Cuenta *</label>
            <input type="text" id="editAccountName" class="form-control" value="${account.accountName}" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="editAccountNumber" class="form-label">Número de Cuenta *</label>
            <input type="text" id="editAccountNumber" class="form-control" value="${account.accountNumber}" required pattern="^[0-9-]+$">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="editAccountType" class="form-label">Tipo de Cuenta *</label>
              <select id="editAccountType" class="form-select" required>
                <option value="">Selecciona un tipo</option>
                ${this.bankAccountTypes.map(type => 
                  `<option value="${type}" ${account.accountType === type ? 'selected' : ''}>${this.getBankAccountTypeName(type)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="col-6">
              <label for="editCurrency" class="form-label">Moneda *</label>
              <select id="editCurrency" class="form-select" required>
                <option value="COP" ${account.currency === 'COP' ? 'selected' : ''}>COP - Peso Colombiano</option>
                <option value="USD" ${account.currency === 'USD' ? 'selected' : ''}>USD - Dólar Americano</option>
                <option value="EUR" ${account.currency === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
              </select>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="editBalance" class="form-label">Saldo Actual *</label>
            <input type="number" id="editBalance" class="form-control" value="${account.balance}" required step="0.01">
          </div>
          <div class="mb-3 text-start">
            <div class="form-check">
              <input type="checkbox" id="editIsActive" class="form-check-input" ${account.isActive ? 'checked' : ''}>
              <label for="editIsActive" class="form-check-label">Cuenta activa</label>
            </div>
          </div>
        </form>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0dcaf0',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Actualizar Cuenta',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const bankName = (document.getElementById('editBankName') as HTMLInputElement).value;
        const accountName = (document.getElementById('editAccountName') as HTMLInputElement).value;
        const accountNumber = (document.getElementById('editAccountNumber') as HTMLInputElement).value;
        const accountType = (document.getElementById('editAccountType') as HTMLSelectElement).value;
        const currency = (document.getElementById('editCurrency') as HTMLSelectElement).value;
        const balance = (document.getElementById('editBalance') as HTMLInputElement).value;
        const isActive = (document.getElementById('editIsActive') as HTMLInputElement).checked;

        if (!bankName || !accountName || !accountNumber || !accountType || !currency || !balance) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (bankName.length < 3 || accountName.length < 3) {
          Swal.showValidationMessage('El nombre del banco y de la cuenta deben tener al menos 3 caracteres');
          return false;
        }

        if (!/^[0-9-]+$/.test(accountNumber)) {
          Swal.showValidationMessage('El número de cuenta solo puede contener números y guiones');
          return false;
        }

        // Verificar si el número de cuenta ya existe (excluyendo la cuenta actual)
        const existingAccount = this.bankAccounts.find(acc => acc.accountNumber === accountNumber && acc.id !== account.id);
        if (existingAccount) {
          Swal.showValidationMessage('Ya existe una cuenta con este número');
          return false;
        }

        return {
          bankName: bankName,
          accountName: accountName,
          accountNumber: accountNumber,
          accountType: accountType as BankAccountType,
          currency: currency,
          balance: parseFloat(balance),
          isActive: isActive
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { bankName, accountName, accountNumber, accountType, currency, balance, isActive } = result.value;
        
        // Actualizar la cuenta
        const index = this.bankAccounts.findIndex(acc => acc.id === account.id);
        if (index !== -1) {
          this.bankAccounts[index] = {
            ...this.bankAccounts[index],
            bankName: bankName,
            accountName: accountName,
            accountNumber: accountNumber,
            accountType: accountType,
            currency: currency,
            balance: balance,
            isActive: isActive,
            updatedAt: new Date()
          };
          
          Swal.fire({
            title: '¡Cuenta Actualizada!',
            html: `
              <div class="text-start">
                <p><strong>Banco:</strong> ${bankName}</p>
                <p><strong>Cuenta:</strong> ${accountName}</p>
                <p><strong>Número:</strong> ${accountNumber}</p>
                <p><strong>Tipo:</strong> ${this.getBankAccountTypeName(accountType)}</p>
                <p><strong>Moneda:</strong> ${currency}</p>
                <p><strong>Saldo:</strong> ${this.formatCurrency(balance)}</p>
                <p><strong>Estado:</strong> ${isActive ? 'Activa' : 'Inactiva'}</p>
              </div>
            `,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  async editMovement(movement: BankMovement) {
    const bankAccountOptions = this.bankAccounts.map(account => 
      `<option value="${account.id}" ${account.id === movement.bankAccountId ? 'selected' : ''}>${account.bankName} - ${account.accountNumber}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Editar Movimiento Bancario',
      html: `
        <div class="mb-3">
          <label for="bankAccountId" class="form-label">Cuenta Bancaria</label>
          <select id="bankAccountId" class="form-select" required>
            <option value="">Seleccionar cuenta</option>
            ${bankAccountOptions}
          </select>
        </div>
        <div class="mb-3">
          <label for="type" class="form-label">Tipo de Movimiento</label>
          <select id="type" class="form-select" required>
            <option value="">Seleccionar tipo</option>
            <option value="DEPOSIT" ${movement.type === 'DEPOSIT' ? 'selected' : ''}>Depósito</option>
            <option value="WITHDRAWAL" ${movement.type === 'WITHDRAWAL' ? 'selected' : ''}>Retiro</option>
            <option value="TRANSFER_IN" ${movement.type === 'TRANSFER_IN' ? 'selected' : ''}>Transferencia Entrante</option>
            <option value="TRANSFER_OUT" ${movement.type === 'TRANSFER_OUT' ? 'selected' : ''}>Transferencia Saliente</option>
            <option value="INTEREST" ${movement.type === 'INTEREST' ? 'selected' : ''}>Interés</option>
            <option value="FEE" ${movement.type === 'FEE' ? 'selected' : ''}>Comisión</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="amount" class="form-label">Monto</label>
          <input id="amount" type="number" step="0.01" min="0" class="form-control" value="${movement.amount}" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Descripción</label>
          <input id="description" type="text" class="form-control" value="${movement.description}" required>
        </div>
        <div class="mb-3">
          <label for="reference" class="form-label">Referencia</label>
          <input id="reference" type="text" class="form-control" value="${movement.reference || ''}">
        </div>
        <div class="mb-3">
          <label for="date" class="form-label">Fecha</label>
          <input id="date" type="date" class="form-control" value="${movement.date.toISOString().split('T')[0]}" required>
        </div>
        <div class="form-check">
          <input id="isReconciled" type="checkbox" class="form-check-input" ${movement.isReconciled ? 'checked' : ''}>
          <label for="isReconciled" class="form-check-label">Conciliado</label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Movimiento',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const bankAccountId = (document.getElementById('bankAccountId') as HTMLSelectElement).value;
        const type = (document.getElementById('type') as HTMLSelectElement).value;
        const amount = (document.getElementById('amount') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLInputElement).value;
        const reference = (document.getElementById('reference') as HTMLInputElement).value;
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const isReconciled = (document.getElementById('isReconciled') as HTMLInputElement).checked;

        if (!bankAccountId) {
          Swal.showValidationMessage('Debe seleccionar una cuenta bancaria');
          return false;
        }
        if (!type) {
          Swal.showValidationMessage('Debe seleccionar un tipo de movimiento');
          return false;
        }
        if (!amount || parseFloat(amount) <= 0) {
          Swal.showValidationMessage('El monto debe ser mayor a 0');
          return false;
        }
        if (!description || description.trim().length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }
        if (!date) {
          Swal.showValidationMessage('Debe seleccionar una fecha');
          return false;
        }

        return {
          bankAccountId,
          type,
          amount,
          description: description.trim(),
          reference: reference.trim(),
          date,
          isReconciled
        };
      }
    });

    if (formValues) {
      this.updateMovement(movement.id, formValues);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Movimiento bancario actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  deleteBankAccount(id: string) {
    const account = this.bankAccounts.find(acc => acc.id === id);
    if (!account) return;

    Swal.fire({
      title: '¿Eliminar Cuenta Bancaria?',
      html: `
        <div class="text-start">
          <p>¿Estás seguro de que deseas eliminar esta cuenta bancaria?</p>
          <div class="alert alert-warning">
            <strong>Banco:</strong> ${account.bankName}<br>
            <strong>Cuenta:</strong> ${account.accountName}<br>
            <strong>Número:</strong> ${account.accountNumber}<br>
            <strong>Tipo:</strong> ${this.getBankAccountTypeName(account.accountType)}<br>
            <strong>Saldo:</strong> ${this.formatCurrency(account.balance)}
          </div>
          <p class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Esta acción no se puede deshacer y eliminará todos los movimientos asociados.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.bankAccounts = this.bankAccounts.filter(acc => acc.id !== id);
        // Also remove related movements
        this.bankMovements = this.bankMovements.filter(mov => mov.bankAccountId !== id);
        this.applyMovementFilters();
        
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La cuenta bancaria ha sido eliminada exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  showNewBankAccountModal() {
    Swal.fire({
      title: '¡Nueva Cuenta Bancaria!',
      html: `
        <form id="newBankForm">
          <div class="mb-3 text-start">
            <label for="newBankName" class="form-label">Banco *</label>
            <input type="text" id="newBankName" class="form-control" placeholder="Nombre del banco" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="newAccountName" class="form-label">Nombre de la Cuenta *</label>
            <input type="text" id="newAccountName" class="form-control" placeholder="Nombre descriptivo" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="newAccountNumber" class="form-label">Número de Cuenta *</label>
            <input type="text" id="newAccountNumber" class="form-control" placeholder="123-456789-01" required pattern="^[0-9-]+$">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="newAccountType" class="form-label">Tipo de Cuenta *</label>
              <select id="newAccountType" class="form-select" required>
                <option value="">Selecciona un tipo</option>
                ${this.bankAccountTypes.map(type => 
                  `<option value="${type}">${this.getBankAccountTypeName(type)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="col-6">
              <label for="newCurrency" class="form-label">Moneda *</label>
              <select id="newCurrency" class="form-select" required>
                <option value="COP" selected>COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="newBalance" class="form-label">Saldo Inicial *</label>
            <input type="number" id="newBalance" class="form-control" placeholder="0.00" required step="0.01" value="0">
          </div>
          <div class="mb-3 text-start">
            <div class="form-check">
              <input type="checkbox" id="newIsActive" class="form-check-input" checked>
              <label for="newIsActive" class="form-check-label">Cuenta activa</label>
            </div>
          </div>
        </form>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Crear Cuenta',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const bankName = (document.getElementById('newBankName') as HTMLInputElement).value;
        const accountName = (document.getElementById('newAccountName') as HTMLInputElement).value;
        const accountNumber = (document.getElementById('newAccountNumber') as HTMLInputElement).value;
        const accountType = (document.getElementById('newAccountType') as HTMLSelectElement).value;
        const currency = (document.getElementById('newCurrency') as HTMLSelectElement).value;
        const balance = (document.getElementById('newBalance') as HTMLInputElement).value;
        const isActive = (document.getElementById('newIsActive') as HTMLInputElement).checked;

        if (!bankName || !accountName || !accountNumber || !accountType || !currency) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (bankName.length < 3 || accountName.length < 3) {
          Swal.showValidationMessage('El nombre del banco y de la cuenta deben tener al menos 3 caracteres');
          return false;
        }

        if (!/^[0-9-]+$/.test(accountNumber)) {
          Swal.showValidationMessage('El número de cuenta solo puede contener números y guiones');
          return false;
        }

        // Verificar si el número de cuenta ya existe
        const existingAccount = this.bankAccounts.find(acc => acc.accountNumber === accountNumber);
        if (existingAccount) {
          Swal.showValidationMessage('Ya existe una cuenta con este número');
          return false;
        }

        return {
          bankName: bankName,
          accountName: accountName,
          accountNumber: accountNumber,
          accountType: accountType as BankAccountType,
          currency: currency,
          balance: parseFloat(balance) || 0,
          isActive: isActive
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { bankName, accountName, accountNumber, accountType, currency, balance, isActive } = result.value;
        
        // Crear nueva cuenta bancaria
        const newAccount: BankAccount = {
          id: Date.now().toString(),
          bankName: bankName,
          accountName: accountName,
          accountNumber: accountNumber,
          accountType: accountType,
          currency: currency,
          balance: balance,
          isActive: isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.bankAccounts.push(newAccount);
        
        Swal.fire({
          title: '¡Cuenta Creada!',
          html: `
            <div class="text-start">
              <p><strong>Banco:</strong> ${bankName}</p>
              <p><strong>Cuenta:</strong> ${accountName}</p>
              <p><strong>Número:</strong> ${accountNumber}</p>
              <p><strong>Tipo:</strong> ${this.getBankAccountTypeName(accountType)}</p>
              <p><strong>Moneda:</strong> ${currency}</p>
              <p><strong>Saldo:</strong> ${this.formatCurrency(balance)}</p>
              <p><strong>Estado:</strong> ${isActive ? 'Activa' : 'Inactiva'}</p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  async deleteMovement(id: string) {
    const movement = this.bankMovements.find(mov => mov.id === id);
    if (!movement) return;

    const bankAccount = this.bankAccounts.find(acc => acc.id === movement.bankAccountId);
    const accountName = bankAccount ? `${bankAccount.bankName} - ${bankAccount.accountNumber}` : 'Cuenta desconocida';

    const result = await Swal.fire({
      title: '¿Eliminar Movimiento?',
      html: `
        <div class="text-start">
          <p><strong>Cuenta:</strong> ${accountName}</p>
          <p><strong>Descripción:</strong> ${movement.description}</p>
          <p><strong>Monto:</strong> ${this.formatCurrency(movement.amount)}</p>
          <p><strong>Fecha:</strong> ${movement.date.toLocaleDateString()}</p>
          <p><strong>Tipo:</strong> ${this.getMovementTypeLabel(movement.type)}</p>
        </div>
        <div class="alert alert-warning mt-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Advertencia:</strong> Esta acción no se puede deshacer.
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      this.bankMovements = this.bankMovements.filter(mov => mov.id !== id);
      this.applyMovementFilters();
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El movimiento ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
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

  async showNewMovementModal() {
    const bankAccountOptions = this.bankAccounts.map(account => 
      `<option value="${account.id}">${account.bankName} - ${account.accountNumber}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Movimiento Bancario',
      html: `
        <div class="mb-3">
          <label for="bankAccountId" class="form-label">Cuenta Bancaria</label>
          <select id="bankAccountId" class="form-select" required>
            <option value="">Seleccionar cuenta</option>
            ${bankAccountOptions}
          </select>
        </div>
        <div class="mb-3">
          <label for="type" class="form-label">Tipo de Movimiento</label>
          <select id="type" class="form-select" required>
            <option value="">Seleccionar tipo</option>
            <option value="DEPOSIT">Depósito</option>
            <option value="WITHDRAWAL">Retiro</option>
            <option value="TRANSFER_IN">Transferencia Entrante</option>
            <option value="TRANSFER_OUT">Transferencia Saliente</option>
            <option value="INTEREST">Interés</option>
            <option value="FEE">Comisión</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="amount" class="form-label">Monto</label>
          <input id="amount" type="number" step="0.01" min="0" class="form-control" placeholder="0.00" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Descripción</label>
          <input id="description" type="text" class="form-control" placeholder="Descripción del movimiento" required>
        </div>
        <div class="mb-3">
          <label for="reference" class="form-label">Referencia</label>
          <input id="reference" type="text" class="form-control" placeholder="Número de referencia (opcional)">
        </div>
        <div class="mb-3">
          <label for="date" class="form-label">Fecha</label>
          <input id="date" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-check">
          <input id="isReconciled" type="checkbox" class="form-check-input">
          <label for="isReconciled" class="form-check-label">Conciliado</label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Movimiento',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const bankAccountId = (document.getElementById('bankAccountId') as HTMLSelectElement).value;
        const type = (document.getElementById('type') as HTMLSelectElement).value;
        const amount = (document.getElementById('amount') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLInputElement).value;
        const reference = (document.getElementById('reference') as HTMLInputElement).value;
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const isReconciled = (document.getElementById('isReconciled') as HTMLInputElement).checked;

        if (!bankAccountId) {
          Swal.showValidationMessage('Debe seleccionar una cuenta bancaria');
          return false;
        }
        if (!type) {
          Swal.showValidationMessage('Debe seleccionar un tipo de movimiento');
          return false;
        }
        if (!amount || parseFloat(amount) <= 0) {
          Swal.showValidationMessage('El monto debe ser mayor a 0');
          return false;
        }
        if (!description || description.trim().length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }
        if (!date) {
          Swal.showValidationMessage('Debe seleccionar una fecha');
          return false;
        }

        return {
          bankAccountId,
          type,
          amount,
          description: description.trim(),
          reference: reference.trim(),
          date,
          isReconciled
        };
      }
    });

    if (formValues) {
      this.createMovement(formValues);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Movimiento bancario creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
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

  getMovementTypeLabel(type: MovementType): string {
    const labels = {
      [MovementType.DEPOSIT]: 'Depósito',
      [MovementType.WITHDRAWAL]: 'Retiro',
      [MovementType.TRANSFER_IN]: 'Transferencia Entrante',
      [MovementType.TRANSFER_OUT]: 'Transferencia Saliente',
      [MovementType.INTEREST]: 'Interés',
      [MovementType.FEE]: 'Comisión'
    };
    return labels[type] || type;
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