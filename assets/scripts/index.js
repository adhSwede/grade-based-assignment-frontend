// ===========================================================
//        Imports
// ===========================================================
import {
  getRandomDrink,
  insertPreviewToDom,
  insertLoaderToDOM,
  getSearchResult,
  insertSRToDom,
  getDetailedInfo,
  insertDetailsToDOM,
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

// ===========================================================
//        Details Page
// ===========================================================
export function createDetailsPage(drinkID) {
  insertLoaderToDOM();
  getDetailedInfo(drinkID).then((details) => {
    console.log(details);
    insertDetailsToDOM(details);
  });
}
