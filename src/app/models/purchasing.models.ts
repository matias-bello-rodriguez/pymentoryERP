// Enums
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export enum SupplierType {
  GOODS = 'GOODS',
  SERVICES = 'SERVICES',
  BOTH = 'BOTH'
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_45 = 'NET_45',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90'
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED'
}

export enum PurchaseOrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE',
  CANCELLED = 'CANCELLED'
}

export enum ReceiptItemStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  DAMAGED = 'DAMAGED'
}

// Interfaces
export interface Supplier {
  id: string;
  code: string;
  name: string;
  legalName: string;
  type: SupplierType;
  status: SupplierStatus;
  taxId: string;
  email: string;
  phone: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentTerms: PaymentTerms;
  creditLimit: number;
  currentBalance: number;
  rating: number; // 1-5 stars
  notes?: string;
  categories: string[];
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  orderDate: Date;
  requiredDate?: Date;
  expectedDate?: Date;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms: PaymentTerms;
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  discountPercent: number;
  receivedQuantity: number;
  pendingQuantity: number;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  status: ReceiptStatus;
  receiptDate: Date;
  deliveryDate: Date;
  receivedBy: string;
  items: ReceiptItem[];
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productCode: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  unitPrice: number;
  totalValue: number;
  status: ReceiptItemStatus;
  lotNumber?: string;
  expirationDate?: Date;
  notes?: string;
}

export interface SupplierEvaluation {
  id: string;
  supplierId: string;
  evaluationDate: Date;
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    qualityScore: number; // 1-100
    deliveryScore: number; // 1-100
    priceScore: number; // 1-100
    serviceScore: number; // 1-100
    overallScore: number; // 1-100
  };
  orders: {
    total: number;
    onTime: number;
    late: number;
    cancelled: number;
  };
  quality: {
    acceptedItems: number;
    rejectedItems: number;
    damagedItems: number;
    returnedItems: number;
  };
  comments?: string;
  evaluatedBy: string;
  createdAt: Date;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  department: string;
  requestedBy: string;
  requestDate: Date;
  requiredDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  items: {
    productId?: string;
    description: string;
    quantity: number;
    estimatedPrice?: number;
    justification?: string;
  }[];
  totalEstimatedCost: number;
  justification: string;
  approvedBy?: string;
  approvedAt?: Date;
  convertedToPO?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierQuote {
  id: string;
  quoteNumber: string;
  supplierId: string;
  supplierName: string;
  requestDate: Date;
  responseDate?: Date;
  validUntil: Date;
  status: 'REQUESTED' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    leadTime: number; // days
    minimumQuantity?: number;
  }[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentTerms: PaymentTerms;
  deliveryTerms: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseAnalytics {
  period: {
    from: Date;
    to: Date;
  };
  orders: {
    total: number;
    totalValue: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  suppliers: {
    active: number;
    totalTransactions: number;
    averageOrderValue: number;
    topSuppliers: {
      supplierId: string;
      supplierName: string;
      orderCount: number;
      totalValue: number;
    }[];
  };
  products: {
    totalItems: number;
    mostPurchased: {
      productId: string;
      productName: string;
      quantity: number;
      value: number;
    }[];
  };
  performance: {
    averageLeadTime: number;
    onTimeDeliveryRate: number;
    qualityRate: number;
    costSavings: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    variance: number;
  };
}