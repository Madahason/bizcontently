import { useState, useEffect } from "react";
import { ProviderConfig } from "@/lib/video/assetMatching/types";
import { AssetMatchingService } from "@/lib/video/assetMatching/AssetMatchingService";

interface ProviderFormData {
  name: string;
  apiKey: string;
  enabled: boolean;
  priority: number;
}

export default function ProviderConfigPanel() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [formData, setFormData] = useState<ProviderFormData>({
    name: "",
    apiKey: "",
    enabled: true,
    priority: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const assetMatcher = new AssetMatchingService();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    const configs = assetMatcher.getProviderConfigs();
    setProviders(configs);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const config: ProviderConfig = {
        ...formData,
        priority: Number(formData.priority),
      };

      const success = await assetMatcher.addProvider(config);

      if (success) {
        setSuccessMessage(`Successfully added ${config.name} provider`);
        loadProviders();
        setFormData({
          name: "",
          apiKey: "",
          enabled: true,
          priority: 1,
        });
      } else {
        setError("Failed to add provider");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProvider = async (providerName: string) => {
    try {
      assetMatcher.removeProvider(providerName);
      setSuccessMessage(`Successfully removed ${providerName} provider`);
      loadProviders();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Asset Provider Configuration</h2>

      {/* Provider List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Configured Providers</h3>
        <div className="space-y-2">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <span className="font-medium">{provider.name}</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded ${
                    provider.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {provider.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRemoveProvider(provider.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Provider Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">Add New Provider</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Provider Name
          </label>
          <select
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a provider</option>
            <option value="Pexels">Pexels</option>
            <option value="Unsplash">Unsplash</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="password"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            min="1"
            max="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={formData.enabled}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Enable Provider
          </label>
        </div>

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

        {successMessage && (
          <div className="text-green-600 text-sm mt-2">{successMessage}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add Provider"}
        </button>
      </form>
    </div>
  );
}
