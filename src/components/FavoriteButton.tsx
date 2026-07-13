"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  domain: string;
  groupId?: string;
  size?: "sm" | "default" | "icon";
  showLabel?: boolean;
}

export default function FavoriteButton({
  domain,
  groupId,
  size = "icon",
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(domain);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(domain, groupId);
  };

  if (showLabel) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={favorited ? "text-yellow-500 border-yellow-300" : ""}>
        <Star className={`w-4 h-4 mr-1 ${favorited ? "fill-yellow-500" : ""}`} />
        {favorited ? "已收藏" : "收藏"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-1 rounded transition-colors hover:bg-black/5 ${
        favorited ? "text-yellow-500" : "text-black/30 hover:text-black/60"
      }`}
      title={favorited ? "取消收藏" : "收藏"}>
      <Star className={`w-4 h-4 ${favorited ? "fill-yellow-500" : ""}`} />
    </button>
  );
}
