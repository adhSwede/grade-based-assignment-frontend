// ===========================================================
//        Imports
// ===========================================================
import { refreshPreview, searchDrink, createDetailsPage } from "/index.js";

// ===========================================================
//        References
// ===========================================================
const baseURL = "https://www.thecocktaildb.com/api/json/v1/1";
const detailsPage = document.querySelector(".details-page");
const favPage = document.querySelector(".fav-page");
const loader = document.querySelector(".loader");
const navBtns = document.querySelector(".nav-buttons");
const previewBox = document.querySelector(".preview-box");
const searchOptions = document.querySelector("#search-options");
const searchPage = document.querySelector(".search-page");
const searchResults = document.querySelector(".search-results");
const startPage = document.querySelector(".start-page");
const startPageBtns = document.querySelector(".start-page-buttons");
// had no smart order for these, so went alphabetically, from the variable names.

// ===========================================================
//        Map cocktail data
// ===========================================================

// this function was made by our teacher to help us map the raw cocktail data.
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
} // I ended up reusing some version of this for most API calls.
// It's a variation i made up based on what we've been shown in the lesson repos.

// Create a preview card/page for the random drink generator.
function createPreview(drink) {
  const preview = /*html*/ `
    <article class="preview-card" data-id="${drink.id}">
     <div class="random-card-top">
      <h3 class="random-drink-name">${drink.name}</h3>
      <button class="like-btn" data-id="${drink.id}">
        <span class="material-icons">${
          likes.includes(drink.id) ? "favorite" : "favorite_border"
        }</span>
      </button>
      </div>
      <div class="img-wrapper"><img src="${drink.thumbnail}" alt="${
    drink.name
  }"></div>
    </article>
  `;
  return preview;
}

// Again this is a variation of what we've been doing in class. The name however I got from the teacher.
// I ended up agreeing with this naming convention so much I named all similar functions "insert...ToDOM"
export function insertPreviewToDom(mappedDrink) {
  const randomDrinkHTML = mappedDrink
    .map((drink) => createPreview(drink))
    .join("");

  previewBox.innerHTML = randomDrinkHTML;
  mappedDrink.forEach((drink) => updateLikeUI(drink.id));
} // Slight modification i added for the favorites system.

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
    // Make the las page count even if there is not enough items to fill it.
    pageTracker.currentPage = 1;

    updateSearchResults();
  } catch (error) {
    console.error("Fetch error:", error);
    searchResults.innerHTML = `
      <li class="search-result-card">
      There was an error getting your cocktails, please try again later.
      </li>`;
  }
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
  <button class="like-btn" data-id="${drink.id}">
  <span class="material-icons">${
    likes.includes(drink.id) ? "favorite" : "favorite_border"
  }</span>
  </button>
  </div>
  </li>`;
  // Had to fill in the like button later, as i did all the tasks in the order they were presented.

  return srLi;
}

// another "insert...ToDom" function. THis time i thought an li would be fitting, since they could all gop in a ul.
export async function insertSRToDom(searchResult) {
  console.log(searchResult);
  const srLiHTML = searchResult.map((drink) => createSearchLi(drink)).join("");
  searchResults.innerHTML = srLiHTML;
}

// Made this multi-choice abomination to replace my original variables handling links.
// i found it easier to just replace the whole string here.
function getSearchType() {
  const userSearch = document.querySelector("#search-name").value.trim();
  const optValue = document.querySelector("#search-options").value;

  if (!userSearch) {
    return "noInput";
  }

  if (optValue === "name") {
    return `${baseURL}/search.php?s=${userSearch}`;
  }
  if (optValue === "category") {
    return `${baseURL}/filter.php?c=${userSearch}`;
  }
  if (optValue === "ingredients") {
    return `${baseURL}/filter.php?i=${userSearch}`;
  }
  if (optValue === "glass") {
    return `${baseURL}/filter.php?g=${userSearch}`;
  }
  if (optValue === "alcohol") {
    return `${baseURL}/filter.php?a=${userSearch}`;
  }
}

// Bit of a "hacky" solution because i didn't feel like messing with the above function again.
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
  } // i don't now if people do this in java but in C# dir is a pretty common variable for direction so i named it dir.
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
// It was a little tricky, as I had no knowledge of dataset id's prior to this assignment, and had to read up on them.
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

// Api call for details.
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
    <p class= dt-ctg>${drink.category}</p>
    <ul class="dt-tags">
    ${drink.tags.map((tag) => `<li>${tag}</li>`).join(" ")}
    </ul>
    <button class="like-btn dt-like-btn" data-id="${drink.id}">
      <span class="material-icons">
        ${likes.includes(drink.id) ? "favorite" : "favorite_border"}
      </span>
    </button>
      <p></p>
      <ul class="dt-ingredients">
        ${drink.ingredients
          .map(
            (ingredient) =>
              `<li>${ingredient.ingredient}: ${ingredient.measure}</li>`
          )
          .join("")}
      </ul>
      <p class="dt-instructions">${drink.instructions}</p>
      <p class= dt-glass>Best served in: ${drink.glass}</p>
    </aside>
  `;
  return detailCard;
} // Yet another card where i had to insert the like function in post.

