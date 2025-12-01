import apiClient from './client';
import { ApiResponse, Address, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from '../types';

export const usersApi = {
  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/users/change-password',
      data
    );
    return response.data.data!;
  },

  // Get addresses
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get<ApiResponse<{ addresses: Address[] }>>(
      '/users/addresses'
    );
    return response.data.data!.addresses;
  },

  // Create address
  createAddress: async (data: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.post<ApiResponse<{ address: Address }>>(
      '/users/addresses',
      data
    );
    return response.data.data!.address;
  },

  // Update address
  updateAddress: async (id: number, data: UpdateAddressDto): Promise<Address> => {
    const response = await apiClient.put<ApiResponse<{ address: Address }>>(
      `/users/addresses/${id}`,
      data
    );
    return response.data.data!.address;
  },

  // Delete address
  deleteAddress: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/users/addresses/${id}`
    );
    return response.data.data!;
  },

  // Set default address
  setDefaultAddress: async (id: number): Promise<Address> => {
    const response = await apiClient.put<ApiResponse<{ address: Address }>>(
      `/users/addresses/${id}/default`
    );
    return response.data.data!.address;
  },
};
