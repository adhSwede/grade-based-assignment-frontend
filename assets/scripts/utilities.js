import { refreshPreview, previewBox, loader } from "/assets/scripts/index.js";
const baseURL = "https://www.thecocktaildb.com/api/json/v1/1";

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

// search.php?s=${cocktailName}

// ===========================================================
//        Others...
// ===========================================================
document
  .querySelector(".start-page-buttons")
  .addEventListener("click", handleButtons);

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
