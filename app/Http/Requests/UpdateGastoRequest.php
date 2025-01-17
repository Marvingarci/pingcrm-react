<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGastoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'vendedor_id'  => ['required'],
            'organization_id' => ['required'],
            'title' => ['required'],
            'description' => ['required'],
            'total' => ['required', 'numeric'],
            'invoice' => [''],
            'evidence' => ['']
        ];
    }
}
