import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Statistics } from '@prisma/client'
import { LoginService } from '../authentication//login/login.service';

interface UserProfile extends User {
  avatarURL: string;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly loginService: LoginService,
  ) {}

  async getUserIDByToken(token: string): Promise<number> {
    const intraUsername = await this.loginService.getIntraName(token);
    const user = await this.prisma.user.findUnique({
      where: {
        intraUsername: intraUsername,
      },
      select: {
        ID: true,
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user.ID; // Return the user ID if found, otherwise return null
  } //! make sure to catch where calling this function

  async getUserProfileByToken(token: string): Promise<UserProfile> {
    const intraName = await this.loginService.getIntraName(token);
    console.log("intraName = ", intraName);

    if (!intraName)
      throw new NotFoundException('intraUsername not found');

    const user = await this.prisma.user.findUnique({
      where: { intraUsername: intraName },
    });
    console.log("user = ", user);

    if (!user)
      throw new NotFoundException("User not found!");

    // console.log("FROM SERVICE.TS: user.avatar = ", user.avatar);
    const avatarURL = user.avatar
      ? `data:image/jpeg;base64,${user.avatar.toString('base64')}`
      : 'http://localhost:3001/images/default-avatar.png';

    // console.log("FROM SERVICE.TS: avatarURL = ", avatarURL);

    return {
      ...user,
      avatarURL, // Attach either the user's avatar or the default avatar URL
    };
  }

  async updateUsername(token: string, newUsername: string): Promise<User> {
    try {
      const intraUsername = await this.loginService.getIntraName(token);
      const updatedUser = await this.prisma.user.update({
        where: { intraUsername: intraUsername },
        data: { username: newUsername },
      });
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating username');
    }
  }

  async updateAvatar(token: string, avatar: Buffer): Promise<User> {
    const intraUsername = await this.loginService.getIntraName(token);
    return await this.prisma.user.update({
        where: { intraUsername: intraUsername },
        data: { avatar },
    });
  }

  async toggle2FA(token: string, enable: boolean): Promise<User> {
    const intraUsername = await this.loginService.getIntraName(token);
    return await this.prisma.user.update({
      where: { intraUsername: intraUsername },
        data: { Enabled2FA: enable },
    });
  }

  async getUserStats(userID: number): Promise<Statistics | null> {
    const statistics = await this.prisma.statistics.findUnique({
      where: { userID: userID },
    });
    console.log("statistics = ", statistics);

    if (!statistics)
      throw new NotFoundException("Statistics not found!");

    return statistics;
  }
}
