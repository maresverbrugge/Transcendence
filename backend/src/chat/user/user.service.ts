import { Injectable, NotFoundException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserStatus } from '@prisma/client'


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    //temporary function
    async assignSocketAndTokenToUserOrCreateNewUser(socketID: string, token: string | null, server: Namespace) {
      // Step 1: Find user with an empty websocketID
      const emptyWebSocketUser = await this.prisma.user.findFirst({
        where: { websocketID: null },
      });
    
      if (emptyWebSocketUser)
        // Assign socketID if user with empty websocketID is found
        return await this.prisma.user.update({
          where: { ID: emptyWebSocketUser.ID },
          data: { websocketID: socketID,
                  token: token },
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
                data: { websocketID: socketID,
                  token: token },
              });
          }
        }
        catch (error) {
          console.log('error fetching socket: ', error)
        }
      }
    
      // Step 3: If no users have an empty or inactive websocketID, create a new user
      return await this.prisma.user.create({
        data: { username: `user${socketID}`, intraUsername: `user${socketID}`, Enabled2FA: false, status: UserStatus.ONLINE, websocketID: socketID, token: token },
      });
    }

    async removeWebsocketIDFromUser(websocketID: string) {
      const user = await this.getUserBySocketID(websocketID);
      if (user)
        return await this.prisma.user.update({
          where: { ID: user.ID },
          data: { websocketID: null },
        });
    }
    

    async getUsers(client: Socket) {
        const users: User[] = await this.prisma.user.findMany(); // Fetch all users from the User model
        client.emit('users', users);
      }

    async getUserByUserID(userID: number): Promise<User | null> {
      const user = await this.prisma.user.findUnique({
        where: { ID: userID },
      });
      if (!user)
        throw new NotFoundException(`User with ID ${userID} not found.`);
      return (user)
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

    async getWebSocketByUserID(server: Namespace, userID: number) : Promise<Socket | null> {
      const user = await this.prisma.user.findUnique({where: {ID: userID}, select: {websocketID: true}})
      const socket: Socket = server.sockets.get(user.websocketID)
      return socket ? socket : null
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
        if (!user)
          throw new NotFoundException('User not found')
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
    
        if (userID)
          return this.prisma.user.delete({
            where: {
              ID: userID,
            },
          });
      }
}
