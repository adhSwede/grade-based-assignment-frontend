// ===========================================================
//        Imports
// ===========================================================
import {
  loader,
  previewBox,
  refreshPreview,
  searchDrink,
  createDetailsPage,
} from "/assets/scripts/index.js";

// ===========================================================
//        References
// ===========================================================
const baseURL = "https://www.thecocktaildb.com/api/json/v1/1";
const detailsPage = document.querySelector(".details-page");
const startPageBtns = document.querySelector(".start-page-buttons");
const searchOptions = document.querySelector("#search-options");
const searchResults = document.querySelector(".search-results");
const searchPage = document.querySelector(".search-page");
const startPage = document.querySelector(".start-page");
const navBtns = document.querySelector(".nav-buttons");

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

function createPreview(drink) {
  const preview = /*html*/ `
  <article class="preview-card" data-id="${drink.id}">
    <h3 class="random-drink-name">${drink.name}</h3>
    <div class="img-wrapper"><img src="${drink.thumbnail}" alt=""></div></article>
  `;
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
  const searchValue = getSearchType();

  if (searchValue === "noInput") {
    searchResults.innerHTML = /*html*/ `
      <li class="search-result-card">
      Choose an option, please!
      </li>`;
    return;
  }

  if (!searchValue) return;

  try {
    const apiRes = await fetch(`${searchValue}`);
    const rawSearchData = await apiRes.json();
    console.log("Response Data:", rawSearchData);

    if (!rawSearchData.drinks?.length) {
      searchResults.innerHTML = /*html*/ `
      <li class="search-result-card">
      We could not find anything matching your search.
      </li>`;
      return;
    }

    const mappedSearch = rawSearchData.drinks.map(mapRawCocktailData);
    insertSRToDom(mappedSearch);
  } catch (error) {
    console.error("Fetch error:", error);
    searchResults.innerHTML = /*html*/ `
    <li class="search-result-card">
    There was an error getting your cocktails, please try again later.
    </li>`;
  }
}

function createSearchLi(drink) {
  const srLi = /*html*/ `
  <li class="search-result-card" data-id="${drink.id}">
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

export async function insertSRToDom(searchResult) {
  console.log(searchResult);
  const srLiHTML = searchResult.map((drink) => createSearchLi(drink)).join("");
  searchResults.innerHTML = srLiHTML;
}

function getSearchType() {
  const searchValue = document.querySelector("#search-name").value.trim();
  const optValue = document.querySelector("#search-options").value;

  if (!searchValue) {
    return "noInput"; // Return a specific value to signal no input
  }

  if (optValue === "name") {
    return `${baseURL}/search.php?s=${searchValue}`;
  }
  if (optValue === "category") {
    return `${baseURL}/filter.php?c=${searchValue}`;
  }
  if (optValue === "ingredients") {
    return `${baseURL}/filter.php?i=${searchValue}`;
  }
  if (optValue === "glass") {
    return `${baseURL}/filter.php?g=${searchValue}`;
  }
  if (optValue === "alcohol") {
    return `${baseURL}/filter.php?a=${searchValue}`;
  }
}

// bit of a "hacky" solution because i didn't feel like messing with the other function again.
export function selectSearchType() {
  const searchOptions = document.querySelector("#search-options");
  const showing = searchOptions.value;
  const options = document.querySelectorAll(".search-types > *");
  const searchBar = document.querySelector("#search-name");
  const selectedOption = document.querySelector(
    `.search-types #search-${showing}`
  );

  options.forEach((option) => option.classList.add("hide-section"));

  if (selectedOption) {
    selectedOption.classList.remove("hide-section");

    selectedOption.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      searchBar.value = selectedValue;
    });
  }
}

// ===========================================================
//        Details/See more...
// ===========================================================
export async function getDetailedInfo(drinkID) {
  const detailRes = await fetch(`${baseURL}/lookup.php?i=${drinkID}`);
  const rawDetails = await detailRes.json();

  const mappedDetails = rawDetails.drinks.map(mapRawCocktailData);
  return mappedDetails;
}

function createDetailCard(drink) {
  const detailCard = /*html*/ `
    <div class="dt-img-wrapper"><img class="dt-image" src="${
      drink.thumbnail
    }" alt="${drink.name}" /></div>
    <aside class="dt-info">
      <h3 class="dt-name">${drink.name}</h3>
      <ul class="dt-ingredients">
        ${drink.ingredients
          .map(
            (ingredient) =>
              `<li>${ingredient.ingredient}: ${ingredient.measure}</li>`
          )
          .join("")}
      </ul>
      <ul class="dt-tags">
        ${drink.tags.map((tag) => `<li>${tag}</li>`).join(" ")}
      </ul>
      <p class="dt-instructions">${drink.instructions}</p>
    </aside>
  `;
  return detailCard;
}

export function insertDetailsToDOM(details) {
  const detailsHTML = details.map((drink) => createDetailCard(drink)).join("");

  detailsPage.innerHTML = detailsHTML;
}

// ===========================================================
//        Others...
// ===========================================================

document.querySelector(".search-form").addEventListener("submit", searchDrink);
startPageBtns.addEventListener("click", handleOnClick);
navBtns.addEventListener("click", handleOnClick);
searchOptions.addEventListener("change", handleOnClick);
searchResults.addEventListener("click", handleOnClick);

export function idFromElement(event) {
  const previewCard = document.querySelector(".preview-card");
  const detailsBtn = event.target.closest(".details-btn");
  const searchRes = event.target.closest(".search-result-card");

  if (detailsBtn) {
    return previewCard.dataset.id;
  }

  if (searchRes) {
    return searchRes.dataset.id;
  }
}

export function handleOnClick(event) {
  const { target } = event;
  const detailsBtn = target.closest(".details-btn");
  const searchRes = target.closest(".search-result-card");
  const homeBtn = target.closest(".nav-buttons .home-btn");
  const randomBtn = target.closest(".start-page-buttons .random-btn");
  const searchBtn = target.closest(".nav-buttons .search-btn");
  const searchOptions = target.closest("#search-options");

  if (detailsBtn || searchRes) {
    const id = idFromElement(event);
    createDetailsPage(id);
    showTab("details");
  }

  if (homeBtn) {
    showTab("start");
    refreshPreview();
  }

  if (randomBtn) {
    refreshPreview();
  }

  if (searchBtn) {
    showTab("search");
  }

  if (searchOptions) {
    selectSearchType();
  }
}

// Added because it was getting crowded in my click handler.
export function showTab(showing) {
  const dList = detailsPage.classList;
  const stList = startPage.classList;
  const srList = searchPage.classList;

  stList.add("hide-section");
  srList.add("hide-section");
  dList.add("hide-section");

  if (showing === "details") {
    dList.remove("hide-section");
  } else if (showing === "search") {
    srList.remove("hide-section");
  } else if (showing === "start") {
    stList.remove("hide-section");
  }
}

export function insertLoaderToDOM() {
  previewBox.innerHTML = loader.outerHTML;
}
