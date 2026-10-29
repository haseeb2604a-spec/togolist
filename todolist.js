const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("input");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const taskList = document.getElementById("dynamiclist");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("todoListTasks")) || [];
} catch (error) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("todoListTasks", JSON.stringify(tasks));
}

function addTask(taskText) {
    const task = {
        id: Date.now() + Math.random(),
        text: taskText,
        completed: false
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    addTask(taskText);
    taskInput.value = "";
    taskInput.focus();
});

function renderTasks() {
    taskList.innerHTML = "";

    const searchTerm = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;

    const visibleTasks = tasks.filter(function (task) {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        const matchesFilter =
            filter === "all" ||
            (filter === "pending" && !task.completed) ||
            (filter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    visibleTasks.forEach(function (task) {
        const row = document.createElement("div");
        row.className = "flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4 transition hover:border-slate-500 sm:flex-row sm:items-center sm:justify-between";

        const left = document.createElement("div");
        left.className = "flex min-w-0 items-start gap-3";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as complete");
        checkbox.className = "mt-1 h-5 w-5 shrink-0 cursor-pointer accent-emerald-400";

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("p");
        text.textContent = task.text;
        text.className = "break-words leading-6";

        if (task.completed) {
            text.classList.add("text-slate-400", "line-through");
        } else {
            text.classList.add("text-white");
        }

        const status = document.createElement("span");
        status.textContent = task.completed ? "Completed" : "Pending";
        status.className = task.completed
            ? "mt-2 inline-block rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
            : "mt-2 inline-block rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300";

        const textWrap = document.createElement("div");
        textWrap.className = "min-w-0";
        textWrap.appendChild(text);
        textWrap.appendChild(status);

        left.appendChild(checkbox);
        left.appendChild(textWrap);

        const actions = document.createElement("div");
        actions.className = "flex shrink-0 flex-wrap gap-2 pl-8 sm:pl-0";

        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.textContent = task.completed ? "Undo" : "Complete";
        toggleButton.className = task.completed
            ? "rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            : "rounded-lg bg-emerald-400 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300";

        toggleButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "rounded-lg border border-rose-400/40 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10";

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });
            saveTasks();
            renderTasks();
        });

        actions.appendChild(toggleButton);
        actions.appendChild(deleteButton);
        row.appendChild(left);
        row.appendChild(actions);
        taskList.appendChild(row);
    });

    emptyMessage.classList.toggle("hidden", visibleTasks.length > 0);

    if (visibleTasks.length === 0) {
        if (searchTerm !== "") {
            emptyMessage.textContent = "No tasks match your search.";
        } else if (filter === "completed") {
            emptyMessage.textContent = "No completed tasks yet.";
        } else if (filter === "pending") {
            emptyMessage.textContent = "No pending tasks. Great job!";
        } else {
            emptyMessage.textContent = "No tasks yet. Add your first task above!";
        }
    }

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("totalCount").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("progressText").textContent = percentage + "%";
    document.getElementById("progressBar").style.width = percentage + "%";
}

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

document.getElementById("clearCompleted").addEventListener("click", function () {
    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;

    if (completedCount === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    if (confirm("Delete all completed tasks?")) {
        tasks = tasks.filter(function (task) {
            return !task.completed;
        });
        saveTasks();
        renderTasks();
    }
});

renderTasks();
