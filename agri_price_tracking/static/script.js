let allProducts = [];
let currentCategory = "all";

async function loadProducts() {
    const response = await fetch("/prices");
    const data = await response.json();
    allProducts = data;
    displayProducts();
}

function setCategory(category) {
    currentCategory = category;
    displayProducts();
}

function displayProducts() {
    const tableBody = document.getElementById("tableBody");
    const searchText = document.getElementById("search").value.toLowerCase();

    tableBody.innerHTML = "";

    const filtered = allProducts.filter(p => {
        const matchesCategory =
            currentCategory === "all" || p.category === currentCategory;

        const matchesSearch =
            p.name.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">No products found</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(p => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.name}</td>
            <td>₹${p.current_price}</td>
            <td class="${p.percentage_change >= 0 ? 'green' : 'red'}">
                ${p.percentage_change}%
            </td>
            <td class="${p.price_difference >= 0 ? 'green' : 'red'}">
                ${p.price_difference >= 0 ? '↑' : '↓'} ₹${Math.abs(p.price_difference)}
            </td>
            <td>${new Date(p.last_updated).toLocaleTimeString()}</td>
        `;

        tableBody.appendChild(row);
    });
}

document.getElementById("search").addEventListener("input", displayProducts);

window.onload = loadProducts;