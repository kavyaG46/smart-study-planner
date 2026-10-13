const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const searchTask = document.getElementById("searchTask");
const themeBtn = document.getElementById("themeBtn");

let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let currentFilter = "All";

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

document.getElementById("taskDate").min =
    new Date().toLocaleDateString("en-CA");

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";
}

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("taskName").value.trim();
    const subject = document.getElementById("subject").value;
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("priority").value;

    if (!name || !subject || !date) {
        alert("Please fill in all the required fields.");
        return;
    }

    tasks.push({
        id: Date.now(),
        name,
        subject,
        date,
        priority,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskForm.reset();

    document.getElementById("priority").value = "Medium";
});

function renderTasks() {
    const query = searchTask.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.name.toLowerCase().includes(query) ||
            task.subject.toLowerCase().includes(query);

        const matchesFilter =
            currentFilter === "All" ||
            (currentFilter === "Completed" && task.completed) ||
            (currentFilter === "Pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <span>📖</span>
                <h3>No tasks found!</h3>
                <p>Add a new task or change your search.</p>
            </div>
        `;
    }

    filteredTasks
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(task => {
            const item = document.createElement("div");

            item.className =
                "task-item" + (task.completed ? " done" : "");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-check";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", "Mark task complete");

            checkbox.addEventListener("change", () => {
                task.completed = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const details = document.createElement("div");
            details.className = "task-details";

            const title = document.createElement("h3");
            title.textContent = task.name;

            const info = document.createElement("p");
            info.textContent =
                `${task.subject} • ${formatDate(task.date)}`;

            const badge = document.createElement("span");
            badge.className = `priority ${task.priority}`;
            badge.textContent = task.priority + " Priority";

            details.append(title, info, badge);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "🗑️";
            deleteBtn.setAttribute("aria-label", "Delete task");

            deleteBtn.addEventListener("click", () => {
                if (confirm("Do you want to delete this task?")) {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    renderTasks();
                }
            });

            item.append(checkbox, details, deleteBtn);
            taskList.appendChild(item);
        });

    updateDashboard();
}

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

searchTask.addEventListener("input", renderTasks);

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeBtn.textContent = isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    localStorage.setItem("studyTheme", isDark ? "dark" : "light");
});

if (localStorage.getItem("studyTheme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️ Light Mode";
}

renderTasks();
