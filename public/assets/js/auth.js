const users = [
  { username: "admin", pin: "1234", role: "admin" },
  { username: "cashier", pin: "1111", role: "pos" }
];

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const pin = document.getElementById("pin").value;
  const error = document.getElementById("error");

  const user = users.find(
    u => u.username === username && u.pin === pin
  );

  if (!user) {
    error.textContent = "Invalid username or PIN";
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "pos.html";
  }
});
