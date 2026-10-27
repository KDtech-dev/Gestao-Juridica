<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Services\AccessControlService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccessControlController extends Controller
{
    public function __construct(private readonly AccessControlService $service) {}

    public function permissions()
    {
        return response()->json(['data' => $this->service->permissionCatalog()]);
    }

    public function roles()
    {
        return response()->json(['data' => $this->service->roles()]);
    }

    public function userPermissions(User $user)
    {
        return response()->json([
            'data' => ['permissions' => $this->service->userPermissions($user)],
        ]);
    }

    public function rolePermissions(Role $role)
    {
        return response()->json([
            'data' => ['permissions' => $this->service->rolePermissions($role)],
        ]);
    }

    public function syncRolePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['required', 'string', 'distinct', Rule::enum(PermissionEnum::class)],
        ]);

        return response()->json([
            'message' => 'Permissões do papel atualizadas com sucesso.',
            'data' => ['permissions' => $this->service->syncRolePermissions($role, $validated['permissions'])],
        ]);
    }

    public function grantRolePermission(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permission' => ['required', 'string', Rule::enum(PermissionEnum::class)],
        ]);

        return response()->json([
            'message' => 'Permissão atribuída ao papel com sucesso.',
            'data' => [
                'permissions' => $this->service->grantRolePermission(
                    $role,
                    PermissionEnum::from($validated['permission']),
                ),
            ],
        ]);
    }

    public function revokeRolePermission(Role $role, string $permission)
    {
        $permissionEnum = PermissionEnum::tryFrom($permission);
        abort_unless($permissionEnum, 404, 'Permissão não encontrada.');

        return response()->json([
            'message' => 'Permissão removida do papel com sucesso.',
            'data' => [
                'permissions' => $this->service->revokeRolePermission($role, $permissionEnum),
            ],
        ]);
    }

    public function syncUserPermissions(Request $request, User $user)
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['required', 'string', 'distinct', Rule::enum(PermissionEnum::class)],
        ]);

        return response()->json([
            'message' => 'Permissões extras atualizadas com sucesso.',
            'data' => ['permissions' => $this->service->syncUserPermissions($user, $validated['permissions'])],
        ]);
    }

    public function grantUserPermission(Request $request, User $user)
    {
        $validated = $request->validate([
            'permission' => ['required', 'string', Rule::enum(PermissionEnum::class)],
        ]);

        return response()->json([
            'message' => 'Permissão extra atribuída com sucesso.',
            'data' => [
                'permissions' => $this->service->grantUserPermission(
                    $user,
                    PermissionEnum::from($validated['permission']),
                ),
            ],
        ]);
    }

    public function revokeUserPermission(User $user, string $permission)
    {
        $permissionEnum = PermissionEnum::tryFrom($permission);
        abort_unless($permissionEnum, 404, 'Permissão não encontrada.');

        return response()->json([
            'message' => 'Permissão extra removida com sucesso.',
            'data' => [
                'permissions' => $this->service->revokeUserPermission($user, $permissionEnum),
            ],
        ]);
    }
}
