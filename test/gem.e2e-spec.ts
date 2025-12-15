import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Farming API - Gem (e2e)', () => {
  let app: INestApplication;
  const testJwt = process.env.TEST_JWT;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /farming/gem - should farm gem', () => {
    return request(app.getHttpServer())
      .post('/farming/gem')
      .send({ jwt: testJwt })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
      });
  });

  it('POST /farming/gem - should return 400 if jwt is missing', () => {
    return request(app.getHttpServer())
      .post('/farming/gem')
      .send({})
      .expect(400);
  });
});

