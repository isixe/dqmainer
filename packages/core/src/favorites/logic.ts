import {
  DEFAULT_GROUP_ID,
  type DomainGroup,
  type FavoriteItem,
  type LegacyFavoriteItem,
} from "../types/favorites";

export const FAVORITES_KEY = "dqmainer-favorites";
export const GROUPS_KEY = "dqmainer-groups";

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function createDefaultGroups(): DomainGroup[] {
  return [
    { id: DEFAULT_GROUP_ID, name: "全部域名", createdAt: Date.now(), order: 0 },
  ];
}

export function migrateFavoriteItem(
  item: LegacyFavoriteItem | FavoriteItem,
): FavoriteItem {
  if ("groupIds" in item) return item;
  return {
    domain: item.domain,
    groupIds: [item.groupId],
    note: item.note,
    addedAt: item.addedAt,
  };
}

export function parseFavorites(raw: string | null): FavoriteItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as (LegacyFavoriteItem | FavoriteItem)[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateFavoriteItem);
  } catch {
    return [];
  }
}

export function parseGroups(raw: string | null): DomainGroup[] {
  if (!raw) return createDefaultGroups();
  try {
    const parsed = JSON.parse(raw) as DomainGroup[];
    if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultGroups();
    return parsed;
  } catch {
    return createDefaultGroups();
  }
}

export function toggleFavoriteItem(
  favorites: FavoriteItem[],
  domain: string,
  groupId?: string,
): FavoriteItem[] {
  const existing = favorites.some((f) => f.domain === domain);
  if (existing) {
    return favorites.filter((f) => f.domain !== domain);
  }
  return [
    ...favorites,
    {
      domain,
      groupIds: groupId ? [groupId] : [],
      note: "",
      addedAt: Date.now(),
    },
  ];
}

export function addFavoriteItem(
  favorites: FavoriteItem[],
  domain: string,
  groupIds: string[] = [],
): FavoriteItem[] {
  if (favorites.some((f) => f.domain === domain)) return favorites;
  return [
    ...favorites,
    { domain, groupIds, note: "", addedAt: Date.now() },
  ];
}

export function batchAddFavoriteItems(
  favorites: FavoriteItem[],
  domains: string[],
  groupIds: string[] = [],
): FavoriteItem[] {
  const existing = new Set(favorites.map((f) => f.domain));
  const added = domains
    .filter((d) => !existing.has(d))
    .map((domain) => ({ domain, groupIds, note: "", addedAt: Date.now() }));
  return added.length === 0 ? favorites : [...favorites, ...added];
}

export function removeFavoriteItems(
  favorites: FavoriteItem[],
  domains: string[],
): FavoriteItem[] {
  const remove = new Set(domains);
  return favorites.filter((f) => !remove.has(f.domain));
}

export function addItemsToGroup(
  favorites: FavoriteItem[],
  domains: string[],
  groupId: string,
): FavoriteItem[] {
  const target = new Set(domains);
  return favorites.map((f) =>
    target.has(f.domain) && !f.groupIds.includes(groupId)
      ? { ...f, groupIds: [...f.groupIds, groupId] }
      : f,
  );
}

export function removeItemFromGroup(
  favorites: FavoriteItem[],
  domain: string,
  groupId: string,
): FavoriteItem[] {
  return favorites.map((f) =>
    f.domain === domain
      ? { ...f, groupIds: f.groupIds.filter((gid) => gid !== groupId) }
      : f,
  );
}

export function setFavoriteNote(
  favorites: FavoriteItem[],
  domain: string,
  note: string,
): FavoriteItem[] {
  return favorites.map((f) => (f.domain === domain ? { ...f, note } : f));
}

export function favoritesByGroup(
  favorites: FavoriteItem[],
  groupId: string,
): FavoriteItem[] {
  if (groupId === DEFAULT_GROUP_ID) return favorites;
  return favorites.filter((f) => f.groupIds.includes(groupId));
}

export function detachGroupFromFavorites(
  favorites: FavoriteItem[],
  groupId: string,
): FavoriteItem[] {
  return favorites.map((f) =>
    f.groupIds.includes(groupId)
      ? { ...f, groupIds: f.groupIds.filter((gid) => gid !== groupId) }
      : f,
  );
}
