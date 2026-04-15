// State Management
let tasks = [];
let currentEditingId = null;
let currentTargetCol = null;

// Selectors
const modal = document.getElementById('task-modal');
const counter = document.getElementById('task-counter');
const priorityFilter = document.getElementById('priority-filter');

/**
 * Task 2: Core CRUD Operations
 */

function createTaskCard(taskObj) {
    const li = document.createElement('li');
    li.classList.add('task-card');
    li.setAttribute('data-id', taskObj.id);
    li.setAttribute('data-priority', taskObj.priority);

    const title = document.createElement('h4');
    title.classList.add('editable-title');
    title.textContent = taskObj.title;

    const desc = document.createElement('p');
    desc.textContent = taskObj.description;

    const badge = document.createElement('span');
    badge.classList.add('priority-badge', taskObj.priority);
    badge.textContent = taskObj.priority.toUpperCase();

    const date = document.createElement('small');
    date.textContent = `Due: ${taskObj.dueDate}`;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('data-id', taskObj.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('data-id', taskObj.id);

    // Append all items
    [title, desc, badge, date, editBtn, deleteBtn].forEach(el => li.appendChild(el));
    
    return li;
}

function addTask(columnId, taskObj) {
    tasks.push(taskObj);
    const list = document.querySelector(`#${columnId} ul`);
    list.appendChild(createTaskCard(taskObj));
    updateGlobalCounter();
}

function deleteTask(taskId) {
    const card = document.querySelector(`li[data-id="${taskId}"]`);
    card.classList.add('fade-out');
    
    card.addEventListener('animationend', () => {
        card.remove();
        tasks = tasks.filter(t => t.id !== taskId);
        updateGlobalCounter();
    });
}

/**
 * Task 3: Event Handling & Delegation
 */

// Delegation for Edit/Delete
document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        const id = parseInt(e.target.getAttribute('data-id'));
        
        if (action === 'delete') deleteTask(id);
        if (action === 'edit') openModal(id);
    });

    // Inline Editing
    list.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('editable-title')) {
            enterInlineEdit(e.target);
        }
    });
});

function enterInlineEdit(element) {
    const currentVal = element.textContent;
    const input = document.createElement('input');
    input.value = currentVal;
    
    const commit = () => {
        element.textContent = input.value;
        input.replaceWith(element);
        // Update task in array
        const id = parseInt(element.closest('li').getAttribute('data-id'));
        const task = tasks.find(t => t.id === id);
        if (task) task.title = input.value;
    };

    input.addEventListener('keydown', (e) => { if(e.key === 'Enter') commit(); });
    input.addEventListener('blur', commit);

    element.replaceWith(input);
    input.focus();
}

// Priority Filter
priorityFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    document.querySelectorAll('.task-card').forEach(card => {
        const match = val === 'all' || card.getAttribute('data-priority') === val;
        card.classList.toggle('is-hidden', !match);
    });
});

// Clear Done (Staggered)
document.getElementById('clear-done').addEventListener('click', () => {
    const cards = document.querySelectorAll('#done .task-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            deleteTask(parseInt(card.getAttribute('data-id')));
        }, index * 100);
    });
});

// Helper: Modal Logic
function openModal(id = null) {
    if (id) {
        const task = tasks.find(t => t.id === id);
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-desc-input').value = task.description;
        currentEditingId = id;
    } else {
        currentEditingId = null;
        document.getElementById('task-title-input').value = '';
        document.getElementById('task-desc-input').value = '';
    }
    modal.classList.remove('is-hidden');
}

document.getElementById('save-task').addEventListener('click', () => {
    const taskObj = {
        id: currentEditingId || Date.now(),
        title: document.getElementById('task-title-input').value,
        description: document.getElementById('task-desc-input').value,
        priority: document.getElementById('task-priority-input').value,
        dueDate: document.getElementById('task-date-input').value
    };

    if (currentEditingId) {
        // Update Logic
        const index = tasks.findIndex(t => t.id === currentEditingId);
        tasks[index] = taskObj;
        const oldCard = document.querySelector(`li[data-id="${currentEditingId}"]`);
        oldCard.replaceWith(createTaskCard(taskObj));
    } else {
        addTask(currentTargetCol, taskObj);
    }
    modal.classList.add('is-hidden');
});

// Column "Add" buttons
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentTargetCol = btn.getAttribute('data-col');
        openModal();
    });
});

function updateGlobalCounter() {
    counter.textContent = tasks.length;
}
// Close modal when Cancel is clicked
document.getElementById('cancel-task').addEventListener('click', () => {
    modal.classList.add('is-hidden');
    currentEditingId = null; // Reset editing state
});

// Optional: Close modal if user clicks outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('is-hidden');
    }
});
