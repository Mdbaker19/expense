(() => {
    const firebaseDBCategory = 'https://react-sho-default-rtdb.firebaseio.com/category.json';
    const firebaseDBExpense = 'https://react-sho-default-rtdb.firebaseio.com/expense.json';
    let catChoice = document.getElementById("expenseType");
    let catSelection = '';
    let EXPENSES = [];
    let CATEGORIES = [];
    $("#filter").on("click", () => {
        EXPENSES = EXPENSES.filter(ex => ex.type === catSelection);
        console.log(EXPENSES);
        let sum = 0;
        for(let i = 0; i < EXPENSES.length; i++) {
            sum += +EXPENSES[i].amount;
        }
        document.getElementById("total").innerText = sum;
        loadPage(EXPENSES, CATEGORIES);
        allowExpenseChoices();
    });
    $("#reset").on("click", getExpenseData);

    document.getElementById("newCat").addEventListener("click", () => {
        document.getElementById("modal").style.display = "block";
    });
    $("#close").on("click", () => {
        document.getElementById("modal").style.display = "none";
    })
    $("#sendCatName").on("click", async () => {
        await fetch(firebaseDBCategory, {
            method: "POST",
            body: JSON.stringify({name: $("#catName").val()})
        });
        await getExpenseData();
        document.getElementById("modal").style.display = "none";
    });

    function loadPage(expenseData, categoryData) {
        $("#expenseData").html(render(expenseData, singleExpense));
        $("#expenseTypes").html(render(categoryData, singleButton));
    }

    function allowExpenseChoices() {
        Array.from(document.getElementsByClassName("expense-type")).forEach(type => {
           type.addEventListener("click", (e) => {
               catChoice.innerText = e.target.innerText;
               catSelection = e.target.innerText;
           })
        });
    }

    document.getElementById("submitExp").addEventListener("click", async () => {
        let expense = {
            day: new Date().toDateString(),
            amount: $("#amount").val(),
            type: catSelection
        };
        await fetch(firebaseDBExpense, {
            method: "POST",
            body: JSON.stringify(expense)
        });
        await getExpenseData();
    });

    function render(data, fn) {
        let html = '';
        for(let i = 0; i < data.length; i++) {
            html += fn(data[i]);
        }
        return html;
    }

    function singleButton(category) {
        return `<button class="expense-type">
                    ${category.name}
                </button>`;
    }

    function singleExpense(expense) {
        return `<div class="expense-item">
                    <h5>${expense.amount} ${expense.type}</h5>
                    <p>${expense.day}</p>
                </div>`;
    }

    function parseData(firebaseData) {
        let keys = [];
        let values = [];
        for(const [key, value] of Object.entries(firebaseData)) {
            keys.push(key);
            values.push(value);
        }
        return [keys, values];
    }

    async function getExpenseData() {
        const categories = await fetch(firebaseDBCategory);
        const categoryResponse = await categories.json();
        let [cKeys, cParsed] = parseData(categoryResponse);
        CATEGORIES = cParsed;
        const expenses = await fetch(firebaseDBExpense);
        const expenseResponse = await expenses.json();
        let [keys, parsed] = parseData(expenseResponse);
        EXPENSES = parsed;
        loadPage(parsed, cParsed);
        allowExpenseChoices();
    }

    getExpenseData().then(() => {
        console.log("done");
    })

})();