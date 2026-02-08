document.addEventListener("DOMContentLoaded", () => {

  const totalOrders = document.getElementById("totalOrders");
  const totalSales = document.getElementById("totalSales");
  const cashTotal = document.getElementById("cashTotal");
  const upiTotal = document.getElementById("upiTotal");
  const cardTotal = document.getElementById("cardTotal");
  const ordersTable = document.getElementById("ordersTable");

  const BACKEND_URL = "http://localhost:5000";

  function renderAdminData(orders) {
    let cash = 0, upi = 0, card = 0, sales = 0;
    ordersTable.innerHTML = "";

    if (!orders.length) {
      totalOrders.innerText = "0";
      totalSales.innerText = "₹0";
      cashTotal.innerText = "₹0";
      upiTotal.innerText = "₹0";
      cardTotal.innerText = "₹0";
      return;
    }

    orders.slice().reverse().forEach(o => {
      const amount = Number(o.total) || 0;
      sales += amount;

      if (o.payment === "Cash") cash += amount;
      if (o.payment === "UPI") upi += amount;
      if (o.payment === "Card") card += amount;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${o.id}</td>
        <td>${o.time}</td>
        <td>${o.payment}</td>
        <td>₹${amount}</td>
      `;
      ordersTable.appendChild(row);
    });

    totalOrders.innerText = orders.length;
    totalSales.innerText = `₹${sales}`;
    cashTotal.innerText = `₹${cash}`;
    upiTotal.innerText = `₹${upi}`;
    cardTotal.innerText = `₹${card}`;
  }

  function fetchOrders() {
    fetch(`${BACKEND_URL}/orders`)
      .then(res => res.json())
      .then(renderAdminData)
      .catch(err => console.error("Fetch orders failed", err));
  }

  fetchOrders();
  setInterval(fetchOrders, 1000);

  /* ✅ CLEAR ORDERS */
  document.getElementById("clearOrders").onclick = async () => {
    if (!confirm("Clear all order data?")) return;

    try {
      await fetch(`${BACKEND_URL}/orders`, { method: "DELETE" });
      fetchOrders();
    } catch (e) {
      alert("Failed to clear orders");
    }
  };

  document.getElementById("logoutAdmin").onclick = () => {
    window.location.href = "index.html";
  };

});
