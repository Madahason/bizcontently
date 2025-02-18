import ProviderConfigPanel from "@/app/components/providers/ProviderConfigPanel";

export default function ProvidersSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Asset Provider Settings</h1>
        <ProviderConfigPanel />
      </div>
    </div>
  );
}
