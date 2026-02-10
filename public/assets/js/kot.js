const BACKEND_URL = "https://barista-cafe.onrender.com";

const currentOrdersEl = document.getElementById("currentOrders");
const completedOrdersEl = document.getElementById("completedOrders");
const logoutBtn = document.getElementById("logoutBtn");

let completedIds = new Set();

/* LOGOUT */
logoutBtn.onclick = () => {
  window.location.href = "index.html";
};

/* RENDER ORDERS */
function renderOrders(orders) {
  currentOrdersEl.innerHTML = "";
  completedOrdersEl.innerHTML = "";

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="order-header">
        Order #${order.id}
      </div>

      <div class="order-items">
        ${order.items.map(i =>
          `<div>
            <span>${i.name}</span>
            <span>x${i.qty}</span>
          </div>`
        ).join("")}
      </div>
    `;

    if (completedIds.has(order.id)) {
      card.classList.add("completed");
      completedOrdersEl.appendChild(card);
    } else {
      const btn = document.createElement("button");
      btn.className = "ready-btn";
      btn.innerText = "Mark Ready";
      btn.onclick = () => completedIds.add(order.id);
      card.appendChild(btn);
      currentOrdersEl.appendChild(card);
    }
  });
}

/* FETCH ORDERS */
function fetchOrders() {
  fetch(`${BACKEND_URL}/orders`)
    .then(res => res.json())
    .then(renderOrders)
    .catch(console.error);
}

fetchOrders();
setInterval(fetchOrders, 2000);
