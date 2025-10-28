import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { PurchaseOrder, PurchaseOrderStatus, Supplier, PurchaseOrderItem, Receipt, ReceiptStatus, ReceiptItem } from '../../../models/purchasing.models';
import { Product, ProductCategory, UnitOfMeasure, ProductStatus } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.css'
})
export class ReceiptsComponent implements OnInit {
  receipts: Receipt[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  
  receiptForm: FormGroup;
  editingReceipt: Receipt | null = null;
  showModal = false;
  
  // Filter properties
  filterText = '';
  filterStatus: ReceiptStatus | '' = '';
  filterSupplier = '';
  filterDateFrom = '';
  filterDateTo = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Enums for templates
  ReceiptStatus = ReceiptStatus;
  
  constructor(private fb: FormBuilder) {
    this.receiptForm = this.fb.group({
      id: [''],
      receiptNumber: ['', [Validators.required]],
      purchaseOrderId: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      receiptDate: ['', [Validators.required]],
      status: [ReceiptStatus.PENDING, [Validators.required]],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadInitialData();
    this.loadReceipts();
  }

  loadInitialData() {
    // Load sample data
    this.suppliers = [
      {
        id: '1',
        code: 'PROV001',
        name: 'Proveedor ABC',
        legalName: 'Proveedor ABC S.A.',
        contactPerson: 'Juan Pérez',
        contactEmail: 'juan@proveedorabc.com',
        contactPhone: '555-0101',
        email: 'contacto@proveedorabc.com',
        phone: '555-0101',
        website: 'www.proveedorabc.com',
        address: {
          street: 'Calle 123',
          city: 'Ciudad',
          state: 'Estado',
          postalCode: '12345',
          country: 'País'
        },
        taxId: '20-12345678-9',
        type: 'GOODS' as any,
        paymentTerms: 'NET_30' as any,
        status: 'ACTIVE' as any,
        creditLimit: 10000,
        currentBalance: 5000,
        rating: 4,
        categories: ['Electronics'],
        notes: 'Proveedor confiable',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'PROV002',
        name: 'Distribuidora XYZ',
        legalName: 'Distribuidora XYZ Ltda.',
        contactPerson: 'María García',
        contactEmail: 'maria@distribuidoraxyz.com',
        contactPhone: '555-0102',
        email: 'info@distribuidoraxyz.com',
        phone: '555-0102',
        address: {
          street: 'Avenida 456',
          city: 'Ciudad',
          state: 'Estado',
          postalCode: '67890',
          country: 'País'
        },
        taxId: '20-87654321-9',
        type: 'GOODS' as any,
        paymentTerms: 'NET_15' as any,
        status: 'ACTIVE' as any,
        creditLimit: 15000,
        currentBalance: 8000,
        rating: 5,
        categories: ['Tools'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.products = [
      {
        id: '1',
        code: 'PROD001',
        name: 'Producto A',
        description: 'Descripción del producto A',
        category: ProductCategory.ELECTRONICS,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 80.00,
        unitPrice: 100.00,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 15,
        status: ProductStatus.ACTIVE,
        supplier: 'Proveedor ABC',
        location: 'Almacén A',
        barcode: '1234567890123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'PROD002',
        name: 'Producto B',
        description: 'Descripción del producto B',
        category: ProductCategory.TOOLS,
        unitOfMeasure: UnitOfMeasure.KG,
        unitCost: 40.00,
        unitPrice: 50.00,
        currentStock: 100,
        minStock: 20,
        maxStock: 200,
        reorderPoint: 30,
        status: ProductStatus.ACTIVE,
        supplier: 'Distribuidora XYZ',
        location: 'Almacén B',
        barcode: '9876543210987',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.purchaseOrders = [
      {
        id: '1',
        orderNumber: 'PO-001',
        supplierId: '1',
        supplierName: 'Proveedor ABC',
        orderDate: new Date(),
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: PurchaseOrderStatus.APPROVED,
        priority: 'NORMAL' as any,
        deliveryAddress: {
          street: 'Calle Principal 123',
          city: 'Ciudad',
          state: 'Estado',
          postalCode: '12345',
          country: 'País'
        },
        subtotal: 1000,
        taxAmount: 210,
        shippingCost: 50,
        discountAmount: 0,
        totalAmount: 1260,
        currency: 'USD',
        paymentTerms: 'NET_30' as any,
        notes: 'Orden urgente',
        createdBy: 'user1',
        items: [
          {
            id: '1',
            productId: '1',
            productCode: 'PROD001',
            productName: 'Producto A',
            description: 'Descripción del producto A',
            quantity: 10,
            unitPrice: 80,
            totalPrice: 800,
            taxRate: 21,
            discountPercent: 0,
            receivedQuantity: 0,
            pendingQuantity: 10
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.receipts = [
      {
        id: '1',
        receiptNumber: 'REC-001',
        purchaseOrderId: '1',
        purchaseOrderNumber: 'PO-001',
        supplierId: '1',
        supplierName: 'Proveedor ABC',
        receiptDate: new Date(),
        deliveryDate: new Date(),
        status: ReceiptStatus.COMPLETE,
        receivedBy: 'user1',
        notes: 'Recepción completa',
        items: [
          {
            id: '1',
            purchaseOrderItemId: '1',
            productId: '1',
            productCode: 'PROD001',
            productName: 'Producto A',
            orderedQuantity: 10,
            receivedQuantity: 10,
            rejectedQuantity: 0,
            damagedQuantity: 0,
            unitPrice: 80,
            totalValue: 800,
            status: 'RECEIVED' as any
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  loadReceipts() {
    let filteredReceipts = [...this.receipts];

    // Apply filters
    if (this.filterText) {
      filteredReceipts = filteredReceipts.filter(receipt =>
        receipt.receiptNumber.toLowerCase().includes(this.filterText.toLowerCase()) ||
        receipt.supplierName.toLowerCase().includes(this.filterText.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(this.filterText.toLowerCase())
      );
    }

    if (this.filterStatus) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.status === this.filterStatus);
    }

    if (this.filterSupplier) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.supplierId === this.filterSupplier
      );
    }

    if (this.filterDateFrom) {
      const fromDate = new Date(this.filterDateFrom);
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.receiptDate >= fromDate
      );
    }

    if (this.filterDateTo) {
      const toDate = new Date(this.filterDateTo);
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.receiptDate <= toDate
      );
    }

    this.totalItems = filteredReceipts.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.receipts = filteredReceipts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get items() {
    return this.receiptForm.get('items') as FormArray;
  }

  openModal(receipt?: Receipt) {
    this.editingReceipt = receipt || null;
    
    if (receipt) {
      this.receiptForm.patchValue({
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        purchaseOrderId: receipt.purchaseOrderId,
        supplierId: receipt.supplierId,
        receiptDate: receipt.receiptDate.toISOString().split('T')[0],
        status: receipt.status,
        notes: receipt.notes
      });
      
      // Clear and populate items
      while (this.items.length !== 0) {
        this.items.removeAt(0);
      }
      
      receipt.items.forEach((item: ReceiptItem) => {
        this.items.push(this.fb.group({
          id: [item.id],
          productId: [item.productId, [Validators.required]],
          orderedQuantity: [item.orderedQuantity, [Validators.required, Validators.min(0)]],
          receivedQuantity: [item.receivedQuantity, [Validators.required, Validators.min(0)]],
          unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
          subtotal: [item.totalValue]
        }));
      });
    } else {
      this.receiptForm.reset();
      this.receiptForm.patchValue({
        status: ReceiptStatus.PENDING,
        receiptDate: new Date().toISOString().split('T')[0]
      });
      
      // Clear items
      while (this.items.length !== 0) {
        this.items.removeAt(0);
      }
    }
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingReceipt = null;
    this.receiptForm.reset();
  }

  addItem() {
    this.items.push(this.fb.group({
      id: [''],
      productId: ['', [Validators.required]],
      orderedQuantity: [0, [Validators.required, Validators.min(0)]],
      receivedQuantity: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0]
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  calculateItemSubtotal(index: number) {
    const item = this.items.at(index);
    const receivedQuantity = item.get('receivedQuantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const subtotal = receivedQuantity * unitPrice;
    item.get('subtotal')?.setValue(subtotal);
  }

  onSubmit() {
    if (this.receiptForm.valid) {
      const formValue = this.receiptForm.value;
      
      if (this.editingReceipt) {
        // Update existing receipt
        const index = this.receipts.findIndex(r => r.id === this.editingReceipt!.id);
        if (index !== -1) {
          this.receipts[index] = {
            ...this.receipts[index],
            ...formValue,
            receiptDate: new Date(formValue.receiptDate),
            updatedAt: new Date()
          };
        }
      } else {
        // Create new receipt
        const newReceipt: Receipt = {
          id: String(Math.max(...this.receipts.map(r => parseInt(r.id)), 0) + 1),
          receiptNumber: formValue.receiptNumber,
          purchaseOrderId: formValue.purchaseOrderId,
          purchaseOrderNumber: this.purchaseOrders.find(po => po.id === formValue.purchaseOrderId)?.orderNumber || '',
          supplierId: formValue.supplierId,
          supplierName: this.suppliers.find(s => s.id === formValue.supplierId)?.name || '',
          receiptDate: new Date(formValue.receiptDate),
          deliveryDate: new Date(formValue.receiptDate),
          receivedBy: 'current_user',
          status: formValue.status,
          notes: formValue.notes,
          items: formValue.items.map((item: any) => ({
            ...item,
            purchaseOrderItemId: item.id || '1',
            productCode: this.products.find(p => p.id === item.productId)?.code || '',
            productName: this.products.find(p => p.id === item.productId)?.name || '',
            rejectedQuantity: 0,
            damagedQuantity: 0,
            totalValue: item.receivedQuantity * item.unitPrice,
            status: 'RECEIVED' as any
          })),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.receipts.unshift(newReceipt);
      }
      
      this.loadReceipts();
      this.closeModal();
    }
  }

  deleteReceipt(receipt: Receipt) {
    if (confirm(`¿Está seguro que desea eliminar la recepción ${receipt.receiptNumber}?`)) {
      const index = this.receipts.findIndex(r => r.id === receipt.id);
      if (index !== -1) {
        this.receipts.splice(index, 1);
        this.loadReceipts();
      }
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadReceipts();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadReceipts();
  }

  clearFilters() {
    this.filterText = '';
    this.filterStatus = '';
    this.filterSupplier = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.currentPage = 1;
    this.loadReceipts();
  }

  getStatusBadgeClass(status: ReceiptStatus): string {
    switch (status) {
      case ReceiptStatus.PENDING:
        return 'bg-warning text-dark';
      case ReceiptStatus.PARTIAL:
        return 'bg-info text-white';
      case ReceiptStatus.COMPLETE:
        return 'bg-success text-white';
      case ReceiptStatus.CANCELLED:
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  getStatusText(status: ReceiptStatus): string {
    switch (status) {
      case ReceiptStatus.PENDING:
        return 'Pendiente';
      case ReceiptStatus.PARTIAL:
        return 'Parcial';
      case ReceiptStatus.COMPLETE:
        return 'Completado';
      case ReceiptStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  }

  getPaginationArray(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
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

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPurchaseOrderChange() {
    const purchaseOrderId = this.receiptForm.get('purchaseOrderId')?.value;
    if (purchaseOrderId) {
      const purchaseOrder = this.purchaseOrders.find(po => po.id === purchaseOrderId);
      if (purchaseOrder) {
        this.receiptForm.patchValue({
          supplierId: purchaseOrder.supplierId
        });

        // Clear and populate items from purchase order
        while (this.items.length !== 0) {
          this.items.removeAt(0);
        }
        
        purchaseOrder.items.forEach(item => {
          this.items.push(this.fb.group({
            id: [''],
            productId: [item.productId, [Validators.required]],
            orderedQuantity: [item.quantity, [Validators.required, Validators.min(0)]],
            receivedQuantity: [0, [Validators.required, Validators.min(0)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
            subtotal: [0]
          }));
        });
      }
    }
  }

  exportToCSV() {
    const headers = ['Número', 'Orden de Compra', 'Proveedor', 'Fecha', 'Estado', 'Notas'];
    const data = this.receipts.map(receipt => [
      receipt.receiptNumber,
      receipt.purchaseOrderNumber || '',
      receipt.supplierName || '',
      receipt.receiptDate.toLocaleDateString(),
      this.getStatusText(receipt.status),
      receipt.notes || ''
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recepciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}