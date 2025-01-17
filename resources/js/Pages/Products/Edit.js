import React from 'react';
import Helmet from 'react-helmet';
import { Inertia } from '@inertiajs/inertia';
import { InertiaLink, usePage, useForm } from '@inertiajs/inertia-react';
import Layout from '@/Shared/Layout';
import DeleteButton from '@/Shared/DeleteButton';
import LoadingButton from '@/Shared/LoadingButton';
import TextInput from '@/Shared/TextInput';
import SelectInput from '@/Shared/SelectInput';
import TrashedMessage from '@/Shared/TrashedMessage';
import Icon from '@/Shared/Icon';

const colores = [
  'Indefinido',
  'verde',
  'azul',
  'naranja',
  'negro',
  'blanco',
  'morado',
  'amarillo',
  'rojo',
  'gris'
];
const Edit = () => {
  const { product, categorias, auth } = usePage().props;
  const { data, setData, errors, post, processing } = useForm({
    id: product.id || '',
    name: product.name || '',
    // product_code: product.product_code || '',
    dbType: product.dbType || '',
    cost_price: product.cost_price || 0,
    sell_price: product.sell_price || '',
    whole_sell_price: product.whole_sell_price || '',
    color: product.color || '',
    category_id: product.category.id || '',
    created_at: product.created_at || '',
    // NOTE: When working with Laravel PUT/PATCH requests and FormData
    // you SHOULD send POST request and fake the PUT request like this.
    _method: 'PUT'
  });

  console.log(auth.user.owner);

  function handleSubmit(e) {
    e.preventDefault();
    // NOTE: We are using POST method here, not PUT/PACH. See comment above.
    post(route('products.update', product.id));
  }

  function destroy() {
    if (confirm('¿Está seguro que desea borrar este producto?')) {
      Inertia.delete(route('products.destroy', data.id));
    }
  }

  function restore() {
    if (confirm('Are you sure you want to restore this organization?')) {
      Inertia.put(route('product.restore', product.id));
    }
  }

  return (
    <div>
      <Helmet title={data.name} />
      <h1 className="mb-8 text-3xl font-bold">
        <InertiaLink
          href={route('products')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Productos
        </InertiaLink>
        <span className="mx-2 font-medium text-indigo-600">/</span>
        {data.name}
      </h1>
      {product.deleted_at && (
        <TrashedMessage onRestore={restore}>
          Este producto ha sido borrado
        </TrashedMessage>
      )}
      <div className=" overflow-hidden bg-white rounded shadow">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap p-8 -mb-8 -mr-6">
            <TextInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Nombre"
              name="name"
              disabled={!auth.user.owner}
              errors={errors.name}
              value={data.name}
              onChange={e => setData('name', e.target.value)}
            />
            {/* <TextInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Código del Producto"
              name="email"
              type="text"
              errors={errors.product_code}
              value={data.product_code}
              onChange={e => setData('product_code', e.target.value)}
            /> */}
            <SelectInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Tipo de producto"
              name="Categoria"
              disabled={!auth.user.owner}
              errors={errors.dbType}
              value={data.dbType}
              onChange={e => setData('dbType', e.target.value)}
            >
              <option value="individual">Individual</option>
              <option value="colectivo">Colectivo</option>
              {/* {
                colores.map(color=>{
                  return(<option value={color}>{color}</option>)
                })
              }               */}
            </SelectInput>

            {auth.user.owner == true && (
              <TextInput
                className="w-full pb-8 pr-6 lg:w-1/2"
                label="Precio de costo"
                name="city"
                type="number"
                errors={errors.cost_price}
                value={data.cost_price}
                onChange={e => setData('cost_price', e.target.value)}
              />
            )}

            <TextInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Precio de venta"
              name="region"
              type="number"
              disabled={!auth.user.owner}
              errors={errors.sell_price}
              value={data.sell_price}
              onChange={e => setData('sell_price', e.target.value)}
            />

            <TextInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Precio de Mayorista"
              name="region"
              type="number"
              disabled={!auth.user.owner}
              errors={errors.whole_sell_price}
              value={data.whole_sell_price}
              onChange={e => setData('whole_sell_price', e.target.value)}
            />

            <SelectInput
              className="w-full pb-8 pr-6 lg:w-1/2"
              label="Categoría"
              name="country"
              disabled={!auth.user.owner}
              errors={errors.category_id}
              value={data.category_id}
              onChange={e => setData('category_id', e.target.value)}
            >
              <option value=""></option>
              {categorias.map(categoria => {
                return <option value={categoria.id}>{categoria.name}</option>;
              })}
            </SelectInput>
          </div>
          <div className="flex items-center px-8 py-4 bg-gray-100 border-t border-gray-200">
            {(!product.deleted_at && auth.user.owner == true) && (
              <DeleteButton onDelete={destroy}>Borrar Producto</DeleteButton>
            )}

            <InertiaLink
              href={route('inventario.edit', data.id)}
              className="flex items-center pl-5 px-6 py-2 border-2 bg-green-500 text-white rounded-xl focus:text-blue-700 focus:outline-none"
            >
              Administrar Inventarios
            </InertiaLink>
            {auth.user.owner == true && (

            <LoadingButton
              loading={processing}
              type="submit"
              className="ml-auto btn-indigo"
            >
              Editar Producto
            </LoadingButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

Edit.layout = page => <Layout children={page} />;

export default Edit;
