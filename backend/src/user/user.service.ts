import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserStatus } from '@prisma/client'

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
    if (!user) throw new NotFoundException('User not found');
    return user.ID;
  } //! make sure to catch where calling this function

    async removewebsocketIDFromUser(websocketID: string) {
      const user = await this.getUserBySocketID(websocketID);
      if (user) {
        return await this.prisma.user.update({
          where: { ID: user.ID },
          data: { websocketID: null },
        });
      }
    }
    
    async getUsers(client: Socket) {
        const users: User[] = await this.prisma.user.findMany(); // Fetch all users from the User model
        client.emit('users', users);
      }

    async getUserByUserID(userID: number): Promise<User | null> {
      return this.prisma.user.findUnique({
        where: { ID: userID },
      });
    }

    async getUserProfileByUserID(userID: number): Promise<UserProfile | null> {
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
      });
      // console.log("user = ", user);

      if (!user) return null;

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

    async createUser(socketID: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                username: socketID,
                intraUsername: socketID,
                websocketID: socketID,
                Enabled2FA: true,
                status: UserStatus.ONLINE,
                },
        });
    }

    async updateUsername(userID: number, newUsername: string) {
      try {
        const updatedUser = await this.prisma.user.update({
          where: { ID: userID },
          data: { username: newUsername },
        });
        return updatedUser;
      } catch (error) {
        throw new Error('Error updating username');
      }
    }

    async updateAvatar(userID: number, avatar: Buffer) {
      return await this.prisma.user.update({
          where: { ID: userID },
          data: { avatar },
      });
    }

    async toggle2FA(userID: number, enable: boolean) {
      return await this.prisma.user.update({
          where: { ID: userID },
          data: { Enabled2FA: enable },
      });
    }

	async getSocketIDByUserID(userID: number): Promise<string | null> {
        const user = await this.prisma.user.findUnique({
          where: {
            ID: userID,
          },
          select: {
            websocketID: true,
          },
        });
        return user?.websocketID || null; // Return the user's websocketID if found, otherwise return null
      }

    async getUserIDBySocketID(socketID: string): Promise<number | null> {
        const user = await this.prisma.user.findUnique({
          where: {
            websocketID: socketID,
          },
          select: {
            ID: true,
          },
        });
        return user?.ID || null; // Return the user ID if found, otherwise return null
      }

    async getSocketIDByUserID(userID: number): Promise<string | null> {
        const user = await this.prisma.user.findUnique({
          where: {
            ID: userID,
          },
          select: {
            websocketID: true,
          },
        });
        return user?.websocketID || null; // Return the user's websocketID if found, otherwise return null
      }

      async getUserBySocketID(socketID: string): Promise<User | null> {
        return this.prisma.user.findUnique({
          where: {
            websocketID: socketID,
          }
        });
      }

      async deleteUserBySocketID(socketID: string): Promise<User | null> {
        const userID = await this.getUserIDBySocketID(socketID);

        if (userID) {
          return this.prisma.user.delete({
            where: {
              ID: userID, // Deleting user by ID
            },
          });
        }
      }
}
