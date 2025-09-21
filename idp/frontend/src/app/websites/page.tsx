export default function WebsitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
        <a href="/websites/new" className="btn-primary">
          Create Website
        </a>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Websites</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Sample website cards */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">My Blog</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Running
              </span>
            </div>
            <p className="text-sm text-gray-500">blog.naserraoofi.com</p>
            <p className="text-sm text-gray-500">WordPress • Basic Plan</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Online Shop</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Running
              </span>
            </div>
            <p className="text-sm text-gray-500">shop.naserraoofi.com</p>
            <p className="text-sm text-gray-500">Drupal • Premium Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
