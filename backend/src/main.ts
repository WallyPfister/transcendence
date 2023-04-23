import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Transcendence Swagger')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  app.useWebSocketAdapter(new IoAdapter(app));
  const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
  };
  app.enableCors(corsOptions);

  var http = require('http');
  var server = http.createServer(app);
  var io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('a user connected');
  });
  await app.listen(3000);
}
bootstrap();
