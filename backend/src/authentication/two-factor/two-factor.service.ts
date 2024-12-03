import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as speakeasy from 'speakeasy'; // https://www.npmjs.com/package/speakeasy
import * as qrcode from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TwoFactorService {

	constructor(private prisma: PrismaService) {}

	async getQRCode(userID: number): Promise<any> {
		try {
			var secret = speakeasy.generateSecret({
				name: "Transcendancing Queens"
			});
			const dataURL = await qrcode.toDataURL(secret.otpauth_url);
			await this.prisma.user.update({
				where: { ID: userID },
				data: { secretKey: secret.ascii },
			});
			return dataURL

		} catch (error) {
			throw new InternalServerErrorException("Error generating QR code for 2FA");
		}
	}

	async verifyOneTimePassword(oneTimePassword: string, userID: number): Promise<boolean> {
		console.log("oneTimePassword: ", oneTimePassword); // For debugging
		try {
			const secretKey = await this.prisma.user.findUnique({
				where: { ID: userID },
				select: { secretKey: true },
			});
			const verified = speakeasy.totp.verify({
				secret: secretKey,
				encoding: 'ascii',
				token: oneTimePassword,
			});
			return verified
		}
		catch (error) {
			throw new InternalServerErrorException('Error while verifying token');
		}
	}

	async enableTwoFactor(userID: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: { ID: userID },
				data: { Enabled2FA: true },
			});
		}
		catch (error) {
			throw new InternalServerErrorException('Error while enabling two-factor authentication');
		}
	}

	async disableTwoFactor(userID: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: { ID: userID },
				data: { 
					secretKey: null,
					Enabled2FA: false,
				},
			});
		}
		catch (error) {
			throw new InternalServerErrorException('Error while disabling two-factor authentication');
		}
	}
}
