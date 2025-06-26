export function imageKeywordFromFilename(filename: string): string {
  const splitArray = filename.split('/');
  const name = splitArray[splitArray.length - 1];
  const keyword = name.slice(0, name.length - 4);

  return keyword;
}

export function filenameFromImageKey(key: string): string {
  return `/assets/images/profilePics/${key}.jpg`;
}