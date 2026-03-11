const Footer = () => {
  return (
    <div className="w-full bg-slate-900 text-white py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
          <div className="space-y-2 md:space-y-4">
            <h3 className="text-lg font-bold mb-2">SRIT Alumni Association</h3>
            <p className="text-sm text-gray-300">
              The SRIT Alumni Association was formed on 29 October 2023 to foster lasting connections among alumni and strengthen the bond with our alma mater.
            </p>
          </div>
          <div className="space-y-2 md:space-y-4">
            <h3 className="text-lg font-bold mb-2">Contact Details</h3>
            <p className="text-sm text-gray-300">Email: alumni@srit.edu</p>
            <p className="text-sm text-gray-300">Phone: +91-XXXX-XXXX-XXXX</p>
            <p className="text-sm text-gray-300">Address: SRIT Campus, India</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-400">
          <p>&copy; 2024 SRIT Alumni Association. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer
