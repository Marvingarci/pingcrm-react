import React, { useState } from 'react';
import Layout from '@/Shared/Layout';
import Index from '@/Pages/Reports/Index';
import { PDFExport } from '@progress/kendo-react-pdf';
import LoadingButton from '@/Shared/LoadingButton';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import SelectInput from '@/Shared/SelectInput';
import TextInput from '@/Shared/TextInput';
import { Inertia } from '@inertiajs/inertia';

const DayliReport = () => {
  const { ventas, gastos, payments, auth, organizations } = usePage().props;
  const [fecha, setFecha] = useState(0);
  const [organization, setOrganization] = useState(auth.user.organization_id);

  var total=0;
  var totalGastos=0;
  var totalPOS = 0;
  var totalTransfer = 0;
  var totalPayments=0;

  const [readyToPrit, setReadyToPrint] = useState(true);
  const pdfExportComponentA = React.useRef(null);
  const printReport=()=>{
    setReadyToPrint(true)
      if (pdfExportComponentA.current) {
        pdfExportComponentA.current.save();
      }
  }

  const buscarPorFecha =()=>{
    Inertia.post(route('reports.diarioPorDia'), {day: fecha, organization : organization} ,{
        onSuccess: page => {
          console.log(page)
        },
        onError: error => {
          console.log(error);
        }
      }
    );
  }

  console.log(payments)

  return (
    <div>
      <LoadingButton onClick={e => printReport()} className="btn-indigo">Imprimir Reporte</LoadingButton>

      <div  className='flex'>
        <TextInput type="date"  label="Fecha" className="border-2 mx-2 rounded-lg w-2/5" onChange={e => setFecha(e.target.value)}  placeholder="Seleciones fecha" />
        <SelectInput
                className="pr-6 w-2/5 "
                label="Tienda"
                disabled={!auth.user.owner}
                value={organization}
                onChange={e => setOrganization(e.target.value)}
              >
                <option value="">Seleccciona Tienda</option>
                {
                  organizations.map(orga=>{
                    return(<option value={orga.id}>{orga.name}</option>)
                  })
                }              
        </SelectInput>
        <button onClick={e =>buscarPorFecha()} class=" w-1/5 px-4 py-2 mx-2 border-2 text-white rounded-lg bg-newGreen-100" >Buscar</button>
      </div>

      <PDFExport
          keepTogether="p"
          scale={0.45}
          paperSize="letter"
          margin="2.5cm"
          ref={pdfExportComponentA}
          fileName={`Ventas Diarias`}
        >

      <h1 className="mb-8 text-3xl font-bold">Reporte Ventas diarias</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
      <table className=" whitespace-nowrap w-full">
      <thead>
                  <tr className="font-bold text-left">
                   <th className="px-6 pt-5 pb-4 text-center">Factura</th>
                    <th className="px-6 pt-5 pb-4 text-center">Cliente</th>
                    <th className="px-6 pt-5 pb-4 text-center">Producto</th>
                    <th className="px-6 pt-5 pb-4 text-center">Tipo Venta</th>
                    <th className="px-6 pt-5 pb-4 text-center">Total Producto</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    
                  ventas.map((venta) => (
                      venta.tipoPago == 'pos' ? totalPOS += parseInt(venta.total) : null,
                      venta.tipoPago == 'transferencia' ? totalTransfer += parseInt(venta.total) : null,
                     
                        <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                           <td className="border-t justify-center text-center items-center">
                    <InertiaLink
                      href={route('ventas.edit', venta.id)}
                      className="flex items-center px-6 py-4 text-indigo-700 focus:outline-none"
                    >
                      Ver factura {venta.id}
                    </InertiaLink>
                  </td>
                        <td className="border-t justify-center text-center items-center">
                            {venta.cliente}
                        </td> 

                        <td className="border-t justify-center text-center items-center flex flex-col">
                          {
                             venta.venta_detalles.map((detalle)=>{
                              total += parseInt(detalle.total_producto) 
                              return (
                                <span>{detalle.fullName}</span>
                              )
                            })
                          }     
                        </td>
                        <td className="border-t justify-center text-center items-center">
                            {venta.tipoPago}
                        </td>
                        <td className="border-t justify-center text-center items-center">
                            {venta.total}
                        </td>
                        </tr>
                        
                    
                       
                    )
                  )}
                  <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                    <td className="border-t justify-center text-center items-center"></td>
                    <td className="border-t justify-center text-center items-center"></td>
                    <td className="border-t justify-center text-center items-center"></td>
                    <td  className="border-t justify-center text-center items-center font-bold">Total Ventas</td>
                    <td  className="border-t justify-center text-center items-center font-bold">
                      {total}
                    </td>
                  </tr>
                </tbody>
              </table>
              {
                payments.length > 0 &&
                <>
                <table className=" whitespace-nowrap w-full ">
                  <thead>
                    <tr className="font-bold text-left">
                      <th className="px-6 pt-5 pb-4 text-center">Abono</th>
                      <th className="px-6 pt-5 pb-4 text-center">Cliente</th>
                      <th className="px-6 pt-5 pb-4 text-center">Venta</th>
                      <th className="px-6 pt-5 pb-4 text-center">Tipo de Pago</th>
                      <th className="px-6 pt-5 pb-4 text-center">Monto</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                       payment.concepto == 'pos' ? totalPOS += parseInt(payment.cantidad) : null,
                       payment.concepto == 'transferencia' ? totalTransfer += parseInt(payment.cantidad) : null,
                      totalPayments += parseInt(payment.cantidad),
                      <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                        <td className="border-t justify-center text-center items-center">
                          <InertiaLink
                            href={route('ventas.edit', payment.venta.id)}
                            className="flex items-center px-6 py-4 text-indigo-700 focus:outline-none"
                          >
                            Ver Pago
                          </InertiaLink>
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {payment.venta.cliente}
                        </td>
                        <td className="border-t justify-center text-center items-center">
                        <InertiaLink
                            href={route('ventas.edit', payment.venta.id)}
                            className="flex items-center px-6 py-4 text-indigo-700 focus:outline-none"
                          >
                          Ver Venta {payment.venta.id}
                          </InertiaLink>
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {payment.concepto}
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {payment.cantidad}
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                      <td className="border-t justify-center text-center items-center"></td>
                      <td className="border-t justify-center text-center items-center"></td>
                      <td className="border-t justify-center text-center items-center"></td>
                      <td className="border-t justify-center text-center items-center font-bold">Total Abonos</td>
                      <td className="border-t justify-center text-center items-center font-bold">
                        {totalPayments}
                      </td>
                    </tr>
                  </tbody>
                </table>
              <div className="flex justify-end">
                <h1 className="font-bold text-2xl px-5 py-2">Total Ingresos: {total + totalPayments}</h1>
              </div>
              </>
              }
              {
                gastos.length > 0 &&
                <>
                <table className=" whitespace-nowrap w-full ">
                  <thead>
                    <tr className="font-bold text-left">
                      <th className="px-6 pt-5 pb-4 text-center">Gasto</th>
                      <th className="px-6 pt-5 pb-4 text-center">Titulo</th>
                      <th className="px-6 pt-5 pb-4 text-center">Colaborador</th>
                      <th className="px-6 pt-5 pb-4 text-center">Monto</th>

                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((gasto) => (
                      totalGastos += parseInt(gasto.total),
                      <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                        <td className="border-t justify-center text-center items-center">
                          <InertiaLink
                            href={route('gastos.edit', gasto.id)}
                            className="flex items-center px-6 py-4 text-indigo-700 focus:outline-none"
                          >
                            Ver Gasto
                          </InertiaLink>
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {gasto.title}
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {gasto.vendedor_name}
                        </td>
                        <td className="border-t justify-center text-center items-center">
                          {gasto.total}
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
                      <td className="border-t justify-center text-center items-center"></td>
                      <td className="border-t justify-center text-center items-center"></td>
                      <td className="border-t justify-center text-center items-center font-bold">Total Gastos</td>
                      <td className="border-t justify-center text-center items-center font-bold">
                        {totalGastos}
                      </td>
                    </tr>
                  </tbody>
                </table>
              <div className="flex justify-end">
                <h1 className="font-bold text-2xl px-5 py-2">Total Real: L {(total+totalPayments) - totalGastos}</h1>
              </div>
              <div className="flex justify-end">               
                <h1 className="font-bold text-2xl px-5 py-2">Total menos transferencias({totalTransfer}) y POS({totalPOS}): L {(total+totalPayments) - totalGastos - totalTransfer - totalPOS}</h1>
              </div>
              </>
              }
      </div>
      </PDFExport>
    </div>
  );
};

DayliReport.layout = page => <Layout >
    <Index children={page}></Index>
</Layout>;

export default DayliReport;
