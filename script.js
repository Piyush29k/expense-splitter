// =====================================
// SPLITSMART PRO
// =====================================

let expenseChart = null;

// Unique ID generator to completely prevent duplicate ID bugs
function generateUniqueId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// =====================================
// ADD PERSON
// =====================================

function addPerson(savedData = null) {
    const personList = document.getElementById("personList");
    const uniqueId = savedData ? savedData.id : generateUniqueId();

    const personCard = document.createElement("div");
    personCard.className = "person-segment";
    personCard.id = `person-${uniqueId}`;

    personCard.innerHTML = `
        <div class="person">
            <input
                type="text"
                id="name-${uniqueId}"
                class="person-name"
                placeholder="Name"
                value="${savedData ? savedData.name : ''}">

            <input
                type="number"
                id="food-${uniqueId}"
                class="expense-input"
                placeholder="Food"
                min="0"
                value="${savedData ? savedData.food : ''}">

            <input
                type="number"
                id="travel-${uniqueId}"
                class="expense-input"
                placeholder="Travel"
                min="0"
                value="${savedData ? savedData.travel : ''}">

            <input
                type="number"
                id="other-${uniqueId}"
                class="expense-input"
                placeholder="Other"
                min="0"
                value="${savedData ? savedData.other : ''}">

            <button
                class="delete-btn"
                onclick="removePerson('${uniqueId}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    personList.appendChild(personCard);

    // Auto-save when values inside this specific card change
    personCard.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateLiveTotal();
            saveData();
        });
    });

    if (!savedData) {
        saveData();
    }
}

// =====================================
// REMOVE PERSON
// =====================================

function removePerson(id) {
    const card = document.getElementById(`person-${id}`);
    if (card) {
        card.remove();
    }
    updateLiveTotal();
    saveData();
}

// =====================================
// LIVE TOTAL
// =====================================

// Global listener handles real-time updates across all dynamically added inputs
document.addEventListener("input", function(e) {
    if (e.target.matches('input[type="number"]')) {
        updateLiveTotal();
    }
});

function updateLiveTotal() {
    let total = 0;

    document.querySelectorAll('input[type="number"]').forEach(input => {
        total += Number(input.value) || 0;
    });

    const liveTotalEl = document.getElementById("liveTotal");
    const grandTotalEl = document.getElementById("grandTotal");

    if (liveTotalEl) liveTotalEl.textContent = `₹${total.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${total.toFixed(2)}`;
}

// =====================================
// CALCULATE
// =====================================

function calculateSettlement() {
    let people = [];
    let total = 0;
    let foodTotal = 0;
    let travelTotal = 0;
    let otherTotal = 0;

    const segments = document.querySelectorAll(".person-segment");

    segments.forEach(card => {
        const id = card.id.replace("person-", "");
        
        const nameInput = document.getElementById(`name-${id}`);
        const foodInput = document.getElementById(`food-${id}`);
        const travelInput = document.getElementById(`travel-${id}`);
        const otherInput = document.getElementById(`other-${id}`);

        if (!nameInput || !nameInput.value.trim()) return;

        const name = nameInput.value.trim();
        const food = Number(foodInput?.value) || 0;
        const travel = Number(travelInput?.value) || 0;
        const other = Number(otherInput?.value) || 0;

        const spent = food + travel + other;

        total += spent;
        foodTotal += food;
        travelTotal += travel;
        otherTotal += other;

        people.push({
            name: name,
            spent: spent
        });
    });

    if (people.length === 0) {
        alert("Add participants with names first!");
        return;
    }

    const equalShare = total / people.length;
    let creditors = [];
    let debtors = [];

    people.forEach(person => {
        const balance = Number((person.spent - equalShare).toFixed(2));
        person.balance = balance;

        if (balance > 0) {
            creditors.push({ name: person.name, amount: balance });
        } else if (balance < 0) {
            debtors.push({ name: person.name, amount: -balance });
        }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Build Summary UI
    let summary = `
        <h3>Summary</h3>
        <p>Total Expense: ₹${total.toFixed(2)}</p>
        <p>Equal Share: ₹${equalShare.toFixed(2)}</p>
        <ul>
    `;

    people.forEach(person => {
        const percentage = total > 0 ? (person.spent / total) * 100 : 0;
        summary += `
            <li>
                <strong>${person.name}</strong> spent 
                ₹${person.spent.toFixed(2)} (${percentage.toFixed(1)}%)
            </li>
        `;
    });
    summary += "</ul>";

    // Greedy settlement calculation algorithm
    let result = "<h3>Settlement Results</h3>";
    let transactionCount = 0;
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        const pay = Math.min(debtors[i].amount, creditors[j].amount);

        if (pay > 0.01) {
            result += `
                <p>
                    <i class="fa-solid fa-money-bill-transfer"></i>
                    <strong>${debtors[i].name}</strong> pays 
                    <strong>₹${pay.toFixed(2)}</strong> to 
                    <strong>${creditors[j].name}</strong>
                </p>
            `;
            transactionCount++;
        }

        debtors[i].amount -= pay;
        creditors[j].amount -= pay;

        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    if (transactionCount === 0) {
        result += "<p>Everyone is completely settled up!</p>";
    }

    // UI Updates
    document.getElementById("summary").innerHTML = summary;
    document.getElementById("result").innerHTML = result;
    document.getElementById("participantCount").textContent = people.length;
    document.getElementById("avgShare").textContent = `₹${equalShare.toFixed(2)}`;
    document.getElementById("transactionCount").textContent = transactionCount;

    document.getElementById("activityLog").innerHTML = `
        <li>Settlement calculated at ${new Date().toLocaleTimeString()}</li>
    `;

    updateChart(foodTotal, travelTotal, otherTotal);
    saveData();
}

// =====================================
// CHART
// =====================================

function updateChart(food, travel, other) {
    const ctx = document.getElementById("expenseChart");
    if (!ctx) return;

    if (expenseChart) {
        expenseChart.destroy();
    }

    // Edge check: If all categories are 0, clear chart visuals safely
    if (food === 0 && travel === 0 && other === 0) return;

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Food", "Travel", "Other"],
            datasets: [{
                data: [food, travel, other],
                backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe"]
            }]
        }
    });
}

// =====================================
// SEARCH
// =====================================

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("keyup", function() {
        const value = this.value.toLowerCase();
        document.querySelectorAll(".person-segment").forEach(card => {
            const nameInput = card.querySelector('input[type="text"]');
            const nameText = nameInput ? nameInput.value.toLowerCase() : "";
            card.style.display = nameText.includes(value) ? "block" : "none";
        });
    });
}

// =====================================
// DARK MODE
// =====================================

function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark"));
}

// =====================================
// CSV EXPORT
// =====================================

function downloadCSV() {
    let csv = "Name,Food,Travel,Other,Total Expense\n";

    document.querySelectorAll(".person-segment").forEach(card => {
        const id = card.id.replace("person-", "");
        const name = document.getElementById(`name-${id}`).value || "Unnamed";
        const food = Number(document.getElementById(`food-${id}`).value) || 0;
        const travel = Number(document.getElementById(`travel-${id}`).value) || 0;
        const other = Number(document.getElementById(`other-${id}`).value) || 0;
        const total = food + travel + other;

        csv += `"${name.replace(/"/g, '""')}",${food},${travel},${other},${total}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SplitSmart_Report.csv";
    link.click();
}

