// Variables 
const categoriesDiv = document.getElementById("categories");
const treeCards = document.getElementById("treeCards");
const spinner = document.getElementById("spinner");
const cartList = document.getElementById("cartList");
const totalPriceEl = document.getElementById("totalPrice");

let cart = [];
let activeCategoryId = null;

const showSpinner = () => spinner.classList.remove("hidden");
const hideSpinner = () => spinner.classList.add("hidden");

// Load Categories
function loadCategories() {
  const fixedCategories = [
    { id: "1", name: "Fruit Trees" },
    { id: "2", name: "Flowering Trees" },
    { id: "3", name: "Shade Trees" },
    { id: "4", name: "Medicinal Trees" },
    { id: "5", name: "Timber Trees" },
    { id: "6", name: "Evergreen Trees" },
    { id: "7", name: "Ornamental Plants" },
    { id: "8", name: "Bamboo" },
    { id: "9", name: "Climbers" },
    { id: "10", name: "Aquatic Plants" },
  ];

  const allCategory = { id: "all", name: "All Category" };
  displayCategories([allCategory, ...fixedCategories]);

  setActiveCategoryButton(0);
  loadAllPlants();
}

function displayCategories(categories) {
  categoriesDiv.innerHTML = "";
  categories.forEach((cat, idx) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.className = "btn btn-sm normal-case justify-start bg-green-100 text-green-800 hover:bg-green-500 hover:text-white w-full";

    btn.addEventListener("click", () => {
      setActiveCategoryButton(idx);
      if (cat.id === "all") {
        loadAllPlants();
        activeCategoryId = "all";
      } else {
        loadTreesByCategory(cat.id);
        activeCategoryId = cat.id;
      }
    });

    categoriesDiv.appendChild(btn);
  });
};

function setActiveCategoryButton(activeIndex) {
  const buttons = categoriesDiv.querySelectorAll("button");
  buttons.forEach((b) => {
    b.classList.remove("bg-green-500", "text-white");
    b.classList.add("bg-green-100", "text-green-800");
  });
  if (buttons[activeIndex]) {
    buttons[activeIndex].classList.add("bg-green-500", "text-white");
    buttons[activeIndex].classList.remove("bg-green-100", "text-green-800");
  }
};

//  Load All Plants
async function loadAllPlants() {
  showSpinner();
  treeCards.innerHTML = "";
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    hideSpinner();
    const plants = data.data || data.plants || [];
    displayTrees(plants);
  } catch (err) {
    hideSpinner();
    treeCards.innerHTML = "<p class='text-red-500 text-center'>Could not load plants.</p>";
    console.error(err);
  }
};

//  Load Trees by Category 
async function loadTreesByCategory(id) {
  showSpinner();
  treeCards.innerHTML = "";
  try {
    const res = await fetch(`https://openapi.programming-hero.com/api/category/${id}`
    );
    const data = await res.json();
    hideSpinner();
    const plants = data.data || data.plants || [];
    displayTrees(plants);
  } catch (err) {
    hideSpinner();
    treeCards.innerHTML ="<p class='text-center text-red-500'>No plants found!</p>";
    console.error(err);
  }
};

//  Render Tree Cards 
function displayTrees(plants) {
  treeCards.innerHTML = "";
  if (!plants || plants.length === 0) {
    treeCards.innerHTML ="<p class='text-center text-gray-500'>No plants found.</p>";
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.className ="card bg-white rounded-xl shadow hover:shadow-lg transition p-2 flex flex-col";

    const pid = plant.id ?? plant._id ?? plant.plantId ?? "";
    const name = plant.name ?? "Untitled";
    const image = plant.image ?? "";
    const desc = (plant.description ?? "").toString().slice(0, 80);
    const category = plant.category ?? "Unknown";
    const price = Number(plant.price ?? 0);

    card.innerHTML = `
      <figure class="mb-3">
        <img src="${image}" alt="${name}" class="w-full h-40 object-cover rounded-xl"/>
      </figure>
      <div class="flex flex-col gap-2 flex-1">
        <h3 data-id="${pid}" class="text-lg font-bold hover:underline cursor-pointer"> ${name} </h3>
        <p class="text-sm text-gray-600">${desc}${desc.length === 80 ? "..." : ""}</p>
        <div class="flex items-center my-2 justify-between">
          <span class="badge bg-green-200">${category}</span>
          <span class="font-bold"> ৳ ${price}</span>
        </div>
        <button class="btn btn-sm rounded-2xl text-white bg-green-700"
        onclick="addToCart('${name.replace(/'/g, "\\'")}', ${price}, '${category.replace(/'/g, "\\'")}'); alert('${name.replace(/'/g, "\\'")} added to cart!');"> Add to Cart </button>
      </div>
    `;
    treeCards.appendChild(card);
  });
};

//  Modal cart code
const allTreesContainer = document.getElementById("treeCards");

allTreesContainer.addEventListener("click", async (e) => {
  if (e.target.tagName === "H3") {
    const id = e.target.dataset.id;
    if (!id) return;
    const URL = `https://openapi.programming-hero.com/api/plant/${id}`;
    try {
      const res = await fetch(URL);
      const data = await res.json();
      const plant = data.data || data.plants || {};
      showModal(plant);
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

function showModal(plant) {
  const modal = document.getElementById("my_modal_6");
  const modalBox = document.getElementById("modal-box");
  modal.showModal();
  let imageURL = "https://via.placeholder.com/150";
  if (plant.image) {
    imageURL = plant.image;
  } else if (plant.images && plant.images.length > 0) {
    imageURL = plant.images[0];
  }

  modalBox.innerHTML = `
    <h1 id="modal-title" class="font-bold text-xl mb-2"> ${plant.name ?? "Unknown"} </h1>
    <div class="img">
      <img class="w-full h-48 object-cover rounded-lg mb-3" src="${imageURL}" alt="${plant.name ?? 'No Image'}">
    </div>
    <p class="mb-1"><strong>Category:</strong> ${plant.category ?? "Unknown"}</p>
    <p class="mb-1"><strong>Price:</strong> ৳${plant.price ?? 0}</p>
    <p class="mb-3"><strong>Description:</strong> ${plant.description ?? "No description available."}</p>
    <form method="dialog">
      <button class="btn bg-green-700 text-white hover:bg-green-900 rounded-full ml-[80%]">Close</button>
    </form>
  `;
};

//  Cart count code
function addToCart(name, price, category) {
  cart.push({ name, price, category });
  renderCart();
};

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
};

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  if (!cart.length) {
    cartList.innerHTML = "<p class='text-gray-500'>Your cart is empty.</p>";
  }

  cart.forEach((item, index) => {
    total += Number(item.price) || 0;
    const row = document.createElement("div");
    row.className = "flex justify-between items-center bg-green-100 rounded-xl p-2";
    row.innerHTML = `
      <span class="text-sm font-semibold">${item.name} </br> ৳${item.price} × 1</span>
      <button class="" title="Remove" onclick="removeFromCart(${index})">❌</button>
    `;
    cartList.appendChild(row);
  });

  totalPriceEl.textContent = "৳" + total;
};

loadCategories();

// Make functions global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;