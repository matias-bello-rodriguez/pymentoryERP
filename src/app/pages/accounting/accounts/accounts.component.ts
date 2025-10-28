import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Account, AccountType, AccountCategory } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: 'Editar Cuenta',
      html: `
        <form id="editAccountForm">
          <div class="mb-3 text-start">
            <label for="editCode" class="form-label">Código *</label>
            <input type="text" id="editCode" class="form-control" value="${account.code}" required pattern="[0-9]+">
          </div>
          <div class="mb-3 text-start">
            <label for="editName" class="form-label">Nombre *</label>
            <input type="text" id="editName" class="form-control" value="${account.name}" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="editType" class="form-label">Tipo *</label>
            <select id="editType" class="form-select" required>
              <option value="">Selecciona un tipo</option>
              ${this.accountTypes.map(type => 
                `<option value="${type}" ${account.type === type ? 'selected' : ''}>${this.getAccountTypeName(type)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="mb-3 text-start">
            <label for="editCategory" class="form-label">Categoría *</label>
            <select id="editCategory" class="form-select" required>
              <option value="">Selecciona una categoría</option>
              ${this.accountCategories.map(category => 
                `<option value="${category}" ${account.category === category ? 'selected' : ''}>${this.getCategoryName(category)}</option>`
              ).join('')}
            </select>
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
        const code = (document.getElementById('editCode') as HTMLInputElement).value;
        const name = (document.getElementById('editName') as HTMLInputElement).value;
        const type = (document.getElementById('editType') as HTMLSelectElement).value;
        const category = (document.getElementById('editCategory') as HTMLSelectElement).value;
        const isActive = (document.getElementById('editIsActive') as HTMLInputElement).checked;

        if (!code || !name || !type || !category) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (!/^[0-9]+$/.test(code)) {
          Swal.showValidationMessage('El código solo puede contener números');
          return false;
        }

        if (name.length < 3) {
          Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
          return false;
        }

        // Verificar si el código ya existe (excluyendo la cuenta actual)
        const existingAccount = this.accounts.find(acc => acc.code === code && acc.id !== account.id);
        if (existingAccount) {
          Swal.showValidationMessage('Ya existe una cuenta con este código');
          return false;
        }

        return {
          code: code,
          name: name,
          type: type as AccountType,
          category: category as AccountCategory,
          isActive: isActive
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { code, name, type, category, isActive } = result.value;
        
        // Actualizar la cuenta
        const index = this.accounts.findIndex(acc => acc.id === account.id);
        if (index !== -1) {
          this.accounts[index] = {
            ...this.accounts[index],
            code: code,
            name: name,
            type: type,
            category: category,
            isActive: isActive,
            updatedAt: new Date()
          };
          this.filteredAccounts = [...this.accounts];
          
          Swal.fire({
            title: '¡Cuenta Actualizada!',
            html: `
              <div class="text-start">
                <p><strong>Código:</strong> ${code}</p>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Tipo:</strong> ${this.getAccountTypeName(type)}</p>
                <p><strong>Categoría:</strong> ${this.getCategoryName(category)}</p>
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

  deleteAccount(id: string) {
    const account = this.accounts.find(acc => acc.id === id);
    if (!account) return;

    Swal.fire({
      title: '¿Eliminar Cuenta?',
      html: `
        <div class="text-start">
          <p>¿Estás seguro de que deseas eliminar esta cuenta?</p>
          <div class="alert alert-warning">
            <strong>Código:</strong> ${account.code}<br>
            <strong>Nombre:</strong> ${account.name}<br>
            <strong>Tipo:</strong> ${this.getAccountTypeName(account.type)}
          </div>
          <p class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Esta acción no se puede deshacer.</p>
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
        this.accounts = this.accounts.filter(acc => acc.id !== id);
        this.filteredAccounts = [...this.accounts];
        
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La cuenta ha sido eliminada exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  showNewAccountModal() {
    Swal.fire({
      title: '¡Nueva Cuenta!',
      html: `
        <form id="newAccountForm">
          <div class="mb-3 text-start">
            <label for="newCode" class="form-label">Código *</label>
            <input type="text" id="newCode" class="form-control" placeholder="1000" required pattern="[0-9]+">
          </div>
          <div class="mb-3 text-start">
            <label for="newName" class="form-label">Nombre *</label>
            <input type="text" id="newName" class="form-control" placeholder="Nombre de la cuenta" required minlength="3">
          </div>
          <div class="mb-3 text-start">
            <label for="newType" class="form-label">Tipo *</label>
            <select id="newType" class="form-select" required>
              <option value="">Selecciona un tipo</option>
              ${this.accountTypes.map(type => 
                `<option value="${type}">${this.getAccountTypeName(type)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="mb-3 text-start">
            <label for="newCategory" class="form-label">Categoría *</label>
            <select id="newCategory" class="form-select" required>
              <option value="">Selecciona una categoría</option>
              ${this.accountCategories.map(category => 
                `<option value="${category}">${this.getCategoryName(category)}</option>`
              ).join('')}
            </select>
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
        const code = (document.getElementById('newCode') as HTMLInputElement).value;
        const name = (document.getElementById('newName') as HTMLInputElement).value;
        const type = (document.getElementById('newType') as HTMLSelectElement).value;
        const category = (document.getElementById('newCategory') as HTMLSelectElement).value;
        const isActive = (document.getElementById('newIsActive') as HTMLInputElement).checked;

        if (!code || !name || !type || !category) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (!/^[0-9]+$/.test(code)) {
          Swal.showValidationMessage('El código solo puede contener números');
          return false;
        }

        if (name.length < 3) {
          Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
          return false;
        }

        // Verificar si el código ya existe
        const existingAccount = this.accounts.find(acc => acc.code === code);
        if (existingAccount) {
          Swal.showValidationMessage('Ya existe una cuenta con este código');
          return false;
        }

        return {
          code: code,
          name: name,
          type: type as AccountType,
          category: category as AccountCategory,
          isActive: isActive
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { code, name, type, category, isActive } = result.value;
        
        // Crear nueva cuenta
        const newAccount: Account = {
          id: Date.now().toString(),
          code: code,
          name: name,
          type: type,
          category: category,
          balance: 0,
          isActive: isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.accounts.push(newAccount);
        this.filteredAccounts = [...this.accounts];
        
        Swal.fire({
          title: '¡Cuenta Creada!',
          html: `
            <div class="text-start">
              <p><strong>Código:</strong> ${code}</p>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Tipo:</strong> ${this.getAccountTypeName(type)}</p>
              <p><strong>Categoría:</strong> ${this.getCategoryName(category)}</p>
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