import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('DuoFarmer API (e2e)', () => {
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

  describe('User API', () => {
    it('GET /users/me - should get user info', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .send({ jwt: testJwt })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username');
          expect(res.body).toHaveProperty('fromLanguage');
          expect(res.body).toHaveProperty('learningLanguage');
        });
    });

    it('GET /users/me - should return 400 if jwt is missing', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .send({})
        .expect(400);
    });

    it('GET /users/me - should return error if jwt is invalid', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .send({ jwt: 'invalid-jwt' })
        .expect((res) => {
          expect([400, 500]).toContain(res.status);
        });
    });
  });

  describe('Farming API - Gem', () => {
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

  describe('Farming API - XP Session', () => {
    const validSessionAmounts = [10, 20, 40, 50, 110];

    validSessionAmounts.forEach((amount) => {
      it(`POST /farming/xp/session - should farm ${amount} XP session`, () => {
        return request(app.getHttpServer())
          .post('/farming/xp/session')
          .send({ jwt: testJwt, amount })
          .expect((res) => {
            expect([200, 201]).toContain(res.status);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('xpGained');
          });
      });
    });

    it('POST /farming/xp/session - should return 400 for invalid amount', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt, amount: 999 })
        .expect(400);
    });

    it('POST /farming/xp/session - should return 400 if jwt is missing', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ amount: 10 })
        .expect(400);
    });

    it('POST /farming/xp/session - should return 400 if amount is missing', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt })
        .expect(400);
    });
  });

  describe('Farming API - XP Story', () => {
    const validStoryAmounts = [50, 100, 200, 300, 400, 499];

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

  describe('Farming API - Streak', () => {
    it('POST /farming/streak/farm - should return not implemented', () => {
      return request(app.getHttpServer())
        .post('/farming/streak/farm')
        .send({ jwt: testJwt })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Not implemented yet');
        });
    });

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
});

