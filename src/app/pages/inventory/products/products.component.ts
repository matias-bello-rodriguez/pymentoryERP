import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Product, ProductStatus, ProductCategory, UnitOfMeasure, InventoryAlert, StockMovement } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  alerts: InventoryAlert[] = [];
  
  productForm: FormGroup;
  showForm = false;
  editingProduct: Product | null = null;
  
  // Expose enums to template
  ProductStatus = ProductStatus;
  ProductCategory = ProductCategory;
  UnitOfMeasure = UnitOfMeasure;
  
  // Filters
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  stockFilter = '';
  
  // Stats
  totalProducts = 0;
  totalValue = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['', Validators.required],
      unitOfMeasure: ['', Validators.required],
      unitCost: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [0, [Validators.required, Validators.min(0)]],
      reorderPoint: [0, [Validators.required, Validators.min(0)]],
      supplier: [''],
      location: [''],
      barcode: [''],
      status: [ProductStatus.ACTIVE, Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.calculateStats();
    this.generateAlerts();
  }

  loadProducts() {
    // Simulate loading products with sample data
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
        status: ProductStatus.ACTIVE,
        supplier: 'HP Distributor',
        location: 'Almacén A-01',
        barcode: '1234567890123',
        createdAt: new Date('2024-01-15'),
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
        status: ProductStatus.ACTIVE,
        supplier: 'Textiles SA',
        location: 'Almacén B-05',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date()
      },
      {
        id: '3',
        code: 'PROD003',
        name: 'Smartphone Samsung',
        description: 'Samsung Galaxy A54 128GB',
        category: ProductCategory.ELECTRONICS,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 300,
        unitPrice: 450,
        currentStock: 0,
        minStock: 5,
        maxStock: 30,
        reorderPoint: 8,
        status: ProductStatus.ACTIVE,
        supplier: 'Samsung Distributor',
        location: 'Almacén A-02',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date()
      },
      {
        id: '4',
        code: 'PROD004',
        name: 'Mesa de Oficina',
        description: 'Mesa de oficina de madera 120x60cm',
        category: ProductCategory.HOME,
        unitOfMeasure: UnitOfMeasure.UNIT,
        unitCost: 80,
        unitPrice: 150,
        currentStock: 25,
        minStock: 3,
        maxStock: 15,
        reorderPoint: 5,
        status: ProductStatus.ACTIVE,
        supplier: 'Muebles del Sur',
        location: 'Almacén C-01',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: '5',
        code: 'PROD005',
        name: 'Café Premium',
        description: 'Café molido premium 500g',
        category: ProductCategory.FOOD,
        unitOfMeasure: UnitOfMeasure.PACK,
        unitCost: 8,
        unitPrice: 15,
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        reorderPoint: 30,
        status: ProductStatus.ACTIVE,
        supplier: 'Café del Valle',
        location: 'Almacén D-03',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date()
      }
    ];
    
    this.filteredProducts = [...this.products];
  }

  calculateStats() {
    this.totalProducts = this.products.length;
    this.totalValue = this.products.reduce((sum, product) => 
      sum + (product.currentStock * product.unitCost), 0);
    this.lowStockCount = this.products.filter(p => 
      p.currentStock <= p.minStock && p.currentStock > 0).length;
    this.outOfStockCount = this.products.filter(p => 
      p.currentStock === 0).length;
  }

  generateAlerts() {
    this.alerts = [];
    
    this.products.forEach(product => {
      if (product.currentStock === 0) {
        this.alerts.push({
          id: `alert_${product.id}_out`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          alertType: 'OUT_OF_STOCK',
          currentStock: product.currentStock,
          threshold: 0,
          severity: 'CRITICAL',
          message: `Producto agotado: ${product.name}`,
          acknowledged: false,
          createdAt: new Date()
        });
      } else if (product.currentStock <= product.minStock) {
        this.alerts.push({
          id: `alert_${product.id}_low`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          alertType: 'LOW_STOCK',
          currentStock: product.currentStock,
          threshold: product.minStock,
          severity: 'HIGH',
          message: `Stock bajo: ${product.name} (${product.currentStock} unidades)`,
          acknowledged: false,
          createdAt: new Date()
        });
      } else if (product.currentStock <= product.reorderPoint) {
        this.alerts.push({
          id: `alert_${product.id}_reorder`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          alertType: 'REORDER_POINT',
          currentStock: product.currentStock,
          threshold: product.reorderPoint,
          severity: 'MEDIUM',
          message: `Punto de reorden alcanzado: ${product.name}`,
          acknowledged: false,
          createdAt: new Date()
        });
      } else if (product.currentStock >= product.maxStock) {
        this.alerts.push({
          id: `alert_${product.id}_over`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          alertType: 'OVERSTOCK',
          currentStock: product.currentStock,
          threshold: product.maxStock,
          severity: 'LOW',
          message: `Exceso de stock: ${product.name}`,
          acknowledged: false,
          createdAt: new Date()
        });
      }
    });
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.categoryFilter || 
        product.category === this.categoryFilter;
      
      const matchesStatus = !this.statusFilter || 
        product.status === this.statusFilter;
      
      const matchesStock = !this.stockFilter || 
        (this.stockFilter === 'low' && product.currentStock <= product.minStock) ||
        (this.stockFilter === 'normal' && product.currentStock > product.minStock && product.currentStock < product.maxStock) ||
        (this.stockFilter === 'high' && product.currentStock >= product.maxStock) ||
        (this.stockFilter === 'out' && product.currentStock === 0);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = this.productForm.value;
      
      if (this.editingProduct) {
        // Update existing product
        const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          this.products[index] = {
            ...this.editingProduct,
            ...formData,
            updatedAt: new Date()
          };
        }
      } else {
        // Create new product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.products.push(newProduct);
      }
      
      this.resetForm();
      this.applyFilters();
      this.calculateStats();
      this.generateAlerts();
    }
  }

  async showNewProductModal() {
    const categoryOptions = Object.values(ProductCategory).map(cat => 
      `<option value="${cat}">${this.getCategoryLabel(cat)}</option>`
    ).join('');

    const unitOptions = Object.values(UnitOfMeasure).map(unit => 
      `<option value="${unit}">${this.getUnitLabel(unit)}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Producto',
      html: `
        <div class="row g-3">
          <div class="col-md-6">
            <label for="code" class="form-label">Código</label>
            <input id="code" type="text" class="form-control" placeholder="Código del producto" required>
          </div>
          <div class="col-md-6">
            <label for="name" class="form-label">Nombre</label>
            <input id="name" type="text" class="form-control" placeholder="Nombre del producto" required>
          </div>
          <div class="col-12">
            <label for="description" class="form-label">Descripción</label>
            <textarea id="description" class="form-control" rows="2" placeholder="Descripción del producto"></textarea>
          </div>
          <div class="col-md-6">
            <label for="category" class="form-label">Categoría</label>
            <select id="category" class="form-select" required>
              <option value="">Seleccionar categoría</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="col-md-6">
            <label for="unitOfMeasure" class="form-label">Unidad de Medida</label>
            <select id="unitOfMeasure" class="form-select" required>
              <option value="">Seleccionar unidad</option>
              ${unitOptions}
            </select>
          </div>
          <div class="col-md-6">
            <label for="unitCost" class="form-label">Costo Unitario</label>
            <input id="unitCost" type="number" step="0.01" min="0" class="form-control" placeholder="0.00" required>
          </div>
          <div class="col-md-6">
            <label for="unitPrice" class="form-label">Precio Unitario</label>
            <input id="unitPrice" type="number" step="0.01" min="0" class="form-control" placeholder="0.00" required>
          </div>
          <div class="col-md-4">
            <label for="currentStock" class="form-label">Stock Inicial</label>
            <input id="currentStock" type="number" min="0" class="form-control" value="0" required>
          </div>
          <div class="col-md-4">
            <label for="minStock" class="form-label">Stock Mínimo</label>
            <input id="minStock" type="number" min="0" class="form-control" value="0" required>
          </div>
          <div class="col-md-4">
            <label for="maxStock" class="form-label">Stock Máximo</label>
            <input id="maxStock" type="number" min="0" class="form-control" value="100" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Producto',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const code = (document.getElementById('code') as HTMLInputElement).value;
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const category = (document.getElementById('category') as HTMLSelectElement).value;
        const unitOfMeasure = (document.getElementById('unitOfMeasure') as HTMLSelectElement).value;
        const unitCost = (document.getElementById('unitCost') as HTMLInputElement).value;
        const unitPrice = (document.getElementById('unitPrice') as HTMLInputElement).value;
        const currentStock = (document.getElementById('currentStock') as HTMLInputElement).value;
        const minStock = (document.getElementById('minStock') as HTMLInputElement).value;
        const maxStock = (document.getElementById('maxStock') as HTMLInputElement).value;

        if (!code || code.trim().length < 3) {
          Swal.showValidationMessage('El código debe tener al menos 3 caracteres');
          return false;
        }
        if (!name || name.trim().length < 2) {
          Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
          return false;
        }
        if (this.products.some(p => p.code === code.trim())) {
          Swal.showValidationMessage('Ya existe un producto con este código');
          return false;
        }
        if (!category) {
          Swal.showValidationMessage('Debe seleccionar una categoría');
          return false;
        }
        if (!unitOfMeasure) {
          Swal.showValidationMessage('Debe seleccionar una unidad de medida');
          return false;
        }
        if (!unitCost || parseFloat(unitCost) < 0) {
          Swal.showValidationMessage('El costo unitario debe ser mayor o igual a 0');
          return false;
        }
        if (!unitPrice || parseFloat(unitPrice) < 0) {
          Swal.showValidationMessage('El precio unitario debe ser mayor o igual a 0');
          return false;
        }
        if (!currentStock || parseFloat(currentStock) < 0) {
          Swal.showValidationMessage('El stock inicial debe ser mayor o igual a 0');
          return false;
        }
        if (!minStock || parseFloat(minStock) < 0) {
          Swal.showValidationMessage('El stock mínimo debe ser mayor o igual a 0');
          return false;
        }
        if (!maxStock || parseFloat(maxStock) < parseFloat(minStock)) {
          Swal.showValidationMessage('El stock máximo debe ser mayor al stock mínimo');
          return false;
        }

        return {
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          category,
          unitOfMeasure,
          unitCost: parseFloat(unitCost),
          unitPrice: parseFloat(unitPrice),
          currentStock: parseInt(currentStock),
          minStock: parseInt(minStock),
          maxStock: parseInt(maxStock),
          status: ProductStatus.ACTIVE
        };
      }
    });

    if (formValues) {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...formValues,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.products.push(newProduct);
      this.applyFilters();
      this.calculateStats();
      this.generateAlerts();
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Producto creado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async editProduct(product: Product) {
    const categoryOptions = Object.values(ProductCategory).map(cat => 
      `<option value="${cat}" ${product.category === cat ? 'selected' : ''}>${this.getCategoryLabel(cat)}</option>`
    ).join('');

    const unitOptions = Object.values(UnitOfMeasure).map(unit => 
      `<option value="${unit}" ${product.unitOfMeasure === unit ? 'selected' : ''}>${this.getUnitLabel(unit)}</option>`
    ).join('');

    const statusOptions = Object.values(ProductStatus).map(status => 
      `<option value="${status}" ${product.status === status ? 'selected' : ''}>${this.getStatusLabel(status)}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Editar Producto',
      html: `
        <div class="row g-3">
          <div class="col-md-6">
            <label for="code" class="form-label">Código</label>
            <input id="code" type="text" class="form-control" value="${product.code}" required>
          </div>
          <div class="col-md-6">
            <label for="name" class="form-label">Nombre</label>
            <input id="name" type="text" class="form-control" value="${product.name}" required>
          </div>
          <div class="col-12">
            <label for="description" class="form-label">Descripción</label>
            <textarea id="description" class="form-control" rows="2">${product.description || ''}</textarea>
          </div>
          <div class="col-md-6">
            <label for="category" class="form-label">Categoría</label>
            <select id="category" class="form-select" required>
              ${categoryOptions}
            </select>
          </div>
          <div class="col-md-6">
            <label for="unitOfMeasure" class="form-label">Unidad de Medida</label>
            <select id="unitOfMeasure" class="form-select" required>
              ${unitOptions}
            </select>
          </div>
          <div class="col-md-6">
            <label for="unitCost" class="form-label">Costo Unitario</label>
            <input id="unitCost" type="number" step="0.01" min="0" class="form-control" value="${product.unitCost}" required>
          </div>
          <div class="col-md-6">
            <label for="unitPrice" class="form-label">Precio Unitario</label>
            <input id="unitPrice" type="number" step="0.01" min="0" class="form-control" value="${product.unitPrice}" required>
          </div>
          <div class="col-md-4">
            <label for="currentStock" class="form-label">Stock Actual</label>
            <input id="currentStock" type="number" min="0" class="form-control" value="${product.currentStock}" required>
          </div>
          <div class="col-md-4">
            <label for="minStock" class="form-label">Stock Mínimo</label>
            <input id="minStock" type="number" min="0" class="form-control" value="${product.minStock}" required>
          </div>
          <div class="col-md-4">
            <label for="maxStock" class="form-label">Stock Máximo</label>
            <input id="maxStock" type="number" min="0" class="form-control" value="${product.maxStock}" required>
          </div>
          <div class="col-12">
            <label for="status" class="form-label">Estado</label>
            <select id="status" class="form-select" required>
              ${statusOptions}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Producto',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary me-2',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const code = (document.getElementById('code') as HTMLInputElement).value;
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const category = (document.getElementById('category') as HTMLSelectElement).value;
        const unitOfMeasure = (document.getElementById('unitOfMeasure') as HTMLSelectElement).value;
        const unitCost = (document.getElementById('unitCost') as HTMLInputElement).value;
        const unitPrice = (document.getElementById('unitPrice') as HTMLInputElement).value;
        const currentStock = (document.getElementById('currentStock') as HTMLInputElement).value;
        const minStock = (document.getElementById('minStock') as HTMLInputElement).value;
        const maxStock = (document.getElementById('maxStock') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLSelectElement).value;

        if (!code || code.trim().length < 3) {
          Swal.showValidationMessage('El código debe tener al menos 3 caracteres');
          return false;
        }
        if (!name || name.trim().length < 2) {
          Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
          return false;
        }
        if (this.products.some(p => p.code === code.trim() && p.id !== product.id)) {
          Swal.showValidationMessage('Ya existe un producto con este código');
          return false;
        }
        if (!category) {
          Swal.showValidationMessage('Debe seleccionar una categoría');
          return false;
        }
        if (!unitOfMeasure) {
          Swal.showValidationMessage('Debe seleccionar una unidad de medida');
          return false;
        }
        if (!unitCost || parseFloat(unitCost) < 0) {
          Swal.showValidationMessage('El costo unitario debe ser mayor o igual a 0');
          return false;
        }
        if (!unitPrice || parseFloat(unitPrice) < 0) {
          Swal.showValidationMessage('El precio unitario debe ser mayor o igual a 0');
          return false;
        }
        if (!currentStock || parseFloat(currentStock) < 0) {
          Swal.showValidationMessage('El stock actual debe ser mayor o igual a 0');
          return false;
        }
        if (!minStock || parseFloat(minStock) < 0) {
          Swal.showValidationMessage('El stock mínimo debe ser mayor o igual a 0');
          return false;
        }
        if (!maxStock || parseFloat(maxStock) < parseFloat(minStock)) {
          Swal.showValidationMessage('El stock máximo debe ser mayor al stock mínimo');
          return false;
        }

        return {
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          category,
          unitOfMeasure,
          unitCost: parseFloat(unitCost),
          unitPrice: parseFloat(unitPrice),
          currentStock: parseInt(currentStock),
          minStock: parseInt(minStock),
          maxStock: parseInt(maxStock),
          status
        };
      }
    });

    if (formValues) {
      const index = this.products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        this.products[index] = {
          ...product,
          ...formValues,
          updatedAt: new Date()
        };
        
        this.applyFilters();
        this.calculateStats();
        this.generateAlerts();
        
        Swal.fire({
          title: '¡Éxito!',
          text: 'Producto actualizado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  }

  async deleteProduct(product: Product) {
    const result = await Swal.fire({
      title: '¿Eliminar Producto?',
      html: `
        <div class="text-start">
          <p><strong>Código:</strong> ${product.code}</p>
          <p><strong>Nombre:</strong> ${product.name}</p>
          <p><strong>Categoría:</strong> ${this.getCategoryLabel(product.category)}</p>
          <p><strong>Stock Actual:</strong> ${product.currentStock} ${this.getUnitLabel(product.unitOfMeasure)}</p>
          <p><strong>Precio:</strong> ${this.formatCurrency(product.unitPrice)}</p>
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
      this.products = this.products.filter(p => p.id !== product.id);
      this.applyFilters();
      this.calculateStats();
      this.generateAlerts();
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El producto ha sido eliminado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  resetForm() {
    this.productForm.reset();
    this.productForm.patchValue({ status: ProductStatus.ACTIVE });
    this.editingProduct = null;
    this.showForm = false;
  }

  getStockStatusClass(product: Product): string {
    if (product.currentStock === 0) return 'text-danger';
    if (product.currentStock <= product.minStock) return 'text-warning';
    if (product.currentStock >= product.maxStock) return 'text-info';
    return 'text-success';
  }

  getStockStatusText(product: Product): string {
    if (product.currentStock === 0) return 'Agotado';
    if (product.currentStock <= product.minStock) return 'Stock Bajo';
    if (product.currentStock >= product.maxStock) return 'Exceso';
    return 'Normal';
  }

  getCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
      [ProductCategory.ELECTRONICS]: 'Electrónicos',
      [ProductCategory.CLOTHING]: 'Ropa',
      [ProductCategory.FOOD]: 'Alimentos',
      [ProductCategory.BOOKS]: 'Libros',
      [ProductCategory.HOME]: 'Hogar',
      [ProductCategory.TOOLS]: 'Herramientas',
      [ProductCategory.HEALTH]: 'Salud',
      [ProductCategory.SPORTS]: 'Deportes',
      [ProductCategory.OTHER]: 'Otros'
    };
    return labels[category] || category;
  }

  getUnitLabel(unit: UnitOfMeasure): string {
    const labels: Record<UnitOfMeasure, string> = {
      [UnitOfMeasure.UNIT]: 'Unidad',
      [UnitOfMeasure.KG]: 'Kg',
      [UnitOfMeasure.LITER]: 'Litro',
      [UnitOfMeasure.METER]: 'Metro',
      [UnitOfMeasure.BOX]: 'Caja',
      [UnitOfMeasure.PACK]: 'Paquete'
    };
    return labels[unit] || unit;
  }

  getStatusLabel(status: ProductStatus): string {
    const labels: Record<ProductStatus, string> = {
      [ProductStatus.ACTIVE]: 'Activo',
      [ProductStatus.INACTIVE]: 'Inactivo',
      [ProductStatus.DISCONTINUED]: 'Descontinuado'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  }

  getCategoryIcon(category: ProductCategory): string {
    const icons = {
      [ProductCategory.ELECTRONICS]: 'fas fa-laptop',
      [ProductCategory.CLOTHING]: 'fas fa-tshirt',
      [ProductCategory.FOOD]: 'fas fa-apple-alt',
      [ProductCategory.BOOKS]: 'fas fa-book',
      [ProductCategory.HOME]: 'fas fa-home',
      [ProductCategory.TOOLS]: 'fas fa-tools',
      [ProductCategory.HEALTH]: 'fas fa-heart',
      [ProductCategory.SPORTS]: 'fas fa-running',
      [ProductCategory.OTHER]: 'fas fa-box'
    };
    return icons[category] || 'fas fa-box';
  }

  acknowledgeAlert(alert: InventoryAlert) {
    alert.acknowledged = true;
  }

  clearFilters() {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.stockFilter = '';
    this.applyFilters();
  }
}