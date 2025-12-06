const form = document.getElementById('productForm');
const productTable = document.getElementById('productTable');

// Google Apps Script endpoint for your sheet
const WEB_APP_URL = "/.netlify/functions/proxy";

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('add-name').value;
  const price = document.getElementById('add-price').value;
  const description = document.getElementById('add-description').value;
  const category = document.getElementById('add-category').value;
  const file = document.getElementById('add-imageFile').files[0];

  if (!file) return alert("Select an image!");

  try {
    // 1️⃣ Upload image to ImgBB
    const imageUrl = await uploadImgToHost(file); // direct image URL

    // 2️⃣ Send product info + image URL to Google Sheet
    const payload = {
      ID: Date.now(),
      Name: name,
      Price: price,
      Description: description,
      Category: category,
      ImageURL: imageUrl,
      UploadDate: new Date().toISOString()
    };

    const sheetResponse = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", ...payload })
    });

    const result = await sheetResponse.json();
    if (result.success) {
      showToast("Product added successfully!", "success");
      form.reset();
      fetchProducts();
    } else {
      showToast("Failed to save product to sheet.", "failure");
    }

  } catch (err) {
    console.error(err);
    showToast("Error uploading image or saving data.", "failure");
  }
});


// 3️⃣ Fetch products and display in table
async function fetchProducts() {
  try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        table.setData(data); // Tabulator automatically refreshes the table
    } catch (err) {
        console.error(err);
    }
}


// Update product
async function updateProduct(product) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", ...product })
    });
    const result = await response.json();
    if (result.success) {
      showToast("Product updated successfully!", "success");
      fetchProducts(); // refresh table
    } else {
      showToast(`Failed to update product: ${result.error}`, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error updating product.", "error");
  }
}

// Delete product
async function deleteProduct(productID) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ID: productID })
    });
    const result = await response.json();
    if (result.success) {
      showToast("Product deleted successfully!", "success");
      fetchProducts(); // refresh table
    } else {
      showToast(`Failed to delete product: ${result.error}`, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error deleting product.", "error");
  }
}

// Edit Modal Functions
function openEditModal(product){
    const modal = document.getElementById("editModal");
    modal.classList.remove("hidden");

    document.getElementById("edit-name").value = product.Name;
    document.getElementById("edit-price").value = product.Price;
    document.getElementById("edit-description").value = product.Description;
    document.getElementById("edit-category").value = product.Category;
    document.getElementById("edit-imagePreview").src = product.ImageURL;
    document.getElementById("edit-id").value = product.ID; // hidden input for tracking
}

function closeEditModal(){
    const modal = document.getElementById("editModal");
    modal.classList.add("hidden");
}

// Edit Modal Submit
const editForm = document.getElementById("editModal");
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // get image for update
  const imgFile = document.getElementById("edit-imageFile").files[0];
  const editPreview = document.getElementById("edit-imagePreview");

  imgURL = undefined;
  if (!imgFile) {
    imgURL = editPreview.src;
  }
  else{
    imgURL = await uploadImgToHost(imgFile);
  }

  // Gather updated values
  const updatedProduct = {
    ID: document.getElementById("edit-id").value,
    Name: document.getElementById("edit-name").value,
    Price: document.getElementById("edit-price").value,
    Description: document.getElementById("edit-description").value,
    Category: document.getElementById("edit-category").value,
    ImageURL: imgURL,
  };

  // Call the update function
  await updateProduct(updatedProduct);

  // Close modal
  document.getElementById("editModal").classList.add("hidden");
});

// Upload image to ImgBB
async function uploadImgToHost(file){
    const formData = new FormData();
    formData.append("image", file); // key is 'image'
    formData.append("key", "9d3fdcc4c4819328a472cde28eec0134"); // your API key

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });

    const imgData = await imgbbResponse.json();

    if (!imgData || !imgData.data || !imgData.data.url) {
      return alert("Image upload failed!");
    }

    return imgData.data.url; // direct image URL
}

// Handle File Box
document.getElementById("add-imageFile").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("imagePreview");

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  }
});

document.getElementById("edit-imageFile").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("edit-imagePreview");

  if (file) {
    preview.src = URL.createObjectURL(file);
  }
});

// Tabulator JS Table Init

