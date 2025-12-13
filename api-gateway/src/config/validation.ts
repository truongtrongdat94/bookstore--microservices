export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export interface ConfigDefinition {
  name: string;
  required: boolean;
  sensitive: boolean;
  defaultValue?: string | number;
}

const KNOWN_DEFAULTS = ['dev-jwt-secret-key', 'dev-jwt-secret', 'dev_password', 'password', 'secret', 'changeme'];

export function validateRequiredEnvVar(name: string, value: string | undefined): void {
  if (value === undefined || value === '') {
    throw new Error('Missing required environment variable: ' + name);
  }
}

export function isKnownDefault(value: string | number | undefined): boolean {
  if (value === undefined) return false;
  const strValue = String(value).toLowerCase();
  return KNOWN_DEFAULTS.some(def => strValue.includes(def.toLowerCase()));
}

export function validateConfig(configs: ConfigDefinition[], nodeEnv: string = 'development'): ValidationResult {
  const isProduction = nodeEnv === 'production';
  const missing: string[] = [];
  const warnings: string[] = [];
  for (const config of configs) {
    const value = process.env[config.name];
    if (config.required && (value === undefined || value === '')) {
      if (isProduction) missing.push(config.name);
      else if (config.defaultValue === undefined) warnings.push(`${config.name} is not set`);
    }
    if (isProduction && config.sensitive && value && isKnownDefault(value)) {
      missing.push(`${config.name} (insecure default)`);
    }
  }
  return { valid: missing.length === 0, missing, warnings };
}

export function validateAndThrow(configs: ConfigDefinition[], nodeEnv: string = 'development'): void {
  const result = validateConfig(configs, nodeEnv);
  if (!result.valid) throw new Error(`Config validation failed: ${result.missing.join(', ')}`);
}

export function getEnvVar(name: string, opts: { defaultValue?: string | number; required?: boolean; sensitive?: boolean } = {}): string | number {
  const { defaultValue, required = false, sensitive = false } = opts;
  const value = process.env[name];
  const isProduction = process.env.NODE_ENV === 'production';
  if (value !== undefined && value !== '') {
    if (isProduction && sensitive && isKnownDefault(value)) throw new Error(`${name} uses insecure default`);
    return value;
  }
  if (required && isProduction) throw new Error(`Missing required environment variable: ${name}`);
  if (defaultValue !== undefined) return defaultValue;
  if (!required) return '';
  throw new Error(`Missing required environment variable: ${name}`);
}
