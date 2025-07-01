const express = require('express');
const authenticateToken = require('../middleware/auth'); // Assuming your auth middleware is here

// Export a function that accepts the database instance and JWT_SECRET
module.exports = (db) => { // Removed JWT_SECRET from here, it's used by authenticateToken
    const router = express.Router();

    // All routes in this file will require authentication
    router.use(authenticateToken); // Apply authentication middleware to all task routes

    /**
     * @route POST /api/tasks
     * @desc Add a new task for the authenticated user
     * @access Private
     */
    router.post('/', async (req, res) => {
        const { title, description } = req.body;
        const userId = req.user.id; // Get user ID from the authenticated token

        if (!title) {
            return res.status(400).json({ message: 'Task title is required.' });
        }

        try {
            db.run(
                'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
                [userId, title, description],
                function(err) {
                    if (err) {
                        console.error('Database error adding task:', err.message);
                        return res.status(500).json({ message: 'Failed to add task.' });
                    }
                    res.status(201).json({
                        message: 'Task added successfully!',
                        task: {
                            id: this.lastID,
                            user_id: userId,
                            title,
                            description,
                            completed: false, // Default from schema
                            created_at: new Date().toISOString() // Placeholder, DB sets it
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Unhandled error adding task:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });

    /**
     * @route GET /api/tasks
     * @desc Get all tasks for the authenticated user
     * @access Private
     */
    router.get('/', async (req, res) => {
        const userId = req.user.id; // Get user ID from the authenticated token

        try {
            db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, tasks) => {
                if (err) {
                    console.error('Database error fetching tasks:', err.message);
                    return res.status(500).json({ message: 'Failed to fetch tasks.' });
                }
                res.status(200).json(tasks);
            });
        } catch (error) {
            console.error('Unhandled error fetching tasks:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });

    /**
     * @route PUT /api/tasks/:id
     * @desc Update a task for the authenticated user
     * @access Private
     */
    router.put('/:id', async (req, res) => {
        const taskId = req.params.id;
        const userId = req.user.id; // Ensure task belongs to the authenticated user
        const { title, description, completed } = req.body; // 'completed' should be 0 or 1

        // Basic validation: at least one field to update should be present
        if (title === undefined && description === undefined && completed === undefined) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        let fields = [];
        let params = [];

        if (title !== undefined) {
            fields.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            fields.push('description = ?');
            params.push(description);
        }
        if (completed !== undefined) {
            // Ensure boolean is stored as 0 or 1
            fields.push('completed = ?');
            params.push(completed ? 1 : 0);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        params.push(taskId, userId); // Add taskId and userId for WHERE clause

        try {
            db.run(
                `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
                params,
                function(err) {
                    if (err) {
                        console.error('Database error updating task:', err.message);
                        return res.status(500).json({ message: 'Failed to update task.' });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ message: 'Task not found or does not belong to user.' });
                    }
                    res.status(200).json({ message: 'Task updated successfully!' });
                }
            );
        } catch (error) {
            console.error('Unhandled error updating task:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });

    /**
     * @route DELETE /api/tasks/:id
     * @desc Delete a task for the authenticated user
     * @access Private
     */
    router.delete('/:id', async (req, res) => {
        const taskId = req.params.id;
        const userId = req.user.id; // Ensure task belongs to the authenticated user

        try {
            db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId], function(err) {
                if (err) {
                    console.error('Database error deleting task:', err.message);
                    return res.status(500).json({ message: 'Failed to delete task.' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: 'Task not found or does not belong to user.' });
                }
                res.status(200).json({ message: 'Task deleted successfully!' });
            });
        } catch (error) {
            console.error('Unhandled error deleting task:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });

    return router;
};