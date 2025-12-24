let tasks = getData('tasks');
let activeTasks = getData('active-tasks');
let completedTasks = getData('completed-tasks');
let removedTasks = getData('removed-tasks');
let tasksContainer = document.querySelector('.tasks-container');

let navButtons = document.querySelectorAll('.nav button');

let input = document.querySelector('.input input');
let addButton = document.querySelector('.input button');

let taskCounter = document.querySelector('.header span');
let taskCounter2 = document.querySelector('.footer p:first-child');

// Enter button functionality

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addButton.click();
})

// Adding tasks button functionality

addButton.addEventListener('click', function () {
  let found = false;

  tasks.forEach(e => {
    if (e.title === input.value) found = true;
  })

  if (input.value && !found) {
    createTask(input.value, true, false, false);
    changeCategories('active');
    input.value = '';
  }
})

let category = getData('category', true) || 'all';

// What to do onload

window.addEventListener('load', function () {
  changeCategories(category);
})

// Nav Buttons functionality

navButtons.forEach(e => {
  e.addEventListener('click', function () {
    changeButton(e.id);
    changeCategories(e.id);

    category = e.id;

    saveData('category', e.id, true);
  })
})

// the function that's responsible of creating tasks

function createTask(title, isNew, completed, deleted) {
  let found = false;

  [...tasksContainer.children].forEach(task => {
    [...task.children].forEach(e => {
      if (e.textContent === title) found = true;
    })
  })
  
  if (!found) {
    let taskObject = {
      title: title,
      completed: completed,
      deleted: deleted
    }
    let task = document.createElement('div');
    task.classList.add('task');

    let checkbox = document.createElement('div');
    checkbox.classList.add('checkbox');

    let checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.checked = completed;

    checkboxInput.addEventListener('change', function () {
      if (checkboxInput.checked) {
        task.classList.add('completed');

        taskObject.completed = true;

        tasks.forEach(e => {
          if (e.title === taskTitle.textContent) e.completed = true;
        })

        saveData('tasks', tasks);

        refreshTasksData();

        changeCategories(category);
      } else {
        task.classList.remove('completed');

        taskObject.completed = false;

        tasks.forEach(e => {
          if (e.title === taskTitle.textContent) e.completed = false;
        })

        saveData('tasks', tasks);

        refreshTasksData();

        changeCategories(category);
      }
    })

    let checkmark = document.createElement('i');
    checkmark.classList.add('fa-solid', 'fa-check', 'checkmark');

    checkbox.append(checkboxInput, checkmark);

    // if the task is completed mark the check

    if (!isNew && completed) {
      task.classList.add('completed');
    }

    let taskTitle = document.createElement('p');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = title;

    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');

    deleteButton.addEventListener('click', function () {
      if (!deleted) {
        taskObject.deleted = true;

        tasks.forEach(e => {
          if (e.title === taskTitle.textContent) e.deleted = true;
        })

        saveData('tasks', tasks);

        refreshTasksData();

        task.remove();
      } else {

        tasks = tasks.filter(e => e.title !== taskTitle.textContent);

        saveData('tasks', tasks);

        refreshTasksData();

        task.remove();
      }

      refreshCounter();
    })

    task.append(checkbox, taskTitle);

    let holder = document.createElement('div');
    holder.classList.add('holder');

    if (deleted) {
      let undoButton = document.createElement('button');
      undoButton.classList.add('undo-button');

      let icon = document.createElement('i');
      icon.classList.add('fas', 'fa-undo');

      undoButton.append(icon);

      undoButton.addEventListener('click', function () {

        removedTasks = removedTasks.filter(e => e.title !== taskTitle.textContent);

        saveData('removed-tasks', removedTasks);

        tasks.forEach(e => {
          if (e.title === taskTitle.textContent) e.deleted = false;
        })

        saveData('tasks', tasks);

        changeCategories(category);
        
        refreshTasksData();

        refreshCounter();

      })

      holder.append(undoButton);
    }

    holder.append(deleteButton);

    task.append(holder);

    let found = false;

    tasks.forEach(e => {
      if (e.title === taskTitle.textContent) found = true;
    })

    if (isNew && !found) {
      tasks.push(taskObject);
    
      saveData('tasks', tasks);
      refreshTasksData();
    }

    tasksContainer.append(task);

    refreshCounter();

  }
}

function refreshCounter() {
  let length = tasks.filter(e => !e.deleted).length;
  taskCounter.textContent = `${length} ${length === 1 ? 'Task' : 'Tasks'}`;

  let length2 = activeTasks.length;
  taskCounter2.textContent = `${length2} ${length2 === 1 ? 'task' : 'tasks'} remaining`;
}

// Saves data in localStorage

function saveData(name, value, raw = false) {
  if (!raw) {
    if (name === 'tasks') {
      localStorage.setItem(name, JSON.stringify(value));
    } else if (name === 'active-tasks') {
      localStorage.setItem(name, JSON.stringify(value.filter(e => !e.completed)));
    } else if (name === 'completed-tasks') {
      localStorage.setItem(name, JSON.stringify(value.filter(e => e.completed)));
    } else {
      localStorage.setItem(name,  JSON.stringify(value.filter(e => e.deleted)));
    }

  } else localStorage.setItem(name, value);
}

// Gets data from localStorage

function getData(name, raw = false) {
  if (!raw) {
    return localStorage.getItem(name) ? JSON.parse(localStorage.getItem(name)) : [];
  } else return localStorage.getItem(name) ? localStorage.getItem(name) : '';
}

// Reloading tasks depending on category

function changeCategories(category) {
  tasksContainer.innerHTML = '';

  refreshCounter();

  changeButton(category);

  if (category === 'all') {
    tasks.filter(e => !e.deleted).forEach(e => {
      createTask(e.title, false, e.completed, false);
    })
  } else if (category === 'active') {
    activeTasks.forEach(e => {
      createTask(e.title, false, false, false);
    })
  } else if (category === 'completed') {
    completedTasks.forEach(e => {
      createTask(e.title, false, true, false);
    })
  } else {
    removedTasks.forEach(e => {
      createTask(e.title, false, e.completed, true);
    })
  }
}

// function used to change the active classes in nav buttons

function changeButton(categorySelection) {
  navButtons.forEach(e => {
    if (e.classList.contains('active')) {
      e.classList.remove('active');
    }
  })

  navButtons.forEach(e => {
    if (e.id === categorySelection) {
      e.classList.add('active');
    }
  })

  category = categorySelection;

  saveData('category', category, true);
}

// Saves new tasks data depending on the main tasks variable

function refreshTasksData() {
  activeTasks = tasks.filter(e => !e.completed && !e.deleted);
  saveData('active-tasks', activeTasks)
  completedTasks = tasks.filter(e => e.completed && !e.deleted);
  saveData('completed-tasks', completedTasks)
  removedTasks = tasks.filter(e => e.deleted);
  saveData('removed-tasks', removedTasks)
}