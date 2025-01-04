import { useState, useEffect } from 'react'
import AddWorkerModal from './AddWorkerModal'
import { MoreVertical } from 'lucide-react'

function WorkerList({ onSelectWorker, selectedWorker }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/workers')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch workers')
      }
      const data = await response.json()
      setWorkers(data)
      setError(null)
    } catch (err) {
      setError(`Failed to load workers: ${err.message}`)
      console.error('Error details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWorker = async (newWorker) => {
    try {
      const response = await fetch('http://localhost:3000/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorker)
      })
      
      if (!response.ok) throw new Error('Failed to add worker')
      
      await fetchWorkers() // Refresh the list
    } catch (err) {
      console.error('Error adding worker:', err)
      // You might want to show an error message to the user
    }
  }

  const handleStatusChange = async (workerId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/workers/${workerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      await fetchWorkers() // Refresh the list
      setActiveDropdown(null)
    } catch (err) {
      console.error('Error updating status:', err)
      // You might want to show an error message to the user
    }
  }

  if (loading) return <p className="text-gray-400">Loading workers...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors"
      >
        Add Worker
      </button>
      
      <AddWorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWorker}
      />

      <h2 className="text-lg font-semibold mb-4 text-white">Worker List</h2>
      {workers.map(worker => (
        <div
          key={worker.id}
          className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
            selectedWorker?.id === worker.id
              ? 'bg-blue-900 border-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <div onClick={() => onSelectWorker(worker)} className="flex-1">
              <p className="font-medium text-white">{worker.name}</p>
              <p className="text-sm text-gray-400">{worker.designation}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                worker.status === 'Active' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-red-900 text-red-300'
              }`}>
                {worker.status}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === worker.id ? null : worker.id)}
                className="p-1 hover:bg-gray-600 rounded"
              >
                <MoreVertical className="h-5 w-5 text-gray-300" />
              </button>

              {activeDropdown === worker.id && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    <button
                      onClick={() => handleStatusChange(worker.id, 'Active')}
                      className={`block px-4 py-2 text-sm text-left w-full ${
                        worker.status === 'Active'
                          ? 'text-green-400 bg-gray-700'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Set as Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(worker.id, 'Inactive')}
                      className={`block px-4 py-2 text-sm text-left w-full ${
                        worker.status === 'Inactive'
                          ? 'text-red-400 bg-gray-700'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Set as Inactive
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WorkerList 