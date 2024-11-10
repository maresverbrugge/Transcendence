import { Injectable } from '@nestjs/common';
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
			console.log("unique secret:", secret.ascii);
			const dataURL = await qrcode.toDataURL(secret.otpauth_url);
			return dataURL

		} catch (error) {
			console.log("error in 2FA service:", error);
			throw new Error("Error generating QR code");
		}
	}

	async verifyOneTimePassword(oneTimePassword: string): Promise<any> {
		console.log("oneTimePassword: ", oneTimePassword);
		const verified = speakeasy.totp.verify({
			secret: SECRET,
			encoding: 'ascii',
			token: oneTimePassword,
		});
		return verified
	}
}
