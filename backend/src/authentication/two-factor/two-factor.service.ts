import { Injectable, NotFoundException } from '@nestjs/common';
import * as speakeasy from 'speakeasy'; // https://www.npmjs.com/package/speakeasy
import * as qrcode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorHandlingService } from '../../error-handling/error-handling.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private readonly errorHandlingservice: ErrorHandlingService,
  ) {}

  async getQRCode(userID: number): Promise<any> {
    try {
      const secret = speakeasy.generateSecret({
        name: 'Transcendancing Queens',
      });
      const dataURL = await qrcode.toDataURL(secret.otpauth_url);
      await this.prisma.user.update({
        where: { ID: userID },
        data: { secretKey: secret.ascii },
      });
      return dataURL;
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
    }
  }

  async isTwoFactorEnabled(intraUsername: string): Promise<boolean> {
    try {
      const isEnabled = await this.prisma.user.findUnique({
        where: { intraUsername: intraUsername },
        select: { Enabled2FA: true },
      });
      if (isEnabled === null) {
        throw new NotFoundException('User not found');
      } else {
        return isEnabled.Enabled2FA;
      }
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
    }
  }

  async verifyOneTimePassword(oneTimePassword: string, intraUsername: string): Promise<boolean> {
    try {
      const secretKey = await this.prisma.user.findUnique({
        where: { intraUsername: intraUsername },
        select: { secretKey: true },
      });
      const verified = speakeasy.totp.verify({
        secret: secretKey.secretKey,
        encoding: 'ascii',
        token: oneTimePassword,
      });
      return verified;
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
    }
  }

  async enableTwoFactor(userID: number): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { ID: userID },
        data: { Enabled2FA: true },
      });
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
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
    } catch (error) {
      this.errorHandlingservice.throwHttpException(error);
    }
  }
}
