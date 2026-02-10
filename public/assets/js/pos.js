document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     SAFETY
  ====================== */
  if (typeof MENU === "undefined") {
    alert("MENU not loaded. Check items.js path.");
    return;
  }

  /* ======================
     DAILY RESET (ORDER ID)
  ====================== */
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem("pos_last_date");

  if (lastDate !== today) {
    localStorage.setItem("pos_last_date", today);
    localStorage.setItem("pos_order_counter", "0");
    localStorage.removeItem("heldBills");
  }

  /* ======================
     STATE
  ====================== */
  let cart = [];
  let selectedPaymentType = null;

  let orderCounter = Number(localStorage.getItem("pos_order_counter") || 0);

  const CGST_RATE = 0.04;
  const SGST_RATE = 0.04;
  const POS_PIN = "1234";
  const BACKEND_URL = "https://barista-cafe.onrender.com";

  const $ = id => document.getElementById(id);

  /* ======================
     DOM
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
     LOGOUT / LOCK
  ====================== */
  logoutBtn.onclick = () => {
    if (confirm("Logout POS?")) {
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
     CHANGE QTY
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
     RENDER BILL
  ====================== */
  function renderBill() {
    billItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(i => {
      subtotal += i.price * i.qty;

      const row = document.createElement("div");
      row.className = "bill-item";

      row.innerHTML = `
        <span>${i.name}</span>
        <div class="qty">
          <button class="minus">-</button>
          <span>${i.qty}</span>
          <button class="plus">+</button>
        </div>
        <span>₹${i.price * i.qty}</span>
      `;

      row.querySelector(".minus").onclick = () => changeQty(i.name, -1);
      row.querySelector(".plus").onclick = () => changeQty(i.name, 1);

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
     HOLD BILL (FIXED)
  ====================== */
  holdBillBtn.onclick = () => {
    if (!cart.length) return alert("No items to hold");

    const heldBills = JSON.parse(localStorage.getItem("heldBills") || "[]");

    heldBills.push({
      id: Date.now(),
      items: JSON.parse(JSON.stringify(cart))
    });

    localStorage.setItem("heldBills", JSON.stringify(heldBills));
    cart = [];
    renderBill();
  };

  /* ======================
     RECALL BILL (FIXED)
  ====================== */
  recallBillBtn.onclick = () => {
    const heldBills = JSON.parse(localStorage.getItem("heldBills") || "[]");
    if (!heldBills.length) return alert("No held bills");

    let list = "Select bill:\n";
    heldBills.forEach((b, i) => {
      list += `${i + 1}. Bill ${i + 1}\n`;
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
            : "Collect UPI payment"}
        </p>
      `;

      receiptQR.innerHTML = "";
      receiptModal.classList.add("active");
    };
  });

  /* ======================
     CONFIRM PAYMENT (SERIAL ORDER ID)
  ====================== */
  confirmPaymentBtn.onclick = () => {
    if (!cart.length) return;

    orderCounter++;
    localStorage.setItem("pos_order_counter", orderCounter);

    fetch(`${"https://barista-cafe.onrender.com"}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNo: orderCounter,
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
     KEYBOARD SHORTCUTS (FIXED)
  ====================== */
  document.addEventListener("keydown", e => {

    if (lockModal.classList.contains("active")) return;

    if (e.key === "Enter" && !paymentModal.classList.contains("active")) {
      payBtn.click();
    }

    if (e.key === "Escape") {
      paymentModal.classList.remove("active");
      receiptModal.classList.remove("active");
      lockModal.classList.remove("active");
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      clearBtn.click();
    }

    if (e.key === "F1") {
      e.preventDefault();
      logoutBtn.click();
    }

    if (e.key === "ArrowDown") holdBillBtn.click();
    if (e.key === "ArrowUp") recallBillBtn.click();
  });

  /* ======================
     INIT
  ====================== */
  categoryButtons[0].classList.add("active");
  loadCategory(categoryButtons[0].textContent.trim());
  renderBill();

});
