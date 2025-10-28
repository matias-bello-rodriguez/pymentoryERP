// Enums
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED'
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  FOOD = 'FOOD',
  BOOKS = 'BOOKS',
  HOME = 'HOME',
  TOOLS = 'TOOLS',
  HEALTH = 'HEALTH',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER'
}

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export enum MovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
  ADJUSTMENT = 'ADJUSTMENT',
  INITIAL_STOCK = 'INITIAL_STOCK',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT'
}

export enum UnitOfMeasure {
  UNIT = 'UNIT',
  KG = 'KG',
  LITER = 'LITER',
  METER = 'METER',
  BOX = 'BOX',
  PACK = 'PACK'
}

// Interfaces
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ProductCategory;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  status: ProductStatus;
  supplier?: string;
  location?: string;
  barcode?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  movementType: MovementType;
  reason: MovementReason;
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  productCount: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'REORDER_POINT';
  currentStock: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  acknowledged: boolean;
  createdAt: Date;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  overstockProducts: number;
  movementsToday: number;
  averageStockRotation: number;
  topSellingProducts: Product[];
  slowMovingProducts: Product[];
  alerts: InventoryAlert[];
  generatedAt: Date;
}

export interface StockAdjustment {
  id: string;
  reference: string;
  reason: string;
  adjustments: {
    productId: string;
    productCode: string;
    productName: string;
    previousStock: number;
    newStock: number;
    difference: number;
    reason: string;
  }[];
  totalAdjustments: number;
  createdBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  approvedAt?: Date;
}