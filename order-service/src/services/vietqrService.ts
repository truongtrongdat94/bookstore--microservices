import axios, { AxiosError } from 'axios';
import config from '../config';

// VietQR Types
export interface VietQRConfig {
  clientId: string;
  apiKey: string;
  apiUrl: string;
  accountNo: string;
  accountName: string;
  acqId: number;
  template: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export interface VietQRRequest {
  accountNo: string;
  accountName: string;
  acqId: number;
  amount: number;
  addInfo: string;
  template: string;
}

export interface VietQRResponse {
  code: string;
  desc: string;
  data: {
    qrCode: string;
    qrDataURL: string;
  };
}

export interface GenerateQRResult {
  success: boolean;
  qrCode?: string;
  qrDataURL?: string;
  transferContent?: string;
  error?: string;
}

/**
 * Format order ID to transfer content
 * Format: DH + 6-digit padded order ID (e.g., DH000123)
 */
export function formatTransferContent(orderId: number): string {
  return `DH${orderId.toString().padStart(6, '0')}`;
}

/**
 * Build VietQR API request parameters
 * Note: VietQR API requires amount to be an integer (no decimals)
 */
export function buildQRRequest(orderId: number, amount: number): VietQRRequest {
  // VietQR API only accepts integer amounts (max 13 digits)
  // Round to nearest integer to avoid "Invalid amount" error
  const integerAmount = Math.round(amount);
  
  return {
    accountNo: String(config.vietqr.accountNo),
    accountName: String(config.vietqr.accountName),
    acqId: config.vietqr.acqId,
    amount: integerAmount,
    addInfo: formatTransferContent(orderId),
    template: String(config.vietqr.template),
  };
}

class VietQRService {
  private config: VietQRConfig;

  constructor() {
    this.config = {
      clientId: String(config.vietqr.clientId),
      apiKey: String(config.vietqr.apiKey),
      apiUrl: String(config.vietqr.apiUrl),
      accountNo: String(config.vietqr.accountNo),
      accountName: String(config.vietqr.accountName),
      acqId: config.vietqr.acqId,
      template: config.vietqr.template,
    };
  }

  /**
   * Generate QR code for payment
   * @param orderId - The order ID
   * @param amount - The payment amount
   * @returns QR generation result
   */
  async generateQR(orderId: number, amount: number): Promise<GenerateQRResult> {
    const requestBody = buildQRRequest(orderId, amount);
    const transferContent = formatTransferContent(orderId);

    try {
      const response = await axios.post<VietQRResponse>(
        this.config.apiUrl,
        requestBody,
        {
          headers: {
            'x-client-id': this.config.clientId,
            'x-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.code === '00' && response.data.data) {
        return {
          success: true,
          qrCode: response.data.data.qrCode,
          qrDataURL: response.data.data.qrDataURL,
          transferContent,
        };
      }

      return {
        success: false,
        error: response.data.desc || 'Unknown error from VietQR API',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.desc 
          || error.message 
          || 'VietQR API request failed';
        
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get bank info for display
   */
  getBankInfo() {
    return {
      account_no: this.config.accountNo,
      account_name: this.config.accountName,
      bank_name: this.getBankName(this.config.acqId),
    };
  }

  /**
   * Get bank name from acqId
   */
  private getBankName(acqId: number): string {
    const bankNames: Record<number, string> = {
      970422: 'MB Bank',
      970415: 'VietinBank',
      970436: 'Vietcombank',
      970418: 'BIDV',
      970405: 'Agribank',
      970407: 'Techcombank',
      970416: 'ACB',
      970432: 'VPBank',
      970423: 'TPBank',
      970403: 'Sacombank',
    };
    return bankNames[acqId] || 'Unknown Bank';
  }
}

export const vietqrService = new VietQRService();
export default vietqrService;
