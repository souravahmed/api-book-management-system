import { AppModule } from '@/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';

export class TestAppManagerUtil {
  private app: INestApplication;

  static async create(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api');

    await app.init();

    return app;
  }

  getApp(): INestApplication {
    return this.app;
  }
}
