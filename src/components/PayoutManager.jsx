function PayoutManager({ workerId }) {
  if (!workerId) {
    return <p className="text-gray-500">Select a worker to view payout details</p>
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="font-medium text-gray-300">This Week's Payout</p>
        <p className="text-2xl font-bold text-white">₹0</p>
      </div>
      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
        Process Payout
      </button>
    </div>
  )
}

export default PayoutManager 