const table = new Tabulator("#productTable", {
    height: "600px", // optional
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 20,
    movableColumns: true,
    resizableRows: true,
    placeholder: "No products found",
    columns: [
        { title: "Image", field: "ImageURL", formatter: "image", formatterParams: { height: "50px" } },
        { title: "Name", field: "Name", headerFilter: "input" },
        { title: "Price", field: "Price", headerFilter: "input" },

        {
            title: "Category",
            field: "Category",
            headerFilter: "select",
            headerFilterParams: {
                values: {
                    "": "All",
                    "Offers": "Offers",
                    "Baby & kids accessories": "Baby & kids accessories",
                    "Toys for boys": "Toys for boys",
                    "Toys for girls": "Toys for girls",
                    "Educational toys": "Educational toys",
                    "Wooden Toys": "Wooden Toys",
                    "Electric cars and scooter": "Electric cars and scooter",
                    "Bikes": "Bikes",
                    "Beds": "Beds",
                    "Strollers & Walkers": "Strollers & Walkers",
                    "High chairs & Car seats": "High chairs & Car seats"
                }
            }
        },

        { 
            title: "Actions", 
            field: "actions", 
            hozAlign: "center", 
            formatter: function(cell, formatterParams){
                const rowData = cell.getRow().getData(); // get the product data
                return `
                    <button class="edit-btn bg-green-500/10 text-green-600 font-semibold py-1 px-2 rounded-md hover:bg-green-500/20" 
                            data-id="${rowData.ID}" title="Edit">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="delete-btn bg-red-500/10 text-red-600 font-semibold py-1 px-2 rounded-md hover:bg-red-500/20" 
                            data-id="${rowData.ID}" title="Delete">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                `;
            },
            cellClick: function(e, cell){ 
                const target = e.target.closest("button");
                if(!target) return;

                const id = target.dataset.id;
                const rowData = cell.getRow().getData();

                if(target.classList.contains("edit-btn")){
                    // Open edit modal and populate fields
                    openEditModal(rowData);
                }

                if(target.classList.contains("delete-btn")){
                    deleteProduct(id);
                }
            }
        },
    ],
});

// Set Data
fetchProducts();

// Toast Function for Success

function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toast-container");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `
    px-4 py-2 rounded-lg shadow-lg text-white
    ${type === "success" ? "bg-green-500" : "bg-red-500"}
    animate-slide-in
  `;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after duration
  setTimeout(() => {
    toast.classList.add("animate-slide-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

// Login Logic
// Add your allowed emails here
const ALLOWED_EMAILS = [
  "mohamad.ayash987@gmail.com",
  "zammarosama@gmail.com"
];

// Wait for Identity to initialize
document.addEventListener("DOMContentLoaded", () => {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (user) checkAccess(user);
    });

    window.netlifyIdentity.on("login", user => {
      checkAccess(user);
    });

    window.netlifyIdentity.on("logout", () => {
      showLogin();
    });
  }
});

function checkAccess(user) {
  // Collect all possible email sources
  const possibleEmails = [
    user.email,
    user.user_metadata?.email,
    user.identities?.[0]?.email
  ].filter(Boolean);

  // console.log("Found user emails:", possibleEmails);

  // Is any email allowed?
  const isAllowed = possibleEmails.some(email =>
    ALLOWED_EMAILS.includes(email)
  );

  if (isAllowed) {
    hideLogin();
    showAdminContent();
  } else {
    alert("You do not have permission to access this page.");
    netlifyIdentity.logout();
  }
}

function showLogin() {
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("admin-section").classList.add("hidden");
}

function hideLogin() {
  document.getElementById("login-section").classList.add("hidden");
}

function showAdminContent() {
  document.getElementById("admin-section").classList.remove("hidden");
}

document.getElementById("login-btn").addEventListener("click", () => {
  if (window.netlifyIdentity) {
    try{
      // Always log out first to clear any previous session
      netlifyIdentity.logout().then(() => {
        netlifyIdentity.open("login");
      });
    }
    catch(e){
      netlifyIdentity.open("login");
    }
  }
});

// Auto logout on URL change / page unload
window.addEventListener("beforeunload", () => {
  if (window.netlifyIdentity) {
    netlifyIdentity.logout();
  }
});

// Optional: also handle SPA-like navigation (back/forward)
window.addEventListener("popstate", () => {
  if (window.netlifyIdentity) {
    netlifyIdentity.logout();
  }
});
