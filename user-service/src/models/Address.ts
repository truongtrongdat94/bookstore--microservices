import { query } from '../config/database';
import { Address, CreateAddressDto, UpdateAddressDto } from '../types';

export class AddressModel {
  // Get all addresses for a user
  static async findByUserId(userId: number): Promise<Address[]> {
    const sql = `
      SELECT * FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get a specific address
  static async findById(addressId: number, userId: number): Promise<Address | null> {
    const sql = `
      SELECT * FROM user_addresses
      WHERE address_id = $1 AND user_id = $2
    `;
    const result = await query(sql, [addressId, userId]);
    return result.rows[0] || null;
  }

  // Create new address
  static async create(userId: number, data: CreateAddressDto): Promise<Address> {
    const sql = `
      INSERT INTO user_addresses (
        user_id, name, phone, company, address, country,
        province, district, ward, zip_code, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      userId,
      data.name,
      data.phone,
      data.company || null,
      data.address,
      data.country,
      data.province,
      data.district,
      data.ward,
      data.zip_code || null,
      data.is_default
    ];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update address
  static async update(addressId: number, userId: number, data: UpdateAddressDto): Promise<Address | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (fields.length === 0) {
      return this.findById(addressId, userId);
    }

    values.push(addressId, userId);
    const sql = `
      UPDATE user_addresses
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE address_id = $${paramCounter} AND user_id = $${paramCounter + 1}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  // Delete address
  static async delete(addressId: number, userId: number): Promise<boolean> {
    const sql = `
      DELETE FROM user_addresses
      WHERE address_id = $1 AND user_id = $2
    `;
    const result = await query(sql, [addressId, userId]);
    return result.rowCount! > 0;
  }

  // Set default address
  static async setDefault(addressId: number, userId: number): Promise<Address | null> {
    // The trigger will handle unsetting other defaults
    return this.update(addressId, userId, { is_default: true });
  }
}
