import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { PurchaseOrder, PurchaseOrderStatus, Supplier, SupplierStatus, SupplierType, PaymentTerms, PurchaseOrderItem, PurchaseOrderPriority } from '../../../models/purchasing.models';
import { Product, ProductCategory, UnitOfMeasure, ProductStatus } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  orderForm!: FormGroup;
  editingOrder: PurchaseOrder | null = null;
  showForm = false;

  // Filters
  searchTerm = '';
  statusFilter: PurchaseOrderStatus | '' = '';
  supplierFilter = '';
  dateFromFilter = '';
  dateToFilter = '';

  // Enums for template
  PurchaseOrderStatus = PurchaseOrderStatus;

  // Statistics
  totalOrders = 0;
  pendingOrders = 0;
  approvedOrders = 0;
  receivedOrders = 0;
  totalValue = 0;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSampleData();
    this.calculateStatistics();
    this.applyFilters();
  }

  initializeForm(): void {
    this.orderForm = this.fb.group({
      orderNumber: ['', [Validators.required, Validators.minLength(3)]],
      supplierId: ['', Validators.required],
      supplierName: [''],
      orderDate: [this.getCurrentDate(), Validators.required],
      expectedDate: ['', Validators.required],
      status: [PurchaseOrderStatus.DRAFT, Validators.required],
      priority: ['NORMAL', Validators.required],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      taxAmount: [0, [Validators.min(0)]],
      shippingCost: [0, [Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]],
      currency: ['EUR', Validators.required],
      paymentTerms: [PaymentTerms.NET_30, Validators.required],
      deliveryAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['España', Validators.required]
      }),
      notes: [''],
      createdBy: ['Usuario Actual'],
      items: this.fb.array([])
    });

    // Add initial line item
    this.addLineItem();
  }

  get lineItems(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addLineItem(): void {
    const lineItem = this.fb.group({
      productId: ['', Validators.required],
      productName: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      taxRate: [21, [Validators.min(0), Validators.max(100)]],
      lineTotal: [0, Validators.min(0)]
    });

    // Subscribe to value changes to calculate line total
    lineItem.valueChanges.subscribe(() => {
      this.calculateLineTotal(lineItem);
      this.calculateOrderTotal();
    });

    this.lineItems.push(lineItem);
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
      this.calculateOrderTotal();
    }
  }

  calculateLineTotal(lineItem: FormGroup): void {
    const quantity = lineItem.get('quantity')?.value || 0;
    const unitPrice = lineItem.get('unitPrice')?.value || 0;
    const discount = lineItem.get('discount')?.value || 0;
    const taxRate = lineItem.get('taxRate')?.value || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const lineTotal = taxableAmount + taxAmount;

    lineItem.get('lineTotal')?.setValue(lineTotal, { emitEvent: false });
  }

  calculateOrderTotal(): void {
    let totalAmount = 0;
    let taxAmount = 0;

    this.lineItems.controls.forEach(lineItem => {
      const quantity = lineItem.get('quantity')?.value || 0;
      const unitPrice = lineItem.get('unitPrice')?.value || 0;
      const discount = lineItem.get('discount')?.value || 0;
      const taxRate = lineItem.get('taxRate')?.value || 0;

      const subtotal = quantity * unitPrice;
      const discountAmount = subtotal * (discount / 100);
      const taxableAmount = subtotal - discountAmount;
      const lineTaxAmount = taxableAmount * (taxRate / 100);
      
      totalAmount += taxableAmount + lineTaxAmount;
      taxAmount += lineTaxAmount;
    });

    this.orderForm.get('totalAmount')?.setValue(totalAmount, { emitEvent: false });
    this.orderForm.get('taxAmount')?.setValue(taxAmount, { emitEvent: false });
  }

  onProductSelect(index: number, productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const lineItem = this.lineItems.at(index);
      lineItem.get('productName')?.setValue(product.name);
      lineItem.get('description')?.setValue(product.description);
      lineItem.get('unitPrice')?.setValue(product.unitPrice || 0);
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      
      if (this.editingOrder) {
        this.updateOrder(formValue);
      } else {
        this.createOrder(formValue);
      }
    } else {
      this.markFormGroupTouched(this.orderForm);
    }
  }

  createOrder(formValue: any): void {
    const newOrder: PurchaseOrder = {
      id: this.generateId(),
      ...formValue,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.push(newOrder);
    this.resetForm();
    this.calculateStatistics();
    this.applyFilters();
  }

  updateOrder(formValue: any): void {
    if (this.editingOrder) {
      const index = this.orders.findIndex(o => o.id === this.editingOrder!.id);
      if (index !== -1) {
        this.orders[index] = {
          ...this.editingOrder,
          ...formValue,
          updatedAt: new Date()
        };
        this.resetForm();
        this.calculateStatistics();
        this.applyFilters();
      }
    }
  }

  editOrder(order: PurchaseOrder): void {
    this.editingOrder = order;
    this.showForm = true;
    this.orderForm.patchValue(order);
    
    // Clear existing line items and add order line items
    while (this.lineItems.length !== 0) {
      this.lineItems.removeAt(0);
    }
    
    order.items.forEach((item: PurchaseOrderItem) => {
      const lineItem = this.fb.group({
        productId: [item.productId, Validators.required],
        productName: [item.productName, Validators.required],
        description: [item.description],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
        discount: [item.discountPercent, [Validators.min(0), Validators.max(100)]],
        taxRate: [item.taxRate, [Validators.min(0), Validators.max(100)]],
        lineTotal: [item.totalPrice, Validators.min(0)]
      });
      
      lineItem.valueChanges.subscribe(() => {
        this.calculateLineTotal(lineItem);
        this.calculateOrderTotal();
      });
      
      this.lineItems.push(lineItem);
    });
  }

  deleteOrder(order: PurchaseOrder): void {
    if (confirm(`¿Está seguro de que desea eliminar la orden ${order.orderNumber}?`)) {
      const index = this.orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orders.splice(index, 1);
        this.calculateStatistics();
        this.applyFilters();
      }
    }
  }

  approveOrder(order: PurchaseOrder): void {
    if (order.status === PurchaseOrderStatus.DRAFT) {
      order.status = PurchaseOrderStatus.APPROVED;
      order.updatedAt = new Date();
      this.calculateStatistics();
      this.applyFilters();
    }
  }

  cancelOrder(order: PurchaseOrder): void {
    if (confirm(`¿Está seguro de que desea cancelar la orden ${order.orderNumber}?`)) {
      order.status = PurchaseOrderStatus.CANCELLED;
      order.updatedAt = new Date();
      this.calculateStatistics();
      this.applyFilters();
    }
  }

  resetForm(): void {
    this.orderForm.reset();
    this.editingOrder = null;
    this.showForm = false;
    this.initializeForm();
  }

  showNewOrderForm(): void {
    this.editingOrder = null;
    this.showForm = true;
    this.orderForm.reset();
    this.orderForm.patchValue({
      orderNumber: this.generateOrderNumber(),
      orderDate: this.getCurrentDate(),
      status: PurchaseOrderStatus.DRAFT,
      priority: PurchaseOrderPriority.NORMAL,
      currency: 'EUR',
      paymentTerms: PaymentTerms.NET_30,
      createdBy: 'Usuario Actual',
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'España'
      }
    });
    
    // Clear items and add one empty item
    while (this.lineItems.length !== 0) {
      this.lineItems.removeAt(0);
    }
    this.addLineItem();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingOrder = null;
    this.orderForm.reset();
  }

  onSupplierChange(): void {
    const supplierId = this.orderForm.get('supplierId')?.value;
    if (supplierId) {
      const supplier = this.suppliers.find(s => s.id === supplierId);
      if (supplier) {
        this.orderForm.patchValue({
          supplierName: supplier.name,
          paymentTerms: supplier.paymentTerms
        });
      }
    }
  }

  onProductChange(index: number): void {
    const item = this.lineItems.at(index);
    const productId = item.get('productId')?.value;
    
    if (productId) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        item.patchValue({
          productName: product.name,
          description: product.description,
          unitPrice: product.unitCost
        });
      }
    }
  }

  viewOrder(order: PurchaseOrder): void {
    // Implementation for viewing order details
    console.log('Viewing order:', order);
    // You could open a modal or navigate to a detail page
    alert(`Ver detalles de la orden ${order.orderNumber}`);
  }

  duplicateOrder(order: PurchaseOrder): void {
    const duplicatedOrder = {
      ...order,
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      status: PurchaseOrderStatus.DRAFT,
      orderDate: new Date(),
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.orders.unshift(duplicatedOrder);
    this.calculateStatistics();
    this.applyFilters();
    
    // Edit the duplicated order
    this.editOrder(duplicatedOrder);
  }

  getStatusBadgeClass(status: PurchaseOrderStatus): string {
    const statusClasses = {
      [PurchaseOrderStatus.DRAFT]: 'bg-secondary text-white',
      [PurchaseOrderStatus.PENDING]: 'bg-warning text-dark',
      [PurchaseOrderStatus.APPROVED]: 'bg-primary text-white',
      [PurchaseOrderStatus.SENT]: 'bg-info text-white',
      [PurchaseOrderStatus.CANCELLED]: 'bg-danger text-white',
      [PurchaseOrderStatus.RECEIVED]: 'bg-success text-white',
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'bg-info text-white',
      [PurchaseOrderStatus.CLOSED]: 'bg-dark text-white'
    };
    return statusClasses[status] || 'bg-secondary text-white';
  }

  getPriorityBadgeClass(priority: PurchaseOrderPriority): string {
    const priorityClasses = {
      [PurchaseOrderPriority.LOW]: 'bg-light text-dark',
      [PurchaseOrderPriority.NORMAL]: 'bg-primary text-white',
      [PurchaseOrderPriority.HIGH]: 'bg-warning text-dark',
      [PurchaseOrderPriority.URGENT]: 'bg-danger text-white'
    };
    return priorityClasses[priority] || 'bg-primary text-white';
  }

  getPriorityText(priority: PurchaseOrderPriority): string {
    const priorityTexts = {
      [PurchaseOrderPriority.LOW]: 'Baja',
      [PurchaseOrderPriority.NORMAL]: 'Normal',
      [PurchaseOrderPriority.HIGH]: 'Alta',
      [PurchaseOrderPriority.URGENT]: 'Urgente'
    };
    return priorityTexts[priority] || priority;
  }

  exportToExcel(): void {
    // Create CSV content
    const headers = ['Número', 'Proveedor', 'Fecha', 'Fecha Esperada', 'Estado', 'Prioridad', 'Total'];
    const data = this.filteredOrders.map(order => [
      order.orderNumber,
      order.supplierName,
      this.formatDate(order.orderDate),
      order.expectedDate ? this.formatDate(order.expectedDate) : '',
      this.getStatusText(order.status),
      this.getPriorityText(order.priority),
      order.totalAmount.toFixed(2)
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ordenes_compra_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getSupplierName(order.supplierId).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
      
      const matchesSupplier = !this.supplierFilter || order.supplierId === this.supplierFilter;
      
      const matchesDateFrom = !this.dateFromFilter || 
        new Date(order.orderDate) >= new Date(this.dateFromFilter);
      
      const matchesDateTo = !this.dateToFilter || 
        new Date(order.orderDate) <= new Date(this.dateToFilter);

      return matchesSearch && matchesStatus && matchesSupplier && matchesDateFrom && matchesDateTo;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.supplierFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.applyFilters();
  }

  calculateStatistics(): void {
    this.totalOrders = this.orders.length;
    this.pendingOrders = this.orders.filter(o => o.status === PurchaseOrderStatus.PENDING).length;
    this.approvedOrders = this.orders.filter(o => o.status === PurchaseOrderStatus.APPROVED).length;
    this.receivedOrders = this.orders.filter(o => o.status === PurchaseOrderStatus.RECEIVED).length;
    this.totalValue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  exportOrders(): void {
    // Implementation for exporting orders
    console.log('Exporting orders...', this.filteredOrders);
  }

  generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(this.orders.length + 1).padStart(4, '0');
    return `PO-${year}${month}-${sequence}`;
  }

  getSupplierName(supplierId: string): string {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Desconocido';
  }

  getStatusText(status: PurchaseOrderStatus): string {
    const statusTexts = {
      [PurchaseOrderStatus.DRAFT]: 'Borrador',
      [PurchaseOrderStatus.PENDING]: 'Pendiente',
      [PurchaseOrderStatus.APPROVED]: 'Aprobada',
      [PurchaseOrderStatus.SENT]: 'Enviada',
      [PurchaseOrderStatus.CANCELLED]: 'Cancelada',
      [PurchaseOrderStatus.RECEIVED]: 'Recibida',
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'Parcialmente Recibida',
      [PurchaseOrderStatus.CLOSED]: 'Cerrada'
    };
    return statusTexts[status] || status;
  }

  getStatusClass(status: PurchaseOrderStatus): string {
    const statusClasses = {
      [PurchaseOrderStatus.DRAFT]: 'secondary',
      [PurchaseOrderStatus.PENDING]: 'warning',
      [PurchaseOrderStatus.APPROVED]: 'primary',
      [PurchaseOrderStatus.SENT]: 'info',
      [PurchaseOrderStatus.CANCELLED]: 'danger',
      [PurchaseOrderStatus.RECEIVED]: 'success',
      [PurchaseOrderStatus.PARTIALLY_RECEIVED]: 'info',
      [PurchaseOrderStatus.CLOSED]: 'dark'
    };
    return statusClasses[status] || 'secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES');
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  private loadSampleData(): void {
    // Sample suppliers
    this.suppliers = [
      {
        id: '1',
        code: 'TECH001',
        name: 'TechnoSupply S.L.',
        legalName: 'TechnoSupply Sistemas S.L.',
        type: SupplierType.GOODS,
        status: SupplierStatus.ACTIVE,
        taxId: 'B12345678',
        email: 'ventas@technosupply.es',
        phone: '+34 912 345 678',
        website: 'https://technosupply.es',
        contactPerson: 'Ana García',
        contactEmail: 'ana.garcia@technosupply.es',
        contactPhone: '+34 912 345 679',
        address: {
          street: 'Calle Tecnología 123',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_30,
        creditLimit: 50000,
        currentBalance: 15000,
        rating: 5,
        categories: ['Electrónicos', 'Informática'],
        notes: 'Proveedor principal de equipos informáticos',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        code: 'OFF001',
        name: 'OfficeMax España',
        legalName: 'OfficeMax España S.A.',
        type: SupplierType.GOODS,
        status: SupplierStatus.ACTIVE,
        taxId: 'A87654321',
        email: 'pedidos@officemax.es',
        phone: '+34 913 456 789',
        website: 'https://officemax.es',
        contactPerson: 'Carlos Ruiz',
        contactEmail: 'carlos.ruiz@officemax.es',
        contactPhone: '+34 913 456 790',
        address: {
          street: 'Avenida Oficina 456',
          city: 'Barcelona',
          state: 'Cataluña',
          postalCode: '08001',
          country: 'España'
        },
        paymentTerms: PaymentTerms.NET_15,
        creditLimit: 25000,
        currentBalance: 8500,
        rating: 4,
        categories: ['Oficina', 'Papelería'],
        notes: 'Suministros de oficina y papelería',
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    // Sample products
    this.products = [
      {
        id: '1',
        code: 'LAP001',
        name: 'Portátil Dell Inspiron 15',
        description: 'Portátil Dell Inspiron 15 con procesador Intel i5',
        category: ProductCategory.ELECTRONICS,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 650.00,
        unitPrice: 850.00,
        currentStock: 25,
        minStock: 5,
        maxStock: 50,
        reorderPoint: 10,
        status: ProductStatus.ACTIVE,
        supplier: 'TechnoSupply S.L.',
        location: 'A-001',
        barcode: '1234567890123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        code: 'MON001',
        name: 'Monitor Samsung 24"',
        description: 'Monitor Samsung de 24 pulgadas Full HD',
        category: ProductCategory.ELECTRONICS,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 180.00,
        unitPrice: 250.00,
        currentStock: 15,
        minStock: 3,
        maxStock: 30,
        reorderPoint: 5,
        status: ProductStatus.ACTIVE,
        supplier: 'TechnoSupply S.L.',
        location: 'A-002',
        barcode: '1234567890124',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        code: 'PAP001',
        name: 'Papel A4 500 hojas',
        description: 'Resma de papel A4 blanco 80g/m²',
        category: ProductCategory.OTHER,
        unitOfMeasure: UnitOfMeasure.PACK,
        unitCost: 3.50,
        unitPrice: 5.00,
        currentStock: 100,
        minStock: 20,
        maxStock: 200,
        reorderPoint: 30,
        status: ProductStatus.ACTIVE,
        supplier: 'OfficeMax España',
        location: 'B-001',
        barcode: '1234567890125',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    // Sample orders
    this.orders = [
      {
        id: '1',
        orderNumber: 'PO-202401-0001',
        supplierId: '1',
        supplierName: 'TechnoSupply S.L.',
        status: PurchaseOrderStatus.APPROVED,
        priority: PurchaseOrderPriority.NORMAL,
        orderDate: new Date('2024-01-25'),
        expectedDate: new Date('2024-02-05'),
        deliveryAddress: {
          street: 'Calle Empresa 789',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28002',
          country: 'España'
        },
        items: [
          {
            id: '1',
            productId: '1',
            productCode: 'LAP001',
            productName: 'Portátil Dell Inspiron 15',
            description: 'Portátiles para el departamento de ventas',
            quantity: 3,
            unitPrice: 650.00,
            totalPrice: 1950.00,
            taxRate: 21,
            discountPercent: 5,
            receivedQuantity: 0,
            pendingQuantity: 3,
            notes: ''
          },
          {
            id: '2',
            productId: '2',
            productCode: 'MON001',
            productName: 'Monitor Samsung 24"',
            description: 'Monitores adicionales',
            quantity: 1,
            unitPrice: 180.00,
            totalPrice: 180.00,
            taxRate: 21,
            discountPercent: 0,
            receivedQuantity: 0,
            pendingQuantity: 1,
            notes: ''
          }
        ],
        subtotal: 2130.00,
        taxAmount: 447.30,
        shippingCost: 50.00,
        discountAmount: 97.50,
        totalAmount: 2529.80,
        currency: 'EUR',
        paymentTerms: PaymentTerms.NET_30,
        notes: 'Entrega urgente para nuevo empleado',
        createdBy: 'Usuario Admin',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: '2',
        orderNumber: 'PO-202401-0002',
        supplierId: '2',
        supplierName: 'OfficeMax España',
        status: PurchaseOrderStatus.PENDING,
        priority: PurchaseOrderPriority.NORMAL,
        orderDate: new Date('2024-01-28'),
        expectedDate: new Date('2024-02-02'),
        deliveryAddress: {
          street: 'Calle Empresa 789',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28002',
          country: 'España'
        },
        items: [
          {
            id: '3',
            productId: '3',
            productCode: 'PAP001',
            productName: 'Papel A4 500 hojas',
            description: 'Suministro mensual de papel',
            quantity: 100,
            unitPrice: 3.50,
            totalPrice: 350.00,
            taxRate: 21,
            discountPercent: 10,
            receivedQuantity: 0,
            pendingQuantity: 100,
            notes: ''
          }
        ],
        subtotal: 350.00,
        taxAmount: 73.50,
        shippingCost: 25.00,
        discountAmount: 35.00,
        totalAmount: 413.50,
        currency: 'EUR',
        paymentTerms: PaymentTerms.NET_15,
        notes: 'Pedido mensual recurrente',
        createdBy: 'Usuario Admin',
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28')
      }
    ];
  }
}