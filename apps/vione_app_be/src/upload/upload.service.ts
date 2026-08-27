import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { MinioService } from './minio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  async saveAvatar(file: any, userId: string): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeFilename = `avatars/${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const url = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);
    
    // Save upload metadata
    const uploadId = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
      VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
    `;

    // Save url to database user_profiles
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET avatar_url = ${url}
      WHERE user_id = ${userId}::uuid
    `;
    
    // Save url to database business_identities
    await this.prisma.$executeRaw`
      UPDATE public.business_identities
      SET avatar_url = ${url}
      WHERE owner_user_id = ${userId}::uuid
    `;
    
    return url;
  }

  async saveFile(file: any, userId: string, folder = 'documents'): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.bin';
    const safeFilename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const url = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);

    // Save upload metadata
    const uploadId = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
      VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
    `;

    return url;
  }

  async getFileStream(filename: string): Promise<any> {
    return this.minioService.getFileStream(filename);
  }

  async deleteFile(filename: string, userId: string): Promise<void> {
    // Find upload metadata record to verify ownership
    const uploads = await this.prisma.$queryRaw<any[]>`
      SELECT id, file_path FROM public.user_uploads
      WHERE filename = ${filename} AND user_id = ${userId}::uuid
    `.catch(() => []);

    if (uploads.length === 0) {
      throw new InternalServerErrorException('File not found or access denied');
    }

    const upload = uploads[0];

    // Remove from MinIO
    await this.minioService.deleteFile(filename);

    // Remove metadata from DB
    await this.prisma.$executeRaw`
      DELETE FROM public.user_uploads
      WHERE id = ${upload.id}::uuid
    `;

    // Reset avatars if they matched this deleted file
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET avatar_url = NULL
      WHERE user_id = ${userId}::uuid AND avatar_url = ${upload.file_path}
    `;

    await this.prisma.$executeRaw`
      UPDATE public.business_identities
      SET avatar_url = NULL
      WHERE owner_user_id = ${userId}::uuid AND avatar_url = ${upload.file_path}
    `;
  }
}

