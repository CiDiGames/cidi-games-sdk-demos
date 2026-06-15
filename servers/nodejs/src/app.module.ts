import { Module } from '@nestjs/common';
import { CallbacksController } from './callbacks/callbacks.controller';
import { CidiOpenApiService } from './cidi/cidi-openapi.service';
import { DemoController } from './demo/demo.controller';
import { DemoService } from './demo/demo.service';

@Module({
  controllers: [DemoController, CallbacksController],
  providers: [CidiOpenApiService, DemoService]
})
export class AppModule {}
