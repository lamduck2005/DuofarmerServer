import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

describe('User API (e2e)', () => {
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

