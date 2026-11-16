import { useShopStaff } from '@/features/shops/api/shops.queries';
import { useShopRole } from '@/features/shops/hooks/useShopContext';
import { useTeamMembers } from '@/features/team/api/team.queries';

export type Person = { id: string; name: string; hint?: string };

/**
 * People who can be assigned work in this shop, and a name lookup.
 * Owners/managers see the shop's staff plus the business's managers
 * (GET /shops/:id/staff and GET /team/members). Staff cannot list
 * colleagues (those routes are OWNER/MANAGER), so they get only "Me".
 */
export function usePeople(shopId: string) {
  const { user, manages } = useShopRole();
  const staff = useShopStaff(shopId);
  const team = useTeamMembers();

  const people: Person[] = [];
  const seen = new Set<string>();
  const add = (p: Person) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      people.push(p);
    }
  };

  if (user) add({ id: user.id, name: `${user.displayName} (me)` });
  if (manages) {
    for (const m of team.data ?? []) {
      if (m.role !== 'STAFF')
        add({
          id: m.id,
          name: m.displayName,
          hint: m.role === 'OWNER' ? 'Owner' : 'Manager',
        });
    }
    for (const s of staff.data ?? []) {
      add({
        id: s.id,
        name: s.displayName,
        hint: s.isSupervisor ? 'Supervisor' : 'Staff',
      });
    }
  }

  const nameOf = (id: string | null | undefined): string | null => {
    if (!id) return null;
    if (id === user?.id) return 'You';
    return people.find((p) => p.id === id)?.name ?? 'A teammate';
  };

  return { people, nameOf };
}
