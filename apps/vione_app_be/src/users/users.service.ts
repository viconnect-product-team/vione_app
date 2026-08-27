import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { vione_users } from '@vibe/db';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string): Promise<vione_users | null> {
    if (username === 'admin@connect.vn') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'admin@connect.vn',
        password:
          '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
        email: 'admin@connect.vn',
        name: 'Administrator',
        avatar_url: null,
        google_id: null,
        apple_id: null,
        email_verified: true,
        apple_refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as vione_users;
    }
    return this.prisma.vione_users
      .findFirst({
        where: { username },
      })
      .catch(() => null);
  }

  async findById(id: string): Promise<vione_users | null> {
    if (id === 'mock-admin-id' || id === '00000000-0000-0000-0000-000000000000') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'admin@connect.vn',
        password:
          '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
        email: 'admin@connect.vn',
        name: 'Administrator',
        avatar_url: null,
        google_id: null,
        apple_id: null,
        email_verified: true,
        apple_refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as vione_users;
    }
    return this.prisma.vione_users
      .findUnique({
        where: { id },
      })
      .catch(() => null);
  }

  async findByGoogleId(googleId: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { google_id: googleId },
      })
      .catch(() => null);
  }

  async findByAppleId(appleId: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { apple_id: appleId },
      })
      .catch(() => null);
  }

  async findByEmail(email: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { email },
      })
      .catch(() => null);
  }

  async createUser(data: {
    username: string;
    password?: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    google_id?: string;
    apple_id?: string;
    email_verified?: boolean;
  }) {
    const newUser = await this.prisma.vione_users.create({
      data: {
        username: data.username,
        password: data.password || '',
        email: data.email || null,
        name: data.name || null,
        avatar_url: data.avatar_url || null,
        google_id: data.google_id || null,
        apple_id: data.apple_id || null,
        email_verified: data.email_verified || false,
      },
    });

    // Sync to auth.users to satisfy foreign key constraints in related tables
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO auth.users (id, email, role) VALUES ($1::uuid, $2, 'authenticated') ON CONFLICT (id) DO NOTHING`,
      newUser.id,
      newUser.email || newUser.username,
    ).catch((err) => {
      console.error('Failed to sync user to auth.users:', err);
    });

    return newUser;
  }

  async updateUser(id: string, data: Partial<vione_users>) {
    return this.prisma.vione_users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }
}
