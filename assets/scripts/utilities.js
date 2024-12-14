// ===========================================================
//        Imports
// ===========================================================
import {
  loader,
  previewBox,
  refreshPreview,
  searchDrink,
} from "/assets/scripts/index.js";

// ===========================================================
//        References
// ===========================================================
const baseURL = "https://www.thecocktaildb.com/api/json/v1/1";
const startPageBtns = document.querySelector(".start-page-buttons");
const searchResults = document.querySelector(".search-results");

// ==================================s=========================
//        Map cocktail data
// ===========================================================
export function mapRawCocktailData(rawCocktail) {
  return {
    id: rawCocktail.idDrink,
    name: rawCocktail.strDrink,
    tags: rawCocktail.strTags ? rawCocktail.strTags.split(",") : [],
    category: rawCocktail.strCategory,
    alcoholic: rawCocktail.strAlcoholic === "Alcoholic",
    glass: rawCocktail.strGlass,
    instructions: rawCocktail.strInstructions,
    thumbnail: rawCocktail.strDrinkThumb,
    ingredients: Array.from({ length: 15 })
      .map((_, i) => ({
        ingredient: rawCocktail[`strIngredient${i + 1}`],
        measure: rawCocktail[`strMeasure${i + 1}`],
      }))
      .filter((item) => item.ingredient),
  };
}

// ===========================================================
//        Random Cocktail generation
// ===========================================================
export async function getRandomDrink() {
  const apiRes = await fetch(baseURL + "/random.php");
  const rawDrink = await apiRes.json();
  const mappedDrink = rawDrink.drinks.map(mapRawCocktailData);

  return mappedDrink;
}

function saveCurrentRandomToLS(currentRandom) {
  localStorage.setItem("currentRandom", currentRandom);
}

function createPreview(drink) {
  const preview = /*html*/ `
  <article class="preview-card">
  <h3 class="random-drink-name">${drink.name}</h3>
    <div class="img-wrapper"><img src="${drink.thumbnail}" alt=""></div>
  </article>
  `;
  saveCurrentRandomToLS(drink.id);

  return preview;
}

export function insertPreviewToDom(mappedDrink) {
  const randomDrinkHTML = mappedDrink
    .map((drink) => createPreview(drink))
    .join("");
  previewBox.innerHTML = randomDrinkHTML;
}
// ===========================================================
//        Search Cocktails
// ===========================================================

export async function getSearchResult() {
  const searchValue = document.querySelector("#search-field").value.trim();
  const searchResults = document.querySelector(".search-results");

  if (!searchValue) return;
  try {
    const apiRes = await fetch(`${baseURL}/search.php?s=${searchValue}`);
    const rawSearchData = await apiRes.json();
    console.log("Response Data:", rawSearchData);

    if (!rawSearchData.drinks?.length) {
      searchResults.innerHTML = "";
      searchResults.innerHTML = /*html*/ `
          <li class="search-result-card">
            Could not find anything matching your search.
          </li>`;
      return;
    }

    const mappedSearch = rawSearchData.drinks.map(mapRawCocktailData);
    insertSRToDom(mappedSearch);
  } catch (error) {
    console.error("Fetch error:", error);
    searchResults.innerHTML = "";
    searchResults.innerHTML = /*html*/ `
        <li class="search-result-card">
          There was an error getting your cocktails, please try again later.
        </li>`;
  }
}

function createSearchLi(drink) {
  const srLi = /*html*/ `
  <li class="search-result-card">
  <div class="sr-thumb-wrapper">
    <img class="sr-thumb" src="${drink.thumbnail}/preview" alt="${drink.name}">
  </div>
  <div class="sr-text-wrapper">
    <h3 class="sr-drink-name">${drink.name}</h3>
    <p class="sr-drink-id">ID: ${drink.id}</p>
    <p class="sr-drink-tags">Tags: ${drink.tags.join(", ") || "None"}</p>
  </div>
  </li>`;

  return srLi;
}

export function insertSRToDom(searchResult) {
  const srLiHTML = searchResult.map((drink) => createSearchLi(drink)).join("");
  searchResults.innerHTML = srLiHTML;
}

// ===========================================================
//        Others...
// ===========================================================

document.querySelector(".search-form").addEventListener("submit", searchDrink);
startPageBtns.addEventListener("click", handleButtons);

export function handleButtons(event) {
  const { target } = event;
  const randomButton = target.closest(".start-page-buttons .random-btn");

  if (randomButton) {
    refreshPreview();
  }
}

export function insertLoaderToDOM() {
  previewBox.innerHTML = loader.outerHTML;
}
