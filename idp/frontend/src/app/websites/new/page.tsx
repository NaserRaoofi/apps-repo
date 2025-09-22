"use client";

import { useState } from "react";

interface WebsiteFormData {
  // اطلاعات ادمین سایت
  adminUsername: string; // wordpressUsername
  adminPassword: string; // wordpressPassword
  adminEmail: string; // wordpressEmail
  blogName: string; // wordpressBlogName
  subdomain: string; // برای hostname: subdomain.myplatform.com
}

export default function CreateWebsitePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WebsiteFormData>({
    adminUsername: "",
    adminPassword: "",
    adminEmail: "",
    blogName: "",
    subdomain: "",
  });

  const updateFormData = (field: keyof WebsiteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Send only simplified fields (backend auto-generates the rest)
      const backendData = {
        adminUsername: formData.adminUsername,
        adminPassword: formData.adminPassword,
        adminEmail: formData.adminEmail,
        blogName: formData.blogName,
        subdomain: formData.subdomain,
      };

      const response = await fetch("http://localhost:8001/api/v1/websites/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        let message = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors array
            message = errorData.detail
              .map((e: any) => {
                const field = Array.isArray(e.loc) ? e.loc.slice(-1)[0] : e.loc;
                return `${field}: ${e.msg}`;
              })
              .join("; ");
          } else if (errorData.detail) {
            message = errorData.detail;
          }
        } catch (_) {
          // ignore JSON parse issues
        }
        throw new Error(message);
      }

      const result = await response.json();
      console.log("Website created successfully:", result);

      // Show success message and redirect or reset form
      alert(`Website "${formData.blogName}" created successfully!`);

      // Reset form
      setFormData({
        adminUsername: "",
        adminPassword: "",
        adminEmail: "",
        blogName: "",
        subdomain: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating website:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create website");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Website</h1>
        <a href="/websites" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Websites
        </a>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-900">
                {step === 1 && "Website Details"}
                {step === 2 && "Auto Configuration"}
                {step === 3 && "Review & Deploy"}
              </div>
              {step < 3 && <div className={`ml-4 w-16 h-0.5 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Website Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">WordPress Admin Details</h2>
            <p className="text-sm text-gray-600">Enter the admin credentials for your WordPress site</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Username</label>
                <input
                  type="text"
                  value={formData.adminUsername}
                  onChange={(e) => updateFormData("adminUsername", e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => updateFormData("adminPassword", e.target.value)}
                  placeholder="Strong password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData("adminEmail", e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Name</label>
                <input
                  type="text"
                  value={formData.blogName}
                  onChange={(e) => updateFormData("blogName", e.target.value)}
                  placeholder="My Awesome Blog"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => updateFormData("subdomain", e.target.value)}
                    placeholder="mysite"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                    .naserraoofi.com
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your site will be available at: https://{formData.subdomain || "subdomain"}.naserraoofi.com
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Auto Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Auto Configuration</h2>
            <p className="text-sm text-gray-600">Your WordPress will be configured with the best settings</p>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-green-900">Everything Ready!</h3>
                  <p className="text-green-700">Your site will be installed with the following settings:</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-green-800">🚀 Latest WordPress Version</p>
                  <p className="text-green-800">🛡️ Automatic HTTPS</p>
                  <p className="text-green-800">🔒 High Security</p>
                </div>
                <div className="space-y-2">
                  <p className="text-green-800">⚡ Optimized Performance</p>
                  <p className="text-green-800">📊 Stable MariaDB</p>
                  <p className="text-green-800">🔄 Automatic Backup</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Deploy */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Review & Final Confirmation</h2>
            <p className="text-sm text-gray-600">Please review your entered information</p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">🚀 Your WordPress is ready to install!</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Blog Name</dt>
                  <dd className="text-sm text-gray-900 font-medium">{formData.blogName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website URL</dt>
                  <dd className="text-sm text-blue-600 font-medium">https://{formData.subdomain}.naserraoofi.com</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admin Username</dt>
                  <dd className="text-sm text-gray-900">{formData.adminUsername}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admin Email</dt>
                  <dd className="text-sm text-gray-900">{formData.adminEmail}</dd>
                </div>
              </dl>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Auto Configuration:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✅ Latest WordPress Version</li>
                  <li>✅ Optimized MariaDB</li>
                  <li>✅ Automatic SSL Certificate</li>
                  <li>✅ Configured Load Balancer</li>
                  <li>✅ Daily Backup</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <div>
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  Error: {submitError}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Website"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
