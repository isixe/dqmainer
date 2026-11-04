import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KeyValueStorage } from "core";

export const asyncStorageAdapter: KeyValueStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
};
