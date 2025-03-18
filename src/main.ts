import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentInterceptor } from './common/interceptor/repo.interceptor';
import { json } from 'express';
import { ErrorInterceptor } from './common/interceptor/error.interceptor';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new DocumentInterceptor(), new ErrorInterceptor());

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(json({ limit: '50mb' }));

  // const setup = new DocumentBuilder()
  //   .setTitle('ScoreOBE+ API')
  //   .setDescription('description')
  //   .setVersion('1.0')
  //   .addServer(`${process.env.BASE_URL}/api/v1`)
  //   .addBearerAuth(
  //     {
  //       bearerFormat: 'Bearer',
  //       scheme: 'Bearer',
  //       type: 'http',
  //       in: 'Header',
  //     },
  //     'bearerAuth',
  //   )
  //   .build();
  // const document = SwaggerModule.createDocument(app, setup);
  // SwaggerModule.setup('', app, document, {
  //   customfavIcon: '../score-logo.png',
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //   },
  // });

  const port = parseInt(process.env.PORT);
  await app.listen(port);
}
bootstrap();
