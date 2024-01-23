import { put } from "./helper.js";

export async function initDB() {
  for (const path of ["synthsizers", "dictionaries", "_state"]) {
    await put(path, "");
  }
}
