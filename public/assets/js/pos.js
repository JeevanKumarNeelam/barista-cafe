document.addEventListener("DOMContentLoaded", () => {

  if (typeof MENU === "undefined") {
    alert("MENU not loaded. Check items.js path.");
    return;
  }

  let cart = [];
  let selectedPaymentType = null;

  const CGST_RATE = 0.04;
  const SGST_RATE = 0.04;
  const POS_PIN = "1234";
  const BACKEND_URL = "http://localhost:5000";

  const $ = id => document.getElementById(id);

  /* ======================
     DOM REFERENCES
     ====================== */
  const items = $("items");
  const billItems = $("billItems");
  const summary = $("summary");

  const payBtn = $("payBtn");
  const clearBtn = $("clearCart");
  const printBillBtn = $("printBillBtn");
  const holdBillBtn = $("holdBillBtn");
  const recallBillBtn = $("recallBillBtn");

  const paymentModal = $("paymentModal");
  const cancelPayment = $("cancelPayment");

  const receiptModal = $("receiptModal");
  const receiptSummary = $("receiptSummary");
  const receiptQR = $("receiptQR");
  const confirmPaymentBtn = $("confirmPayment");
  const closeReceiptBtn = $("closeReceipt");

  const logoutBtn = $("logoutBtn");
  const lockBtn = $("lockBtn");
  const lockModal = $("lockModal");
  const unlockBtn = $("unlockBtn");
  const unlockPin = $("unlockPin");

  const categoryButtons = document.querySelectorAll(".categories button");
  const paymentButtons = document.querySelectorAll(".payment-options button");

  /* ======================
     LOCK / LOGOUT
     ====================== */
  logoutBtn.onclick = () => {
    if (confirm("Are you sure you want to logout?")) {
      cart = [];
      window.location.href = "index.html";
    }
  };

  lockBtn.onclick = () => {
    lockModal.classList.add("active");
    unlockPin.value = "";
    unlockPin.focus();
  };

  unlockBtn.onclick = () => {
    unlockPin.value === POS_PIN
      ? lockModal.classList.remove("active")
      : alert("Invalid PIN");
  };

  /* ======================
     LOAD CATEGORY
     ====================== */
  function loadCategory(category) {
    items.innerHTML = `<h4>${category}</h4>`;
    MENU[category].forEach(item => {
      const div = document.createElement("div");
      div.className = "item-row";
      div.dataset.name = item.name;
      div.dataset.price = item.price;
      div.innerHTML = `<span>${item.name}</span><span>₹${item.price}</span>`;
      items.appendChild(div);
    });
  }

  categoryButtons.forEach(btn => {
    btn.onclick = () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadCategory(btn.textContent.trim());
    };
  });

  /* ======================
     ADD ITEM
     ====================== */
  items.onclick = e => {
    const card = e.target.closest(".item-row");
    if (!card) return;

    const name = card.dataset.name;
    const price = Number(card.dataset.price);

    const found = cart.find(i => i.name === name);
    found ? found.qty++ : cart.push({ name, price, qty: 1 });

    renderBill();
  };

  /* ======================
     CHANGE QTY (FIXED)
     ====================== */
  function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
    renderBill();
  }

  /* ======================
     RENDER BILL (FIXED)
     ====================== */
  function renderBill() {
    billItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(i => {
      subtotal += i.price * i.qty;

      const row = document.createElement("div");
      row.className = "bill-item";

      const nameEl = document.createElement("span");
      nameEl.textContent = i.name;

      const qtyEl = document.createElement("div");
      qtyEl.className = "qty";

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "-";
      minusBtn.onclick = () => changeQty(i.name, -1);

      const qtyText = document.createElement("span");
      qtyText.textContent = i.qty;

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.onclick = () => changeQty(i.name, 1);

      qtyEl.append(minusBtn, qtyText, plusBtn);

      const priceEl = document.createElement("span");
      priceEl.textContent = `₹${i.price * i.qty}`;

      row.append(nameEl, qtyEl, priceEl);
      billItems.appendChild(row);
    });

    const cgst = Math.round(subtotal * CGST_RATE);
    const sgst = Math.round(subtotal * SGST_RATE);
    const total = subtotal + cgst + sgst;

    summary.innerHTML = `
      <p>Subtotal <span>₹${subtotal}</span></p>
      <p>CGST <span>₹${cgst}</span></p>
      <p>SGST <span>₹${sgst}</span></p>
      <h3>Total <span>₹${total}</span></h3>
    `;

    payBtn.disabled = !cart.length;
  }

  /* ======================
     CLEAR BILL
     ====================== */
  clearBtn.onclick = () => {
    if (!cart.length) return;
    if (confirm("Clear bill?")) {
      cart = [];
      renderBill();
    }
  };

  /* ======================
     HOLD / RECALL (FIXED)
     ====================== */
  holdBillBtn.onclick = () => {
    if (!cart.length) return alert("No items to hold");

    const heldBills = JSON.parse(localStorage.getItem("heldBills") || "[]");
    heldBills.push({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: JSON.parse(JSON.stringify(cart))
    });

    localStorage.setItem("heldBills", JSON.stringify(heldBills));
    cart = [];
    renderBill();
    alert("Bill held successfully");
  };

  recallBillBtn.onclick = () => {
    const heldBills = JSON.parse(localStorage.getItem("heldBills") || "[]");
    if (!heldBills.length) return alert("No held bills available");

    let list = "Select bill to recall:\n";
    heldBills.forEach((b, i) => {
      list += `${i + 1}. ${b.time}\n`;
    });

    const index = Number(prompt(list)) - 1;
    if (!heldBills[index]) return;

    cart = heldBills[index].items;
    heldBills.splice(index, 1);
    localStorage.setItem("heldBills", JSON.stringify(heldBills));
    renderBill();
  };

  /* ======================
     PRINT (DISABLED)
     ====================== */
  printBillBtn.onclick = () => {
    alert("Print will be enabled later.");
  };

  /* ======================
     PAYMENT
     ====================== */
  payBtn.onclick = () => paymentModal.classList.add("active");
  cancelPayment.onclick = () => paymentModal.classList.remove("active");

  paymentButtons.forEach(btn => {
    btn.onclick = () => {
      selectedPaymentType = btn.dataset.type;
      paymentModal.classList.remove("active");

      const totalText = summary.querySelector("h3 span").innerText;

      receiptSummary.innerHTML = `
        <h3>Total Amount</h3>
        <p style="font-size:22px;font-weight:700">${totalText}</p>
        <p>
          ${selectedPaymentType === "Cash"
            ? "Collect cash from customer"
            : selectedPaymentType === "Card"
            ? "Swipe card at the machine"
            : "Scan QR code to pay"}
        </p>
      `;

      receiptQR.innerHTML = "";
      receiptModal.classList.add("active");
    };
  });

  /* ======================
     CONFIRM PAYMENT
     ====================== */
  confirmPaymentBtn.onclick = () => {
    if (!cart.length) return;

    fetch(`${BACKEND_URL}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "POS",
        items: cart,
        total: cart.reduce((s, i) => s + i.price * i.qty, 0),
        payment: selectedPaymentType
      })
    });

    cart = [];
    receiptModal.classList.remove("active");
    renderBill();
  };

  closeReceiptBtn.onclick = () => receiptModal.classList.remove("active");

  /* ======================
     INIT
     ====================== */
  const firstCategory = Object.keys(MENU)[0];
  categoryButtons[0].classList.add("active");
  loadCategory(firstCategory);
  renderBill();

});
