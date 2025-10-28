import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  stats = [
    { title: 'Ventas Totales', value: '$125,430', icon: 'fas fa-chart-line', color: 'success' },
    { title: 'Productos', value: '1,245', icon: 'fas fa-box', color: 'primary' },
    { title: 'Clientes', value: '356', icon: 'fas fa-users', color: 'info' },
    { title: 'Pedidos Pendientes', value: '23', icon: 'fas fa-clock', color: 'warning' }
  ];

  recentActivities = [
    { action: 'Nueva venta registrada', time: 'Hace 5 minutos', icon: 'fas fa-shopping-cart' },
    { action: 'Producto actualizado', time: 'Hace 15 minutos', icon: 'fas fa-edit' },
    { action: 'Nuevo cliente registrado', time: 'Hace 1 hora', icon: 'fas fa-user-plus' },
    { action: 'Inventario actualizado', time: 'Hace 2 horas', icon: 'fas fa-warehouse' }
  ];
}