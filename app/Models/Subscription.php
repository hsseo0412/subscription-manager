<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'price',
        'billing_cycle',
        'billing_date',
        'billing_month',
        'category',
        'color',
        'memo',
        'payment_method_id',
        'status',
        'members',
        'website',
        'trial_ends_at',
    ];

    protected $casts = [
        'price'          => 'integer',
        'billing_date'   => 'integer',
        'billing_month'  => 'integer',
        'members'        => 'integer',
        'status'         => 'string',
        'trial_ends_at'  => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
