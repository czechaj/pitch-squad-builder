# Pitch Squad Builder (Next.js)

Next.js tabanli hali saha kadro dengeleme uygulamasi.

## Local Calistirma

```bash
npm install
cp .env.example .env
npm run dev
```

Uygulama: `http://localhost:3000`  
API: `POST /api/balance`

## Environment Variables

- `DATABASE_URL`:
  Production ortaminda zorunlu. Vercel production build asamasinda kontrol edilir.
- `ENABLE_MOCK_OTP`:
  Mock OTP endpointleri icin feature flag. Production'da varsayilan `false`.

## Deploy Checklist (Vercel)

1. Project Settings > Environment Variables altinda `DATABASE_URL` tanimla.
2. Production icin `ENABLE_MOCK_OTP=false` oldugunu dogrula.
3. Build komutunun `npm run build` oldugunu dogrula.
4. Deploy sonrasi auth endpointlerinde 403/429 davranisini smoke test et:
   - `POST /api/auth/mock-otp/request` (flag kapaliyken 403)
   - fazla denemede 429 rate limit
