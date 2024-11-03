import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {
	async getQRCode(something: string): Promise<any> {
		console.log('2FA service');
		console.log("something:", something);

		var secret = speakeasy.generateSecret({
			name: "Transcendancing Queens"
		});
		console.log("secret:", secret);

		try {
			const dataURL = await qrcode.toDataURL(secret.otpauth_url);
			console.log("dataURL:", dataURL);
			return dataURL

		} catch (error) {
			console.log("error in 2FA service:", error);
			throw new Error("Error generating QR code");
		}
	}
}
