import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { AccountsComponent } from './pages/accounting/accounts/accounts.component';
import { CashFlowComponent } from './pages/accounting/cash-flow/cash-flow.component';
import { BanksComponent } from './pages/accounting/banks/banks.component';
import { BalancesComponent } from './pages/accounting/balances/balances.component';
import { ProductsComponent } from './pages/inventory/products/products.component';
import { StockComponent } from './pages/inventory/stock/stock.component';
import { SuppliersComponent } from './pages/purchasing/suppliers/suppliers.component';
import { OrdersComponent } from './pages/purchasing/orders/orders.component';
import { ReceiptsComponent } from './pages/purchasing/receipts/receipts.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Accounting routes
  { path: 'accounting/accounts', component: AccountsComponent },
  { path: 'accounting/cash-flow', component: CashFlowComponent },
  { path: 'accounting/banks', component: BanksComponent },
  { path: 'accounting/balances', component: BalancesComponent },
  
  // Inventory routes
  { path: 'inventory', component: ProductsComponent },
  { path: 'inventory/products', component: ProductsComponent },
  { path: 'inventory/stock', component: StockComponent },
  
  // Purchasing routes
  { path: 'purchasing/suppliers', component: SuppliersComponent },
  { path: 'purchasing/orders', component: OrdersComponent },
  { path: 'purchasing/receipts', component: ReceiptsComponent },
  
  { path: '**', redirectTo: '/home' }
];
