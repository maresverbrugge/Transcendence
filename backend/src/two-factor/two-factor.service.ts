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

	async verifyOneTimePassword(oneTimePassword: string): Promise<any> {
		console.log("oneTimePassword: ", oneTimePassword); // For debugging
		const verified = speakeasy.totp.verify({
			secret: SECRET,
			encoding: 'ascii',
			token: oneTimePassword,
		});
		return verified
	}
}
