import { Module } from '@nestjs/common';
import { ConnectAppController, ConnectAppPublicController } from './connect-app.controller';
import { ConnectAppService } from './connect-app.service';

@Module({
  controllers: [ConnectAppController, ConnectAppPublicController],
  providers: [ConnectAppService],
})
export class ConnectAppModule {}
