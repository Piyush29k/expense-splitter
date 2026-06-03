from pathlib import Path

code = r'''"""
SplitSmart Pro (Python CLI Version)
"""

def calculate_settlement():
    n = int(input("Number of participants: "))
    people = []
    total = 0

    for i in range(n):
        name = input(f"Name {i+1}: ")
        food = float(input("Food: ") or 0)
        travel = float(input("Travel: ") or 0)
        other = float(input("Other: ") or 0)

        spent = food + travel + other
        total += spent

        people.append({
            "name": name,
            "spent": spent
        })

    share = total / n

    creditors = []
    debtors = []

    for p in people:
        bal = round(p["spent"] - share, 2)

        if bal > 0:
            creditors.append([p["name"], bal])
        elif bal < 0:
            debtors.append([p["name"], -bal])

    i = j = 0

    print("\n=== Settlement ===")

    while i < len(debtors) and j < len(creditors):
        pay = min(debtors[i][1], creditors[j][1])

        print(
            f"{debtors[i][0]} pays ₹{pay:.2f} to {creditors[j][0]}"
        )

        debtors[i][1] -= pay
        creditors[j][1] -= pay

        if debtors[i][1] < 0.01:
            i += 1

        if creditors[j][1] < 0.01:
            j += 1


if __name__ == "__main__":
    calculate_settlement()
'''

path = "/mnt/data/SplitSmartPro.py"
Path(path).write_text(code, encoding="utf-8")
print(path)
