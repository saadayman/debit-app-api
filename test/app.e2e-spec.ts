import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * End-to-end smoke tests. These boot the real AppModule, so they need the
 * database running: `npm run db:up` from the repo root.
 */
describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      // Mirror main.ts so routes and validation behave as in production.
      app.setGlobalPrefix('api');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
      );
      await app.init();
    } catch (err) {
      // Without this, an unreachable database surfaces as an opaque
      // "Jest worker encountered child process exceptions" crash.
      throw new Error(
        `Could not start the app for e2e tests. Is the database running? ` +
          `Start it with "npm run db:up" from the repo root.\nCause: ${String(err)}`,
      );
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('auth guard', () => {
    it.each([
      '/api/dashboard',
      '/api/expenses',
      '/api/savings',
      '/api/analytics',
      '/api/calendar',
      '/api/alerts',
    ])('rejects unauthenticated %s with 401', (path) => {
      return request(app.getHttpServer()).get(path).expect(401);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects unknown credentials with 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong-password' })
        .expect(401);
    });

    it('rejects a malformed body with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });
});
