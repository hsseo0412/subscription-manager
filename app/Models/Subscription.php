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
        'category',
        'color',
        'memo',
    ];

    protected $casts = [
        'price' => 'integer',
        'billing_date' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
