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

  const setup = new DocumentBuilder()
    .setTitle('ScoreOBE+ API')
    .setDescription('description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, setup);
  SwaggerModule.setup('/api/', app, document, {
    swaggerOptions: {
      supportedSubmitMethods: [],
    },
    customSiteTitle: 'ScoreOBE+ API',
    customfavIcon: '/scoreOBElogoFill.png',
    customCss: `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Emoji:wght@300..700&display=swap');
      
      body, .swagger-ui {
        font-family: 'Manrope', sans-serif !important;
      }
      
      .topbar .wrapper {
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 10px;
      }
      .topbar-wrapper {
        content: url("/scoreOBElogobold.png");
        width: 28px;
        height: auto;
      }
      .topbar .wrapper::after {
        content: "ScoreOBE+";
        font-size: 16px;
        font-weight: 600;
        color: transparent;
        background-clip: text;
        background-image: linear-gradient(to right, #4285f4, #ec407a, #a06ee1, #fb8c00);
      }
      .swagger-ui .topbar {
        background-color: #fafafa;
      }
    `,
  });

  const port = parseInt(process.env.PORT);
  await app.listen(port);
}
bootstrap();
