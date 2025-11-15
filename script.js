const { jwtDecode } = require('jwt-decode');

let currentUserEmail = null;

// Function to handle the credential response from Google
function handleCredentialResponse(response) {
    // Decode the JWT token to get user information
    const responsePayload = jwtDecode(response.credential);

    // Store user information
    currentUserEmail = responsePayload.email;

    // Hide the login screen and show the to-do screen
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('todo-screen').style.display = 'block';

    // Display the user's name
    document.getElementById('username').textContent = responsePayload.name;

    // Load the to-do list from localStorage
    loadTodos();
}

// Attach the function to the window object
window.handleCredentialResponse = handleCredentialResponse;

// Function to handle logout
function handleLogout() {
    // For now, we'll just reload the page to go back to the login screen
    currentUserEmail = null;
    location.reload();
}

// Add event listener for the logout button
document.getElementById('logout-button').addEventListener('click', handleLogout);

// To-Do List Functionality
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');

addTodoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', handleTodoClick);

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
        const todoItem = createTodoItem({ text: todoText, completed: false, createdAt: new Date().toLocaleString() });
        todoList.appendChild(todoItem);
        saveTodos();
        todoInput.value = '';
    }
}

function createTodoItem(todo) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${todo.text}</span>
        <span class="timestamp">Created: ${todo.createdAt}</span>
    `;
    if (todo.completed) {
        li.classList.add('completed');
        if (todo.completedAt) {
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('timestamp', 'completion-timestamp');
            timestampSpan.textContent = `Completed: ${todo.completedAt}`;
            li.appendChild(timestampSpan);
        }
    }
    return li;
}

function handleTodoClick(event) {
    const target = event.target;
    if (target.tagName === 'SPAN' && !target.classList.contains('timestamp')) {
        const li = target.parentElement;
        li.classList.toggle('completed');

        const now = new Date();
        const timestamp = now.toLocaleString();
        let timestampSpan = li.querySelector('.completion-timestamp');

        if (li.classList.contains('completed')) {
            if (!timestampSpan) {
                timestampSpan = document.createElement('span');
                timestampSpan.classList.add('timestamp', 'completion-timestamp');
                li.appendChild(timestampSpan);
            }
            timestampSpan.textContent = `Completed: ${timestamp}`;
        } else {
            if (timestampSpan) {
                li.removeChild(timestampSpan);
            }
        }
        saveTodos();
    }
}

function saveTodos() {
    if (!currentUserEmail) return;
    const todos = [];
    todoList.querySelectorAll('li').forEach(li => {
        const todo = {
            text: li.querySelector('span:first-child').textContent,
            completed: li.classList.contains('completed'),
            createdAt: li.querySelector('.timestamp').textContent.replace('Created: ', ''),
            completedAt: li.classList.contains('completed') && li.querySelector('.completion-timestamp') ? li.querySelector('.completion-timestamp').textContent.replace('Completed: ', '') : null
        };
        todos.push(todo);
    });
    localStorage.setItem(`todos_${currentUserEmail}`, JSON.stringify(todos));
}

function loadTodos() {
    if (!currentUserEmail) return;
    const todos = JSON.parse(localStorage.getItem(`todos_${currentUserEmail}`)) || [];
    todos.forEach(todo => {
        const todoItem = createTodoItem(todo);
        todoList.appendChild(todoItem);
    });
}