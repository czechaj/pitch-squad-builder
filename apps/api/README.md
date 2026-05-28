# API (Fastify + Prisma)

Bu API repo icinde `.env` dosyasi zorunlu degildir.
Production ortaminda (Vercel) tum degiskenler **Environment Variables** olarak tanimlanmalidir.

## Gerekli Environment Variables

- `DATABASE_URL` (zorunlu)
  - Neon pooled URL (runtime)
- `DATABASE_URL_UNPOOLED` (onerilen)
  - Neon direct/non-pooled URL (migration)
- `PORT` (opsiyonel)

## Vercel'e ekleme

1. Vercel Project -> `Settings` -> `Environment Variables`
2. Asagidaki degiskenleri ekle:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
3. Ortam secimi:
   - `Preview`
   - `Production`
4. Redeploy yap

## Lokal gelistirme (opsiyonel)

Lokal calisma gerekiyorsa `apps/api/.env` dosyasi kullanabilirsin, ama bu dosya Git'e girmez.

```bash
cd apps/api
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```
