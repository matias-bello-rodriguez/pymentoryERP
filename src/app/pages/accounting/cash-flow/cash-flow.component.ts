import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CashFlowEntry, CashFlowType, CashFlowCategory } from '../../../models/accounting.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

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
    this.isEditing = true;
    this.editingId = entry.id;
    this.showForm = true;
    
    this.cashFlowForm.patchValue({
      date: entry.date.toISOString().split('T')[0],
      description: entry.description,
      category: entry.category,
      type: entry.type,
      amount: entry.amount,
      reference: entry.reference
    });
  }

  deleteEntry(id: string) {
    if (confirm('¿Está seguro de eliminar este movimiento?')) {
      this.cashFlowEntries = this.cashFlowEntries.filter(entry => entry.id !== id);
      this.applyFilters();
    }
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