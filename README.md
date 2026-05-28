# Hali Saha Kadro (v1)

FM tarzı (1-20) özellik puanlarıyla oyuncuları güçlerine göre dengeli takımlara ayıran web+API başlangıç projesi.

## Kurulum

```bash
npm install
npm run dev
```

API: `http://localhost:4000`

## Endpoint

`POST /api/balance`

Örnek payload:

```json
{
  "teamCount": 2,
  "players": [
    {
      "id": "p1",
      "name": "Ali",
      "positions": ["ST", "RW"],
      "attributes": {
        "pace": 15,
        "stamina": 13,
        "strength": 14,
        "agility": 15,
        "technique": 14,
        "passing": 10,
        "vision": 11,
        "finishing": 16,
        "firstTouch": 15,
        "tackling": 6,
        "marking": 6,
        "positioning": 14,
        "reflexes": 3,
        "handling": 2
      }
    }
  ]
}
```

## Notlar

- Oyuncu birden çok mevkide olabilir, sıra önemlidir.
- İlk mevki hesapta daha yüksek ağırlık taşır.
- Güç hesabı mevki-özellik eşleşme ağırlıklarına göre yapılır.
