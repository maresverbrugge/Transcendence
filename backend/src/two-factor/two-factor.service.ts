import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy'; // https://www.npmjs.com/package/speakeasy
import * as qrcode from 'qrcode';

const SECRET = '{dn4KV)lHN^{Sr29I?R:4a^p#oh/0PG7';

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

	async verifyOneTimePassword(one_time_password: string): Promise<any> {
		console.log("one_time_password: ", one_time_password);
		const verified = speakeasy.totp.verify({
			secret: SECRET,
			encoding: 'ascii',
			token: one_time_password,
		});
		return verified
	}
}
