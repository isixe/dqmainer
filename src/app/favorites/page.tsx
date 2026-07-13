"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/locales/i18n";
import { useFavorites } from "@/hooks/useFavorites";
import {
  DEFAULT_GROUP_ID,
  type FavoriteItem,
  type LegacyFavoriteItem,
  type FavoritesExportData,
} from "@/types/favorites";
import {
  Star,
  Trash2,
  Search,
  Download,
  Upload,
  Edit3,
  FolderPlus,
  Check,
  X,
  Globe,
  Zap,
  ArrowUpDown,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function FavoritesPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const {
    favorites,
    groups,
    loaded,
    removeFavorite,
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
    addFavorite,
  } = useFavorites();

  const [selectedGroup, setSelectedGroup] = useState(DEFAULT_GROUP_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openMenuDomain, setOpenMenuDomain] = useState<string | null>(null);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const batchMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuDomain(null);
      }
      if (batchMenuRef.current && !batchMenuRef.current.contains(e.target as Node)) {
        setShowBatchMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedFavorites = useMemo(() => {
    let items = getFavoritesByGroup(selectedGroup);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((f) => f.domain.toLowerCase().includes(q));
    }
    items = [...items].sort((a, b) => {
      if (sortBy === "name") return a.domain.localeCompare(b.domain);
      return b.addedAt - a.addedAt;
    });
    return items;
  }, [getFavoritesByGroup, selectedGroup, searchQuery, sortBy]);

  const allSelected = groupedFavorites.length > 0 && selectedItems.size === groupedFavorites.length;

  const toggleSelect = (domain: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(groupedFavorites.map((f) => f.domain)));
    }
  };

  const handleOneClickCheck = () => {
    const domains = groupedFavorites.map((f) => f.domain).join(",");
    if (!domains) return;
    router.push(`/?domains=${encodeURIComponent(domains)}`);
  };

  const handleExport = () => {
    const data: FavoritesExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      groups,
      favorites,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dqmainer-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data: FavoritesExportData = JSON.parse(ev.target?.result as string);
          if (!data.groups || !data.favorites) {
            alert(t("favorites.importError"));
            return;
          }
          const existingNames = new Set(groups.map((g) => g.name));
          const groupIdMap = new Map<string, string>();
          groupIdMap.set(DEFAULT_GROUP_ID, DEFAULT_GROUP_ID);
          for (const g of data.groups) {
            if (g.id === DEFAULT_GROUP_ID) continue;
            if (!existingNames.has(g.name)) {
              const created = createGroup(g.name);
              groupIdMap.set(g.id, created.id);
              existingNames.add(g.name);
            } else {
              const existing = groups.find((eg) => eg.name === g.name);
              if (existing) groupIdMap.set(g.id, existing.id);
            }
          }
          for (const f of data.favorites) {
            let groupIds: string[];
            if ("groupIds" in f) {
              groupIds = (f as FavoriteItem).groupIds
                .map((gid) => groupIdMap.get(gid))
                .filter((gid): gid is string => gid !== undefined);
            } else if ("groupId" in f) {
              const legacyGid = (f as LegacyFavoriteItem).groupId;
              groupIds = legacyGid
                ? [groupIdMap.get(legacyGid) ?? DEFAULT_GROUP_ID]
                : [];
            } else {
              groupIds = [];
            }
            addFavorite(f.domain, groupIds);
          }
        } catch {
          alert(t("favorites.importError"));
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [groups, createGroup, addFavorite, t],
  );

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    createGroup(name);
    setNewGroupName("");
    setShowNewGroup(false);
  };

  const handleRenameGroup = (id: string) => {
    const name = editGroupName.trim();
    if (!name) return;
    renameGroup(id, name);
    setEditingGroup(null);
    setEditGroupName("");
  };

  const startEditGroup = (id: string, name: string) => {
    setEditingGroup(id);
    setEditGroupName(name);
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm(t("favorites.confirmDeleteGroup"))) {
      deleteGroup(id);
      if (selectedGroup === id) {
        setSelectedGroup(DEFAULT_GROUP_ID);
      }
    }
  };

  const handleBatchRemove = () => {
    if (selectedItems.size === 0) return;
    removeBatchFavorites(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const startEditNote = (domain: string, currentNote: string) => {
    setEditingNote(domain);
    setNoteValue(currentNote);
  };

  const saveNote = (domain: string) => {
    updateNote(domain, noteValue);
    setEditingNote(null);
    setNoteValue("");
  };

  const formatDate = (date: number | string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language === "zh" ? "zh-CN" : "en-US");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black/60">{t("common.loading")}</p>
      </div>
    );
  }

  const displayGroups = groups.filter((g) => g.id !== DEFAULT_GROUP_ID);
  const totalCount = favorites.length;

  const sidebar = (
    <Card className="border-black/10">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1.5 text-xs font-semibold text-black/40 uppercase tracking-wider">
            {t("favorites.groups")}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-black/30 hover:text-black rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedGroup(DEFAULT_GROUP_ID);
            setSidebarOpen(false);
          }}
          className={`w-full text-left px-2 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
            selectedGroup === DEFAULT_GROUP_ID
              ? "bg-black text-white"
              : "hover:bg-black/5 text-black"
          }`}>
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t("favorites.allDomains")}
          </span>
          <span className="text-xs opacity-70">{totalCount}</span>
        </button>

        <div className="mt-1 space-y-0.5">
          {displayGroups.map((group) => (
            <div key={group.id} className="group relative">
              {editingGroup === group.id ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <Input
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="h-7 text-sm focus-visible:ring-0 focus-visible:border-black/20 focus-visible:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameGroup(group.id);
                      if (e.key === "Escape") setEditingGroup(null);
                    }}
                  />
                  <button
                    onClick={() => handleRenameGroup(group.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingGroup(null)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                    selectedGroup === group.id
                      ? "bg-black text-white"
                      : "hover:bg-black/5 text-black"
                  }`}>
                  <span className="flex items-center gap-2 truncate">
                    <FolderIcon />
                    {group.name}
                  </span>
                  <span className="text-xs opacity-70 group-hover:opacity-0 transition-opacity">
                    {favorites.filter((f) => f.groupIds.includes(group.id)).length}
                  </span>
                </button>
              )}

              {editingGroup !== group.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={() => startEditGroup(group.id, group.name)}
                    className="p-1 text-black/40 hover:text-black rounded">
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 text-black/40 hover:text-red-600 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-black/5">
          {showNewGroup ? (
            <div className="flex items-center gap-1 px-1">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder={t("favorites.groupNamePlaceholder")}
                className="h-8 text-sm focus-visible:ring-0 focus-visible:border-black/20 focus-visible:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateGroup();
                  if (e.key === "Escape") setShowNewGroup(false);
                }}
              />
              <button
                onClick={handleCreateGroup}
                className="p-1 text-green-600 hover:bg-green-50 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNewGroup(false)}
                className="p-1 text-red-600 hover:bg-red-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGroup(true)}
              className="w-full text-left px-2 py-2 text-sm text-black/50 hover:text-black hover:bg-black/5 rounded-md transition-colors flex items-center gap-2">
              <FolderPlus className="w-4 h-4" />
              {t("favorites.newGroup")}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-black/40 hover:text-black rounded-lg hover:bg-black/5">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-black flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              {t("favorites.title")}
            </h1>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            {sidebar}
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-50 overflow-y-auto p-4 shadow-xl animate-in slide-in-from-left">
                {sidebar}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("favorites.searchPlaceholder")}
                  className="pl-9 h-9 text-sm border-black/20 focus-visible:ring-0 focus-visible:border-black/20 focus:outline-none focus-visible:outline-none"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOneClickCheck}
                className="gap-1.5"
                disabled={groupedFavorites.length === 0}>
                <Zap className="w-4 h-4" />
                {t("favorites.oneClickCheck")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="w-4 h-4" />
                {t("favorites.export")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                <Upload className="w-4 h-4" />
                {t("favorites.import")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "name" ? "date" : "name")}
                className="gap-1.5">
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === "name" ? t("favorites.sortByName") : t("favorites.sortByDate")}
              </Button>
            </div>

            {selectedItems.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 flex-wrap">
                <span className="text-sm font-medium text-amber-800 whitespace-nowrap">
                  {t("result.selectedCount", { count: selectedItems.size })}
                </span>
                <div className="relative" ref={batchMenuRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBatchMenu(!showBatchMenu)}
                    className="gap-1.5 text-amber-700 border-amber-300">
                    <FolderPlus className="w-4 h-4" />
                    {t("favorites.batchAddToGroup")}
                  </Button>
                  {showBatchMenu && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-black/10 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                      {groups
                        .filter((g) => g.id !== DEFAULT_GROUP_ID)
                        .map((g) => (
                          <button
                            key={g.id}
                            onClick={() => {
                              batchAddToGroup(Array.from(selectedItems), g.id);
                              setSelectedItems(new Set());
                              setShowBatchMenu(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/5 text-black">
                            {g.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchRemove}
                  className="gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                  {t("favorites.batchRemove")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
                  {t("result.cancelSelect")}
                </Button>
              </div>
            )}

            <Card className="border-black/10">
              <CardContent className="p-0">
                {groupedFavorites.length === 0 ? (
                  <div className="text-center py-16">
                    <Star className="w-12 h-12 text-black/10 mx-auto mb-3" />
                    <p className="text-black/40">{t("favorites.empty")}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-black/5 bg-gray-50/50">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1.5 text-xs text-black/40 hover:text-black transition-colors">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5"
                        />
                        <span>{t("result.selectAllShort")}</span>
                      </button>
                      <span className="text-xs text-black/30 ml-auto">
                        {groupedFavorites.length} {t("favorites.domains")}
                      </span>
                    </div>

                    {groupedFavorites.map((item) => (
                      <div
                        key={item.domain}
                        className="flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.domain)}
                          onChange={() => toggleSelect(item.domain)}
                          className="w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                              <span className="font-mono text-sm font-medium text-black truncate max-w-full">
                                {item.domain}
                              </span>
                              {item.groupIds.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {item.groupIds.map((gid) => (
                                    <span
                                      key={gid}
                                      className="text-[10px] px-1.5 py-0.5 bg-black/5 rounded-full text-black/50 whitespace-nowrap">
                                      {getGroupName(gid)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {editingNote === item.domain ? (
                            <div className="flex items-center gap-1 mt-1">
                              <Input
                                value={noteValue}
                                onChange={(e) => setNoteValue(e.target.value)}
                                placeholder={t("favorites.notePlaceholder")}
                                className="h-7 text-xs focus-visible:ring-0 focus-visible:border-black/20 focus-visible:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveNote(item.domain);
                                  if (e.key === "Escape") setEditingNote(null);
                                }}
                              />
                              <button
                                onClick={() => saveNote(item.domain)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded flex-shrink-0">
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingNote(null)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : item.note ? (
                            <p
                              className="text-xs text-black/40 mt-0.5 cursor-pointer hover:text-black/60 truncate"
                              onClick={() => startEditNote(item.domain, item.note)}>
                              {item.note}
                            </p>
                          ) : (
                            <button
                              onClick={() => startEditNote(item.domain, "")}
                              className="text-xs text-black/20 hover:text-black/40 mt-0.5 transition-colors">
                              {t("favorites.addNote")}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Group action menu */}
                          <div className="relative" ref={menuRef}>
                            <button
                              onClick={() =>
                                setOpenMenuDomain(
                                  openMenuDomain === item.domain ? null : item.domain,
                                )
                              }
                              className="p-1.5 text-black/30 hover:text-black rounded hover:bg-black/5">
                              <FolderPlus className="w-3.5 h-3.5" />
                            </button>
                            {openMenuDomain === item.domain && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-black/10 rounded-lg shadow-lg py-1 min-w-[160px] z-10">
                                {groups.filter(
                                  (g) => g.id === DEFAULT_GROUP_ID || !item.groupIds.includes(g.id),
                                ).length > 0 && (
                                  <>
                                    <div className="px-3 py-1 text-[10px] font-semibold text-black/30 uppercase tracking-wider">
                                      {t("favorites.addToGroup")}
                                    </div>
                                    {groups
                                      .filter(
                                        (g) =>
                                          g.id === DEFAULT_GROUP_ID ||
                                          !item.groupIds.includes(g.id),
                                      )
                                      .map((g) => (
                                        <button
                                          key={g.id}
                                          onClick={() => {
                                            addToGroup(item.domain, g.id);
                                            setOpenMenuDomain(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/5 text-black">
                                          {g.id === DEFAULT_GROUP_ID
                                            ? t("favorites.allDomains")
                                            : g.name}
                                        </button>
                                      ))}
                                  </>
                                )}
                                {item.groupIds.filter((gid) => gid !== DEFAULT_GROUP_ID).length >
                                  0 && (
                                  <>
                                    <div className="border-t border-black/5 my-1" />
                                    <div className="px-3 py-1 text-[10px] font-semibold text-black/30 uppercase tracking-wider">
                                      {t("favorites.removeFromGroup")}
                                    </div>
                                    {groups
                                      .filter(
                                        (g) =>
                                          g.id !== DEFAULT_GROUP_ID &&
                                          item.groupIds.includes(g.id),
                                      )
                                      .map((g) => (
                                        <button
                                          key={g.id}
                                          onClick={() => {
                                            removeFromGroup(item.domain, g.id);
                                            setOpenMenuDomain(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 text-red-600">
                                          {g.name}
                                        </button>
                                      ))}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFavorite(item.domain)}
                            className="p-1.5 text-black/30 hover:text-red-600 rounded hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 opacity-60">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}
