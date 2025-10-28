import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Product, StockMovement, MovementType, MovementReason, ProductCategory, UnitOfMeasure } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  products: Product[] = [];
  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  
  movementForm: FormGroup;
  showForm = false;
  
  // Expose enums to template
  MovementType = MovementType;
  MovementReason = MovementReason;
  
  // Filters
  searchTerm = '';
  movementTypeFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  productFilter = '';
  
  // Stats
  totalMovements = 0;
  entriesValue = 0;
  exitsValue = 0;
  netValue = 0;

  constructor(private fb: FormBuilder) {
    this.movementForm = this.fb.group({
      productId: ['', Validators.required],
      movementType: ['', Validators.required],
      reason: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      unitCost: [0, [Validators.required, Validators.min(0)]],
      reference: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadMovements();
    this.calculateStats();
  }

  loadProducts() {
    // Sample products (in real app, this would come from a service)
    this.products = [
      {
        id: '1',
        code: 'PROD001',
        name: 'Laptop HP Pavilion',
        description: 'Laptop HP Pavilion 15.6" Intel Core i5',
        category: ProductCategory.ELECTRONICS,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 800,
        unitPrice: 1200,
        currentStock: 5,
        minStock: 3,
        maxStock: 20,
        reorderPoint: 5,
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        code: 'PROD002',
        name: 'Camiseta Polo',
        description: 'Camiseta Polo 100% algodón',
        category: ProductCategory.CLOTHING,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 15,
        unitPrice: 35,
        currentStock: 2,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 15,
        status: 'ACTIVE' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  loadMovements() {
    // Sample movements
    this.movements = [
      {
        id: '1',
        productId: '1',
        productCode: 'PROD001',
        productName: 'Laptop HP Pavilion',
        movementType: MovementType.ENTRY,
        reason: MovementReason.PURCHASE,
        quantity: 10,
        unitCost: 800,
        totalCost: 8000,
        previousStock: 0,
        newStock: 10,
        reference: 'PO-2024-001',
        notes: 'Compra inicial de inventario',
        userId: '1',
        userName: 'Admin',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        productId: '1',
        productCode: 'PROD001',
        productName: 'Laptop HP Pavilion',
        movementType: MovementType.EXIT,
        reason: MovementReason.SALE,
        quantity: 3,
        unitCost: 800,
        totalCost: 2400,
        previousStock: 10,
        newStock: 7,
        reference: 'INV-2024-001',
        notes: 'Venta a cliente corporativo',
        userId: '1',
        userName: 'Admin',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        productId: '1',
        productCode: 'PROD001',
        productName: 'Laptop HP Pavilion',
        movementType: MovementType.EXIT,
        reason: MovementReason.SALE,
        quantity: 2,
        unitCost: 800,
        totalCost: 1600,
        previousStock: 7,
        newStock: 5,
        reference: 'INV-2024-005',
        notes: 'Venta directa',
        userId: '1',
        userName: 'Admin',
        createdAt: new Date('2024-02-01')
      },
      {
        id: '4',
        productId: '2',
        productCode: 'PROD002',
        productName: 'Camiseta Polo',
        movementType: MovementType.ENTRY,
        reason: MovementReason.PURCHASE,
        quantity: 50,
        unitCost: 15,
        totalCost: 750,
        previousStock: 0,
        newStock: 50,
        reference: 'PO-2024-002',
        notes: 'Compra de temporada',
        userId: '1',
        userName: 'Admin',
        createdAt: new Date('2024-01-25')
      },
      {
        id: '5',
        productId: '2',
        productCode: 'PROD002',
        productName: 'Camiseta Polo',
        movementType: MovementType.EXIT,
        reason: MovementReason.SALE,
        quantity: 48,
        unitCost: 15,
        totalCost: 720,
        previousStock: 50,
        newStock: 2,
        reference: 'Ventas Múltiples',
        notes: 'Ventas acumuladas del mes',
        userId: '1',
        userName: 'Admin',
        createdAt: new Date('2024-02-15')
      }
    ];
    
    this.filteredMovements = [...this.movements];
  }

  calculateStats() {
    this.totalMovements = this.movements.length;
    this.entriesValue = this.movements
      .filter(m => m.movementType === MovementType.ENTRY)
      .reduce((sum, m) => sum + m.totalCost, 0);
    this.exitsValue = this.movements
      .filter(m => m.movementType === MovementType.EXIT)
      .reduce((sum, m) => sum + m.totalCost, 0);
    this.netValue = this.entriesValue - this.exitsValue;
  }

  onProductChange() {
    const productId = this.movementForm.get('productId')?.value;
    if (productId) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        this.movementForm.patchValue({
          unitCost: product.unitCost
        });
      }
    }
  }

  onSubmit() {
    if (this.movementForm.valid) {
      const formData = this.movementForm.value;
      const product = this.products.find(p => p.id === formData.productId);
      
      if (!product) return;

      // Create new movement
      const newMovement: StockMovement = {
        id: Date.now().toString(),
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        movementType: formData.movementType,
        reason: formData.reason,
        quantity: formData.quantity,
        unitCost: formData.unitCost,
        totalCost: formData.quantity * formData.unitCost,
        previousStock: product.currentStock,
        newStock: formData.movementType === MovementType.ENTRY 
          ? product.currentStock + formData.quantity
          : product.currentStock - formData.quantity,
        reference: formData.reference,
        notes: formData.notes,
        userId: '1',
        userName: 'Usuario Actual',
        createdAt: new Date()
      };

      // Update product stock
      if (formData.movementType === MovementType.ENTRY) {
        product.currentStock += formData.quantity;
      } else {
        product.currentStock -= formData.quantity;
      }
      
      product.updatedAt = new Date();

      // Add movement
      this.movements.unshift(newMovement);
      
      this.resetForm();
      this.applyFilters();
      this.calculateStats();
    }
  }

  applyFilters() {
    this.filteredMovements = this.movements.filter(movement => {
      const matchesSearch = !this.searchTerm || 
        movement.productCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movement.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movement.notes?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.movementTypeFilter || 
        movement.movementType === this.movementTypeFilter;
      
      const matchesProduct = !this.productFilter || 
        movement.productId === this.productFilter;
      
      const matchesDateFrom = !this.dateFromFilter || 
        new Date(movement.createdAt) >= new Date(this.dateFromFilter);
      
      const matchesDateTo = !this.dateToFilter || 
        new Date(movement.createdAt) <= new Date(this.dateToFilter);
      
      return matchesSearch && matchesType && matchesProduct && matchesDateFrom && matchesDateTo;
    });
  }

  resetForm() {
    this.movementForm.reset();
    this.showForm = false;
  }

  getMovementTypeClass(type: MovementType): string {
    return type === MovementType.ENTRY ? 'text-success' : 'text-danger';
  }

  getMovementTypeIcon(type: MovementType): string {
    return type === MovementType.ENTRY ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  getReasonText(reason: MovementReason): string {
    const reasons = {
      [MovementReason.PURCHASE]: 'Compra',
      [MovementReason.SALE]: 'Venta',
      [MovementReason.RETURN]: 'Devolución',
      [MovementReason.DAMAGE]: 'Daño',
      [MovementReason.LOSS]: 'Pérdida',
      [MovementReason.ADJUSTMENT]: 'Ajuste',
      [MovementReason.INITIAL_STOCK]: 'Stock Inicial',
      [MovementReason.TRANSFER_IN]: 'Transferencia Entrada',
      [MovementReason.TRANSFER_OUT]: 'Transferencia Salida'
    };
    return reasons[reason] || reason;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.movementTypeFilter = '';
    this.dateFromFilter = '';
    this.dateToFilter = '';
    this.productFilter = '';
    this.applyFilters();
  }

  exportMovements() {
    // In a real app, this would generate an Excel or PDF export
    console.log('Exportando movimientos...', this.filteredMovements);
    alert('Función de exportación no implementada en el demo');
  }

  getResultingStock(): string {
    const productId = this.movementForm.get('productId')?.value;
    const movementType = this.movementForm.get('movementType')?.value;
    const quantity = this.movementForm.get('quantity')?.value || 0;
    
    if (!productId || !movementType) return '-';
    
    const product = this.products.find(p => p.id === productId);
    if (!product) return '-';
    
    const newStock = movementType === MovementType.ENTRY 
      ? product.currentStock + quantity
      : product.currentStock - quantity;
    
    return newStock.toString();
  }
}