// =====================================
// DATA PERSISTENCE (FIXED REWRITES)
// =====================================

function saveData() {
    const dataToSave = [];
    
    document.querySelectorAll(".person-segment").forEach(card => {
        const id = card.id.replace("person-", "");
        dataToSave.push({
            id: id,
            name: document.getElementById(`name-${id}`).value,
            food: document.getElementById(`food-${id}`).value,
            travel: document.getElementById(`travel-${id}`).value,
            other: document.getElementById(`other-${id}`).value
        });
    });

    localStorage.setItem("splitSmartDataPro", JSON.stringify(dataToSave));
}

function resetApp() {
    if (confirm("Clear all data and reset application?")) {
        localStorage.clear();
        location.reload();
    }
}

window.onload = () => {
    if (localStorage.getItem("theme") === "true") {
        document.body.classList.add("dark");
    }

    const savedJSON = localStorage.getItem("splitSmartDataPro");
    if (savedJSON) {
        try {
            const parsedData = JSON.parse(savedJSON);
            parsedData.forEach(personObj => {
                addPerson(personObj);
            });
        } catch (e) {
            console.error("Error loading cache", e);
        }
    }

    updateLiveTotal();
};


function downloadPDF() {

    if (!window.jspdf) {
        alert("jsPDF library not loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    // ======================
    // HEADER
    // ======================

    doc.setFillColor(0, 200, 150);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("SplitSmart Pro Report", 14, 18);

    doc.setFontSize(10);
    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        28
    );

    doc.setTextColor(0, 0, 0);

    // ======================
    // SUMMARY TABLE
    // ======================

    const summaryData = [
        [
            "Participants",
            document.getElementById("participantCount").textContent
        ],
        [
            "Total Expense",
            document.getElementById("liveTotal").textContent
        ],
        [
            "Average Share",
            document.getElementById("avgShare").textContent
        ],
        [
            "Transactions",
            document.getElementById("transactionCount").textContent
        ]
    ];

    doc.autoTable({
        startY: 45,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: {
            fillColor: [0, 200, 150]
        }
    });

    // ======================
    // PARTICIPANTS TABLE
    // ======================

    const participants = [];

    document
        .querySelectorAll(".person-segment")
        .forEach(card => {

            const inputs =
                card.querySelectorAll("input");

            const name =
                inputs[0].value || "N/A";

            const food =
                Number(inputs[1].value) || 0;

            const travel =
                Number(inputs[2].value) || 0;

            const other =
                Number(inputs[3].value) || 0;

            const total =
                food + travel + other;

            participants.push([
                name,
                `₹${food.toFixed(2)}`,
                `₹${travel.toFixed(2)}`,
                `₹${other.toFixed(2)}`,
                `₹${total.toFixed(2)}`
            ]);
        });

    doc.autoTable({
        startY:
            doc.lastAutoTable.finalY + 10,

        head: [[
            "Name",
            "Food",
            "Travel",
            "Other",
            "Total"
        ]],

        body: participants,

        theme: "striped",

        headStyles: {
            fillColor: [14, 165, 233]
        }
    });

    // ======================
    // PIE CHART PAGE
    // ======================

    const chartCanvas =
        document.getElementById(
            "expenseChart"
        );

    if (
        chartCanvas &&
        expenseChart
    ) {

        doc.addPage();

        doc.setFontSize(18);

        doc.text(
            "Expense Analysis",
            14,
            20
        );

        const chartImage =
            chartCanvas.toDataURL(
                "image/png",
                1.0
            );

        doc.addImage(
            chartImage,
            "PNG",
            20,
            30,
            170,
            120
        );

        doc.setFontSize(12);

        doc.text(
            "Expense Distribution Pie Chart",
            20,
            165
        );
    }

    // ======================
    // SETTLEMENT PAGE
    // ======================

    doc.addPage();

    const settlements = [];

    document
        .querySelectorAll("#result p")
        .forEach(item => {

            settlements.push([
                item.innerText
            ]);

        });

    if (settlements.length === 0) {

        settlements.push([
            "No settlements available."
        ]);

    }

    doc.autoTable({

        startY: 20,

        head: [[
            "Settlement Details"
        ]],

        body: settlements,

        theme: "grid",

        headStyles: {
            fillColor: [239, 68, 68]
        }
    });

    // ======================
    // FOOTER
    // ======================

    const pages =
        doc.internal.getNumberOfPages();

    for (
        let i = 1;
        i <= pages;
        i++
    ) {

        doc.setPage(i);

        doc.setFontSize(10);

        doc.text(
            `Page ${i} of ${pages}`,
            170,
            290
        );

        doc.text(
            "Generated by SplitSmart Pro",
            14,
            290
        );
    }

    doc.save(
        "SplitSmart_Professional_Report.pdf"
    );
}