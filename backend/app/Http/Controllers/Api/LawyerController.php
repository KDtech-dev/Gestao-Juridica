<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LawyerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $query = User::query()
            ->role('advogado')
            ->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('oab_number', 'like', "%{$search}%");
            });
        }

        $lawyers = $query->get()->map(fn (User $lawyer) => [
            'id' => $lawyer->id,
            'name' => $lawyer->name,
            'email' => $lawyer->email,
            'oab_number' => $lawyer->oab_number,
        ]);

        return ResponseService::success($lawyers);
    }
}
