import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CashFlowEntry, CashFlowType, CashFlowCategory } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cash-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit {
  cashFlowEntries: CashFlowEntry[] = [];
  filteredEntries: CashFlowEntry[] = [];
  cashFlowForm: FormGroup;
  isEditing = false;
  editingId: string | null = null;
  showForm = false;
  
  // Filter properties
  filterType: CashFlowType | '' = '';
  filterCategory: CashFlowCategory | '' = '';
  filterDateFrom = '';
  filterDateTo = '';

  // Summary properties
  totalInflows = 0;
  totalOutflows = 0;
  netCashFlow = 0;

  // Enums for template
  cashFlowTypes = Object.values(CashFlowType);
  cashFlowCategories = Object.values(CashFlowCategory);

  constructor(private fb: FormBuilder) {
    this.cashFlowForm = this.fb.group({
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
  }

  ngOnInit() {
    this.loadCashFlowEntries();
    this.calculateSummary();
  }

  loadCashFlowEntries() {
    // Simulate loading cash flow entries with sample data
    this.cashFlowEntries = [
      {
        id: '1',
        date: new Date('2024-10-01'),
        description: 'Venta de productos',
        category: CashFlowCategory.OPERATING,
        type: CashFlowType.INFLOW,
        amount: 150000,
        reference: 'VENTA-001',
        createdAt: new Date()
      },
      {
        id: '2',
        date: new Date('2024-10-02'),
        description: 'Pago de nómina',
        category: CashFlowCategory.OPERATING,
        type: CashFlowType.OUTFLOW,
        amount: 80000,
        reference: 'NOMINA-001',
        createdAt: new Date()
      },
      {
        id: '3',
        date: new Date('2024-10-03'),
        description: 'Compra de equipo',
        category: CashFlowCategory.INVESTING,
        type: CashFlowType.OUTFLOW,
        amount: 200000,
        reference: 'EQUIPO-001',
        createdAt: new Date()
      },
      {
        id: '4',
        date: new Date('2024-10-04'),
        description: 'Préstamo bancario',
        category: CashFlowCategory.FINANCING,
        type: CashFlowType.INFLOW,
        amount: 300000,
        reference: 'PRESTAMO-001',
        createdAt: new Date()
      },
      {
        id: '5',
        date: new Date('2024-10-05'),
        description: 'Pago de servicios',
        category: CashFlowCategory.OPERATING,
        type: CashFlowType.OUTFLOW,
        amount: 45000,
        reference: 'SERVICIOS-001',
        createdAt: new Date()
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredEntries = this.cashFlowEntries.filter(entry => {
      let matchesType = !this.filterType || entry.type === this.filterType;
      let matchesCategory = !this.filterCategory || entry.category === this.filterCategory;
      let matchesDateFrom = !this.filterDateFrom || entry.date >= new Date(this.filterDateFrom);
      let matchesDateTo = !this.filterDateTo || entry.date <= new Date(this.filterDateTo);

      return matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
    });
    
    this.calculateSummary();
  }

  calculateSummary() {
    this.totalInflows = this.filteredEntries
      .filter(entry => entry.type === CashFlowType.INFLOW)
      .reduce((sum, entry) => sum + entry.amount, 0);

    this.totalOutflows = this.filteredEntries
      .filter(entry => entry.type === CashFlowType.OUTFLOW)
      .reduce((sum, entry) => sum + entry.amount, 0);

    this.netCashFlow = this.totalInflows - this.totalOutflows;
  }

  onSubmit() {
    if (this.cashFlowForm.valid) {
      const formData = this.cashFlowForm.value;
      
      if (this.isEditing && this.editingId) {
        this.updateEntry(this.editingId, formData);
      } else {
        this.createEntry(formData);
      }
    }
  }

  createEntry(entryData: any) {
    const newEntry: CashFlowEntry = {
      id: Date.now().toString(),
      date: new Date(entryData.date),
      description: entryData.description,
      category: entryData.category,
      type: entryData.type,
      amount: parseFloat(entryData.amount),
      reference: entryData.reference || `CF-${Date.now()}`,
      createdAt: new Date()
    };

    this.cashFlowEntries.push(newEntry);
    this.applyFilters();
    this.resetForm();
    this.showForm = false;
  }

  updateEntry(id: string, entryData: any) {
    const index = this.cashFlowEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.cashFlowEntries[index] = {
        ...this.cashFlowEntries[index],
        date: new Date(entryData.date),
        description: entryData.description,
        category: entryData.category,
        type: entryData.type,
        amount: parseFloat(entryData.amount),
        reference: entryData.reference
      };
      this.applyFilters();
      this.resetForm();
      this.showForm = false;
    }
  }

  editEntry(entry: CashFlowEntry) {
    Swal.fire({
      title: 'Editar Movimiento',
      html: `
        <form id="editCashFlowForm">
          <div class="mb-3 text-start">
            <label for="editDate" class="form-label">Fecha *</label>
            <input type="date" id="editDate" class="form-control" value="${entry.date.toISOString().split('T')[0]}" required>
          </div>
          <div class="mb-3 text-start">
            <label for="editDescription" class="form-label">Descripción *</label>
            <input type="text" id="editDescription" class="form-control" value="${entry.description}" required minlength="3">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="editCategory" class="form-label">Categoría *</label>
              <select id="editCategory" class="form-select" required>
                <option value="">Selecciona una categoría</option>
                ${this.cashFlowCategories.map(category => 
                  `<option value="${category}" ${entry.category === category ? 'selected' : ''}>${this.getCategoryName(category)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="col-6">
              <label for="editType" class="form-label">Tipo *</label>
              <select id="editType" class="form-select" required>
                <option value="">Selecciona un tipo</option>
                ${this.cashFlowTypes.map(type => 
                  `<option value="${type}" ${entry.type === type ? 'selected' : ''}>${this.getTypeName(type)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="editAmount" class="form-label">Monto *</label>
            <input type="number" id="editAmount" class="form-control" value="${entry.amount}" required min="0.01" step="0.01">
          </div>
          <div class="mb-3 text-start">
            <label for="editReference" class="form-label">Referencia</label>
            <input type="text" id="editReference" class="form-control" value="${entry.reference || ''}" placeholder="Referencia opcional">
          </div>
        </form>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0dcaf0',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Actualizar Movimiento',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const date = (document.getElementById('editDate') as HTMLInputElement).value;
        const description = (document.getElementById('editDescription') as HTMLInputElement).value;
        const category = (document.getElementById('editCategory') as HTMLSelectElement).value;
        const type = (document.getElementById('editType') as HTMLSelectElement).value;
        const amount = (document.getElementById('editAmount') as HTMLInputElement).value;
        const reference = (document.getElementById('editReference') as HTMLInputElement).value;

        if (!date || !description || !category || !type || !amount) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (description.length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }

        if (parseFloat(amount) <= 0) {
          Swal.showValidationMessage('El monto debe ser mayor a 0');
          return false;
        }

        return {
          date: date,
          description: description,
          category: category as CashFlowCategory,
          type: type as CashFlowType,
          amount: parseFloat(amount),
          reference: reference
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { date, description, category, type, amount, reference } = result.value;
        
        // Actualizar el movimiento
        const index = this.cashFlowEntries.findIndex(e => e.id === entry.id);
        if (index !== -1) {
          this.cashFlowEntries[index] = {
            ...this.cashFlowEntries[index],
            date: new Date(date),
            description: description,
            category: category,
            type: type,
            amount: amount,
            reference: reference || `CF-${Date.now()}`
          };
          this.applyFilters();
          this.calculateSummary();
          
          Swal.fire({
            title: '¡Movimiento Actualizado!',
            html: `
              <div class="text-start">
                <p><strong>Fecha:</strong> ${this.formatDate(new Date(date))}</p>
                <p><strong>Descripción:</strong> ${description}</p>
                <p><strong>Categoría:</strong> ${this.getCategoryName(category)}</p>
                <p><strong>Tipo:</strong> ${this.getTypeName(type)}</p>
                <p><strong>Monto:</strong> ${this.formatCurrency(amount)}</p>
                ${reference ? `<p><strong>Referencia:</strong> ${reference}</p>` : ''}
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

  deleteEntry(id: string) {
    const entry = this.cashFlowEntries.find(e => e.id === id);
    if (!entry) return;

    Swal.fire({
      title: '¿Eliminar Movimiento?',
      html: `
        <div class="text-start">
          <p>¿Estás seguro de que deseas eliminar este movimiento de flujo de caja?</p>
          <div class="alert alert-warning">
            <strong>Fecha:</strong> ${this.formatDate(entry.date)}<br>
            <strong>Descripción:</strong> ${entry.description}<br>
            <strong>Tipo:</strong> ${this.getTypeName(entry.type)}<br>
            <strong>Monto:</strong> ${this.formatCurrency(entry.amount)}
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
        this.cashFlowEntries = this.cashFlowEntries.filter(entry => entry.id !== id);
        this.applyFilters();
        this.calculateSummary();
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El movimiento ha sido eliminado exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  showNewMovementModal() {
    Swal.fire({
      title: '¡Nuevo Movimiento!',
      html: `
        <form id="newCashFlowForm">
          <div class="mb-3 text-start">
            <label for="newDate" class="form-label">Fecha *</label>
            <input type="date" id="newDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="mb-3 text-start">
            <label for="newDescription" class="form-label">Descripción *</label>
            <input type="text" id="newDescription" class="form-control" placeholder="Descripción del movimiento" required minlength="3">
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="newCategory" class="form-label">Categoría *</label>
              <select id="newCategory" class="form-select" required>
                <option value="">Selecciona una categoría</option>
                ${this.cashFlowCategories.map(category => 
                  `<option value="${category}">${this.getCategoryName(category)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="col-6">
              <label for="newType" class="form-label">Tipo *</label>
              <select id="newType" class="form-select" required>
                <option value="">Selecciona un tipo</option>
                ${this.cashFlowTypes.map(type => 
                  `<option value="${type}">${this.getTypeName(type)}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="newAmount" class="form-label">Monto *</label>
            <input type="number" id="newAmount" class="form-control" placeholder="0.00" required min="0.01" step="0.01">
          </div>
          <div class="mb-3 text-start">
            <label for="newReference" class="form-label">Referencia</label>
            <input type="text" id="newReference" class="form-control" placeholder="Referencia opcional">
          </div>
        </form>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Crear Movimiento',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const date = (document.getElementById('newDate') as HTMLInputElement).value;
        const description = (document.getElementById('newDescription') as HTMLInputElement).value;
        const category = (document.getElementById('newCategory') as HTMLSelectElement).value;
        const type = (document.getElementById('newType') as HTMLSelectElement).value;
        const amount = (document.getElementById('newAmount') as HTMLInputElement).value;
        const reference = (document.getElementById('newReference') as HTMLInputElement).value;

        if (!date || !description || !category || !type || !amount) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        if (description.length < 3) {
          Swal.showValidationMessage('La descripción debe tener al menos 3 caracteres');
          return false;
        }

        if (parseFloat(amount) <= 0) {
          Swal.showValidationMessage('El monto debe ser mayor a 0');
          return false;
        }

        return {
          date: date,
          description: description,
          category: category as CashFlowCategory,
          type: type as CashFlowType,
          amount: parseFloat(amount),
          reference: reference
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { date, description, category, type, amount, reference } = result.value;
        
        // Crear nuevo movimiento
        const newEntry: CashFlowEntry = {
          id: Date.now().toString(),
          date: new Date(date),
          description: description,
          category: category,
          type: type,
          amount: amount,
          reference: reference || `CF-${Date.now()}`,
          createdAt: new Date()
        };

        this.cashFlowEntries.push(newEntry);
        this.applyFilters();
        this.calculateSummary();
        
        Swal.fire({
          title: '¡Movimiento Creado!',
          html: `
            <div class="text-start">
              <p><strong>Fecha:</strong> ${this.formatDate(new Date(date))}</p>
              <p><strong>Descripción:</strong> ${description}</p>
              <p><strong>Categoría:</strong> ${this.getCategoryName(category)}</p>
              <p><strong>Tipo:</strong> ${this.getTypeName(type)}</p>
              <p><strong>Monto:</strong> ${this.formatCurrency(amount)}</p>
              ${reference ? `<p><strong>Referencia:</strong> ${reference}</p>` : ''}
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  resetForm() {
    this.cashFlowForm.reset();
    this.isEditing = false;
    this.editingId = null;
  }

  cancelEdit() {
    this.resetForm();
    this.showForm = false;
  }

  getTypeName(type: CashFlowType): string {
    const typeNames = {
      [CashFlowType.INFLOW]: 'Entrada',
      [CashFlowType.OUTFLOW]: 'Salida'
    };
    return typeNames[type];
  }

  getCategoryName(category: CashFlowCategory): string {
    const categoryNames = {
      [CashFlowCategory.OPERATING]: 'Operacional',
      [CashFlowCategory.INVESTING]: 'Inversión',
      [CashFlowCategory.FINANCING]: 'Financiación'
    };
    return categoryNames[category];
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

  getCashFlowByCategory() {
    const categoryTotals = {
      [CashFlowCategory.OPERATING]: { inflow: 0, outflow: 0 },
      [CashFlowCategory.INVESTING]: { inflow: 0, outflow: 0 },
      [CashFlowCategory.FINANCING]: { inflow: 0, outflow: 0 }
    };

    this.filteredEntries.forEach(entry => {
      if (entry.type === CashFlowType.INFLOW) {
        categoryTotals[entry.category].inflow += entry.amount;
      } else {
        categoryTotals[entry.category].outflow += entry.amount;
      }
    });

    return categoryTotals;
  }
}