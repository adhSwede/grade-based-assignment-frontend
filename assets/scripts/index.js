// ===========================================================
//        Imports
// ===========================================================
import {
  // for imports and exports i tried to look in postr for unnecessary onse, but i couldn't find any.
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
} // These all follow a then() order our teacher showed.
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
