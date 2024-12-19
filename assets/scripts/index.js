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
  selectSearchType,
} from "/assets/scripts/utilities.js";

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
selectSearchType();

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
