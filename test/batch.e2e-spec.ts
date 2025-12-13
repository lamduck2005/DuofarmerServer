import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('DuoFarmer API - Batch Farming (e2e)', () => {
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

  describe('Batch Gem Farming', () => {
    it('POST /farming/gem - should farm gem 3 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 3 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 3);
          expect(res.body).toHaveProperty('successCount');
          expect(res.body).toHaveProperty('failedCount');
          expect(res.body).toHaveProperty('results');
          expect(res.body.results).toHaveLength(3);
          expect(res.body.results[0]).toHaveProperty('index', 1);
          expect(res.body.results[0]).toHaveProperty('success');
        });
    });

    it('POST /farming/gem - should farm gem 5 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 5 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 5);
          expect(res.body).toHaveProperty('successCount');
          expect(res.body).toHaveProperty('failedCount');
          expect(res.body).toHaveProperty('results');
          expect(res.body.results).toHaveLength(5);
        });
    }, 15000);

    it('POST /farming/gem - should farm gem 10 times (max batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 10 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 10);
          expect(res.body.results).toHaveLength(10);
        });
    }, 20000);

    it('POST /farming/gem - should work as single when times = 1', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 1 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });

    it('POST /farming/gem - should work as single when times not provided', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });

    it('POST /farming/gem - should return 400 if times > 10', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 11 })
        .expect(400);
    });

    it('POST /farming/gem - should return 400 if times < 1', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 0 })
        .expect(400);
    });
  });

  describe('Batch XP Session Farming', () => {
    it('POST /farming/xp/session - should farm 10 XP session 3 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt, amount: 10, times: 3 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 3);
          expect(res.body).toHaveProperty('successCount');
          expect(res.body).toHaveProperty('failedCount');
          expect(res.body).toHaveProperty('results');
          expect(res.body.results).toHaveLength(3);
        });
    });

    it('POST /farming/xp/session - should farm 20 XP session 5 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt, amount: 20, times: 5 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 5);
          expect(res.body.results).toHaveLength(5);
        });
    }, 15000);

    it('POST /farming/xp/session - should work as single when times = 1', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt, amount: 10, times: 1 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('xpGained');
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });

    it('POST /farming/xp/session - should work as single when times not provided', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/session')
        .send({ jwt: testJwt, amount: 10 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });
  });

  describe('Batch XP Story Farming', () => {
    it('POST /farming/xp/story - should farm 50 XP story 3 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/story')
        .send({ jwt: testJwt, amount: 50, times: 3 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 3);
          expect(res.body).toHaveProperty('successCount');
          expect(res.body).toHaveProperty('failedCount');
          expect(res.body).toHaveProperty('results');
          expect(res.body.results).toHaveLength(3);
        });
    }, 15000);

    it('POST /farming/xp/story - should farm 100 XP story 5 times (batch)', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/story')
        .send({ jwt: testJwt, amount: 100, times: 5 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('totalTimes', 5);
          expect(res.body.results).toHaveLength(5);
        });
    }, 15000);

    it('POST /farming/xp/story - should work as single when times = 1', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/story')
        .send({ jwt: testJwt, amount: 50, times: 1 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('xpGained');
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });

    it('POST /farming/xp/story - should work as single when times not provided', () => {
      return request(app.getHttpServer())
        .post('/farming/xp/story')
        .send({ jwt: testJwt, amount: 50 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).not.toHaveProperty('totalTimes');
        });
    });
  });

  describe('Batch Response Structure', () => {
    it('POST /farming/gem - should have correct batch response structure', () => {
      return request(app.getHttpServer())
        .post('/farming/gem')
        .send({ jwt: testJwt, times: 2 })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
          
          // Check top-level properties
          expect(res.body).toHaveProperty('totalTimes');
          expect(res.body).toHaveProperty('successCount');
          expect(res.body).toHaveProperty('failedCount');
          expect(res.body).toHaveProperty('results');
          
          // Check types
          expect(typeof res.body.totalTimes).toBe('number');
          expect(typeof res.body.successCount).toBe('number');
          expect(typeof res.body.failedCount).toBe('number');
          expect(Array.isArray(res.body.results)).toBe(true);
          
          // Check results array items
          if (res.body.results.length > 0) {
            const firstResult = res.body.results[0];
            expect(firstResult).toHaveProperty('index');
            expect(firstResult).toHaveProperty('success');
            expect(typeof firstResult.index).toBe('number');
            expect(typeof firstResult.success).toBe('boolean');
            
            if (firstResult.success) {
              expect(firstResult).toHaveProperty('data');
            } else {
              expect(firstResult).toHaveProperty('error');
            }
          }
          
          // Check counts match
          expect(res.body.successCount + res.body.failedCount).toBe(res.body.totalTimes);
        });
    });
  });
});

