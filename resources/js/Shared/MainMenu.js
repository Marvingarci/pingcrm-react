import React from 'react';
import MainMenuItem from '@/Shared/MainMenuItem';
import { InertiaLink, usePage } from '@inertiajs/inertia-react';

export default ({ className }) => {
  const { auth } = usePage().props;
  
  return (
    <div className={className}>
      <MainMenuItem text="Principal" link="dashboard" icon="dashboard" />
      <MainMenuItem text="Caja" link="ventas" icon="shopping-cart" />
      <MainMenuItem text="Caja Rápida" link="ventas_rapidas" icon="store-front" />
      <MainMenuItem text="Servicios" link="servicios" icon="apple" />
      <MainMenuItem text="Buscar" link="buscar-inventario" icon="book" />
      <MainMenuItem text="Productos" link="products" icon="book" />
      <MainMenuItem text="Transferir" link="transfer" icon="book" />
      <MainMenuItem text="Compañias" link="organizations" icon="office" />
      <MainMenuItem text="Clientes" link="contacts" icon="users" />
      <MainMenuItem text="Creditos" link="contacts-credit" icon="users" />
      <MainMenuItem text="Gastos" link="gastos" icon="apple" />
      <MainMenuItem text="Reporte" link="reports" icon="printer" />
      
        
      

    </div>
  );
};
