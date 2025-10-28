import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';
import Swal from 'sweetalert2';

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
    { title: 'Inventario', value: '1,245', icon: 'fas fa-warehouse', color: 'primary' },
    { title: 'Clientes', value: '356', icon: 'fas fa-users', color: 'info' },
    { title: 'Pedidos Pendientes', value: '23', icon: 'fas fa-clock', color: 'warning' }
  ];

  recentActivities = [
    { action: 'Nueva venta registrada', time: 'Hace 5 minutos', icon: 'fas fa-shopping-cart' },
    { action: 'Producto actualizado', time: 'Hace 15 minutos', icon: 'fas fa-edit' },
    { action: 'Nuevo cliente registrado', time: 'Hace 1 hora', icon: 'fas fa-user-plus' },
    { action: 'Inventario actualizado', time: 'Hace 2 horas', icon: 'fas fa-warehouse' }
  ];

  // SweetAlert2 methods for quick actions
  showNuevaVenta() {
    Swal.fire({
      title: '¡Nueva Venta!',
      html: `
        <form id="ventaForm">
          <div class="mb-3 text-start">
            <label for="cliente" class="form-label">Cliente</label>
            <select id="cliente" class="form-select" required>
              <option value="">Selecciona un cliente</option>
              <option value="CLI001">Juan Pérez - CLI001</option>
              <option value="CLI002">María García - CLI002</option>
              <option value="CLI003">Carlos López - CLI003</option>
            </select>
          </div>
          <div class="mb-3 text-start">
            <label for="producto" class="form-label">Producto</label>
            <select id="producto" class="form-select" required>
              <option value="">Selecciona un producto</option>
              <option value="PROD001">Laptop HP - $800</option>
              <option value="PROD002">Mouse Logitech - $25</option>
              <option value="PROD003">Teclado Mecánico - $60</option>
            </select>
          </div>
          <div class="mb-3 text-start">
            <label for="cantidad" class="form-label">Cantidad</label>
            <input type="number" id="cantidad" class="form-control" min="1" value="1" required>
          </div>
          <div class="mb-3 text-start">
            <label for="descuento" class="form-label">Descuento (%)</label>
            <input type="number" id="descuento" class="form-control" min="0" max="100" value="0">
          </div>
        </form>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Registrar Venta',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const cliente = (document.getElementById('cliente') as HTMLSelectElement).value;
        const producto = (document.getElementById('producto') as HTMLSelectElement).value;
        const cantidad = (document.getElementById('cantidad') as HTMLInputElement).value;
        const descuento = (document.getElementById('descuento') as HTMLInputElement).value;

        if (!cliente || !producto || !cantidad) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        return {
          cliente: cliente,
          producto: producto,
          cantidad: parseInt(cantidad),
          descuento: parseFloat(descuento) || 0
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { cliente, producto, cantidad, descuento } = result.value;
        Swal.fire({
          title: '¡Venta Registrada!',
          html: `
            <div class="text-start">
              <p><strong>Cliente:</strong> ${cliente}</p>
              <p><strong>Producto:</strong> ${producto}</p>
              <p><strong>Cantidad:</strong> ${cantidad}</p>
              <p><strong>Descuento:</strong> ${descuento}%</p>
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  showAgregarProducto() {
    Swal.fire({
      title: '¡Agregar Producto!',
      html: `
        <form id="productoForm">
          <div class="mb-3 text-start">
            <label for="codigo" class="form-label">Código del Producto</label>
            <input type="text" id="codigo" class="form-control" placeholder="PROD001" required>
          </div>
          <div class="mb-3 text-start">
            <label for="nombre" class="form-label">Nombre del Producto</label>
            <input type="text" id="nombre" class="form-control" placeholder="Nombre del producto" required>
          </div>
          <div class="mb-3 text-start">
            <label for="categoria" class="form-label">Categoría</label>
            <select id="categoria" class="form-select" required>
              <option value="">Selecciona una categoría</option>
              <option value="ELECTRONICS">Electrónicos</option>
              <option value="CLOTHING">Ropa</option>
              <option value="BOOKS">Libros</option>
              <option value="HOME">Hogar</option>
            </select>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="precio" class="form-label">Precio</label>
              <input type="number" id="precio" class="form-control" step="0.01" min="0" required>
            </div>
            <div class="col-6">
              <label for="stock" class="form-label">Stock Inicial</label>
              <input type="number" id="stock" class="form-control" min="0" value="0" required>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="descripcion" class="form-label">Descripción</label>
            <textarea id="descripcion" class="form-control" rows="2" placeholder="Descripción del producto"></textarea>
          </div>
        </form>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Guardar Producto',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const codigo = (document.getElementById('codigo') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const categoria = (document.getElementById('categoria') as HTMLSelectElement).value;
        const precio = (document.getElementById('precio') as HTMLInputElement).value;
        const stock = (document.getElementById('stock') as HTMLInputElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;

        if (!codigo || !nombre || !categoria || !precio) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        return {
          codigo: codigo,
          nombre: nombre,
          categoria: categoria,
          precio: parseFloat(precio),
          stock: parseInt(stock) || 0,
          descripcion: descripcion
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { codigo, nombre, categoria, precio, stock, descripcion } = result.value;
        Swal.fire({
          title: '¡Producto Creado!',
          html: `
            <div class="text-start">
              <p><strong>Código:</strong> ${codigo}</p>
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Categoría:</strong> ${categoria}</p>
              <p><strong>Precio:</strong> $${precio}</p>
              <p><strong>Stock:</strong> ${stock} unidades</p>
              ${descripcion ? `<p><strong>Descripción:</strong> ${descripcion}</p>` : ''}
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  showNuevoCliente() {
    Swal.fire({
      title: '¡Nuevo Cliente!',
      html: `
        <form id="clienteForm">
          <div class="mb-3 text-start">
            <label for="nombreCliente" class="form-label">Nombre Completo</label>
            <input type="text" id="nombreCliente" class="form-control" placeholder="Nombre del cliente" required>
          </div>
          <div class="mb-3 text-start">
            <label for="emailCliente" class="form-label">Email</label>
            <input type="email" id="emailCliente" class="form-control" placeholder="email@ejemplo.com" required>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="telefonoCliente" class="form-label">Teléfono</label>
              <input type="tel" id="telefonoCliente" class="form-control" placeholder="+34 123 456 789">
            </div>
            <div class="col-6">
              <label for="tipoCliente" class="form-label">Tipo de Cliente</label>
              <select id="tipoCliente" class="form-select" required>
                <option value="">Selecciona tipo</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="direccionCliente" class="form-label">Dirección</label>
            <textarea id="direccionCliente" class="form-control" rows="2" placeholder="Dirección completa"></textarea>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="ciudadCliente" class="form-label">Ciudad</label>
              <input type="text" id="ciudadCliente" class="form-control" placeholder="Madrid">
            </div>
            <div class="col-6">
              <label for="codigoPostal" class="form-label">Código Postal</label>
              <input type="text" id="codigoPostal" class="form-control" placeholder="28001">
            </div>
          </div>
        </form>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0dcaf0',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Crear Cliente',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const nombre = (document.getElementById('nombreCliente') as HTMLInputElement).value;
        const email = (document.getElementById('emailCliente') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefonoCliente') as HTMLInputElement).value;
        const tipo = (document.getElementById('tipoCliente') as HTMLSelectElement).value;
        const direccion = (document.getElementById('direccionCliente') as HTMLTextAreaElement).value;
        const ciudad = (document.getElementById('ciudadCliente') as HTMLInputElement).value;
        const codigoPostal = (document.getElementById('codigoPostal') as HTMLInputElement).value;

        if (!nombre || !email || !tipo) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingresa un email válido');
          return false;
        }

        return {
          nombre: nombre,
          email: email,
          telefono: telefono,
          tipo: tipo,
          direccion: direccion,
          ciudad: ciudad,
          codigoPostal: codigoPostal
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { nombre, email, telefono, tipo, direccion, ciudad, codigoPostal } = result.value;
        Swal.fire({
          title: '¡Cliente Creado!',
          html: `
            <div class="text-start">
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Tipo:</strong> ${tipo}</p>
              ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
              ${direccion ? `<p><strong>Dirección:</strong> ${direccion}</p>` : ''}
              ${ciudad ? `<p><strong>Ciudad:</strong> ${ciudad}</p>` : ''}
              ${codigoPostal ? `<p><strong>CP:</strong> ${codigoPostal}</p>` : ''}
            </div>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  showGenerarReporte() {
    Swal.fire({
      title: '¡Generar Reporte!',
      html: `
        <form id="reporteForm">
          <div class="mb-3 text-start">
            <label for="tipoReporte" class="form-label">Tipo de Reporte</label>
            <select id="tipoReporte" class="form-select" required>
              <option value="">Selecciona un tipo</option>
              <option value="ventas">Reporte de Ventas</option>
              <option value="inventario">Reporte de Inventario</option>
              <option value="clientes">Reporte de Clientes</option>
              <option value="financiero">Reporte Financiero</option>
            </select>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label for="fechaInicio" class="form-label">Fecha Inicio</label>
              <input type="date" id="fechaInicio" class="form-control" required>
            </div>
            <div class="col-6">
              <label for="fechaFin" class="form-label">Fecha Fin</label>
              <input type="date" id="fechaFin" class="form-control" required>
            </div>
          </div>
          <div class="mb-3 text-start">
            <label for="formato" class="form-label">Formato de Salida</label>
            <select id="formato" class="form-select" required>
              <option value="">Selecciona formato</option>
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div class="mb-3 text-start">
            <label for="filtros" class="form-label">Filtros Adicionales (Opcional)</label>
            <textarea id="filtros" class="form-control" rows="2" placeholder="Especifica filtros adicionales si es necesario"></textarea>
          </div>
        </form>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Generar Reporte',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title'
      },
      preConfirm: () => {
        const tipoReporte = (document.getElementById('tipoReporte') as HTMLSelectElement).value;
        const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement).value;
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;
        const formato = (document.getElementById('formato') as HTMLSelectElement).value;
        const filtros = (document.getElementById('filtros') as HTMLTextAreaElement).value;

        if (!tipoReporte || !fechaInicio || !fechaFin || !formato) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
          return false;
        }

        // Validar que la fecha de fin sea posterior a la fecha de inicio
        if (new Date(fechaFin) < new Date(fechaInicio)) {
          Swal.showValidationMessage('La fecha de fin debe ser posterior a la fecha de inicio');
          return false;
        }

        return {
          tipoReporte: tipoReporte,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          formato: formato,
          filtros: filtros
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { tipoReporte, fechaInicio, fechaFin, formato, filtros } = result.value;
        
        // Mostrar loading
        Swal.fire({
          title: 'Generando Reporte...',
          text: 'Por favor espera mientras procesamos tu solicitud',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });

        // Simular procesamiento del reporte
        setTimeout(() => {
          Swal.fire({
            title: '¡Reporte Generado!',
            html: `
              <div class="text-start">
                <p><strong>Tipo:</strong> ${tipoReporte}</p>
                <p><strong>Período:</strong> ${fechaInicio} al ${fechaFin}</p>
                <p><strong>Formato:</strong> ${formato}</p>
                ${filtros ? `<p><strong>Filtros:</strong> ${filtros}</p>` : ''}
                <hr>
                <p class="text-success"><i class="fas fa-download me-2"></i>El reporte está listo para descargar</p>
              </div>
            `,
            icon: 'success',
            confirmButtonText: 'Descargar',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          }).then((downloadResult) => {
            if (downloadResult.isConfirmed) {
              Swal.fire('¡Descargando!', 'El archivo se descargará en breve...', 'success');
            }
          });
        }, 2000);
      }
    });
  }
}