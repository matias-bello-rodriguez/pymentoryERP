// Enums
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PROSPECT = 'PROSPECT'
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  CORPORATE = 'CORPORATE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY'
}

export enum CustomerPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  VIP = 'VIP'
}

export enum SaleOrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

// Interfaces
export interface Customer {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  type: CustomerType;
  status: CustomerStatus;
  priority: CustomerPriority;
  taxId?: string;
  email: string;
  phone: string;
  website?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethods: PaymentMethod[];
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  registrationDate: Date;
  birthDate?: Date;
  notes?: string;
  tags: string[];
  salesRepresentative?: string;
  discountPercentage: number;
  isActive: boolean;
  preferences: {
    newsletter: boolean;
    promotions: boolean;
    language: string;
    currency: string;
  };
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: SaleOrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: SaleOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  trackingNumber?: string;
  salesRepresentative?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleOrderItem {
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
  notes?: string;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'SUPPORT' | 'SALE' | 'COMPLAINT';
  subject: string;
  description: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  contactedBy: string;
  interactionDate: Date;
  duration?: number; // in minutes
  attachments?: string[];
  createdAt: Date;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  orderIds: string[];
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  reference: string;
  notes?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  createdAt: Date;
}

export interface CustomerAnalytics {
  customerId: string;
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    orderFrequency: number; // orders per month
    loyaltyScore: number; // 1-100
    satisfactionScore?: number; // 1-5
  };
  trends: {
    monthlySpending: { month: string; amount: number }[];
    categoryPreferences: { category: string; percentage: number }[];
    paymentMethodUsage: { method: PaymentMethod; count: number }[];
  };
  segments: string[];
  lastCalculated: Date;
}