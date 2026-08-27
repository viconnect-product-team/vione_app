import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { CommunityController } from './community.controller';
import { NetworkController } from './network.controller';
import { PublicController } from './public.controller';
import { ConnectAppService } from './connect-app.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeController, CommunityController, NetworkController, PublicController],
  providers: [ConnectAppService],
  exports: [ConnectAppService],
})
export class ConnectAppModule {}
