(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecode = exports.InvalidTokenError = void 0;
class InvalidTokenError extends Error {
}
exports.InvalidTokenError = InvalidTokenError;
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}
function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length");
    }
    try {
        return b64DecodeUnicode(output);
    }
    catch (err) {
        return atob(output);
    }
}
function jwtDecode(token, options) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
        decoded = base64UrlDecode(part);
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
        return JSON.parse(decoded);
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
}
exports.jwtDecode = jwtDecode;

},{}],2:[function(require,module,exports){
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
},{"jwt-decode":1}]},{},[2]);
