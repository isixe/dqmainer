import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_GROUP_ID,
  type DomainGroup,
  type FavoriteItem,
} from "../types/favorites";
import type { KeyValueStorage } from "./storage";
import {
  FAVORITES_KEY,
  GROUPS_KEY,
  addFavoriteItem,
  addItemsToGroup,
  batchAddFavoriteItems,
  createDefaultGroups,
  detachGroupFromFavorites,
  favoritesByGroup,
  generateId,
  parseFavorites,
  parseGroups,
  removeFavoriteItems,
  removeItemFromGroup,
  setFavoriteNote,
  toggleFavoriteItem,
} from "./logic";

export interface UseFavoritesResult {
  favorites: FavoriteItem[];
  groups: DomainGroup[];
  loaded: boolean;
  reload: () => Promise<void>;
  isFavorited: (domain: string) => boolean;
  toggleFavorite: (domain: string, groupId?: string) => void;
  addFavorite: (domain: string, groupIds?: string[]) => void;
  removeFavorite: (domain: string) => void;
  batchAddFavorites: (domains: string[], groupIds?: string[]) => void;
  removeBatchFavorites: (domains: string[]) => void;
  addToGroup: (domain: string, groupId: string) => void;
  removeFromGroup: (domain: string, groupId: string) => void;
  batchAddToGroup: (domains: string[], groupId: string) => void;
  updateNote: (domain: string, note: string) => void;
  getFavoritesByGroup: (groupId: string) => FavoriteItem[];
  getGroupName: (groupId: string) => string;
  createGroup: (name: string) => DomainGroup;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  reorderGroups: (orderedIds: string[]) => void;
}

export function useFavorites(storage: KeyValueStorage): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [groups, setGroups] = useState<DomainGroup[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const [rawFavorites, rawGroups] = await Promise.all([
      storage.getItem(FAVORITES_KEY),
      storage.getItem(GROUPS_KEY),
    ]);

    setFavorites(parseFavorites(rawFavorites));

    const initialGroups = parseGroups(rawGroups);
    setGroups(initialGroups);
    if (rawGroups === null) {
      void storage.setItem(GROUPS_KEY, JSON.stringify(initialGroups));
    }

    setLoaded(true);
  }, [storage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persistFavorites = useCallback(
    (items: FavoriteItem[]) => {
      setFavorites(items);
      void storage.setItem(FAVORITES_KEY, JSON.stringify(items));
    },
    [storage],
  );

  const persistGroups = useCallback(
    (items: DomainGroup[]) => {
      setGroups(items);
      void storage.setItem(GROUPS_KEY, JSON.stringify(items));
    },
    [storage],
  );

  const isFavorited = useCallback(
    (domain: string) => favorites.some((f) => f.domain === domain),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (domain: string, groupId?: string) => {
      persistFavorites(toggleFavoriteItem(favorites, domain, groupId));
    },
    [favorites, persistFavorites],
  );

  const addFavorite = useCallback(
    (domain: string, groupIds?: string[]) => {
      persistFavorites(addFavoriteItem(favorites, domain, groupIds));
    },
    [favorites, persistFavorites],
  );

  const removeFavorite = useCallback(
    (domain: string) => {
      persistFavorites(removeFavoriteItems(favorites, [domain]));
    },
    [favorites, persistFavorites],
  );

  const batchAddFavorites = useCallback(
    (domains: string[], groupIds?: string[]) => {
      persistFavorites(batchAddFavoriteItems(favorites, domains, groupIds));
    },
    [favorites, persistFavorites],
  );

  const removeBatchFavorites = useCallback(
    (domains: string[]) => {
      persistFavorites(removeFavoriteItems(favorites, domains));
    },
    [favorites, persistFavorites],
  );

  const addToGroup = useCallback(
    (domain: string, groupId: string) => {
      persistFavorites(addItemsToGroup(favorites, [domain], groupId));
    },
    [favorites, persistFavorites],
  );

  const removeFromGroup = useCallback(
    (domain: string, groupId: string) => {
      persistFavorites(removeItemFromGroup(favorites, domain, groupId));
    },
    [favorites, persistFavorites],
  );

  const batchAddToGroup = useCallback(
    (domains: string[], groupId: string) => {
      persistFavorites(addItemsToGroup(favorites, domains, groupId));
    },
    [favorites, persistFavorites],
  );

  const updateNote = useCallback(
    (domain: string, note: string) => {
      persistFavorites(setFavoriteNote(favorites, domain, note));
    },
    [favorites, persistFavorites],
  );

  const getFavoritesByGroup = useCallback(
    (groupId: string) => favoritesByGroup(favorites, groupId),
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
      persistFavorites(detachGroupFromFavorites(favorites, id));
    },
    [groups, favorites, persistGroups, persistFavorites],
  );

  const reorderGroups = useCallback(
    (orderedIds: string[]) => {
      const ordered = orderedIds
        .map((id, index) => {
          const group = groups.find((g) => g.id === id);
          return group ? { ...group, order: index } : null;
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
    reload,
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
