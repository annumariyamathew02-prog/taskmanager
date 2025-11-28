const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const dateInput = document.getElementById('task-date');
const catInput = document.getElementById('task-category');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const reminderPopup = document.getElementById('reminder-popup');
const reminderText = document.getElementById('reminder-text');
const closePopup = document.getElementById('close-popup');

let tasks = [];
let currentFilter = 'all';

// Storage
function loadTasks() {
  const saved = localStorage.getItem('tasks');
  tasks = saved ? JSON.parse(saved) : [];
}
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// CRUD + UI
function addTask(title, desc, date, category) {
  tasks.push({
    id: Date.now(),
    title,
    desc,
    date,
    category,
    complete: false
  });
  saveTasks();
  renderTasks();
}

function editTask(id, newTitle, newDesc, newDate, newCategory) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    task.desc = newDesc;
    task.date = newDate;
    task.category = newCategory;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.complete = !task.complete;
    saveTasks();
    renderTasks();
  }
}

function filterTasks() {
  if (currentFilter === 'all') return tasks;
  if (currentFilter === 'complete') return tasks.filter(t => t.complete);
  if (currentFilter === 'pending' || currentFilter === 'incomplete') return tasks.filter(t => !t.complete);
  return tasks;
}


// Emoji for category
function categoryIcon(cat) {
  switch(cat) {
    case "Work": return "📄";
    case "Personal": return "😄";
    case "Fitness": return "🏋️";
    case "Shopping": return "🛒";
    case "Other": return "✨";
    default: return "📝";
  }
}

// Rendering
function renderTasks() {
  taskList.innerHTML = '';
  const filtered = filterTasks();
  filtered.forEach(task => {
    const item = document.createElement('li');
    item.className = 'task-item expert' + (task.complete ? ' complete' : '');
    item.innerHTML = `
      <div class="task-meta">
        <span class="chip category">${categoryIcon(task.category)} ${task.category}</span>
        <span class="task-date">📅 ${task.date}</span>
        <span class="chip ${task.complete ? 'complete' : 'pending'}">
          ${task.complete ? 'Completed' : 'Pending'}
        </span>
      </div>
      <div class="task-main">
        <span class="icon-task">${categoryIcon(task.category)}</span>
        <div>
          <strong>${task.title}</strong>
          <p class="task-desc">${task.desc}</p>
        </div>
      </div>
      <div class="task-actions expert-toolbar">
        <button title="Mark Complete" class="complete-btn">✅</button>
        <button title="Edit" class="edit-btn">✏️</button>
        <button title="Delete" class="delete-btn">🗑</button>
      </div>
    `;
    item.querySelector('.complete-btn').onclick = () => toggleComplete(task.id);
    item.querySelector('.edit-btn').onclick = () => showEditPopup(task);
    item.querySelector('.delete-btn').onclick = () => deleteTask(task.id);

    // Show reminder if deadline is near (due in next 24 hours & not complete)
    if (!task.complete && daysToDeadline(task.date) <= 1 && daysToDeadline(task.date) >= 0) {
      showReminder(`Task "${task.title}" is due soon!`);
    }

    taskList.appendChild(item);
  });
}

function daysToDeadline(dateStr) {
  const today = new Date();
  const due = new Date(dateStr);
  return Math.ceil((due - today) / (1000*60*60*24));
}

function showReminder(msg) {
  reminderText.innerText = msg;
  reminderPopup.classList.remove('hidden');
  setTimeout(() => {
    reminderPopup.classList.add('hidden');
  }, 4500);
}

function showEditPopup(task) {
  const newTitle = prompt('Edit Title:', task.title);
  if (newTitle !== null) {
    const newDesc = prompt('Edit Description:', task.desc);
    if (newDesc !== null) {
      const newDate = prompt('Edit Due Date (YYYY-MM-DD):', task.date);
      if (newDate !== null) {
        const newCat = prompt('Edit Category:', task.category);
        if (newCat !== null) {
          editTask(task.id, newTitle, newDesc, newDate, newCat);
        }
      }
    }
  }
}

// Filters
filterBtns.forEach(btn => {
  btn.onclick = function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    let f = this.id.replace('filter-', '').toLowerCase();
    currentFilter = f;
    renderTasks();
  };
});


form.onsubmit = function(e) {
  e.preventDefault();
  addTask(titleInput.value, descInput.value, dateInput.value, catInput.value);
  form.reset();
};

closePopup.onclick = function() {
  reminderPopup.classList.add('hidden');
};

loadTasks();
renderTasks();
