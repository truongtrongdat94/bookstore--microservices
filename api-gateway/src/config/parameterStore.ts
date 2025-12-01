/**
 * AWS Parameter Store Integration Module
 * 
 * This module provides integration with AWS Systems Manager Parameter Store
 * for secure secrets management in production environments.
 * 
 * **Feature: aws-deployment-readiness, Property 1: Production secrets from Parameter Store**
 * 
 * Usage:
 * - In production (NODE_ENV=production), secrets are loaded from Parameter Store
 * - In development, fallback to environment variables or defaults
 * 
 * IAM Permissions Required:
 * ```json
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "ssm:GetParameter",
 *         "ssm:GetParameters",
 *         "ssm:GetParametersByPath"
 *       ],
 *       "Resource": "arn:aws:ssm:*:*:parameter/bookstore/*"
 *     },
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "kms:Decrypt"
 *       ],
 *       "Resource": "arn:aws:kms:*:*:key/*",
 *       "Condition": {
 *         "StringEquals": {
 *           "kms:ViaService": "ssm.*.amazonaws.com"
 *         }
 *       }
 *     }
 *   ]
 * }
 * ```
 */

/**
 * Configuration for Parameter Store connection
 */
export interface ParameterStoreConfig {
  /** AWS region (e.g., 'ap-southeast-1') */
  region: string;
  /** Parameter path prefix (e.g., '/bookstore/production/') */
  prefix: string;
  /** Maximum retry attempts for Parameter Store calls */
  maxRetries?: number;
  /** Timeout in milliseconds for Parameter Store calls */
  timeout?: number;
}

/**
 * Definition of a secret to be loaded from Parameter Store
 */
export interface SecretDefinition {
  /** Environment variable name to set (e.g., 'DB_PASSWORD') */
  name: string;
  /** Parameter Store parameter name (e.g., 'db-password') */
  parameterName: string;
  /** Whether this secret is required for the service to start */
  required: boolean;
  /** Service-specific or shared secret */
  scope?: 'shared' | 'service';
}

/**
 * Result of loading secrets from Parameter Store
 */
export interface LoadSecretsResult {
  /** Whether all required secrets were loaded successfully */
  success: boolean;
  /** List of secrets that were loaded */
  loaded: string[];
  /** List of secrets that failed to load */
  failed: string[];
  /** Error messages for failed secrets */
  errors: string[];
}

/**
 * Secrets to be stored in Parameter Store for api-gateway service
 * 
 * Parameter Store naming convention:
 * /bookstore/{environment}/{scope}/{parameter}
 * 
 * Examples:
 * - /bookstore/production/shared/jwt-secret
 * - /bookstore/production/api-gateway/rate-limit-key
 * - /bookstore/production/shared/redis-password
 */
export const API_GATEWAY_SECRETS: SecretDefinition[] = [
  { 
    name: 'JWT_SECRET', 
    parameterName: 'jwt-secret', 
    required: true,
    scope: 'shared'
  },
];

/**
 * Secrets for user-service
 */
export const USER_SERVICE_SECRETS: SecretDefinition[] = [
  { name: 'DB_PASSWORD', parameterName: 'db-password', required: true, scope: 'service' },
  { name: 'JWT_SECRET', parameterName: 'jwt-secret', required: true, scope: 'shared' },
  { name: 'GOOGLE_CLIENT_SECRET', parameterName: 'google-client-secret', required: true, scope: 'service' },
  { name: 'FACEBOOK_APP_SECRET', parameterName: 'facebook-app-secret', required: true, scope: 'service' },
  { name: 'SMTP_PASS', parameterName: 'smtp-password', required: true, scope: 'service' },
];

/**
 * Secrets for book-service
 */
export const BOOK_SERVICE_SECRETS: SecretDefinition[] = [
  { name: 'DB_PASSWORD', parameterName: 'db-password', required: true, scope: 'service' },
  { name: 'REDIS_PASSWORD', parameterName: 'redis-password', required: true, scope: 'shared' },
];

/**
 * Secrets for order-service
 */
export const ORDER_SERVICE_SECRETS: SecretDefinition[] = [
  { name: 'DB_PASSWORD', parameterName: 'db-password', required: true, scope: 'service' },
  { name: 'REDIS_PASSWORD', parameterName: 'redis-password', required: true, scope: 'shared' },
  { name: 'VIETQR_API_KEY', parameterName: 'vietqr-api-key', required: true, scope: 'service' },
];

/**
 * Secrets for notification-service
 */
export const NOTIFICATION_SERVICE_SECRETS: SecretDefinition[] = [
  { name: 'DB_PASSWORD', parameterName: 'db-password', required: true, scope: 'service' },
  { name: 'SMTP_PASS', parameterName: 'smtp-password', required: true, scope: 'service' },
];

/**
 * Secrets for blog-service
 */
export const BLOG_SERVICE_SECRETS: SecretDefinition[] = [
  { name: 'DB_PASSWORD', parameterName: 'db-password', required: true, scope: 'service' },
  { name: 'REDIS_PASSWORD', parameterName: 'redis-password', required: true, scope: 'shared' },
];

/**
 * Default Parameter Store configuration
 */
