import { Injectable, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Namespace } from 'socket.io';

import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //temporary function
  async assignSocketAndTokenToUserOrCreateNewUser(socketID: string, token: string | null, server: Namespace): Promise<User> {
    // Step 1: Find user with an empty websocketID
    const emptyWebSocketUser = await this.prisma.user.findFirst({
      where: { websocketID: null },
    });

    if (emptyWebSocketUser)
      // Assign socketID if user with empty websocketID is found
      return await this.prisma.user.update({
        where: { ID: emptyWebSocketUser.ID },
        data: { websocketID: socketID, token: token },
      });

    // Step 2: Check if any user has an inactive websocketID
    const users = await this.prisma.user.findMany(); // Fetch all users
    for (const user of users) {
      try {
        if (user.websocketID) {
          const socket = server.sockets.get(user.websocketID);
          if (!socket)
            // Replace websocketID if an inactive socket is found
            return await this.prisma.user.update({
              where: { ID: user.ID },
              data: { websocketID: socketID, token: token },
            });
        }
      } catch (error) {
        console.error('error fetching socket: ', error);
      }
    }

    // Step 3: If no users have an empty or inactive websocketID, create a new user
    return await this.prisma.user.create({
      data: {
        username: `user${socketID}`,
        intraUsername: `user${socketID}`,
        Enabled2FA: false,
        status: UserStatus.ONLINE,
        websocketID: socketID,
        token: token,
      },
    });
  }

  async getUserByUserID(userID: number): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
      });
      if (!user) throw new NotFoundException(`User not found.`);
      return user;
    } catch (error) {
      if (error instanceof HttpException)  throw error;
      throw new InternalServerErrorException('An unexpected error occurred', error.message);
    }
  }

  async getUserIDBySocketID(socketID: string): Promise<number> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { websocketID: socketID },
        select: { ID: true },
      });
      if (!user) throw new NotFoundException('User not found');
      return user.ID;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred', error.message);
    }
  }

  async getUserBySocketID(socketID: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { websocketID: socketID },
      });
      if (!user) throw new NotFoundException('User not found')
      return user;
    } catch (error) {
      if (error instanceof HttpException)  throw error;
      throw new InternalServerErrorException('An unexpected error occurred', error.message);
    }
  }
}
