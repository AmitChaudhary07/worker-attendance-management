import React, { useEffect, useState, useCallback } from 'react'

function PayoutManager({ workerId }) {
  const [workerData, setWorkerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState({ advance: false, remaining: false })
  const [editValues, setEditValues] = useState({ advance: '', remaining: '' })
  const [weeklyPayout, setWeeklyPayout] = useState(0)
  const [currentWeek, setCurrentWeek] = useState(getWeekDates())

  function getWeekDates(date = new Date()) {
    const normalizedDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ))
    
    const thursday = new Date(normalizedDate)
    const day = thursday.getUTCDay()
    const diff = day >= 4 ? day - 4 : day + 3
    thursday.setUTCDate(thursday.getUTCDate() - diff)

    const week = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(thursday)
      currentDate.setUTCDate(thursday.getUTCDate() + i)
      week.push(currentDate)
    }
    return week
  }

  const calculateWeeklyPayout = async () => {
    if (!workerId || !workerData) return

    try {
      const startDate = currentWeek[0].toISOString().split('T')[0]
      const endDate = currentWeek[6].toISOString().split('T')[0]
      
      const response = await fetch(
        `http://localhost:3000/api/attendance/${workerId}?startDate=${startDate}&endDate=${endDate}`
      )
      
      if (!response.ok) throw new Error('Failed to fetch attendance')
      
      const attendanceData = await response.json()
      
      let presentDays = 0
      let halfDays = 0
      let fullPlusHalfDays = 0
      
      Object.values(attendanceData).forEach(status => {
        switch(status) {
          case 'present':
            presentDays++
            break
          case 'half':
            halfDays++
            break
          case 'full_plus_half':
            fullPlusHalfDays++
            break
        }
      })
      
      const dailyWage = workerData.daily_wage
      const payout = (
        (dailyWage * presentDays) + 
        ((dailyWage/2) * halfDays) + 
        (fullPlusHalfDays * 1.5 * dailyWage)
      )
      
      setWeeklyPayout(payout)
    } catch (err) {
      console.error('Error calculating payout:', err)
      setError('Failed to calculate payout')
    }
  }

  useEffect(() => {
    if (!workerId) return
    fetchWorkerData()
  }, [workerId])

  const fetchWorkerData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/workers/${workerId}`)
      if (!response.ok) throw new Error('Failed to fetch worker data')
      const data = await response.json()
      setWorkerData(data)
      setEditValues({ advance: data.advance, remaining: data.remaining })
      setError(null)
    } catch (err) {
      console.error('Error fetching worker data:', err)
      setError('Failed to load worker data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: true }))
    setEditValues(prev => ({ ...prev, [field]: workerData[field] }))
  }

  const handleSave = async (field) => {
    try {
      const response = await fetch(`http://localhost:3000/api/workers/${workerId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: Number(editValues[field]) }),
      })

      if (!response.ok) throw new Error('Failed to update amount')
      
      await fetchWorkerData()
      setIsEditing(prev => ({ ...prev, [field]: false }))
    } catch (err) {
      console.error('Error updating amount:', err)
      setError(`Failed to update ${field}`)
    }
  }

  const handleCancel = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: false }))
    setEditValues(prev => ({ ...prev, [field]: workerData[field] }))
  }

  if (!workerId) {
    return <p className="text-gray-500">Select a worker to view payout details</p>
  }

  if (loading) {
    return <p className="text-gray-500">Loading payout data...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="space-y-4">
      {/* Advance Amount */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-300">Advance Amount</p>
          {!isEditing.advance ? (
            <button
              onClick={() => handleEdit('advance')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('advance')}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => handleCancel('advance')}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {isEditing.advance ? (
          <input
            type="number"
            value={editValues.advance}
            onChange={(e) => setEditValues(prev => ({ ...prev, advance: e.target.value }))}
            className="w-full bg-gray-600 text-white text-2xl font-bold rounded px-2 py-1"
          />
        ) : (
          <p className="text-2xl font-bold text-white">₹{workerData?.advance || 0}</p>
        )}
      </div>

      {/* Remaining Amount */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-300">Remaining Amount</p>
          {!isEditing.remaining ? (
            <button
              onClick={() => handleEdit('remaining')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave('remaining')}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => handleCancel('remaining')}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {isEditing.remaining ? (
          <input
            type="number"
            value={editValues.remaining}
            onChange={(e) => setEditValues(prev => ({ ...prev, remaining: e.target.value }))}
            className="w-full bg-gray-600 text-white text-2xl font-bold rounded px-2 py-1"
          />
        ) : (
          <p className="text-2xl font-bold text-white">₹{workerData?.remaining || 0}</p>
        )}
      </div>

      {/* This Week's Payout */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-300">This Week's Payout</p>
          <button
            onClick={calculateWeeklyPayout}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Calculate
          </button>
        </div>
        <p className="text-2xl font-bold text-white">₹{weeklyPayout.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default PayoutManager 