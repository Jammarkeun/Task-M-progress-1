document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const taskList = document.getElementById('taskList');
    const notificationHandler = new NotificationHandler(); // Initialize NotificationHandler

    // Load existing tasks
    loadTasks();

    function loadTasks(status = '') {
        const url = status ? `/api/tasks.php?user_id=${userId}&status=${status}` : `/api/tasks.php?user_id=${userId}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.records && data.records.length > 0) {
                    taskList.innerHTML = ''; // Clear existing tasks
                    data.records.forEach(task => {
                        const taskElement = createTaskElement(task);
                        taskList.appendChild(taskElement);
                    });
                } else {
                    taskList.innerHTML = '<p>No tasks found.</p>';
                }
            })
            .catch(error => console.error('Error loading tasks:', error));
    }

    // Function to load completed tasks
    function loadCompletedTasks() {
        loadTasks('completed');
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.innerHTML = `
            <div class="task-info">
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span class="task-category">${task.category}</span>
                    <span class="task-date"><i class="far fa-calendar"></i> ${task.due_date.split('T')[0]}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                <button class="task-action-btn delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                <button class="task-action-btn done-btn" data-id="${task.id}" data-title="${task.title}">Done</button>
            </div>
            <div class="edit-form" style="display: none;">
                <input type="text" class="edit-title" value="${task.title}" />
                <textarea class="edit-description">${task.description}</textarea>
                <button class="save-btn" data-id="${task.id}">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;
    
        // Add event listeners for edit, delete, and done buttons
        taskElement.querySelector('.edit-btn').addEventListener('click', () => {
            const editForm = taskElement.querySelector('.edit-form');
            editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
        });
    
        taskElement.querySelector('.save-btn').addEventListener('click', () => {
            const editTitle = taskElement.querySelector('.edit-title').value;
            const editDescription = taskElement.querySelector('.edit-description').value;
            const taskId = taskElement.querySelector('.save-btn').getAttribute('data-id');
            updateTask(taskId, editTitle, editDescription);
        });
    
        taskElement.querySelector('.done-btn').addEventListener('click', () => {
            const taskId = taskElement.querySelector('.done-btn').getAttribute('data-id');
            const taskTitle = taskElement.querySelector('.done-btn').getAttribute('data-title');
            if (confirm(`Are you sure you want to complete this task: "${taskTitle}"?`)) {
                markTaskAsDone(taskId); // Call the markTaskAsDone function
            }
        });
    
        taskElement.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(task.id);
        });
    
        return taskElement;
    }
        function updateTask(taskId, title, description) {
        const dueDate = document.querySelector('.edit-due-date').value; // Assuming you have an input for due date

        fetch('/api/tasks.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId, title: title, description: description, due_date: dueDate })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task updated:', data);
            loadTasks(); // Reload tasks after updating
        })
        .catch(error => console.error('Error updating task:', error));
    }

    function markTaskAsDone(taskId) {
        const completionDate = new Date().toISOString(); // Get the current date and time

        fetch('/api/tasks.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId, status: 'completed', completed_at: completionDate }) // Include completed_at
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log('Task marked as done:', data.message);
            } else {
                console.error('Error marking task as done:', data);
            }
            loadTasks(); // Reload tasks after marking as done
            updateCompletionRate(); // Update completion rate on the dashboard
        })
        .catch(error => console.error('Error marking task as done:', error));
    }

    function deleteTask(taskId) {
        fetch('/api/tasks.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: taskId })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task deleted:', data);
            loadTasks();
        })
        .catch(error => console.error('Error deleting task:', error));
    }

    function updateCompletionRate() {
        fetch(`/api/tasks.php?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                const totalTasks = data.records.length;
                const completedTasks = data.records.filter(task => task.status === 'completed').length;
                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                document.getElementById('completionRate').innerText = `${completionRate.toFixed(2)}%`;
            })
            .catch(error => console.error('Error updating completion rate:', error));
    }
});
