"use client";

import { useState } from "react";

interface WebsiteFormData {
  websiteId: string;
  domain: string;
  type: "wordpress" | "drupal" | "custom";
  plan: "basic" | "standard" | "premium";
  databaseType: "internal" | "external";
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  storageClass: string;
  cluster: string;
}

export default function CreateWebsitePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WebsiteFormData>({
    websiteId: "",
    domain: "",
    type: "wordpress",
    plan: "basic",
    databaseType: "internal",
    adminUsername: "",
    adminPassword: "",
    adminEmail: "",
    storageClass: "gp2",
    cluster: "dev",
  });

  const updateFormData = (field: keyof WebsiteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
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
      const response = await fetch("http://localhost:8001/api/v1/websites/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Website created successfully:", result);

      // Show success message and redirect or reset form
      alert(`Website "${formData.websiteId}" created successfully! Status: ${result.status}`);

      // Reset form
      setFormData({
        websiteId: "",
        domain: "",
        type: "wordpress",
        plan: "basic",
        databaseType: "internal",
        adminUsername: "",
        adminPassword: "",
        adminEmail: "",
        storageClass: "gp2",
        cluster: "dev",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating website:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create website");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourcePlans = {
    basic: { cpu: "200m", ram: "512Mi", storage: "1Gi" },
    standard: { cpu: "500m", ram: "1Gi", storage: "5Gi" },
    premium: { cpu: "1000m", ram: "2Gi", storage: "20Gi" },
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
          {[1, 2, 3, 4].map((step) => (
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
                {step === 2 && "Configuration"}
                {step === 3 && "Admin Setup"}
                {step === 4 && "Review"}
              </div>
              {step < 4 && <div className={`ml-4 w-16 h-0.5 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Website Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Website Details</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website ID</label>
                <input
                  type="text"
                  value={formData.websiteId}
                  onChange={(e) => updateFormData("websiteId", e.target.value)}
                  placeholder="my-website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => updateFormData("domain", e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => updateFormData("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wordpress">WordPress</option>
                  <option value="drupal">Drupal</option>
                  <option value="custom">Custom Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cluster</label>
                <select
                  value={formData.cluster}
                  onChange={(e) => updateFormData("cluster", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Resource Plan</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Object.entries(resourcePlans).map(([plan, resources]) => (
                  <div
                    key={plan}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.plan === plan ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => updateFormData("plan", plan)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.plan === plan}
                        onChange={() => updateFormData("plan", plan)}
                        className="mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">{plan}</h3>
                        <p className="text-sm text-gray-500">
                          CPU: {resources.cpu} | RAM: {resources.ram} | Storage: {resources.storage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Type</label>
                <select
                  value={formData.databaseType}
                  onChange={(e) => updateFormData("databaseType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="internal">Internal Database</option>
                  <option value="external">External Database</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Class</label>
                <select
                  value={formData.storageClass}
                  onChange={(e) => updateFormData("storageClass", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gp2">General Purpose SSD (gp2)</option>
                  <option value="gp3">General Purpose SSD (gp3)</option>
                  <option value="io1">Provisioned IOPS SSD (io1)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Admin Setup */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Admin Setup</h2>

            <div className="grid grid-cols-1 gap-6">
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
                  placeholder="••••••••"
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
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Review & Submit</h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Website Configuration Summary</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website ID</dt>
                  <dd className="text-sm text-gray-900">{formData.websiteId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domain</dt>
                  <dd className="text-sm text-gray-900">{formData.domain}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.plan}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Resources</dt>
                  <dd className="text-sm text-gray-900">
                    {resourcePlans[formData.plan].cpu} CPU, {resourcePlans[formData.plan].ram} RAM,{" "}
                    {resourcePlans[formData.plan].storage} Storage
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Database</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.databaseType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cluster</dt>
                  <dd className="text-sm text-gray-900 capitalize">{formData.cluster}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admin Email</dt>
                  <dd className="text-sm text-gray-900">{formData.adminEmail}</dd>
                </div>
              </dl>
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

          {currentStep < 4 ? (
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
