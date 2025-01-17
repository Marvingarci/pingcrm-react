<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
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
            'id'=>['required'],
            'name' => ['required', 'max:50'],
            'category_id' => ['required', 'max:50'],
            'color' => ['nullable', 'max:50'],
            'cost_price' => ['nullable','numeric'],
            'dbType' => ['required'],
            'sell_price' => ['required' , 'numeric'],
            'whole_sell_price' => ['required' , 'numeric'],
        ];
    }
}
