let personCount = 0;

function addPerson() {
  personCount++;
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Name" id="name${personCount}" required>
    <input type="number" placeholder="Food" id="food${personCount}" min="0">
    <input type="number" placeholder="Travel" id="travel${personCount}" min="0">
    <input type="number" placeholder="Other" id="other${personCount}" min="0">
  `;
  document.getElementById("personList").appendChild(div);
}

function calculateSettlement() {
  let people = [];
  let total = 0;

  for (let i = 1; i <= personCount; i++) {
    const name = document.getElementById(`name${i}`).value;
    const food = parseFloat(document.getElementById(`food${i}`).value) || 0;
    const travel = parseFloat(document.getElementById(`travel${i}`).value) || 0;
    const other = parseFloat(document.getElementById(`other${i}`).value) || 0;
    const spent = food + travel + other;

    if (!name) continue;
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
    if (p.balance > 0) {
      creditors.push({ name: p.name, amount: p.balance });
    } else if (p.balance < 0) {
      debtors.push({ name: p.name, amount: -p.balance });
    }
  });

  let result = "";
  let summary = `<h3>📊 Summary</h3><p>Total: ₹${total.toFixed(2)}</p><p>Equal Share: ₹${equalShare.toFixed(2)}</p><ul>`;
  people.forEach(p => {
    summary += `<li>${p.name} spent ₹${p.spent.toFixed(2)} (${p.balance >= 0 ? 'gets' : 'owes'} ₹${Math.abs(p.balance).toFixed(2)})</li>`;
  });
  summary += `</ul>`;

  result += `<h3>💸 Settlements</h3>`;
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
