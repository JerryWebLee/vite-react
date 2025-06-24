export function setStorageByName(name: string, value: string) {
  localStorage.setItem(name, value);
}
export function getStorageByName(name: string) {
  return localStorage.getItem(name);
}

export function deleteStorageByName(name: string) {
  localStorage.removeItem(name);
}

export function deleteAllStorages() {
  localStorage.clear();
}
