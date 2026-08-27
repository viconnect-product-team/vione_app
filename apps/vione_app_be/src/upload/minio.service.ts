import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET || 'vione-bucket';

  async onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        
        // Cấu hình policy cho phép truy cập đọc công khai các tệp tin trong bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (err) {
      console.error('Failed to initialize MinIO bucket:', err);
    }
  }

  async uploadFile(filename: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        fileBuffer,
        fileBuffer.length,
        { 'Content-Type': mimeType }
      );
      // Trả về đường dẫn API tương đối để frontend truy cập thông qua backend proxy/stream
      return `/upload/file/${filename}`;
    } catch (err) {
      throw new InternalServerErrorException(`MinIO upload failed: ${err.message}`);
    }
  }

  async getFileStream(filename: string): Promise<any> {
    try {
      return await this.minioClient.getObject(this.bucketName, filename);
    } catch (err) {
      throw new InternalServerErrorException(`Failed to retrieve file from MinIO: ${err.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, filename);
    } catch (err) {
      throw new InternalServerErrorException(`MinIO delete failed: ${err.message}`);
    }
  }
}
