<?php

namespace App\Services;

use App\Enums\PermissionEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class AccessControlService
{
    public function __construct(
        private readonly PermissionRegistrar $permissionRegistrar,
        private readonly ActivityLogger $activityLogger,
    ) {}

    public function permissionCatalog(): array
    {
        return array_map(
            static fn (PermissionEnum $permission): array => $permission->toArray(),
            PermissionEnum::cases(),
        );
    }

    public function roles(): array
    {
        return Role::query()
            ->with('permissions')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions
                    ->map(fn ($permission) => PermissionEnum::tryFrom($permission->name)?->toArray())
                    ->filter()
                    ->values(),
            ])
            ->all();
    }

    public function rolePermissions(Role $role): array
    {
        return $role->getAllPermissions()
            ->map(fn ($permission) => PermissionEnum::tryFrom($permission->name)?->toArray())
            ->filter()
            ->values()
            ->all();
    }

    public function syncRolePermissions(Role $role, array $permissionNames): array
    {
        $role->syncPermissions($permissionNames);
        $this->permissionRegistrar->forgetCachedPermissions();
        $this->activityLogger->record(
            'permissions_updated',
            'access_control',
            $role,
            ['permissions'],
            details: ['permissions' => $permissionNames],
        );

        return $this->rolePermissions($role->fresh());
    }

    public function grantRolePermission(Role $role, PermissionEnum $permission): array
    {
        $role->givePermissionTo($permission->value);
        $this->permissionRegistrar->forgetCachedPermissions();
        $this->activityLogger->record(
            'permission_granted',
            'access_control',
            $role,
            ['permissions'],
            details: ['permission' => $permission->value],
        );

        return $this->rolePermissions($role->fresh());
    }

    public function revokeRolePermission(Role $role, PermissionEnum $permission): array
    {
        $role->revokePermissionTo($permission->value);
        $this->permissionRegistrar->forgetCachedPermissions();
        $this->activityLogger->record(
            'permission_revoked',
            'access_control',
            $role,
            ['permissions'],
            details: ['permission' => $permission->value],
        );

        return $this->rolePermissions($role->fresh());
    }

    public function userPermissions(User $user): array
    {
        return $user->getDirectPermissions()
            ->map(fn ($permission) => PermissionEnum::tryFrom($permission->name)?->toArray())
            ->filter()
            ->values()
            ->all();
    }

    public function syncUserPermissions(User $user, array $permissionNames): array
    {
        DB::transaction(function () use ($user, $permissionNames): void {
            $user->syncPermissions($permissionNames);
            $this->permissionRegistrar->forgetCachedPermissions();
        });
        $this->activityLogger->record(
            'permissions_updated',
            'access_control',
            $user,
            ['permissions'],
            details: ['permissions' => $permissionNames],
        );

        return $this->userPermissions($user->fresh());
    }

    public function grantUserPermission(User $user, PermissionEnum $permission): array
    {
        $user->givePermissionTo($permission->value);
        $this->permissionRegistrar->forgetCachedPermissions();
        $this->activityLogger->record(
            'permission_granted',
            'access_control',
            $user,
            ['permissions'],
            details: ['permission' => $permission->value],
        );

        return $this->userPermissions($user->fresh());
    }

    public function revokeUserPermission(User $user, PermissionEnum $permission): array
    {
        $user->revokePermissionTo($permission->value);
        $this->permissionRegistrar->forgetCachedPermissions();
        $this->activityLogger->record(
            'permission_revoked',
            'access_control',
            $user,
            ['permissions'],
            details: ['permission' => $permission->value],
        );

        return $this->userPermissions($user->fresh());
    }
}
