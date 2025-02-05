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
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'worker_attendance_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle MySQL connection:', err)
  process.exit(1)
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

// Add this with the other routes
app.delete('/api/workers/:id', async (req, res) => {
  const { id } = req.params

  try {
    // First check if worker exists
    const [worker] = await pool.query('SELECT * FROM workers WHERE id = ?', [id])
    if (worker.length === 0) {
      return res.status(404).json({ error: 'Worker not found' })
    }

    // Then attempt to delete
    await pool.query('DELETE FROM workers WHERE id = ?', [id])
    
    res.status(200).json({ message: 'Worker deleted successfully' })
  } catch (error) {
    console.error('Error deleting worker:', error)
    res.status(500).json({ error: 'Failed to delete worker' })
  }
})

// Get attendance for a worker within a date range
app.get('/api/attendance/:workerId', async (req, res) => {
  const { workerId } = req.params
  const { startDate, endDate } = req.query

  try {
    const [rows] = await pool.query(
      'SELECT date, status FROM attendance WHERE worker_id = ? AND date BETWEEN ? AND ?',
      [workerId, startDate, endDate]
    )
    
    // Convert to object format for easier frontend handling
    const attendance = rows.reduce((acc, row) => {
      acc[row.date.toISOString().split('T')[0]] = row.status
      return acc
    }, {})
    
    res.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    res.status(500).json({ 
      error: 'Failed to fetch attendance',
      details: error.message,
      code: error.code 
    })
  }
})

// Update attendance for a worker
app.post('/api/attendance/:workerId', async (req, res) => {
  const { workerId } = req.params
  const { date, status } = req.body

  try {
    await pool.query(
      `INSERT INTO attendance (worker_id, date, status) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE status = ?`,
      [workerId, date, status, status]
    )
    
    res.json({ message: 'Attendance updated successfully' })
  } catch (error) {
    console.error('Error updating attendance:', error)
    res.status(500).json({ error: 'Failed to update attendance' })
  }
})

// Add this with the other routes
app.get('/api/workers/:id', async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await pool.query('SELECT * FROM workers WHERE id = ?', [id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Error fetching worker:', error)
    res.status(500).json({ error: 'Failed to fetch worker details' })
  }
})

// Add this with the other routes
app.patch('/api/workers/:id/payment', async (req, res) => {
  const { id } = req.params
  const updates = req.body

  try {
    // Validate that we're only updating allowed fields
    const allowedFields = ['advance', 'remaining']
    const updateFields = Object.keys(updates)
    const isValidOperation = updateFields.every(field => allowedFields.includes(field))

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' })
    }

    // Build the SQL query dynamically based on what fields are being updated
    const updateQuery = `
      UPDATE workers 
      SET ${updateFields.map(field => `${field} = ?`).join(', ')}
      WHERE id = ?
    `
    
    // Create array of values for the query
    const values = [...updateFields.map(field => updates[field]), id]
    
    await pool.query(updateQuery, values)
    
    // Fetch and return updated worker data
    const [updated] = await pool.query('SELECT * FROM workers WHERE id = ?', [id])
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Worker not found' })
    }
    
    res.json(updated[0])
  } catch (error) {
    console.error('Error updating payment:', error)
    res.status(500).json({ error: 'Failed to update payment details' })
  }
})

// Add this near the other routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

// Add this new endpoint for processing payouts
app.post('/api/workers/:id/process-payout', async (req, res) => {
  const { id } = req.params
  const { amount, weekStart, weekEnd } = req.body

  try {
    // You might want to store processed payouts in a new table
    const [result] = await pool.query(
      `INSERT INTO processed_payouts (worker_id, amount, week_start, week_end) 
       VALUES (?, ?, ?, ?)`,
      [id, amount, weekStart, weekEnd]
    )
    
    res.json({ 
      message: 'Payout processed successfully',
      payoutId: result.insertId 
    })
  } catch (error) {
    console.error('Error processing payout:', error)
    res.status(500).json({ error: 'Failed to process payout' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 