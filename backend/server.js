import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'worker_attendance_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Get all workers
app.get('/api/workers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM workers ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching workers:', error)
    res.status(500).json({ error: 'Failed to fetch workers' })
  }
})

// Add new worker
app.post('/api/workers', async (req, res) => {
  const { name, mobile, dailyWage, designation, status } = req.body
  
  try {
    const [result] = await pool.query(
      'INSERT INTO workers (name, mobile, daily_wage, designation, status) VALUES (?, ?, ?, ?, ?)',
      [name, mobile, dailyWage, designation, status]
    )
    
    const [newWorker] = await pool.query('SELECT * FROM workers WHERE id = ?', [result.insertId])
    res.status(201).json(newWorker[0])
  } catch (error) {
    console.error('Error adding worker:', error)
    res.status(500).json({ error: 'Failed to add worker' })
  }
})

// Update worker status
app.patch('/api/workers/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    await pool.query('UPDATE workers SET status = ? WHERE id = ?', [status, id])
    const [updated] = await pool.query('SELECT * FROM workers WHERE id = ?', [id])
    res.json(updated[0])
  } catch (error) {
    console.error('Error updating worker status:', error)
    res.status(500).json({ error: 'Failed to update worker status' })
  }
})

// Add this near the other routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 