export const DEFAULT_PARAMETER_STORE_CONFIG: ParameterStoreConfig = {
  region: process.env.AWS_REGION || 'ap-southeast-1',
  prefix: `/bookstore/${process.env.NODE_ENV || 'development'}/`,
  maxRetries: 3,
  timeout: 5000,
};

/**
 * Builds the full Parameter Store path for a secret
 * 
 * @param config - Parameter Store configuration
 * @param secret - Secret definition
 * @param serviceName - Name of the service (e.g., 'api-gateway')
 * @returns Full parameter path
 */
export function buildParameterPath(
  config: ParameterStoreConfig,
  secret: SecretDefinition,
  serviceName: string
): string {
  const scope = secret.scope === 'shared' ? 'shared' : serviceName;
  return `${config.prefix}${scope}/${secret.parameterName}`;
}

/**
 * Checks if the application should use Parameter Store for secrets
 * 
 * @returns true if NODE_ENV is 'production'
 */
export function shouldUseParameterStore(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Loads secrets from AWS Parameter Store
 * 
 * This function attempts to load all defined secrets from Parameter Store.
 * In production, it will fail if required secrets are missing.
 * 
 * **Note**: This is a template implementation. In actual deployment,
 * you need to install @aws-sdk/client-ssm and implement the AWS SDK calls.
 * 
 * @param secrets - Array of secret definitions to load
 * @param serviceName - Name of the service loading secrets
 * @param config - Optional Parameter Store configuration
 * @returns Promise resolving to load result
 * 
 * @example
 * ```typescript
 * // In production startup
 * if (shouldUseParameterStore()) {
 *   const result = await loadSecretsFromParameterStore(
 *     API_GATEWAY_SECRETS,
 *     'api-gateway'
 *   );
 *   if (!result.success) {
 *     console.error('Failed to load secrets:', result.errors);
 *     process.exit(1);
 *   }
 * }
 * ```
 */
export async function loadSecretsFromParameterStore(
  secrets: SecretDefinition[],
  serviceName: string,
  config: ParameterStoreConfig = DEFAULT_PARAMETER_STORE_CONFIG
): Promise<LoadSecretsResult> {
  const result: LoadSecretsResult = {
    success: true,
    loaded: [],
    failed: [],
    errors: [],
  };

  // Skip if not in production
  if (!shouldUseParameterStore()) {
    return result;
  }

  /**
   * IMPLEMENTATION NOTE:
   * 
   * To use this in production, install the AWS SDK:
   * npm install @aws-sdk/client-ssm
   * 
   * Then implement the actual Parameter Store calls:
   * 
   * ```typescript
   * import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
   * 
   * const client = new SSMClient({ 
   *   region: config.region,
   *   maxAttempts: config.maxRetries 
   * });
   * 
   * for (const secret of secrets) {
   *   const parameterPath = buildParameterPath(config, secret, serviceName);
   *   try {
   *     const command = new GetParameterCommand({
   *       Name: parameterPath,
   *       WithDecryption: true, // For SecureString parameters
   *     });
   *     const response = await client.send(command);
   *     if (response.Parameter?.Value) {
   *       process.env[secret.name] = response.Parameter.Value;
   *       result.loaded.push(secret.name);
   *     }
   *   } catch (error) {
   *     if (secret.required) {
   *       result.success = false;
   *       result.failed.push(secret.name);
   *       result.errors.push(`Failed to load ${secret.name}: ${error.message}`);
   *     }
   *   }
   * }
   * ```
   */

  // Template implementation - validates that secrets would be loaded
  for (const secret of secrets) {
    const parameterPath = buildParameterPath(config, secret, serviceName);
    
    // In actual implementation, this would call AWS Parameter Store
    // For now, check if the environment variable is already set
    const existingValue = process.env[secret.name];
    
    if (existingValue) {
      result.loaded.push(secret.name);
    } else if (secret.required) {
      result.success = false;
      result.failed.push(secret.name);
      result.errors.push(
        `Missing required secret: ${secret.name} (Parameter Store path: ${parameterPath})`
      );
    }
  }

  return result;
}

/**
 * Validates that all required secrets are available
 * Throws an error if any required secret is missing in production
 * 
 * @param secrets - Array of secret definitions to validate
 * @param serviceName - Name of the service
 * @throws Error if required secrets are missing in production
 */
export async function validateSecrets(
  secrets: SecretDefinition[],
  serviceName: string
): Promise<void> {
  if (!shouldUseParameterStore()) {
    return; // Skip validation in non-production
  }

  const result = await loadSecretsFromParameterStore(secrets, serviceName);
  
  if (!result.success) {
    throw new Error(
      `Failed to load required secrets for ${serviceName}:\n` +
      result.errors.join('\n')
    );
  }
}

/**
 * Gets the Parameter Store path for documentation/debugging
 * 
 * @param serviceName - Name of the service
 * @param secrets - Array of secret definitions
 * @returns Object mapping secret names to their Parameter Store paths
 */
export function getParameterPaths(
  serviceName: string,
  secrets: SecretDefinition[],
  config: ParameterStoreConfig = DEFAULT_PARAMETER_STORE_CONFIG
): Record<string, string> {
  const paths: Record<string, string> = {};
  
  for (const secret of secrets) {
    paths[secret.name] = buildParameterPath(config, secret, serviceName);
  }
  
  return paths;
}
