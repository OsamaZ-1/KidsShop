// 3️⃣ Fetch products
const WEB_APP_URL = "/.netlify/functions/proxy";
async function fetchProducts() {
  try {
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();

    // Map the API fields to the format used in our grid
    const formattedData = data.reverse().map(item => ({
      name: item.Name,
      price: `$${item.Price}`, // add $ sign
      image: item.ImageURL,
      category: item.Category
    }));

    return formattedData;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}


// Code to Load image batches for all available products ---------------------------------------------
let allProducts = [];   // store all fetched products
let displayedProducts = []; // currently shown products
let productsPerLoad = 10;
let lastLoadedIndex = 0;

async function initProducts() {
    allProducts = await fetchProducts(); // fetch from API
    displayedProducts = allProducts;     // initially show all
    lastLoadedIndex = 0;
    loadMoreProducts();                  // load first batch
}

// Function to render products
function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "flex flex-col gap-3 group";

    card.innerHTML = `
      <div class="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden group">

        <!-- Fixed Image Height -->
        <div class="w-full aspect-square overflow-hidden">
            <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                src="${product.image}"
                alt="${product.name}"
                onclick="openImageModal(this.src)"
                onerror="
                  if(!this.retries) this.retries = 7;  // store retries on element
                  if(this.retries-- > 0) {
                      setTimeout(() => { this.src='${product.image}'; }, 5000);
                  }
                "
            />
        </div>

        <!-- Info + Title -->
        <div class="flex flex-col flex-[1_1_auto] p-2">

            <!-- Title (flex-grow keeps bottom aligned) -->
            <p class="text-lg font-bold mb-2 overflow-hidden flex-grow">
                ${product.name}
            </p>

            <!-- Category / Price (fixed height, no shrinking) -->
            <div class="text-sm text-text-light/70 dark:text-text-dark/70 flex flex-col gap-1 flex-none">
                <p class="truncate">Category:</p>
                <p>${product.category}</p>
                <p class="font-bold text-base text-text-light dark:text-text-dark">${product.price}</p>
            </div>

            <!-- WhatsApp Button (fixed position) -->
            <button
                class="mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white hover:opacity-90 transition-opacity flex-none"
                onclick="openWhatsApp('Hi Kids Shop! I want this toy: ${product.name}')"
            >
                Order on &nbsp;&nbsp;&nbsp;
                <svg
                    class="w-6 h-6"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 2.832.743 5.475 2.035 7.819L0 32l8.396-2.005A15.957 15.957 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.455c-3.27 0-6.29-1.03-8.815-2.775l-.63-.405-4.98 1.19 1.21-4.84-.41-.63A13.423 13.423 0 012.545 16c0-7.44 6.015-13.455 13.455-13.455S29.455 8.56 29.455 16 23.44 29.455 16 29.455z"/>
                    <path d="M23.02 20.493c-.37-.185-2.178-1.08-2.517-1.2-.338-.12-.584-.184-.83.185s-.95 1.2-1.164 1.446c-.215.247-.43.278-.8.093-.37-.185-1.566-.576-2.987-1.837-1.105-.984-1.85-2.193-2.067-2.44-.215-.247-.018-.38.13-.565.134-.185.298-.48.446-.732.149-.247.198-.37.298-.617.099-.247.05-.466-.025-.634-.074-.185-.672-.996-.92-1.356-.248-.36-.487-.31-.672-.32-.174-.006-.372-.007-.57-.007s-.52.074-.793.372c-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
            </button>

        </div>
    </div>

    `;

    grid.appendChild(card);
  });
}

function loadMoreProducts() {
    const grid = document.getElementById("product-grid");
    const nextProducts = displayedProducts.slice(lastLoadedIndex, lastLoadedIndex + productsPerLoad);

    renderProducts(nextProducts);

    lastLoadedIndex += nextProducts.length;

    // Hide Load More if done
    const loadBtn = document.getElementById("load-more-btn");
    if(lastLoadedIndex >= displayedProducts.length) {
        loadBtn.style.display = "none";
    } else {
        loadBtn.style.display = "flex"; // show again
    }
}

// Load more button click
document.getElementById("load-more-btn").addEventListener("click", loadMoreProducts);

// Initiate
initProducts();

// ---------------------------------------------------------------------------------------------

// Filter Categories function
function filterCategories(category, event) {
    // Reset load state
    lastLoadedIndex = 0;

    // Filter products
    if (category === "All") {
        displayedProducts = allProducts;
    } else {
        displayedProducts = allProducts.filter(p => p.category === category);
    }

    // Clear grid
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    // Load first batch of filtered products
    loadMoreProducts();

    // Update button styles
    const buttons = document.querySelectorAll("#shop-section .flex.cursor-pointer");
    buttons.forEach(btn => {
        btn.classList.remove("bg-secondary/20", "text-secondary-darker");
        btn.classList.add("bg-subtle-light", "dark:bg-subtle-dark");
    });

    // Highlight the clicked button
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.remove("bg-subtle-light", "dark:bg-subtle-dark");
    clickedBtn.classList.add("bg-secondary/20", "text-secondary-darker");
}


function openWhatsApp(message = "") {
  const phoneNumber = "96171713383"; // WhatsApp number (no spaces or symbols)
  let url = `https://wa.me/${phoneNumber}`;

  // If message is provided, encode it and add to the URL
  if (message.trim() !== "") {
    const encodedMessage = encodeURIComponent(message);
    url += `?text=${encodedMessage}`;
  }

  window.open(url, "_blank"); // Opens WhatsApp in a new tab/window
}

function scrollToElement(id, offset = 0) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const scrollPosition = elementPosition - offset; // scroll a bit above
    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth"
    });
  }
}

// Open Larger item image
function openImageModal(imgSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");

  modalImg.src = imgSrc;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}


// Scroll Filter Buttons with mouse
const slider = document.getElementById("chips-scroll");
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  slider.classList.add("cursor-grabbing");
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
  isDown = false;
  slider.classList.remove("cursor-grabbing");
  document.body.style.userSelect = ""; // ✅ restore
});

slider.addEventListener("mouseup", () => {
  isDown = false;
  slider.classList.remove("cursor-grabbing");
  document.body.style.userSelect = ""; // ✅ restore
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // drag speed
  slider.scrollLeft = scrollLeft - walk;
});
