import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Farming API - Streak (e2e)', () => {
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

  it('POST /farming/streak/farm - should farm streak once', async () => {
    const beforeRes = await request(app.getHttpServer())
      .get('/users/me')
      .send({ jwt: testJwt });
    expect([200, 201]).toContain(beforeRes.status);
    const streakBefore = beforeRes.body?.streak ?? 0;

    const farmRes = await request(app.getHttpServer())
      .post('/farming/streak/farm')
      .send({ jwt: testJwt });
    expect([200, 201]).toContain(farmRes.status);
    expect(farmRes.body).toHaveProperty('success', true);

    const afterRes = await request(app.getHttpServer())
      .get('/users/me')
      .send({ jwt: testJwt });
    expect([200, 201]).toContain(afterRes.status);
    const streakAfter = afterRes.body?.streak ?? streakBefore;

    expect(streakAfter).toBeGreaterThanOrEqual(streakBefore + 1);
  }, 15000);

  it('POST /farming/streak/maintain - should maintain streak', () => {
    return request(app.getHttpServer())
      .post('/farming/streak/maintain')
      .send({ jwt: testJwt })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
      });
  });

  it('POST /farming/streak/farm - should return 400 if jwt is missing', () => {
    return request(app.getHttpServer())
      .post('/farming/streak/farm')
      .send({})
      .expect(400);
  });

  it('POST /farming/streak/maintain - should return 400 if jwt is missing', () => {
    return request(app.getHttpServer())
      .post('/farming/streak/maintain')
      .send({})
      .expect(400);
  });
});

