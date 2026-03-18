/** Favorites — localStorage persistence */

const KEY = "ielts_vocab_favs";

export function getFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveFavs(list: string[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isFav(word: string): boolean {
  return getFavs().includes(word);
}

export function toggleFav(word: string): boolean {
  let f = getFavs();
  if (f.includes(word)) {
    f = f.filter((w) => w !== word);
  } else {
    f.push(word);
  }
  saveFavs(f);
  return f.includes(word);
}
