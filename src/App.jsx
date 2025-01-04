import { useState } from 'react'
import WorkerList from './components/WorkerList'
import AttendanceTracker from './components/AttendanceTracker'
import PayoutManager from './components/PayoutManager'

function App() {
  const [selectedWorker, setSelectedWorker] = useState(null)

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Worker List Section */}
        <div className="col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <WorkerList 
            onSelectWorker={setSelectedWorker}
            selectedWorker={selectedWorker}
          />
        </div>

        {/* Main Content Section */}
        <div className="col-span-6 space-y-4">
          {/* Worker Details */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-white">Details:</h2>
            {selectedWorker ? (
              <div className="space-y-2 text-gray-300">
                <p>Name: {selectedWorker.name}</p>
                <p>Mobile: {selectedWorker.mobile}</p>
                <p>Daily Wage: ₹{selectedWorker.daily_wage}</p>
                <p>Designation: {selectedWorker.designation}</p>
              </div>
            ) : (
              <p className="text-gray-500">Select a worker to view details</p>
            )}
          </div>

          {/* Attendance Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex-grow border border-gray-700">
            <h2 className="text-lg font-semibold mb-2 text-white">Attendance (Weekly basis)</h2>
            <AttendanceTracker workerId={selectedWorker?.id} />
          </div>
        </div>

        {/* Payout Section */}
        <div className="col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-white">Payout Info</h2>
          <PayoutManager workerId={selectedWorker?.id} />
        </div>
      </div>
    </div>
  )
}

export default App
