/* eslint-disable */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly avatarDir = path.join(this.uploadDir, 'avatars');

  onModuleInit() {
    this.ensureDirsExist();
  }

  private ensureDirsExist() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.avatarDir)) {
      fs.mkdirSync(this.avatarDir, { recursive: true });
    }
  }

  async saveAvatar(file: any, userId: string): Promise<string> {
    this.ensureDirsExist();
    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeFilename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const filePath = path.join(this.avatarDir, safeFilename);

    await fs.promises.writeFile(filePath, file.buffer);
    
    return `/uploads/avatars/${safeFilename}`;
  }
}