// I keep calling things "insert...ToDom", It\s just really descriptive, i guess.
export function insertDetailsToDOM(details) {
  const detailsHTML = details.map((drink) => createDetailCard(drink)).join("");

  detailsPage.innerHTML = detailsHTML;
}
// ===========================================================
//        Favorites/LS
// ===========================================================

// This whole section was built to store and handle the "likes"; Originally i was going with the more traditional "favorites",
//  but i like shorter functions and "liking" feels more modern.
let likes = JSON.parse(localStorage.getItem("likes")) || [];

async function insertFavorites() {
  const favoritesList = document.querySelector(".favorites-list");

  favoritesList.innerHTML = ""; // Clear previous content
  if (likes.length === 0) {
    favoritesList.innerHTML =
      "<li class='no-favorites-message'>No favorites yet! Start liking some drinks.</li>";
    return;
  } // It looked empty on the favorites screen when there was nothing there so i ended up making a message.

  try {
    const favoritesDetails = await Promise.all(
      likes.map(async (id) => {
        const rawDetails = await getDetailsById(id);
        return mapRawCocktailData(rawDetails);
      }) // Never heard of promise.all() until i saw it discussed on stack overflow.
    ); // It works almost as a loop but for multiple api responses.

    favoritesDetails.forEach((drink) => {
      const li = document.createElement("li");
      li.classList.add("fav-list-item");
      li.innerHTML = /*html*/ `
        <article class="fav-card" data-id="${drink.id}">
          <h3 class="fav-card-title">${drink.name}</h3>
          <button class="like-btn" data-id="${drink.id}">
            <span class="material-icons">${
              likes.includes(drink.id) ? "favorite" : "favorite_border"
            }</span>
          </button>
          <div class="fav-img-wrapper">
            <img src="${drink.thumbnail}" alt="${drink.name}" />
          </div>
        </article>`;
      favoritesList.appendChild(li);
    });
  } catch (error) {
    console.error("Error inserting favorites:", error);
    favoritesList.innerHTML =
      "<li class='error-message'>There was an error loading your favorites. Please try again later.</li>";
  }
}

// Had to add extra checks because every time it saved likes it kept duplicating them.
// Found out later it was because i had added two eventlisteners, one on the parent and one on the button.
// making every click add two of the same favorite.
function toggleLikes(id) {
  if (likes.includes(id)) {
    likes = likes.filter((likedId) => likedId !== id);
  } else {
    likes.push(id);
  }

  updateStoredLikes();
  updateLikeUI(id);

  if (!favPage.classList.contains("hide-section")) {
    insertFavorites();
  }
}

function updateStoredLikes() {
  likes = [...new Set(likes)];
  localStorage.setItem("likes", JSON.stringify(likes));
} // Used a set to remove the dupes i THOUGHT was caused by something i did with the rendering.

function updateLikeUI(id) {
  const buttons = document.querySelectorAll(`.like-btn[data-id="${id}"]`);
  buttons.forEach((button) => {
    const icon = button.querySelector(".material-icons");
    icon.textContent = likes.includes(id) ? "favorite" : "favorite_border";
  });
}

async function getDetailsById(id) {
  const apiRes = await fetch(`${baseURL}/lookup.php?i=${id}`);
  const rawDetails = await apiRes.json();
  return rawDetails.drinks?.[0];
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
previewBox.addEventListener("click", handleOnClick);
favPage.addEventListener("click", handleOnClick);
detailsPage.addEventListener("click", handleOnClick);
// I know this is kind of a mess but i don't know how to clean it up.

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
  const favBtn = target.closest(".fav-btn");
  const likeBtn = target.closest(".like-btn");
  const favCard = target.closest(".fav-card");

  if (likeBtn) {
    const drinkId = likeBtn.dataset.id;
    toggleLikes(drinkId);
    return;
    // I added return on some of these in another try to stop the duplicates before i figured out what was happening.
  }

  if (favCard) {
    const drinkId = favCard.dataset.id;
    createDetailsPage(drinkId);
    showTab("details");
    return;
  }

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

  if (favBtn) {
    showTab("likes");
    insertFavorites();
    return;
  }
}

// Added because it was getting crowded in my click handler wich really didn't need more code.
// I found it easier just hiding everything and unhiding whatever needed showing,
// than checking what was showing every time.
export function showTab(showing) {
  const dList = detailsPage.classList;
  const stList = startPage.classList;
  const srList = searchPage.classList;
  const favList = favPage.classList;

  stList.add("hide-section");
  srList.add("hide-section");
  dList.add("hide-section");
  favList.add("hide-section");

  if (showing === "details") {
    dList.remove("hide-section");
  } else if (showing === "search") {
    srList.remove("hide-section");
  } else if (showing === "start") {
    stList.remove("hide-section");
  } else if (showing === "likes") {
    favList.remove("hide-section");
  }
}

// So far i only used this on the random generator...
export function insertLoaderToDOM() {
  previewBox.innerHTML = loader.outerHTML;
}
