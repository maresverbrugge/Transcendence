import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, PlayerStatus, Channel } from '@prisma/client'

@Injectable()
export class CommunicationService {

    constructor(private prisma: PrismaService) {}

    async getUsers(): Promise<User[]> {
        return this.prisma.user.findMany(); // Fetch all users from the User model
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

      // Get User ID by Username
  async getUserIDByUsername(username: string): Promise<number | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username, // Assuming 'username' is unique
      },
      select: {
        id: true, // Only selecting the ID field
      },
    });
    return user?.id || null; // Return the user ID if found, otherwise return null
  }

  // Delete User by Username
  async deleteUserByUsername(username: string): Promise<User | null> {
    const userId = await this.getUserIDByUsername(username);

    if (userId) {
      return this.prisma.user.delete({
        where: {
          id: userId, // Deleting user by ID
        },
      });
    }
  }

  async createChannel(ownerUsername: string, memberUsername: string, channelPassword?: string): Promise<Channel> {
    const owner = await this.prisma.user.findUnique({
        where: { username: ownerUsername },
    });
    
    const member = await this.prisma.user.findUnique({
        where: { username: memberUsername },
    });

    if (!owner || !member) {
        throw new Error('One or both users not found');
    }

    const newChannel = await this.prisma.channel.create({
        data: {
            password: channelPassword || null, // Optional password
            ownerId: owner.id,
            members: {
                create: [
                    { userId: owner.id, isAdmin: true },
                    { userId: member.id },
                ],
            },
        },
        include: {
            members: {
              include: {
                user: true
              }
            }
        },
    });
    console.log('new channel created', newChannel)
    return newChannel;
  }

}
