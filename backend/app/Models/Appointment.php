<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by_id',
        'client_id',
        'client_name',
        'title',
        'type',
        'location',
        'video_url',
        'starts_at',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function lawyers()
    {
        return $this->belongsToMany(User::class, 'appointment_lawyer', 'appointment_id', 'lawyer_id')
            ->withTimestamps();
    }
}
