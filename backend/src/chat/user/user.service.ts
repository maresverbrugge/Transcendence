import { Injectable } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, PlayerStatus } from '@prisma/client'


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    //temporary function
    async assignSocketAndTokenToUserOrCreateNewUser(socketID: string, token: string | null, server: Namespace) {
      // Step 1: Find user with an empty websocketId
      const emptyWebSocketUser = await this.prisma.user.findFirst({
        where: { websocketId: null },
      });
    
      if (emptyWebSocketUser) {
        // Assign socketID if user with empty websocketId is found
        return await this.prisma.user.update({
          where: { id: emptyWebSocketUser.id },
          data: { websocketId: socketID,
                  token: token },
        });
      }
    
      // Step 2: Check if any user has an inactive websocketId
      const users = await this.prisma.user.findMany(); // Fetch all users
      for (const user of users) {

        try {
          if (user.websocketId) {
            const socket = server.sockets.get(user.websocketId);
            if (!socket) {
              // Replace websocketId if an inactive socket is found
              return await this.prisma.user.update({
                where: { id: user.id },
                data: { websocketId: socketID,
                  token: token },
              });
            }
          }
        }
        catch (error) {
          console.log('error fetching socket: ', error)
        }
      }
    
      // Step 3: If no users have an empty or inactive websocketId, create a new user
      return await this.prisma.user.create({
        data: { username: `user${socketID}`, intraUsername: 'Timmy', Enabled2FA: false, status: PlayerStatus.ONLINE, websocketId: socketID, token: token },
      });
    }

    async removeWebsocketIDFromUser(websocketID: string) {
      const user = await this.getUserBySocketId(websocketID);
      if (user) {
        return await this.prisma.user.update({
          where: { id: user.id },
          data: { websocketId: null },
        });
      }
    }
    

    async getUsers(client: Socket) {
        const users: User[] = await this.prisma.user.findMany(); // Fetch all users from the User model
        client.emit('users', users);
      }

    async getUserByUserId(userId: number): Promise<User | null> {
      return this.prisma.user.findUnique({
        where: { id: userId },
      });
    }

    async createUser(socketId: string): Promise<User> {
        return this.prisma.user.create({
            data: {
                username: socketId,
                intraUsername: socketId,
                websocketId: socketId,
                Enabled2FA: true,
                status: PlayerStatus.ONLINE,
                },
        });
    }

    async getUserIdBySocketId(socketId: string): Promise<number | null> {
        const user = await this.prisma.user.findUnique({
          where: {
            websocketId: socketId,
          },
          select: {
            id: true,
          },
        });
        return user?.id || null; // Return the user ID if found, otherwise return null
      }

      async getUserBySocketId(socketId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
          where: {
            websocketId: socketId,
          }
        });
      }

      async deleteUserBySocketID(socketID: string): Promise<User | null> {
        const userId = await this.getUserIdBySocketId(socketID);
    
        if (userId) {
          return this.prisma.user.delete({
            where: {
              id: userId, // Deleting user by ID
            },
          });
        }
      }
}
