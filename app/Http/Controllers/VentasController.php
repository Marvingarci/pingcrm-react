<?php

namespace App\Http\Controllers;

use App\Models\Ventas;
use App\Models\VentaDetalle;
use Illuminate\Http\Request as HttpRequest;
use App\Http\Requests\VentaStoreRequest;
use App\Http\Requests\VentaUpdateRequest;
use App\Http\Resources\VentaCollection;
use App\Http\Resources\ProductResource;
use Inertia\Inertia;
use App\Models\Organization;
use App\Models\Category;
use App\Models\Inventario;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VentasController extends Controller
{
   
   public function index()
    {
        return Inertia::render('Sells/Index', [
            'filters' => Request::all('search', 'trashed'),
            'usuarios'=> User::all(['id','first_name','last_name']),
            'ventas_dia' => new VentaCollection(
                Ventas::
                    orderBy('created_at')
                    ->filter(Request::only('search', 'trashed'))
                    ->paginate()
                    ->appends(Request::all())
            ),
        ]);
    }

  

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return Inertia::render('Sells/Create', [
            'filters' => Request::all('search', 'trashed'),
            'categorias' => Category::all(),
            'usuarios'=> User::all(['id','first_name','last_name']),
            'producto'=> Inventario::where('codebar',Request::only('search', 'trashed'))->with('product')->first(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(VentaStoreRequest $request)
    {
        $hoy = Carbon::now();
        $productos = Product::all();
        $registro = Ventas::create($request->validated());
      
         
        $ventas = $request->ventas;
        foreach ($ventas as $venta) {
            if($venta['category_id'] == 2){
                $venta['garantia'] = '60 dias';
                $hoyEn60 = $hoy->add(60, 'day');
                $venta['fin_garantia'] = $hoyEn60;
            }else if($venta['category_id'] == 1){
                $venta['garantia'] = '30 dias';
                $hoyEn30 = $hoy->add(30, 'day');
                $venta['fin_garantia'] = $hoyEn30;
            }else if($venta['category_id'] == 3){
                $venta['garantia'] = 'No aplica';
                $venta['fin_garantia'] = $hoy;
            }

            $ven = VentaDetalle::create([
                'ventas_id'=>$registro->id, 
                'product_id' => $venta['id'], 
                'product_code' => $venta['codebar'],
                'category_id' => $venta['category_id'], 
                'producto'=> $venta['name'], 
                'cantidad'=>$venta['cantidad'], 
                'precio'=> $venta['sell_price'], 
                'descuento'=>$venta['descuento'], 
                'total_producto'=>$venta['total_producto'], 
                'estado' => $request->tipoPago,
                'garantia' => $venta['garantia'],
                'fin_garantia' => $venta['fin_garantia']

            ]);

            if($request->tipoPago == 'efectivo' || $request->tipoPago == 'credito'){
                $inventario = Inventario::where('codebar', $venta['codebar'])->update(['status' => 'vendido']);
            }else {
                $inventario = Inventario::where('codebar', $venta['codebar'])->update(['status' => 'pendiente']);
            }

            // foreach ($productos as $producto) {
            //     if($venta['id'] == $producto->id){
            //         $producto->existencia = $producto->existencia - $venta['cantidad'];
            //         $producto->update();
            //     }
            // }
        }
        if($request->tipoPago == 'pendiente'){
            return Redirect::back()->with('success', 'Venta rapida agregada.');

        }else{
            return Redirect::route('ventas.edit', $registro->id)->with('success', 'Venta agregada.');
        }
    }

 

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {

        
        return Inertia::render('Sells/Edit', [
            'venta' => Ventas::with('venta_detalles')->where('id',$id)->get(),
            'usuarios'=> User::all(['id','first_name','last_name']),
            'categorias'=> Category::All()
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(VentaUpdateRequest $request)
    {
        $venta = Ventas::find($request['id']);
        $venta->tipoPago = 'efectivo';
        $venta->update($request->validated());

        Inventario::where('codebar', $request->venta_detalles['product_code'])->update(['status' => 'vendido']);

        $venta_detalle = VentaDetalle::find($request->venta_detalles['id']);
        $venta_detalle->estado = 'efectivo';
        $venta_detalle->save();
        
        return Redirect::back()->with('success', 'Venta convertida a efectivo.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(HttpRequest $request)
    {   
        $venta = Ventas::find($request['id']);
        //$venta_detalle = VentaDetalle::find($request->venta_detalles['id']);
        
        Inventario::where('codebar', $request->venta_detalles['product_code'])->update(['status' => 'stock']);
        // foreach ($productos as $producto) {
        //     if($producto->id == $venta_detalle['product_id']){
        //         $producto->existencia = $producto->existencia + $venta_detalle['cantidad'];
        //         $producto->update();
        //     }
        // }

        $venta->delete();
      

        return Redirect::back()->with('success', ' borrado.');
    }
}