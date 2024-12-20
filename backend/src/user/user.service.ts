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
    if (!user) throw new NotFoundException("User not found");
    return user.ID; // Return the user ID if found, otherwise return null
  } //! make sure to catch where calling this function

    //temporary function
    async assignSocketAndTokenToUserOrCreateNewUser(socketID: string, token: string | null, server: Namespace) {
      // Step 1: Find user with an empty websocketID
      const emptyWebSocketUser = await this.prisma.user.findFirst({
        where: { websocketID: null },
      });

      if (emptyWebSocketUser) {
        // Assign socketID if user with empty websocketID is found
        return await this.prisma.user.update({
          where: { ID: emptyWebSocketUser.ID },
          data: { websocketID: socketID,
                  token: token },
        });
      }

      // Step 2: Check if any user has an inactive websocketID
      const users = await this.prisma.user.findMany(); // Fetch all users
      for (const user of users) {

        try {
          if (user.websocketID) {
            const socket = server.sockets.get(user.websocketID);
            if (!socket) {
              // Replace websocketID if an inactive socket is found
              return await this.prisma.user.update({
                where: { ID: user.ID },
                data: { websocketID: socketID,
                  token: token },
              });
            }
          }
        }
        catch (error) {
          console.log('error fetching socket: ', error)
        }
      }

      // Step 3: If no users have an empty or inactive websocketID, create a new user
      return await this.prisma.user.create({
        data: { username: `user${socketID}`, intraUsername: 'Timmy', Enabled2FA: false, status: UserStatus.ONLINE, websocketID: socketID, token: token },
      });
    }

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

    async getUserIDByIntraUsername(intraUsername: string): Promise<number | null> {
      const user = await this.prisma.user.findUnique({
        where: { intraUsername: intraUsername },
          select: { ID: true }
      });
      console.log("user = ", user);

      if (!user)
        throw new NotFoundException("User not found!");

      return user.ID;
    }

    async getUserProfileByUserID(token): Promise<UserProfile | null> {
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

    async updateUsername(token: string, newUsername: string) {
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

    async updateAvatar(token: string, avatar: Buffer) {
      const intraUsername = await this.loginService.getIntraName(token);
      return await this.prisma.user.update({
          where: { intraUsername: intraUsername },
          data: { avatar },
      });
    }

    async toggle2FA(token: string, enable: boolean) {
      const intraUsername = await this.loginService.getIntraName(token);
      return await this.prisma.user.update({
        where: { intraUsername: intraUsername },
          data: { Enabled2FA: enable },
      });
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
