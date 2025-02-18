import { ProviderConfig } from "./types";

export class ProviderAuthManager {
  private configs: Map<string, ProviderConfig> = new Map();
  private configStorageKey = "assetProviderConfigs";

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs() {
    try {
      const storedConfigs = localStorage.getItem(this.configStorageKey);
      if (storedConfigs) {
        const configs = JSON.parse(storedConfigs) as ProviderConfig[];
        configs.forEach((config) => {
          this.configs.set(config.name, config);
        });
      }
    } catch (error) {
      console.error("Failed to load provider configs:", error);
    }
  }

  private saveConfigs() {
    try {
      const configsArray = Array.from(this.configs.values());
      localStorage.setItem(this.configStorageKey, JSON.stringify(configsArray));
    } catch (error) {
      console.error("Failed to save provider configs:", error);
    }
  }

  public getConfig(providerName: string): ProviderConfig | undefined {
    return this.configs.get(providerName);
  }

  public getAllConfigs(): ProviderConfig[] {
    return Array.from(this.configs.values());
  }

  public updateConfig(config: ProviderConfig): void {
    this.configs.set(config.name, config);
    this.saveConfigs();
  }

  public removeConfig(providerName: string): void {
    this.configs.delete(providerName);
    this.saveConfigs();
  }

  public validateApiKey(
    providerName: string,
    apiKey: string
  ): Promise<boolean> {
    // This would be implemented per provider
    // For now, we'll just check if the key exists
    return Promise.resolve(!!apiKey);
  }

  public getEnabledProviders(): ProviderConfig[] {
    return Array.from(this.configs.values()).filter((config) => config.enabled);
  }

  public async testConnection(config: ProviderConfig): Promise<boolean> {
    try {
      // This would make a test API call to verify the connection
      // Implementation would vary by provider
      return true;
    } catch (error) {
      console.error(`Failed to test connection for ${config.name}:`, error);
      return false;
    }
  }
}
