"use client";

import { useFavorites as useFavoritesCore } from "core";
import { webStorage } from "@/lib/storage";

export function useFavorites() {
  return useFavoritesCore(webStorage);
}
