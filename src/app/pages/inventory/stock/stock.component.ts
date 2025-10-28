import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Product, StockMovement, MovementType, MovementReason, ProductCategory, UnitOfMeasure } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

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

  async showNewMovementModal() {
    const productOptions = this.products.map(product => 
      `<option value="${product.id}">${product.code} - ${product.name} (Stock: ${product.currentStock})</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Movimiento de Stock',
      html: `
        <div class="mb-3">
          <label for="productId" class="form-label">Producto</label>
          <select id="productId" class="form-select" required>
            <option value="">Seleccionar producto</option>
            ${productOptions}
          </select>
        </div>
        <div class="mb-3">
          <label for="movementType" class="form-label">Tipo de Movimiento</label>
          <select id="movementType" class="form-select" required>
            <option value="">Seleccionar tipo</option>
            <option value="ENTRY">Entrada</option>
            <option value="EXIT">Salida</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="reason" class="form-label">Razón</label>
          <select id="reason" class="form-select" required>
            <option value="">Seleccionar razón</option>
            <option value="PURCHASE">Compra</option>
            <option value="SALE">Venta</option>
            <option value="RETURN">Devolución</option>
            <option value="DAMAGE">Daño</option>
            <option value="LOSS">Pérdida</option>
            <option value="ADJUSTMENT">Ajuste</option>
            <option value="INITIAL_STOCK">Stock Inicial</option>
          </select>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label for="quantity" class="form-label">Cantidad</label>
            <input id="quantity" type="number" step="0.01" min="0.01" class="form-control" placeholder="0" required>
          </div>
          <div class="col-md-6">
            <label for="unitCost" class="form-label">Costo Unitario</label>
            <input id="unitCost" type="number" step="0.01" min="0" class="form-control" placeholder="0.00" required>
          </div>
        </div>
        <div class="mb-3 mt-3">
          <label for="reference" class="form-label">Referencia</label>
          <input id="reference" type="text" class="form-control" placeholder="Número de referencia (opcional)">
        </div>
        <div class="mb-3">
          <label for="notes" class="form-label">Notas</label>
          <textarea id="notes" class="form-control" rows="2" placeholder="Observaciones adicionales"></textarea>
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
        const productId = (document.getElementById('productId') as HTMLSelectElement).value;
        const movementType = (document.getElementById('movementType') as HTMLSelectElement).value;
        const reason = (document.getElementById('reason') as HTMLSelectElement).value;
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        const unitCost = (document.getElementById('unitCost') as HTMLInputElement).value;
        const reference = (document.getElementById('reference') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

        if (!productId) {
          Swal.showValidationMessage('Debe seleccionar un producto');
          return false;
        }
        if (!movementType) {
          Swal.showValidationMessage('Debe seleccionar un tipo de movimiento');
          return false;
        }
        if (!reason) {
          Swal.showValidationMessage('Debe seleccionar una razón');
          return false;
        }
        if (!quantity || parseFloat(quantity) <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        if (!unitCost || parseFloat(unitCost) < 0) {
          Swal.showValidationMessage('El costo unitario debe ser mayor o igual a 0');
          return false;
        }

        return {
          productId,
          movementType,
          reason,
          quantity: parseFloat(quantity),
          unitCost: parseFloat(unitCost),
          reference: reference.trim(),
          notes: notes.trim()
        };
      }
    });

    if (formValues) {
      this.createMovementFromModal(formValues);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Movimiento de stock creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  createMovementFromModal(formData: any) {
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
    
    this.applyFilters();
    this.calculateStats();
  }

  async editMovement(movement: StockMovement) {
    const productOptions = this.products.map(product => 
      `<option value="${product.id}" ${product.id === movement.productId ? 'selected' : ''}>${product.code} - ${product.name}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Editar Movimiento de Stock',
      html: `
        <div class="mb-3">
          <label for="productId" class="form-label">Producto</label>
          <select id="productId" class="form-select" required>
            ${productOptions}
          </select>
        </div>
        <div class="mb-3">
          <label for="movementType" class="form-label">Tipo de Movimiento</label>
          <select id="movementType" class="form-select" required>
            <option value="ENTRY" ${movement.movementType === MovementType.ENTRY ? 'selected' : ''}>Entrada</option>
            <option value="EXIT" ${movement.movementType === MovementType.EXIT ? 'selected' : ''}>Salida</option>
            <option value="ADJUSTMENT" ${movement.movementType === MovementType.ADJUSTMENT ? 'selected' : ''}>Ajuste</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="reason" class="form-label">Razón</label>
          <select id="reason" class="form-select" required>
            <option value="PURCHASE" ${movement.reason === MovementReason.PURCHASE ? 'selected' : ''}>Compra</option>
            <option value="SALE" ${movement.reason === MovementReason.SALE ? 'selected' : ''}>Venta</option>
            <option value="RETURN" ${movement.reason === MovementReason.RETURN ? 'selected' : ''}>Devolución</option>
            <option value="DAMAGE" ${movement.reason === MovementReason.DAMAGE ? 'selected' : ''}>Daño</option>
            <option value="LOSS" ${movement.reason === MovementReason.LOSS ? 'selected' : ''}>Pérdida</option>
            <option value="ADJUSTMENT" ${movement.reason === MovementReason.ADJUSTMENT ? 'selected' : ''}>Ajuste</option>
            <option value="INITIAL_STOCK" ${movement.reason === MovementReason.INITIAL_STOCK ? 'selected' : ''}>Stock Inicial</option>
          </select>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label for="quantity" class="form-label">Cantidad</label>
            <input id="quantity" type="number" step="0.01" min="0.01" class="form-control" value="${movement.quantity}" required>
          </div>
          <div class="col-md-6">
            <label for="unitCost" class="form-label">Costo Unitario</label>
            <input id="unitCost" type="number" step="0.01" min="0" class="form-control" value="${movement.unitCost}" required>
          </div>
        </div>
        <div class="mb-3 mt-3">
          <label for="reference" class="form-label">Referencia</label>
          <input id="reference" type="text" class="form-control" value="${movement.reference || ''}" placeholder="Número de referencia (opcional)">
        </div>
        <div class="mb-3">
          <label for="notes" class="form-label">Notas</label>
          <textarea id="notes" class="form-control" rows="2" placeholder="Observaciones adicionales">${movement.notes || ''}</textarea>
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
        const productId = (document.getElementById('productId') as HTMLSelectElement).value;
        const movementType = (document.getElementById('movementType') as HTMLSelectElement).value;
        const reason = (document.getElementById('reason') as HTMLSelectElement).value;
        const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
        const unitCost = (document.getElementById('unitCost') as HTMLInputElement).value;
        const reference = (document.getElementById('reference') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

        if (!productId) {
          Swal.showValidationMessage('Debe seleccionar un producto');
          return false;
        }
        if (!movementType) {
          Swal.showValidationMessage('Debe seleccionar un tipo de movimiento');
          return false;
        }
        if (!reason) {
          Swal.showValidationMessage('Debe seleccionar una razón');
          return false;
        }
        if (!quantity || parseFloat(quantity) <= 0) {
          Swal.showValidationMessage('La cantidad debe ser mayor a 0');
          return false;
        }
        if (!unitCost || parseFloat(unitCost) < 0) {
          Swal.showValidationMessage('El costo unitario debe ser mayor o igual a 0');
          return false;
        }

        return {
          productId,
          movementType,
          reason,
          quantity: parseFloat(quantity),
          unitCost: parseFloat(unitCost),
          reference: reference.trim(),
          notes: notes.trim()
        };
      }
    });

    if (formValues) {
      this.updateMovement(movement.id, formValues);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Movimiento actualizado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  updateMovement(id: string, formData: any) {
    const index = this.movements.findIndex(mov => mov.id === id);
    if (index !== -1) {
      const oldMovement = this.movements[index];
      const product = this.products.find(p => p.id === formData.productId);
      
      if (!product) return;

      // Revert old movement effect on stock
      if (oldMovement.movementType === MovementType.ENTRY) {
        product.currentStock -= oldMovement.quantity;
      } else {
        product.currentStock += oldMovement.quantity;
      }

      // Apply new movement effect on stock
      if (formData.movementType === MovementType.ENTRY) {
        product.currentStock += formData.quantity;
      } else {
        product.currentStock -= formData.quantity;
      }

      // Update movement
      this.movements[index] = {
        ...oldMovement,
        productId: formData.productId,
        productCode: product.code,
        productName: product.name,
        movementType: formData.movementType,
        reason: formData.reason,
        quantity: formData.quantity,
        unitCost: formData.unitCost,
        totalCost: formData.quantity * formData.unitCost,
        newStock: product.currentStock,
        reference: formData.reference,
        notes: formData.notes
      };

      product.updatedAt = new Date();
      this.applyFilters();
      this.calculateStats();
    }
  }

  async deleteMovement(id: string) {
    const movement = this.movements.find(mov => mov.id === id);
    if (!movement) return;

    const product = this.products.find(p => p.id === movement.productId);
    const productName = product ? `${product.code} - ${product.name}` : 'Producto desconocido';

    const result = await Swal.fire({
      title: '¿Eliminar Movimiento?',
      html: `
        <div class="text-start">
          <p><strong>Producto:</strong> ${productName}</p>
          <p><strong>Tipo:</strong> ${this.getMovementTypeLabel(movement.movementType)}</p>
          <p><strong>Razón:</strong> ${this.getReasonLabel(movement.reason)}</p>
          <p><strong>Cantidad:</strong> ${movement.quantity}</p>
          <p><strong>Costo:</strong> ${this.formatCurrency(movement.totalCost)}</p>
          <p><strong>Fecha:</strong> ${this.formatDate(movement.createdAt)}</p>
        </div>
        <div class="alert alert-warning mt-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Advertencia:</strong> Esta acción no se puede deshacer y afectará el stock del producto.
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
      // Revert movement effect on stock
      if (product) {
        if (movement.movementType === MovementType.ENTRY) {
          product.currentStock -= movement.quantity;
        } else {
          product.currentStock += movement.quantity;
        }
        product.updatedAt = new Date();
      }

      this.movements = this.movements.filter(mov => mov.id !== id);
      this.applyFilters();
      this.calculateStats();
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El movimiento ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  getMovementTypeLabel(type: MovementType): string {
    const labels: Record<MovementType, string> = {
      [MovementType.ENTRY]: 'Entrada',
      [MovementType.EXIT]: 'Salida',
      [MovementType.ADJUSTMENT]: 'Ajuste',
      [MovementType.TRANSFER]: 'Transferencia'
    };
    return labels[type] || type;
  }

  getReasonLabel(reason: MovementReason): string {
    const labels: Record<MovementReason, string> = {
      [MovementReason.PURCHASE]: 'Compra',
      [MovementReason.SALE]: 'Venta',
      [MovementReason.RETURN]: 'Devolución',
      [MovementReason.DAMAGE]: 'Daño',
      [MovementReason.LOSS]: 'Pérdida',
      [MovementReason.ADJUSTMENT]: 'Ajuste',
      [MovementReason.INITIAL_STOCK]: 'Stock Inicial',
      [MovementReason.TRANSFER_IN]: 'Transferencia Entrante',
      [MovementReason.TRANSFER_OUT]: 'Transferencia Saliente'
    };
    return labels[reason] || reason;
  }
}