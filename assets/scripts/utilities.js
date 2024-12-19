// ===========================================================
//        Imports
// ===========================================================
import {
  refreshPreview,
  searchDrink,
  createDetailsPage,
} from "/assets/scripts/index.js";

// ===========================================================
//        References
// ===========================================================
const baseURL = "https://www.thecocktaildb.com/api/json/v1/1";
const detailsPage = document.querySelector(".details-page");
const loader = document.querySelector(".loader");
const navBtns = document.querySelector(".nav-buttons");
const previewBox = document.querySelector(".preview-box");
const searchOptions = document.querySelector("#search-options");
const searchPage = document.querySelector(".search-page");
const searchResults = document.querySelector(".search-results");
const startPage = document.querySelector(".start-page");
const startPageBtns = document.querySelector(".start-page-buttons");

// ===========================================================
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

// This was a really soft start, fetch the info, map it and build your card.
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
const pageTracker = {
  results: [],
  currentPage: 1,
  totalPages: null,
};
// This is the simplest way i could come up with to handle the pages.
// I designed it to work like a "state machine" to keep track of the data and pages.

export async function getSearchResult() {
  const searchValue = getSearchType();

  if (!searchValue) return;

  try {
    const apiRes = await fetch(searchValue);
    const rawSearchData = await apiRes.json();

    pageTracker.results = rawSearchData.drinks?.map(mapRawCocktailData) || [];
    pageTracker.totalPages = Math.ceil(pageTracker.results.length / 10);
    pageTracker.currentPage = 1;
    // Had to build this part post reaching the "VG" part of the assignment,
    // as my previous version couldn't handle counting pages.

    updateSearchResults();
  } catch (error) {
    console.error("Fetch error:", error);
    searchResults.innerHTML = `
      <li class="search-result-card">
      There was an error getting your cocktails, please try again later.
      </li>`;
  } // error message for everything not realted to the noInput state.
}

// simple create-a-card type function for the search li:s.
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

// Made this multi-choice abomination to replace my original variables handling
// the links.
function getSearchType() {
  const searchValue = document.querySelector("#search-name").value.trim();
  const optValue = document.querySelector("#search-options").value;

  if (!searchValue) {
    return "noInput";
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

// Bit of a "hacky" solution because i didn't feel like messing with the other function again.
// Basically what it does is it uses the old search field, but i force the input by hiding it, and setting the value based on the drop downs.
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

// This whole last section is just to accommodate the pagination and "page turning".
function changePage(dir) {
  if (dir === "next" && pageTracker.currentPage < pageTracker.totalPages) {
    pageTracker.currentPage++;
    updateSearchResults();
  } else if (dir === "prev" && pageTracker.currentPage > 1) {
    pageTracker.currentPage--;
    updateSearchResults();
  }
}

function updateSearchResults() {
  const startIndex = (pageTracker.currentPage - 1) * 10;
  const endIndex = pageTracker.currentPage * 10;
  const pageResults = pageTracker.results.slice(startIndex, endIndex);

  insertSRToDom(pageResults);

  document.querySelector(
    ".page-count"
  ).textContent = `Page ${pageTracker.currentPage} of ${pageTracker.totalPages}`;
}

// ===========================================================
//        Details/See more...
// ===========================================================

// Gets the id of an element (search result or the random gen.) so that i can use it to fetch the details.
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

// Liked this naming convention so much when i saw the teacher using it so i keep calling things "insert...ToDom"
export function insertDetailsToDOM(details) {
  const detailsHTML = details.map((drink) => createDetailCard(drink)).join("");

  detailsPage.innerHTML = detailsHTML;
}

// ===========================================================
//        Others...
// ===========================================================

// ############# Event Listeners #############
document.querySelector("#prev-btn").addEventListener("click", handleOnClick);
document.querySelector("#next-btn").addEventListener("click", handleOnClick);
document.querySelector(".search-form").addEventListener("submit", searchDrink);
startPageBtns.addEventListener("click", handleOnClick);
navBtns.addEventListener("click", handleOnClick);
searchOptions.addEventListener("change", handleOnClick);
searchResults.addEventListener("click", handleOnClick);

// After a while it felt silly to keep adding it all into the same event handler, but byt then i was already too deep.
export function handleOnClick(event) {
  const { target } = event;
  const detailsBtn = target.closest(".details-btn");
  const searchRes = target.closest(".search-result-card");
  const homeBtn = target.closest(".nav-buttons .home-btn");
  const randomBtn = target.closest(".start-page-buttons .random-btn");
  const searchBtn = target.closest(".nav-buttons .search-btn");
  const searchOptions = target.closest("#search-options");
  const nextBtn = target.closest(".search-page-buttons #next-btn");
  const prevBtn = target.closest(".search-page-buttons #prev-btn");

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

  if (nextBtn) {
    changePage("next");
  }

  if (prevBtn) {
    changePage("prev");
  }
}

// Added because it was getting crowded in my click handler wich really didn't need more code.
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

// So far i only used this on the random generator...
export function insertLoaderToDOM() {
  previewBox.innerHTML = loader.outerHTML;
}
