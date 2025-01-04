import { useState, useEffect } from 'react'

function AttendanceTracker({ workerId }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates())
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get dates for the current week starting from Thursday
  function getWeekDates(date = new Date()) {
    const thursday = new Date(date)
    const currentThursday = new Date()
    const day = currentThursday.getDay()
    const diff = day >= 4 ? day - 4 : day + 3
    currentThursday.setDate(currentThursday.getDate() - diff)
    currentThursday.setHours(0, 0, 0, 0)

    // If requested date is before current Thursday, return current week
    if (date < currentThursday) {
      date = new Date()
    }

    const targetDay = thursday.getDay()
    const targetDiff = targetDay >= 4 ? targetDay - 4 : targetDay + 3
    thursday.setDate(thursday.getDate() - targetDiff)

    const week = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(thursday)
      currentDate.setDate(thursday.getDate() + i)
      week.push(currentDate)
    }
    return week
  }

  const dayNames = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  const handlePreviousWeek = () => {
    const currentThursday = new Date()
    const day = currentThursday.getDay()
    const diff = day >= 4 ? day - 4 : day + 3
    currentThursday.setDate(currentThursday.getDate() - diff)
    currentThursday.setHours(0, 0, 0, 0)

    const weekStart = new Date(currentWeek[0])
    weekStart.setHours(0, 0, 0, 0)

    // Only allow going back if we're not already at current week
    if (weekStart.getTime() > currentThursday.getTime()) {
      const prevWeek = new Date(currentWeek[0])
      prevWeek.setDate(prevWeek.getDate() - 7)
      setCurrentWeek(getWeekDates(prevWeek))
    }
  }

  const handleNextWeek = () => {
    const currentThursday = new Date()
    const day = currentThursday.getDay()
    const diff = day >= 4 ? day - 4 : day + 3
    currentThursday.setDate(currentThursday.getDate() - diff)
    currentThursday.setHours(0, 0, 0, 0)

    const weekStart = new Date(currentWeek[0])
    weekStart.setHours(0, 0, 0, 0)

    // Only allow going forward if we're not already one week ahead
    if (weekStart.getTime() < currentThursday.getTime() + 7 * 24 * 60 * 60 * 1000) {
      const nextWeek = new Date(currentWeek[0])
      nextWeek.setDate(nextWeek.getDate() + 7)
      setCurrentWeek(getWeekDates(nextWeek))
    }
  }

  // Add useEffect to fetch attendance when week or worker changes
  useEffect(() => {
    if (!workerId) return

    const fetchAttendance = async () => {
      setLoading(true)
      try {
        const startDate = currentWeek[0].toISOString().split('T')[0]
        const endDate = currentWeek[6].toISOString().split('T')[0]
        
        const response = await fetch(
          `http://localhost:3000/api/attendance/${workerId}?startDate=${startDate}&endDate=${endDate}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance')
        }
        
        const data = await response.json()
        setAttendance(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching attendance:', err)
        setError('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [workerId, currentWeek])

  // Update handleAttendanceClick to save to database
  const handleAttendanceClick = async (date) => {
    if (!workerId) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const clickedDate = new Date(date)
    clickedDate.setHours(0, 0, 0, 0)

    if (clickedDate > today) return

    const dateStr = date.toISOString().split('T')[0]
    const currentStatus = attendance[dateStr] || 'absent'
    const newStatus = currentStatus === 'absent' ? 'present' : 
                     currentStatus === 'present' ? 'half' : 'absent'

    try {
      const response = await fetch(`http://localhost:3000/api/attendance/${workerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateStr,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update attendance')
      }

      setAttendance(prev => ({
        ...prev,
        [dateStr]: newStatus
      }))
      setError(null)
    } catch (err) {
      console.error('Error updating attendance:', err)
      setError('Failed to update attendance')
    }
  }

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600'
      case 'half':
        return 'bg-yellow-500 hover:bg-yellow-600'
      default:
        return 'bg-red-500 hover:bg-red-600'
    }
  }

  if (!workerId) {
    return <p className="text-gray-500">Select a worker to view attendance</p>
  }

  if (loading) {
    return <p className="text-gray-500">Loading attendance data...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousWeek}
          disabled={currentWeek[0].getTime() <= getWeekDates()[0].getTime()}
          className={`px-3 py-1 text-white rounded-lg transition-colors ${
            currentWeek[0].getTime() <= getWeekDates()[0].getTime()
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Previous Week
        </button>
        <span className="text-gray-300">
          {formatDate(currentWeek[0])} - {formatDate(currentWeek[6])}
        </span>
        <button
          onClick={handleNextWeek}
          disabled={currentWeek[0].getTime() >= getWeekDates()[0].getTime() + 7 * 24 * 60 * 60 * 1000}
          className={`px-3 py-1 text-white rounded-lg transition-colors ${
            currentWeek[0].getTime() >= getWeekDates()[0].getTime() + 7 * 24 * 60 * 60 * 1000
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Next Week
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 mb-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {currentWeek.map(date => {
          const dateStr = date.toISOString().split('T')[0]
          const status = attendance[dateStr] || 'absent'
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const clickedDate = new Date(date)
          clickedDate.setHours(0, 0, 0, 0)
          const isDisabled = clickedDate > today
          
          return (
            <div
              key={dateStr}
              onClick={() => !isDisabled && handleAttendanceClick(date)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                transition-colors 
                ${isDisabled 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : `cursor-pointer ${getAttendanceColor(status)}`
                }
              `}
            >
              <span className="text-white font-medium">{date.getDate()}</span>
              <span className="text-xs text-white capitalize">
                {isDisabled ? 'upcoming' : status}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-300">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm text-gray-300">Half Day</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm text-gray-300">Absent</span>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTracker 