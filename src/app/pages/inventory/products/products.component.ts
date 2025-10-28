import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Product, ProductStatus, ProductCategory, UnitOfMeasure, InventoryAlert, StockMovement } from '../../../models/inventory.models';
import { NavbarComponent } from '../../../components/shared/navbar/navbar.component';

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

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showForm = true;
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      this.products = this.products.filter(p => p.id !== product.id);
      this.applyFilters();
      this.calculateStats();
      this.generateAlerts();
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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