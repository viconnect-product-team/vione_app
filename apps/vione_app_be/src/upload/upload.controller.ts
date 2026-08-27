/* eslint-disable */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { UploadService } from './upload.service';

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

    const userId = req.user.sub;
    const url = await this.uploadService.saveAvatar(file, userId);
    return { url };
  }
}
