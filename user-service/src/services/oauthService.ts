import { query } from '../config/database';
import { User } from '../types';

export interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface UserAuthProvider {
  provider_id: number;
  user_id: number;
  provider_name: string;
  provider_user_id: string;
  provider_email: string;
  is_primary: boolean;
  created_at: Date;
}

export class OAuthService {
  /**
   * Find or create user based on OAuth data
   * If email exists: link the OAuth provider to existing user
   * If email doesn't exist: create new user with OAuth data
   */
  static async findOrCreateUser(oauthData: OAuthUserData): Promise<User> {
    const { provider, providerId, email, fullName, avatarUrl } = oauthData;

    // Check if user with this email already exists
    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      // User exists - link the OAuth provider to existing account
      await this.linkProvider(
        existingUser.user_id,
        provider,
        providerId,
        email
      );

      // Update avatar if not set and OAuth provides one
      if (!existingUser.avatar_url && avatarUrl) {
        await this.updateUserAvatar(existingUser.user_id, avatarUrl);
        existingUser.avatar_url = avatarUrl;
      }

      return existingUser;
    } else {
      // User doesn't exist - create new user with OAuth data
      const newUser = await this.createOAuthUser(oauthData);
      
      // Link the OAuth provider
      await this.linkProvider(
        newUser.user_id,
        provider,
        providerId,
        email
      );

      return newUser;
    }
  }

  /**
   * Create a new user from OAuth data
   */
  private static async createOAuthUser(oauthData: OAuthUserData): Promise<User> {
    const { provider, providerId, email, fullName, avatarUrl } = oauthData;

    // Generate a unique username from email
    const username = await this.generateUniqueUsername(email);

    const sql = `
      INSERT INTO users (
        username, 
        email, 
        password_hash, 
        full_name, 
        is_email_verified, 
        auth_provider, 
        provider_id, 
        avatar_url,
        created_at
      )
      VALUES ($1, $2, NULL, $3, TRUE, $4, $5, $6, NOW())
      RETURNING user_id, username, email, full_name, is_email_verified, auth_provider, provider_id, avatar_url, created_at
    `;

    const result = await query(sql, [
      username,
      email,
      fullName,
      provider,
      providerId,
      avatarUrl || null
    ]);

    return result.rows[0];
  }

  /**
   * Link an OAuth provider to an existing user
   */
  static async linkProvider(
    userId: number,
    providerName: string,
    providerUserId: string,
    providerEmail: string
  ): Promise<void> {
    // Check if this provider is already linked
    const existingLink = await this.findProviderLink(userId, providerName);

    if (existingLink) {
      // Provider already linked, no need to add again
      return;
    }

    // Check if this is the first provider for the user
    const providerCount = await this.countUserProviders(userId);
    const isPrimary = providerCount === 0;

    const sql = `
      INSERT INTO user_auth_providers (
        user_id, 
        provider_name, 
        provider_user_id, 
        provider_email, 
        is_primary,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (provider_name, provider_user_id) DO NOTHING
    `;

    await query(sql, [
      userId,
      providerName,
      providerUserId,
      providerEmail,
      isPrimary
    ]);
  }

  /**
   * Find user by email
   */
  private static async findUserByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT 
        user_id, 
        username, 
        email, 
        password_hash, 
        full_name, 
        is_email_verified, 
        auth_provider, 
        provider_id, 
        avatar_url,
        created_at, 
        updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by OAuth provider
   */
  static async findUserByProvider(
    providerName: string,
    providerUserId: string
  ): Promise<User | null> {
    const sql = `
      SELECT 
        u.user_id, 
        u.username, 
        u.email, 
        u.password_hash, 
        u.full_name, 
        u.is_email_verified, 
        u.auth_provider, 
        u.provider_id, 
        u.avatar_url,
        u.created_at, 
        u.updated_at
      FROM users u
      JOIN user_auth_providers uap ON u.user_id = uap.user_id
      WHERE uap.provider_name = $1 AND uap.provider_user_id = $2
    `;

    const result = await query(sql, [providerName, providerUserId]);
    return result.rows[0] || null;
  }

  /**
   * Find existing provider link for a user
   */
  private static async findProviderLink(
    userId: number,
    providerName: string
  ): Promise<UserAuthProvider | null> {
    const sql = `
      SELECT * FROM user_auth_providers
      WHERE user_id = $1 AND provider_name = $2
    `;

    const result = await query(sql, [userId, providerName]);
    return result.rows[0] || null;
  }

  /**
   * Count how many providers a user has
   */
  private static async countUserProviders(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM user_auth_providers
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Update user avatar
   */
  private static async updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
    const sql = `
      UPDATE users
      SET avatar_url = $1, updated_at = NOW()
      WHERE user_id = $2
    `;

    await query(sql, [avatarUrl, userId]);
  }

  /**
   * Generate a unique username from email
   */
  private static async generateUniqueUsername(email: string): Promise<string> {
    // Extract base username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if base username is available
    const checkSql = 'SELECT 1 FROM users WHERE username = $1';
    let username = baseUsername;
    let counter = 1;

    while (true) {
      const result = await query(checkSql, [username]);
      if (result.rows.length === 0) {
        return username;
      }
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }

  /**
   * Get all auth providers for a user
   */
  static async getUserProviders(userId: number): Promise<UserAuthProvider[]> {
    const sql = `
      SELECT * FROM user_auth_providers
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }
}
