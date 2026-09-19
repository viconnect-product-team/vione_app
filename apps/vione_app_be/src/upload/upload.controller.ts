/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Res,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { UploadService } from './upload.service';
import * as path from 'path';

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.json': 'application/json',
  };
  return map[ext] || 'application/octet-stream';
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    const userId = req.user.id || req.user.sub;
    const url = await this.uploadService.saveAvatar(file, userId);
    return { url };
  }

  @UseGuards(AuthGuard)
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const userId = req.user.id || req.user.sub;
    const url = await this.uploadService.saveFile(file, userId);
    return { url };
  }

  @Get('file/*path')
  async getFile(@Param('path') filePath: any, @Res() res: any) {
    const filePathStr = Array.isArray(filePath) ? filePath.join('/') : filePath;
    if (!filePathStr) {
      return res.status(404).send('Filename is missing');
    }

    const contentType = getContentType(filePathStr);

    const pipeSafe = (readable: any) => {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      readable.on('error', () => {
        if (!res.headersSent) {
          res.status(404).send('File not found');
        } else {
          res.end();
        }
      });
      return readable.pipe(res);
    };

    try {
      // 1. Thử tìm tệp trên ổ đĩa cục bộ (disk fallback)
      const fs = await import('fs');
      const filenameOnly = path.basename(filePathStr);
      const candidates = [
        path.join(process.cwd(), 'uploads', filePathStr),
        path.join(process.cwd(), 'uploads', 'avatars', filenameOnly),
        path.join(process.cwd(), 'uploads', 'documents', filenameOnly),
        path.join(process.cwd(), filePathStr),
      ];

      for (const cand of candidates) {
        try {
          if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
            return pipeSafe(fs.createReadStream(cand));
          }
        } catch {}
      }

      // 2. Thử tìm trên MinIO theo các đường dẫn tiềm năng
      const minioKeys = [filePathStr];
      if (!filePathStr.startsWith('avatars/')) {
        minioKeys.push(`avatars/${filePathStr}`);
      } else {
        minioKeys.push(filePathStr.replace(/^avatars\//, ''));
      }
      if (!filePathStr.startsWith('documents/')) {
        minioKeys.push(`documents/${filePathStr}`);
      }

      for (const key of minioKeys) {
        try {
          const stream = await this.uploadService.getFileStream(key);
          if (stream) {
            return pipeSafe(stream);
          }
        } catch {}
      }

      return res.status(404).send('File not found');
    } catch (err) {
      if (!res.headersSent) {
        return res.status(404).send('File not found');
      } else {
        res.end();
      }
    }
  }

  @UseGuards(AuthGuard)
  @Delete('file/*path')
  async deleteFile(
    @Param('path') filePath: any,
    @Request() req: any,
  ) {
    const filePathStr = Array.isArray(filePath) ? filePath.join('/') : filePath;
    if (!filePathStr) {
      throw new BadRequestException('Filename is missing');
    }

    const userId = req.user.id || req.user.sub;
    await this.uploadService.deleteFile(filePathStr, userId);
    return { success: true };
  }
}

