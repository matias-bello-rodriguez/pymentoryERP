import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Supplier, SupplierStatus, SupplierType, PaymentTerms } from '../../../models/purchasing.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  
  supplierForm: FormGroup;
  showForm = false;
  editingSupplier: Supplier | null = null;
  
  // Expose enums to template
  SupplierStatus = SupplierStatus;
  SupplierType = SupplierType;
  PaymentTerms = PaymentTerms;
  
  // Filters
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  
  // Stats
  totalSuppliers = 0;
  activeSuppliers = 0;
  totalBalance = 0;
  averageRating = 0;

  constructor(private fb: FormBuilder) {
    this.supplierForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      legalName: ['', Validators.required],
      type: ['', Validators.required],
      status: [SupplierStatus.ACTIVE, Validators.required],
      taxId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: [''],
      contactPerson: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['España', Validators.required],
      paymentTerms: ['', Validators.required],
      creditLimit: [0, [Validators.required, Validators.min(0)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      notes: [''],
      categories: [''],
      bankName: [''],
      accountNumber: [''],
      routingNumber: ['']
    });
  }

  ngOnInit() {
    this.loadSuppliers();
    this.calculateStats();
  }

  loadSuppliers() {
    // Sample suppliers data
    this.suppliers = [
      {
        id: '1',
        code: 'SUP001',
        name: 'Techno Supplies S.A.',
        legalName: 'TechnoSupplies Sociedad Anónima',
        type: SupplierType.GOODS,
        status: SupplierStatus.ACTIVE,
        taxId: 'A12345678',
        email: 'info@technosupplies.com',
        phone: '+34 91 123 4567',
        website: 'https://technosupplies.com',
        contactPerson: 'María García',
        contactEmail: 'maria.garcia@technosupplies.com',
        contactPhone: '+34 91 123 4568',
        address: {
          street: 'Calle Mayor 123',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_30,
        creditLimit: 50000,
        currentBalance: 12500,
        rating: 5,
        notes: 'Proveedor principal de equipos electrónicos',
        categories: ['Electrónicos', 'Informática'],
        bankAccount: {
          bankName: 'Banco Santander',
          accountNumber: 'ES1234567890123456789012',
          routingNumber: '0049'
        },
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'SUP002',
        name: 'Textiles Europa S.L.',
        legalName: 'Textiles Europa Sociedad Limitada',
        type: SupplierType.GOODS,
        status: SupplierStatus.ACTIVE,
        taxId: 'B98765432',
        email: 'pedidos@textileuropa.com',
        phone: '+34 93 987 6543',
        website: 'https://textileuropa.com',
        contactPerson: 'Juan Martínez',
        contactEmail: 'juan.martinez@textileuropa.com',
        contactPhone: '+34 93 987 6544',
        address: {
          street: 'Avenida Diagonal 456',
          city: 'Barcelona',
          state: 'Cataluña',
          postalCode: '08013',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_45,
        creditLimit: 30000,
        currentBalance: 8750,
        rating: 4,
        notes: 'Especialistas en textiles y confección',
        categories: ['Textiles', 'Confección'],
        bankAccount: {
          bankName: 'CaixaBank',
          accountNumber: 'ES9876543210987654321098',
          routingNumber: '2100'
        },
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: '3',
        code: 'SUP003',
        name: 'Servicios Logísticos Pro',
        legalName: 'Servicios Logísticos Profesionales S.A.',
        type: SupplierType.SERVICES,
        status: SupplierStatus.ACTIVE,
        taxId: 'A11122334',
        email: 'contacto@logisticapro.com',
        phone: '+34 95 555 1234',
        contactPerson: 'Ana López',
        contactEmail: 'ana.lopez@logisticapro.com',
        contactPhone: '+34 95 555 1235',
        address: {
          street: 'Polígono Industrial Sur, Nave 45',
          city: 'Sevilla',
          state: 'Andalucía',
          postalCode: '41020',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_15,
        creditLimit: 20000,
        currentBalance: 3200,
        rating: 4,
        notes: 'Servicios de transporte y logística',
        categories: ['Logística', 'Transporte'],
        isActive: true,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date()
      },
      {
        id: '4',
        code: 'SUP004',
        name: 'Alimentaria Valencia',
        legalName: 'Distribuidora Alimentaria Valencia S.L.',
        type: SupplierType.GOODS,
        status: SupplierStatus.INACTIVE,
        taxId: 'B55566778',
        email: 'ventas@alimentariavalencia.com',
        phone: '+34 96 321 9876',
        contactPerson: 'Carlos Ruiz',
        contactEmail: 'carlos.ruiz@alimentariavalencia.com',
        contactPhone: '+34 96 321 9877',
        address: {
          street: 'Calle del Puerto 789',
          city: 'Valencia',
          state: 'Valencia',
          postalCode: '46001',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_30,
        creditLimit: 15000,
        currentBalance: 0,
        rating: 3,
        notes: 'Proveedor de productos alimentarios - Temporalmente inactivo',
        categories: ['Alimentación', 'Bebidas'],
        isActive: false,
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date()
      }
    ];
    
    this.filteredSuppliers = [...this.suppliers];
  }

  calculateStats() {
    this.totalSuppliers = this.suppliers.length;
    this.activeSuppliers = this.suppliers.filter(s => s.status === SupplierStatus.ACTIVE).length;
    this.totalBalance = this.suppliers.reduce((sum, supplier) => sum + supplier.currentBalance, 0);
    this.averageRating = this.suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / this.suppliers.length;
  }

  applyFilters() {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      const matchesSearch = !this.searchTerm || 
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || 
        supplier.status === this.statusFilter;
      
      const matchesType = !this.typeFilter || 
        supplier.type === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      const formData = this.supplierForm.value;
      
      if (this.editingSupplier) {
        // Update existing supplier
        const index = this.suppliers.findIndex(s => s.id === this.editingSupplier!.id);
        if (index !== -1) {
          this.suppliers[index] = {
            ...this.editingSupplier,
            ...this.buildSupplierFromForm(formData),
            updatedAt: new Date()
          };
        }
      } else {
        // Create new supplier
        const newSupplier = this.buildSupplierFromForm(formData);
        newSupplier.id = Date.now().toString();
        newSupplier.createdAt = new Date();
        newSupplier.updatedAt = new Date();
        this.suppliers.push(newSupplier);
      }
      
      this.resetForm();
      this.applyFilters();
      this.calculateStats();
    }
  }

  buildSupplierFromForm(formData: any): Supplier {
    return {
      id: '',
      code: formData.code,
      name: formData.name,
      legalName: formData.legalName,
      type: formData.type,
      status: formData.status,
      taxId: formData.taxId,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      },
      paymentTerms: formData.paymentTerms,
      creditLimit: formData.creditLimit,
      currentBalance: 0,
      rating: formData.rating,
      notes: formData.notes,
      categories: formData.categories ? formData.categories.split(',').map((c: string) => c.trim()) : [],
      bankAccount: formData.bankName ? {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber
      } : undefined,
      isActive: formData.status === SupplierStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  editSupplier(supplier: Supplier) {
    this.editingSupplier = supplier;
    this.supplierForm.patchValue({
      code: supplier.code,
      name: supplier.name,
      legalName: supplier.legalName,
      type: supplier.type,
      status: supplier.status,
      taxId: supplier.taxId,
      email: supplier.email,
      phone: supplier.phone,
      website: supplier.website,
      contactPerson: supplier.contactPerson,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      street: supplier.address.street,
      city: supplier.address.city,
      state: supplier.address.state,
      postalCode: supplier.address.postalCode,
      country: supplier.address.country,
      paymentTerms: supplier.paymentTerms,
      creditLimit: supplier.creditLimit,
      rating: supplier.rating,
      notes: supplier.notes,
      categories: supplier.categories.join(', '),
      bankName: supplier.bankAccount?.bankName || '',
      accountNumber: supplier.bankAccount?.accountNumber || '',
      routingNumber: supplier.bankAccount?.routingNumber || ''
    });
    this.showForm = true;
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm(`¿Estás seguro de eliminar el proveedor "${supplier.name}"?`)) {
      this.suppliers = this.suppliers.filter(s => s.id !== supplier.id);
      this.applyFilters();
      this.calculateStats();
    }
  }

  toggleSupplierStatus(supplier: Supplier) {
    supplier.status = supplier.status === SupplierStatus.ACTIVE ? SupplierStatus.INACTIVE : SupplierStatus.ACTIVE;
    supplier.isActive = supplier.status === SupplierStatus.ACTIVE;
    supplier.updatedAt = new Date();
    this.calculateStats();
  }

  resetForm() {
    this.supplierForm.reset();
    this.supplierForm.patchValue({ 
      status: SupplierStatus.ACTIVE,
      country: 'España',
      rating: 5
    });
    this.editingSupplier = null;
    this.showForm = false;
  }

  getStatusClass(status: SupplierStatus): string {
    switch (status) {
      case SupplierStatus.ACTIVE: return 'success';
      case SupplierStatus.INACTIVE: return 'warning';
      case SupplierStatus.BLOCKED: return 'danger';
      default: return 'secondary';
    }
  }

  getStatusText(status: SupplierStatus): string {
    switch (status) {
      case SupplierStatus.ACTIVE: return 'Activo';
      case SupplierStatus.INACTIVE: return 'Inactivo';
      case SupplierStatus.BLOCKED: return 'Bloqueado';
      default: return status;
    }
  }

  getTypeText(type: SupplierType): string {
    switch (type) {
      case SupplierType.GOODS: return 'Productos';
      case SupplierType.SERVICES: return 'Servicios';
      case SupplierType.BOTH: return 'Ambos';
      default: return type;
    }
  }

  getPaymentTermsText(terms: PaymentTerms): string {
    switch (terms) {
      case PaymentTerms.IMMEDIATE: return 'Inmediato';
      case PaymentTerms.NET_15: return '15 días';
      case PaymentTerms.NET_30: return '30 días';
      case PaymentTerms.NET_45: return '45 días';
      case PaymentTerms.NET_60: return '60 días';
      case PaymentTerms.NET_90: return '90 días';
      default: return terms;
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.applyFilters();
  }

  exportSuppliers() {
    console.log('Exportando proveedores...', this.filteredSuppliers);
    alert('Función de exportación no implementada en el demo');
  }
}