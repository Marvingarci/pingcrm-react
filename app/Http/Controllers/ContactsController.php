<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactStoreRequest;
use App\Http\Requests\ContactUpdateRequest;
use App\Http\Resources\ContactCollection;
use App\Http\Resources\ContactResource;
use App\Http\Resources\UserOrganizationCollection;
use App\Models\Contact;
use App\Models\Ventas;
use App\Models\User;
use App\Models\VentaDetalle;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Redirect;

class ContactsController extends Controller
{
    public function index()
    {
        return Inertia::render('Contacts/Index', [
            'filters' => Request::all('search', 'trashed'),
            'contacts' => new ContactCollection(
                Auth::user()->account->contacts()
                    ->with('organization')
                    ->orderByName()
                    ->filter(Request::only('search', 'trashed'))
                    ->paginate()
                    ->appends(Request::all())
            ),
        ]);
    }

    public function indexCredit()
    {

        //     $contactsWithCredit = Contact::with(['organization', 'ventas' => function ($query) {
        //     $query->where('tipoPago', 'credito');
        // }])->orderByName()->filter(Request::only('search', 'trashed'))->paginate()->get();
        
        $contacts = new ContactCollection(
            Contact::with(['organization', 'ventas' => function ($query) {
            $query->where('tipoPago', 'credito');
        }])->filter(Request::only('search', 'trashed'))
        ->paginate()
        ->appends(Request::all())); 
        
        $contactsWithCredit = [];
        foreach ($contacts as $c) {
            if(count($c->ventas) > 0){
                array_push($contactsWithCredit, $c);
            }
        }
        

        return Inertia::render('Contacts/IndexCredit', [
            'filters' => Request::all('search', 'trashed'),
            'contacts' => new ContactCollection(
                Contact::with(['organization', 'ventas' => function ($query) {
                $query->where('tipoPago', 'credito');
            }])->filter(Request::only('search', 'trashed'))
            ->ventasCredito()
            // ->whereHas('ventas', function($q){
            //     $q->where('id', 'in');
            // })
            ->paginate()
            ->appends(Request::all())),
        'ventasNoMayo' => Ventas::with(['organization', 'vendedor'])->where([['contact_id', null], ['tipoPago', 'credito']])->get()
        ]);
    }
    

    public function create()
    {
        return Inertia::render('Contacts/Create', [
            'organizations' => new UserOrganizationCollection(
                Auth::user()->account->organizations()
                    ->orderBy('name')
                    ->get()
            ),
        ]);
    }

    public function store(ContactStoreRequest $request)
    {
        Auth::user()->account->contacts()->create(
            $request->validated()
        );

        return Redirect::route('contacts')->with('success', 'Contact created.');
    }

    public function edit(Contact $contact)
    {
        $comprasEfectivo = Ventas::with('venta_detalles')->where([['contact_id',$contact->id],['tipoPago', 'efectivo']])->get();
        $comprasCredito = Ventas::with('venta_detalles')->where([['contact_id',$contact->id],['tipoPago', 'credito']])->get();
        $comprasPendientes = Ventas::with('venta_detalles')->where([['contact_id',$contact->id],['tipoPago', 'pendiente']])->get();
        return Inertia::render('Contacts/Edit', [
            'contact' => new ContactResource($contact),
            'organizations' => new UserOrganizationCollection(
                Auth::user()->account->organizations()
                    ->orderBy('name')
                    ->get()
            ),
            'comprasE' => $comprasEfectivo,
            'comprasC' => $comprasCredito,
            'comprasP' => $comprasPendientes,
            'usuarios'=> User::all(['id','first_name','last_name']),

        ]);
    }

    public function update(Contact $contact, ContactUpdateRequest $request)
    {
        $contact->update(
            $request->validated()
        );

        return Redirect::back()->with('success', 'Contact updated.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return Redirect::back()->with('success', 'Contact deleted.');
    }

    public function restore(Contact $contact)
    {
        $contact->restore();

        return Redirect::back()->with('success', 'Contact restored.');
    }
}
