import { useState, useEffect } from 'react'

function AttendanceTracker({ workerId }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates())
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get dates for the current week starting from Thursday
  function getWeekDates(date = new Date()) {
    const thursday = new Date(date)
    const day = thursday.getDay()
    // Adjust to previous Thursday if needed
    const diff = day >= 4 ? day - 4 : day + 3
    thursday.setDate(thursday.getDate() - diff)

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
    const prevWeek = new Date(currentWeek[0])
    prevWeek.setDate(prevWeek.getDate() - 7)
    setCurrentWeek(getWeekDates(prevWeek))
  }

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek[0])
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentWeek(getWeekDates(nextWeek))
  }

  const handleAttendanceClick = (date) => {
    if (!workerId) return

    // Prevent setting attendance for future dates
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time part for accurate date comparison
    const clickedDate = new Date(date)
    clickedDate.setHours(0, 0, 0, 0)

    if (clickedDate > today) {
      return // Silently return if future date
    }

    const dateStr = date.toISOString().split('T')[0]
    const currentStatus = attendance[dateStr] || 'absent'
    const newStatus = currentStatus === 'absent' ? 'present' : 
                     currentStatus === 'present' ? 'half' : 'absent'

    setAttendance(prev => ({
      ...prev,
      [dateStr]: newStatus
    }))
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

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousWeek}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Previous Week
        </button>
        <span className="text-gray-300">
          {formatDate(currentWeek[0])} - {formatDate(currentWeek[6])}
        </span>
        <button
          onClick={handleNextWeek}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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