const BACKEND_URL = "https://barista-cafe.onrender.com";

const currentOrdersEl = document.getElementById("currentOrders");
const completedOrdersEl = document.getElementById("completedOrders");
const clearCompletedBtn = document.getElementById("clearCompleted");

let completedIds = new Set();

/* FETCH ORDERS */
async function fetchOrders() {
  const res = await fetch(`${BACKEND_URL}/orders`);
  const orders = await res.json();
  renderOrders(orders);
}

/* RENDER */
function renderOrders(orders) {
  currentOrdersEl.innerHTML = "";
  completedOrdersEl.innerHTML = "";

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    if (completedIds.has(order.id)) {
      card.classList.add("completed");
    }

    card.innerHTML = `
      <div class="order-header">
        <span>Order #${order.id}</span>
        <span>${order.time}</span>
      </div>
      <div class="order-items">
        ${order.items
          .map(i => `<div><span>${i.name}</span><span>x${i.qty}</span></div>`)
          .join("")}
      </div>
    `;

    if (!completedIds.has(order.id)) {
      const btn = document.createElement("button");
      btn.textContent = "Mark Ready";
      btn.onclick = () => {
        completedIds.add(order.id);
        renderOrders(orders);
      };
      card.appendChild(btn);
      currentOrdersEl.appendChild(card);
    } else {
      completedOrdersEl.appendChild(card);
    }
  });
}

/* CLEAR COMPLETED */
clearCompletedBtn.onclick = () => {
  completedIds.clear();
  completedOrdersEl.innerHTML = "";
};

/* AUTO REFRESH */
fetchOrders();
setInterval(fetchOrders, 2000);
