import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectAppService } from './connect-app.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly connectAppService: ConnectAppService) {}

  @Get()
  async listActiveProducts() {
    return this.connectAppService.listActiveProducts();
  }

  @Post('quote')
  async requestProductQuote(
    @Request() req: any,
    @Body() body: { productId: string; quantity?: number; message?: string },
  ) {
    return this.connectAppService.requestProductQuote(req.user.id, body);
  }
}
