import {
  getRandomDrink,
  insertPreviewToDom,
  insertLoaderToDOM,
} from "/assets/scripts/utilities.js";

export const previewBox = document.querySelector(".preview-box");
export const loader = document.querySelector(".loader");

export function refreshPreview() {
  insertLoaderToDOM();
  getRandomDrink().then((drink) => {
    insertPreviewToDom(drink);
  });
}
refreshPreview();
