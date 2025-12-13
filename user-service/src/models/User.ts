import { query } from '../config/database';
import { User, RegisterDto } from '../types';
import bcrypt from 'bcryptjs';
import config from '../config';
import { PoolClient } from 'pg';

export class UserModel {
  // Hash password (public method for use in controllers)
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.bcrypt.saltRounds);
  }
  
  // Create a new user
  static async create(userData: RegisterDto, isEmailVerified: boolean = false, client?: PoolClient): Promise<User> {
    const { username, email, password, full_name } = userData;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    
    const sql = `
      INSERT INTO users (username, email, password_hash, full_name, is_email_verified, auth_provider, created_at)
      VALUES ($1, $2, $3, $4, $5, 'email', NOW())
      RETURNING user_id, username, email, full_name, is_email_verified, created_at
    `;
    
    // Use client if provided (for transactions), otherwise use global query
    const queryFn = client ? client.query.bind(client) : query;
    const result = await queryFn(sql, [username, email, password_hash, full_name, isEmailVerified]);
    return result.rows[0];
  }
  
  // Create user from OTP verification (after email is verified)
  static async createFromOTP(userData: {
    email: string;
    username: string;
    password_hash: string;
    full_name: string;
  }): Promise<User> {
    const { username, email, password_hash, full_name } = userData;
    
    const sql = `
      INSERT INTO users (username, email, password_hash, full_name, is_email_verified, auth_provider, created_at)
      VALUES ($1, $2, $3, $4, TRUE, 'email', NOW())
      RETURNING user_id, username, email, full_name, is_email_verified, created_at
    `;
    
    const result = await query(sql, [username, email, password_hash, full_name]);
    return result.rows[0];
  }
  
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT user_id, username, email, password_hash, full_name, created_at, updated_at, 
             is_email_verified, auth_provider, provider_id, avatar_url, phone, role
      FROM users
      WHERE email = $1
    `;
    
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }
  
  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const sql = `
      SELECT user_id, username, email, password_hash, full_name, created_at, updated_at,
             is_email_verified, auth_provider, provider_id, avatar_url, phone, role
      FROM users
      WHERE username = $1
    `;
    
    const result = await query(sql, [username]);
    return result.rows[0] || null;
  }
  
  // Find user by ID
  static async findById(userId: number): Promise<User | null> {
    const sql = `
      SELECT user_id, username, email, full_name, created_at, updated_at,
             is_email_verified, auth_provider, provider_id, avatar_url, phone, role
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }
  
  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM users WHERE email = $1 LIMIT 1';
    const result = await query(sql, [email]);
    return result.rows.length > 0;
  }
  
  // Check if username exists
  static async usernameExists(username: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM users WHERE username = $1 LIMIT 1';
    const result = await query(sql, [username]);
    return result.rows.length > 0;
  }
  
  // Verify password (updated to handle NULL password_hash for OAuth users)
  static async verifyPassword(plainPassword: string, hashedPassword: string | null | undefined): Promise<boolean> {
    // OAuth users have NULL password_hash, so they cannot login with password
    if (!hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Update user
  static async update(userId: number, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'user_id') {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    if (fields.length === 0) {
      return this.findById(userId);
    }
    
    values.push(userId);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCounter}
      RETURNING user_id, username, email, full_name, created_at, updated_at
    `;
    
    const result = await query(sql, values);
    return result.rows[0] || null;
  }
  
  // Get all users (for admin)
  static async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const sql = `
      SELECT user_id, username, email, full_name, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
  
  // Count total users
  static async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM users';
    const result = await query(sql);
    return parseInt(result.rows[0].total);
  }
  
  // Update email verification status
  static async updateEmailVerification(email: string, isVerified: boolean): Promise<User | null> {
    const sql = `
      UPDATE users
      SET is_email_verified = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING user_id, username, email, full_name, is_email_verified, created_at, updated_at
    `;
    
    const result = await query(sql, [isVerified, email]);
    return result.rows[0] || null;
  }
  
  // Check if email is verified
  static async isEmailVerified(email: string): Promise<boolean> {
    const sql = 'SELECT is_email_verified FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0]?.is_email_verified || false;
  }
  
  // Create OAuth user (for Google/Facebook login)
  static async createOAuthUser(
    email: string,
    full_name: string,
    provider: string,
    provider_id: string,
    avatar_url?: string
  ): Promise<User> {
    // Generate a unique username from email
    const username = email.split('@')[0] + '_' + Date.now();
    
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
    
    const result = await query(sql, [username, email, full_name, provider, provider_id, avatar_url]);
    return result.rows[0];
  }
  
  // Link OAuth provider to existing user
  static async linkProvider(
    user_id: number,
    provider_name: string,
    provider_user_id: string,
    provider_email: string
  ): Promise<void> {
    const sql = `
      INSERT INTO user_auth_providers (user_id, provider_name, provider_user_id, provider_email, is_primary, created_at)
      VALUES ($1, $2, $3, $4, FALSE, NOW())
      ON CONFLICT (provider_name, provider_user_id) DO NOTHING
    `;
    
    await query(sql, [user_id, provider_name, provider_user_id, provider_email]);
  }
}
