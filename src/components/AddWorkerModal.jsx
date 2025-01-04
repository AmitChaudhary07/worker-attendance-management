import { useState } from 'react'

function AddWorkerModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dailyWage: '',
    designation: '',
    status: 'Active'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({
      ...formData,
      id: Date.now(), // Simple way to generate unique id
      dailyWage: Number(formData.dailyWage)
    })
    setFormData({
      name: '',
      mobile: '',
      dailyWage: '',
      designation: '',
      status: 'Active'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-white">Add New Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Mobile</label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Daily Wage (₹)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={formData.dailyWage}
              onChange={(e) => setFormData(prev => ({ ...prev, dailyWage: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Designation</label>
            <input
              type="text"
              required
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Status</label>
            <select
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Worker
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddWorkerModal 