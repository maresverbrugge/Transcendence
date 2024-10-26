import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, PlayerStatus } from '@prisma/client'


@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

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
                friends: {
                  connect: { id: 6900 }, // Connect Wilma (id: 69) as a friend
                },            },
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
