import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Customer, CustomerStatus, CustomerType, CustomerPriority, PaymentMethod } from '../../models/customer.models';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerForm: FormGroup;
  editingCustomer: Customer | null = null;
  showForm = false;

  // Filter properties
  searchTerm = '';
  statusFilter: CustomerStatus | '' = '';
  typeFilter: CustomerType | '' = '';
  priorityFilter: CustomerPriority | '' = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Statistics
  totalCustomers = 0;
  activeCustomers = 0;
  businessCustomers = 0;
  totalCreditLimit = 0;
  totalBalance = 0;

  // Enums for template
  CustomerStatus = CustomerStatus;
  CustomerType = CustomerType;
  CustomerPriority = CustomerPriority;
  PaymentMethod = PaymentMethod;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      legalName: [''],
      type: [CustomerType.INDIVIDUAL, Validators.required],
      status: [CustomerStatus.ACTIVE, Validators.required],
      priority: [CustomerPriority.NORMAL, Validators.required],
      taxId: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: [''],
      contactPerson: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      // Address
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['España', Validators.required],
      // Billing Address
      billingSameAsMain: [true],
      billingStreet: [''],
      billingCity: [''],
      billingState: [''],
      billingPostalCode: [''],
      billingCountry: ['España'],
      // Financial
      creditLimit: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      // Preferences
      newsletter: [true],
      promotions: [true],
      language: ['es'],
      currency: ['EUR'],
      // Other
      notes: [''],
      tags: [''],
      salesRepresentative: [''],
      birthDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadSampleData();
    this.calculateStatistics();
    this.applyFilters();
  }

  loadSampleData(): void {
    this.customers = [
      {
        id: '1',
        code: 'CLI001',
        name: 'Juan Pérez',
        legalName: 'Juan Pérez García',
        type: CustomerType.INDIVIDUAL,
        status: CustomerStatus.ACTIVE,
        priority: CustomerPriority.HIGH,
        taxId: '12345678Z',
        email: 'juan.perez@email.com',
        phone: '+34 600 123 456',
        website: '',
        contactPerson: 'Juan Pérez',
        contactEmail: 'juan.perez@email.com',
        contactPhone: '+34 600 123 456',
        address: {
          street: 'Calle Mayor 123',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        },
        billingAddress: {
          street: 'Calle Mayor 123',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        },
        paymentMethods: [PaymentMethod.CREDIT_CARD, PaymentMethod.BANK_TRANSFER],
        creditLimit: 5000,
        currentBalance: 1250,
        totalPurchases: 15680,
        lastPurchaseDate: new Date('2024-10-15'),
        registrationDate: new Date('2023-03-15'),
        birthDate: new Date('1985-06-20'),
        notes: 'Cliente VIP, muy puntual en pagos',
        tags: ['VIP', 'Puntual', 'Frecuente'],
        salesRepresentative: 'Ana García',
        discountPercentage: 5,
        isActive: true,
        preferences: {
          newsletter: true,
          promotions: true,
          language: 'es',
          currency: 'EUR'
        },
        loyaltyPoints: 1250,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2024-10-15')
      },
      {
        id: '2',
        code: 'CLI002',
        name: 'Empresa Tecnológica S.L.',
        legalName: 'Empresa Tecnológica Sistemas S.L.',
        type: CustomerType.BUSINESS,
        status: CustomerStatus.ACTIVE,
        priority: CustomerPriority.VIP,
        taxId: 'B12345678',
        email: 'compras@empresatech.com',
        phone: '+34 91 123 4567',
        website: 'https://empresatech.com',
        contactPerson: 'María González',
        contactEmail: 'maria.gonzalez@empresatech.com',
        contactPhone: '+34 91 123 4568',
        address: {
          street: 'Polígono Industrial Norte, Nave 45',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28050',
          country: 'España'
        },
        paymentMethods: [PaymentMethod.BANK_TRANSFER],
        creditLimit: 50000,
        currentBalance: 8750,
        totalPurchases: 125000,
        lastPurchaseDate: new Date('2024-10-20'),
        registrationDate: new Date('2022-01-10'),
        notes: 'Cliente corporativo, pedidos grandes mensuales',
        tags: ['Corporativo', 'Tecnología', 'Pedidos Grandes'],
        salesRepresentative: 'Carlos Ruiz',
        discountPercentage: 10,
        isActive: true,
        preferences: {
          newsletter: false,
          promotions: true,
          language: 'es',
          currency: 'EUR'
        },
        loyaltyPoints: 2500,
        createdAt: new Date('2022-01-10'),
        updatedAt: new Date('2024-10-20')
      },
      {
        id: '3',
        code: 'CLI003',
        name: 'Ana Martínez',
        legalName: 'Ana Martínez López',
        type: CustomerType.INDIVIDUAL,
        status: CustomerStatus.ACTIVE,
        priority: CustomerPriority.NORMAL,
        taxId: '87654321X',
        email: 'ana.martinez@email.com',
        phone: '+34 666 789 012',
        contactPerson: 'Ana Martínez',
        contactEmail: 'ana.martinez@email.com',
        contactPhone: '+34 666 789 012',
        address: {
          street: 'Avenida Libertad 67',
          city: 'Barcelona',
          state: 'Cataluña',
          postalCode: '08001',
          country: 'España'
        },
        paymentMethods: [PaymentMethod.CREDIT_CARD, PaymentMethod.PAYPAL],
        creditLimit: 2000,
        currentBalance: 350,
        totalPurchases: 3200,
        lastPurchaseDate: new Date('2024-10-10'),
        registrationDate: new Date('2023-08-20'),
        birthDate: new Date('1990-11-15'),
        notes: 'Cliente ocasional, compra productos específicos',
        tags: ['Ocasional', 'Online'],
        salesRepresentative: 'Luis Fernández',
        discountPercentage: 0,
        isActive: true,
        preferences: {
          newsletter: true,
          promotions: false,
          language: 'es',
          currency: 'EUR'
        },
        loyaltyPoints: 320,
        createdAt: new Date('2023-08-20'),
        updatedAt: new Date('2024-10-10')
      },
      {
        id: '4',
        code: 'CLI004',
        name: 'Restaurante El Buen Sabor',
        legalName: 'Hostelería El Buen Sabor S.L.',
        type: CustomerType.BUSINESS,
        status: CustomerStatus.SUSPENDED,
        priority: CustomerPriority.LOW,
        taxId: 'B98765432',
        email: 'administracion@buensabor.com',
        phone: '+34 93 456 7890',
        contactPerson: 'Pedro Sánchez',
        contactEmail: 'pedro.sanchez@buensabor.com',
        contactPhone: '+34 93 456 7891',
        address: {
          street: 'Calle Gastronomía 25',
          city: 'Valencia',
          state: 'Valencia',
          postalCode: '46001',
          country: 'España'
        },
        paymentMethods: [PaymentMethod.BANK_TRANSFER],
        creditLimit: 10000,
        currentBalance: 2500,
        totalPurchases: 18500,
        lastPurchaseDate: new Date('2024-09-15'),
        registrationDate: new Date('2023-05-12'),
        notes: 'Cliente suspendido por retrasos en pagos',
        tags: ['Hostelería', 'Suspendido', 'Retrasos'],
        salesRepresentative: 'Elena Vázquez',
        discountPercentage: 3,
        isActive: false,
        preferences: {
          newsletter: false,
          promotions: false,
          language: 'es',
          currency: 'EUR'
        },
        loyaltyPoints: 185,
        createdAt: new Date('2023-05-12'),
        updatedAt: new Date('2024-09-15')
      },
      {
        id: '5',
        code: 'CLI005',
        name: 'David López',
        legalName: 'David López Rodríguez',
        type: CustomerType.INDIVIDUAL,
        status: CustomerStatus.PROSPECT,
        priority: CustomerPriority.NORMAL,
        email: 'david.lopez@email.com',
        phone: '+34 677 888 999',
        contactPerson: 'David López',
        contactEmail: 'david.lopez@email.com',
        contactPhone: '+34 677 888 999',
        address: {
          street: 'Plaza Central 12',
          city: 'Sevilla',
          state: 'Andalucía',
          postalCode: '41001',
          country: 'España'
        },
        paymentMethods: [PaymentMethod.CASH],
        creditLimit: 500,
        currentBalance: 0,
        totalPurchases: 0,
        registrationDate: new Date('2024-10-01'),
        birthDate: new Date('1988-03-10'),
        notes: 'Cliente potencial, aún no ha realizado compras',
        tags: ['Prospect', 'Nuevo'],
        salesRepresentative: 'Isabel Torres',
        discountPercentage: 0,
        isActive: true,
        preferences: {
          newsletter: true,
          promotions: true,
          language: 'es',
          currency: 'EUR'
        },
        loyaltyPoints: 0,
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-10-01')
      }
    ];
  }

  calculateStatistics(): void {
    this.totalCustomers = this.customers.length;
    this.activeCustomers = this.customers.filter(c => c.status === CustomerStatus.ACTIVE).length;
    this.businessCustomers = this.customers.filter(c => c.type === CustomerType.BUSINESS).length;
    this.totalCreditLimit = this.customers.reduce((sum, customer) => sum + customer.creditLimit, 0);
    this.totalBalance = this.customers.reduce((sum, customer) => sum + customer.currentBalance, 0);
  }

  applyFilters(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || customer.status === this.statusFilter;
      const matchesType = !this.typeFilter || customer.type === this.typeFilter;
      const matchesPriority = !this.priorityFilter || customer.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
    
    this.totalItems = this.filteredCustomers.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredCustomers = this.filteredCustomers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.priorityFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  showNewCustomerForm(): void {
    this.editingCustomer = null;
    this.showForm = true;
    this.customerForm.reset();
    this.customerForm.patchValue({
      code: this.generateCustomerCode(),
      type: CustomerType.INDIVIDUAL,
      status: CustomerStatus.ACTIVE,
      priority: CustomerPriority.NORMAL,
      country: 'España',
      billingCountry: 'España',
      billingSameAsMain: true,
      newsletter: true,
      promotions: true,
      language: 'es',
      currency: 'EUR',
      creditLimit: 0,
      discountPercentage: 0
    });
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer = customer;
    this.showForm = true;
    
    this.customerForm.patchValue({
      code: customer.code,
      name: customer.name,
      legalName: customer.legalName || '',
      type: customer.type,
      status: customer.status,
      priority: customer.priority,
      taxId: customer.taxId || '',
      email: customer.email,
      phone: customer.phone,
      website: customer.website || '',
      contactPerson: customer.contactPerson || '',
      contactEmail: customer.contactEmail || '',
      contactPhone: customer.contactPhone || '',
      street: customer.address.street,
      city: customer.address.city,
      state: customer.address.state,
      postalCode: customer.address.postalCode,
      country: customer.address.country,
      billingSameAsMain: !customer.billingAddress || 
        (customer.billingAddress.street === customer.address.street &&
         customer.billingAddress.city === customer.address.city),
      billingStreet: customer.billingAddress?.street || '',
      billingCity: customer.billingAddress?.city || '',
      billingState: customer.billingAddress?.state || '',
      billingPostalCode: customer.billingAddress?.postalCode || '',
      billingCountry: customer.billingAddress?.country || 'España',
      creditLimit: customer.creditLimit,
      discountPercentage: customer.discountPercentage,
      newsletter: customer.preferences.newsletter,
      promotions: customer.preferences.promotions,
      language: customer.preferences.language,
      currency: customer.preferences.currency,
      notes: customer.notes || '',
      tags: customer.tags.join(', '),
      salesRepresentative: customer.salesRepresentative || '',
      birthDate: customer.birthDate ? customer.birthDate.toISOString().split('T')[0] : ''
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const formData = this.customerForm.value;
      
      if (this.editingCustomer) {
        // Update existing customer
        const index = this.customers.findIndex(c => c.id === this.editingCustomer!.id);
        if (index !== -1) {
          this.customers[index] = {
            ...this.editingCustomer,
            ...this.buildCustomerFromForm(formData),
            updatedAt: new Date()
          };
        }
      } else {
        // Create new customer
        const newCustomer = this.buildCustomerFromForm(formData);
        newCustomer.id = Date.now().toString();
        newCustomer.createdAt = new Date();
        newCustomer.updatedAt = new Date();
        newCustomer.registrationDate = new Date();
        newCustomer.totalPurchases = 0;
        newCustomer.currentBalance = 0;
        newCustomer.loyaltyPoints = 0;
        newCustomer.isActive = newCustomer.status === CustomerStatus.ACTIVE;
        
        this.customers.unshift(newCustomer);
      }
      
      this.cancelForm();
      this.calculateStatistics();
      this.applyFilters();
    } else {
      this.markFormGroupTouched(this.customerForm);
    }
  }

  buildCustomerFromForm(formData: any): Customer {
    const tags = formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
    
    const billingAddress = formData.billingSameAsMain ? {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country
    } : {
      street: formData.billingStreet,
      city: formData.billingCity,
      state: formData.billingState,
      postalCode: formData.billingPostalCode,
      country: formData.billingCountry
    };

    return {
      id: '',
      code: formData.code,
      name: formData.name,
      legalName: formData.legalName,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
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
      billingAddress: billingAddress,
      paymentMethods: [PaymentMethod.CREDIT_CARD], // Default
      creditLimit: formData.creditLimit,
      currentBalance: 0,
      totalPurchases: 0,
      registrationDate: new Date(),
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      notes: formData.notes,
      tags: tags,
      salesRepresentative: formData.salesRepresentative,
      discountPercentage: formData.discountPercentage,
      isActive: formData.status === CustomerStatus.ACTIVE,
      preferences: {
        newsletter: formData.newsletter,
        promotions: formData.promotions,
        language: formData.language,
        currency: formData.currency
      },
      loyaltyPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`¿Está seguro que desea eliminar el cliente ${customer.name}?`)) {
      const index = this.customers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        this.customers.splice(index, 1);
        this.calculateStatistics();
        this.applyFilters();
      }
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCustomer = null;
    this.customerForm.reset();
  }

  generateCustomerCode(): string {
    const prefix = 'CLI';
    const nextNumber = this.customers.length + 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  getStatusBadgeClass(status: CustomerStatus): string {
    const statusClasses = {
      [CustomerStatus.ACTIVE]: 'bg-success text-white',
      [CustomerStatus.INACTIVE]: 'bg-secondary text-white',
      [CustomerStatus.SUSPENDED]: 'bg-danger text-white',
      [CustomerStatus.PROSPECT]: 'bg-warning text-dark'
    };
    return statusClasses[status] || 'bg-secondary text-white';
  }

  getStatusText(status: CustomerStatus): string {
    const statusTexts = {
      [CustomerStatus.ACTIVE]: 'Activo',
      [CustomerStatus.INACTIVE]: 'Inactivo',
      [CustomerStatus.SUSPENDED]: 'Suspendido',
      [CustomerStatus.PROSPECT]: 'Prospecto'
    };
    return statusTexts[status] || status;
  }

  getTypeText(type: CustomerType): string {
    const typeTexts = {
      [CustomerType.INDIVIDUAL]: 'Individual',
      [CustomerType.BUSINESS]: 'Empresa',
      [CustomerType.CORPORATE]: 'Corporativo'
    };
    return typeTexts[type] || type;
  }

  getPriorityBadgeClass(priority: CustomerPriority): string {
    const priorityClasses = {
      [CustomerPriority.LOW]: 'bg-light text-dark',
      [CustomerPriority.NORMAL]: 'bg-primary text-white',
      [CustomerPriority.HIGH]: 'bg-warning text-dark',
      [CustomerPriority.VIP]: 'bg-danger text-white'
    };
    return priorityClasses[priority] || 'bg-primary text-white';
  }

  getPriorityText(priority: CustomerPriority): string {
    const priorityTexts = {
      [CustomerPriority.LOW]: 'Baja',
      [CustomerPriority.NORMAL]: 'Normal',
      [CustomerPriority.HIGH]: 'Alta',
      [CustomerPriority.VIP]: 'VIP'
    };
    return priorityTexts[priority] || priority;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPaginationArray(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  exportToCSV(): void {
    const headers = ['Código', 'Nombre', 'Tipo', 'Estado', 'Email', 'Teléfono', 'Crédito', 'Balance', 'Compras Totales'];
    const data = this.customers.map(customer => [
      customer.code,
      customer.name,
      this.getTypeText(customer.type),
      this.getStatusText(customer.status),
      customer.email,
      customer.phone,
      customer.creditLimit.toFixed(2),
      customer.currentBalance.toFixed(2),
      customer.totalPurchases.toFixed(2)
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}