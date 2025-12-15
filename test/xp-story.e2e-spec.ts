import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Farming API - XP Story (e2e)', () => {
  let app: INestApplication;
  const testJwt = process.env.TEST_JWT;
  const validStoryAmounts = [50, 100, 200, 300, 400, 499];

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

  validStoryAmounts.forEach((amount) => {
    it(`POST /farming/xp/story - should farm ${amount} XP story`, () => {
      return request(app.getHttpServer())
        .post('/farming/xp/story')
        .send({ jwt: testJwt, amount })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('xpGained');
        });
    });
  });

  it('POST /farming/xp/story - should return 400 for invalid amount', () => {
    return request(app.getHttpServer())
      .post('/farming/xp/story')
      .send({ jwt: testJwt, amount: 999 })
      .expect(400);
  });

  it('POST /farming/xp/story - should return 400 if jwt is missing', () => {
    return request(app.getHttpServer())
      .post('/farming/xp/story')
      .send({ amount: 50 })
      .expect(400);
  });

  it('POST /farming/xp/story - should return 400 if amount is missing', () => {
    return request(app.getHttpServer())
      .post('/farming/xp/story')
      .send({ jwt: testJwt })
      .expect(400);
  });
});

