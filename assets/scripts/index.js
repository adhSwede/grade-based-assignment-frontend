// ===========================================================
//        Imports
// ===========================================================
import {
  getRandomDrink,
  insertPreviewToDom,
  insertLoaderToDOM,
  getSearchResult,
  insertSRToDom,
} from "/assets/scripts/utilities.js";

// ===========================================================
//        References
// ===========================================================
export const previewBox = document.querySelector(".preview-box");
export const loader = document.querySelector(".loader");
// ===========================================================
//        Start Page
// ===========================================================
export function refreshPreview() {
  insertLoaderToDOM();
  getRandomDrink().then((drink) => {
    insertPreviewToDom(drink);
  });
}
refreshPreview();

// ===========================================================
//        Search Page
// ===========================================================
export function searchDrink(event) {
  event.preventDefault();
  insertLoaderToDOM();
  getSearchResult().then((sr) => {
    insertSRToDom(sr);
  });
}
