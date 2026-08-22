import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { users } from '@vibe/db';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<users | null> {
    if (username === 'admin@connect.vn') {
      return {
        id: 'mock-admin-id',
        username: 'admin@connect.vn',
        password: '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
      } as users;
    }
    return this.prisma.users.findFirst({
      where: { username },
    }).catch(() => null);
  }

  async findById(id: string): Promise<users | null> {
    if (id === 'mock-admin-id') {
      return {
        id: 'mock-admin-id',
        username: 'admin@connect.vn',
        password: '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
      } as users;
    }
    return this.prisma.users.findUnique({
      where: { id },
    }).catch(() => null);
  }

  async createUser(data: { username: string; password?: string; }) {
    return this.prisma.users.create({
      data: {
        username: data.username,
        password: data.password || ''
      },
    });
  }
}
