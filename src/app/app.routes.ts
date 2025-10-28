import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { AccountsComponent } from './pages/accounting/accounts/accounts.component';
import { CashFlowComponent } from './pages/accounting/cash-flow/cash-flow.component';
import { BanksComponent } from './pages/accounting/banks/banks.component';
import { BalancesComponent } from './pages/accounting/balances/balances.component';

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
  
  { path: '**', redirectTo: '/home' }
];
