import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as speakeasy from 'speakeasy'; // https://www.npmjs.com/package/speakeasy
import * as qrcode from 'qrcode';

const SECRET = 'dZwW4A)!qcey/QN)KxzWwnhTJtTEySFn';

@Injectable()
export class TwoFactorService {

	async getQRCode(): Promise<any> {
		try {
			var secret = speakeasy.generateSecret({
				name: "Transcendancing Queens"
			});
			console.log("Unique secret:", secret.ascii); // For debugging
			const dataURL = await qrcode.toDataURL(secret.otpauth_url);
			return dataURL

		} catch (error) {
			console.error("Error in 2FA service:", error);
			throw new InternalServerErrorException("Error generating QR code");
		}
	}

	async verifyOneTimePassword(oneTimePassword: string): Promise<boolean> {
		console.log("oneTimePassword: ", oneTimePassword); // For debugging
		try {
			const verified = speakeasy.totp.verify({
				secret: SECRET,
				encoding: 'ascii',
				token: oneTimePassword,
			});
			return verified
		}
		catch (error) {
			var message = error.response ? error.response.data : error.message;
      		console.error('Error while verifying token:', message);
			throw new InternalServerErrorException('Error while verifying token');
		}
	}
}
