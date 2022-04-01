import fs from "fs";

export function fileExists(path: string) {
  try {
    if (fs.existsSync(path)) {
      return true;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}
