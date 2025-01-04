function AttendanceTracker({ workerId }) {
  if (!workerId) {
    return <p className="text-gray-500">Select a worker to view attendance</p>
  }

  return (
    <div className="space-y-4">
      {/* Implement weekly calendar view here */}
      <p className="text-gray-400">Attendance tracking interface will be implemented here</p>
    </div>
  )
}

export default AttendanceTracker 