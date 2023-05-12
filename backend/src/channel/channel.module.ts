import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ChannelGateway],
  exports: [ChannelGateway]
})
export class ChannelModule {}