"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type DomainGroup,
  type FavoriteItem,
  type LegacyFavoriteItem,
  DEFAULT_GROUP_ID,
} from "@/types/favorites";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const FAVORITES_KEY = "dqmainer-favorites";
const GROUPS_KEY = "dqmainer-groups";

function getDefaultGroups(): DomainGroup[] {
  return [{ id: DEFAULT_GROUP_ID, name: "全部域名", createdAt: Date.now(), order: 0 }];
}

function migrateFavoriteItem(item: LegacyFavoriteItem | FavoriteItem): FavoriteItem {
  if ("groupIds" in item) return item as FavoriteItem;
  return {
    domain: item.domain,
    groupIds: [(item as LegacyFavoriteItem).groupId],
    note: item.note,
    addedAt: item.addedAt,
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [groups, setGroups] = useState<DomainGroup[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const storedFav = localStorage.getItem(FAVORITES_KEY);
    if (storedFav) {
      try {
        const parsed = JSON.parse(storedFav) as (LegacyFavoriteItem | FavoriteItem)[];
        setFavorites(parsed.map(migrateFavoriteItem));
      } catch {
        setFavorites([]);
      }
    }

    const storedGroups = localStorage.getItem(GROUPS_KEY);
    if (storedGroups) {
      try {
        setGroups(JSON.parse(storedGroups));
      } catch {
        setGroups(getDefaultGroups());
        localStorage.setItem(GROUPS_KEY, JSON.stringify(getDefaultGroups()));
      }
    } else {
      setGroups(getDefaultGroups());
      localStorage.setItem(GROUPS_KEY, JSON.stringify(getDefaultGroups()));
    }

    setLoaded(true);
  }, []);

  const persistFavorites = useCallback((items: FavoriteItem[]) => {
    setFavorites(items);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  }, []);

  const persistGroups = useCallback((items: DomainGroup[]) => {
    setGroups(items);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(items));
  }, []);

  const isFavorited = useCallback(
    (domain: string) => favorites.some((f) => f.domain === domain),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (domain: string, groupId?: string) => {
      const existing = favorites.find((f) => f.domain === domain);
      if (existing) {
        persistFavorites(favorites.filter((f) => f.domain !== domain));
      } else {
        const item: FavoriteItem = {
          domain,
          groupIds: groupId ? [groupId] : [],
          note: "",
          addedAt: Date.now(),
        };
        persistFavorites([...favorites, item]);
      }
    },
    [favorites, persistFavorites],
  );

  const addFavorite = useCallback(
    (domain: string, groupIds?: string[]) => {
      if (favorites.some((f) => f.domain === domain)) return;
      const item: FavoriteItem = {
        domain,
        groupIds: groupIds ?? [],
        note: "",
        addedAt: Date.now(),
      };
      persistFavorites([...favorites, item]);
    },
    [favorites, persistFavorites],
  );

  const removeFavorite = useCallback(
    (domain: string) => {
      persistFavorites(favorites.filter((f) => f.domain !== domain));
    },
    [favorites, persistFavorites],
  );

  const batchAddFavorites = useCallback(
    (domains: string[], groupIds?: string[]) => {
      const existingSet = new Set(favorites.map((f) => f.domain));
      const newItems: FavoriteItem[] = domains
        .filter((d) => !existingSet.has(d))
        .map((d) => ({
          domain: d,
          groupIds: groupIds ?? [],
          note: "",
          addedAt: Date.now(),
        }));
      if (newItems.length === 0) return;
      persistFavorites([...favorites, ...newItems]);
    },
    [favorites, persistFavorites],
  );

  const removeBatchFavorites = useCallback(
    (domains: string[]) => {
      const removeSet = new Set(domains);
      persistFavorites(favorites.filter((f) => !removeSet.has(f.domain)));
    },
    [favorites, persistFavorites],
  );

  const addToGroup = useCallback(
    (domain: string, groupId: string) => {
      persistFavorites(
        favorites.map((f) =>
          f.domain === domain && !f.groupIds.includes(groupId)
            ? { ...f, groupIds: [...f.groupIds, groupId] }
            : f,
        ),
      );
    },
    [favorites, persistFavorites],
  );

  const removeFromGroup = useCallback(
    (domain: string, groupId: string) => {
      persistFavorites(
        favorites.map((f) =>
          f.domain === domain
            ? { ...f, groupIds: f.groupIds.filter((gid) => gid !== groupId) }
            : f,
        ),
      );
    },
    [favorites, persistFavorites],
  );

  const batchAddToGroup = useCallback(
    (domains: string[], groupId: string) => {
      persistFavorites(
        favorites.map((f) =>
          domains.includes(f.domain) && !f.groupIds.includes(groupId)
            ? { ...f, groupIds: [...f.groupIds, groupId] }
            : f,
        ),
      );
    },
    [favorites, persistFavorites],
  );

  const updateNote = useCallback(
    (domain: string, note: string) => {
      persistFavorites(
        favorites.map((f) => (f.domain === domain ? { ...f, note } : f)),
      );
    },
    [favorites, persistFavorites],
  );

  const getFavoritesByGroup = useCallback(
    (groupId: string) => {
      if (groupId === DEFAULT_GROUP_ID) return favorites;
      return favorites.filter((f) => f.groupIds.includes(groupId));
    },
    [favorites],
  );

  const getGroupName = useCallback(
    (groupId: string) => {
      if (groupId === DEFAULT_GROUP_ID) return "全部域名";
      const group = groups.find((g) => g.id === groupId);
      return group?.name ?? "未分组";
    },
    [groups],
  );

  const createGroup = useCallback(
    (name: string) => {
      const newGroup: DomainGroup = {
        id: generateId(),
        name,
        createdAt: Date.now(),
        order: groups.length,
      };
      persistGroups([...groups, newGroup]);
      return newGroup;
    },
    [groups, persistGroups],
  );

  const renameGroup = useCallback(
    (id: string, name: string) => {
      persistGroups(groups.map((g) => (g.id === id ? { ...g, name } : g)));
    },
    [groups, persistGroups],
  );

  const deleteGroup = useCallback(
    (id: string) => {
      persistGroups(groups.filter((g) => g.id !== id));
      persistFavorites(
        favorites.map((f) =>
          f.groupIds.includes(id)
            ? { ...f, groupIds: f.groupIds.filter((gid) => gid !== id) }
            : f,
        ),
      );
    },
    [groups, favorites, persistGroups, persistFavorites],
  );

  const reorderGroups = useCallback(
    (orderedIds: string[]) => {
      const ordered = orderedIds
        .map((id, index) => {
          const g = groups.find((grp) => grp.id === id);
          return g ? { ...g, order: index } : null;
        })
        .filter((g): g is DomainGroup => g !== null);
      persistGroups(ordered);
    },
    [groups, persistGroups],
  );

  return {
    favorites,
    groups,
    loaded,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    batchAddFavorites,
    removeBatchFavorites,
    addToGroup,
    removeFromGroup,
    batchAddToGroup,
    updateNote,
    getFavoritesByGroup,
    getGroupName,
    createGroup,
    renameGroup,
    deleteGroup,
    reorderGroups,
  };
}
