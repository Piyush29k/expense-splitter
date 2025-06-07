let personCount = 0;

function addPerson() {
  personCount++;
  const div = document.createElement("div");
  div.className = "person-segment";
  div.id = `person-${personCount}`;

  div.innerHTML = `
    <div class="person">
      <input type="text" placeholder="Name" id="name${personCount}" required>
      <input type="number" placeholder="Food" id="food${personCount}" min="0">
      <input type="number" placeholder="Travel" id="travel${personCount}" min="0">
      <input type="number" placeholder="Other" id="other${personCount}" min="0">
      <button type="button" class="delete-btn" onclick="removePerson(${personCount})">❌</button>
    </div>
  `;

  document.getElementById("personList").appendChild(div);
}

function removePerson(id) {
  const div = document.getElementById(`person-${id}`);
  if (div) div.remove();
}

function calculateSettlement() {
  let people = [];
  let total = 0;

  for (let i = 1; i <= personCount; i++) {
    const nameEl = document.getElementById(`name${i}`);
    const foodEl = document.getElementById(`food${i}`);
    const travelEl = document.getElementById(`travel${i}`);
    const otherEl = document.getElementById(`other${i}`);

    if (!nameEl) continue;

    const name = nameEl.value;
    const food = parseFloat(foodEl?.value) || 0;
    const travel = parseFloat(travelEl?.value) || 0;
    const other = parseFloat(otherEl?.value) || 0;
    const spent = food + travel + other;

    if (!name.trim()) continue;

    people.push({ name, spent, balance: 0 });
    total += spent;
  }

  if (people.length === 0) {
    document.getElementById("result").innerHTML = "<p>No valid data entered.</p>";
    return;
  }

  const equalShare = total / people.length;
  const creditors = [], debtors = [];

  people.forEach(p => {
    p.balance = +(p.spent - equalShare).toFixed(2);
    if (p.balance > 0) creditors.push({ name: p.name, amount: p.balance });
    else if (p.balance < 0) debtors.push({ name: p.name, amount: -p.balance });
  });

  let result = `<h3>💸 Settlements</h3>`;
  let summary = `<h3>📊 Summary</h3><p>Total: ₹${total.toFixed(2)}</p><p>Equal Share: ₹${equalShare.toFixed(2)}</p><ul>`;
  people.forEach(p => {
    summary += `<li>${p.name} spent ₹${p.spent.toFixed(2)} (${p.balance >= 0 ? 'gets' : 'owes'} ₹${Math.abs(p.balance).toFixed(2)})</li>`;
  });
  summary += `</ul>`;

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    let pay = Math.min(debtors[i].amount, creditors[j].amount);
    result += `<p>👉 <b>${debtors[i].name}</b> pays ₹${pay.toFixed(2)} to <b>${creditors[j].name}</b></p>`;
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  document.getElementById("summary").innerHTML = summary;
  document.getElementById("result").innerHTML = result;
}

function resetApp() {
  personCount = 0;
  document.getElementById("personList").innerHTML = "";
  document.getElementById("summary").innerHTML = "";
  document.getElementById("result").innerHTML = "";
}



function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const summaryElement = document.getElementById("summary");
  const resultElement = document.getElementById("result");

  if (!summaryElement.innerText && !resultElement.innerText) {
    alert("Please calculate settlements first!");
    return;
  }

  let y = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Smart Expense Splitter Report", 10, y);

  y += 12;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 10, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  const summaryLines = summaryElement.innerText
    .replace(/📊|💸|👉/g, "") // remove emojis
    .split("\n");

  summaryLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 10, y);
    y += wrapped.length * 7;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Settlements", 10, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  const resultLines = resultElement.innerText
    .replace(/📊|💸|👉/g, "")
    .split("\n");

  resultLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 10, y);
    y += wrapped.length * 7;
  });

  doc.save("SmartExpenseReport.pdf");
}
