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
      throw new BadRequestException('Filename is missing');
    }

    const contentType = getContentType(filePathStr);
    res.setHeader('Content-Type', contentType);

    try {
      const stream = await this.uploadService.getFileStream(filePathStr);
      stream.pipe(res);
    } catch (err) {
      res.status(404).send('File not found');
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

