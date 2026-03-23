## Addis GigFind

Next.js marketplace app with Supabase auth/data and a Telegram bot webhook endpoint at `/api/telegram/webhook`.

## Local Development

Install dependencies and run the app:

```bash
npm run dev
```

The project reads deployment values from `.env.local`. A starter template is provided in `.env.example`.

## Vercel Configuration

Set these environment variables in your Vercel project:

```env
NEXT_PUBLIC_APP_URL=https://addis-gigfind.vercel.app
TELEGRAM_BOT_TOKEN=8728259513:AAF1XL2mlxkY60yyt88G5nnRDZtNji7ySZM
TELEGRAM_WEBHOOK_SECRET=Agf_Sec_9x2kLp_4482_v1
```

You will also need the existing Supabase variables used by the app:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Telegram Webhook

Telegram should point to this production webhook URL:

```text
https://addis-gigfind.vercel.app/api/telegram/webhook
```

Set the webhook with:

```text
https://api.telegram.org/bot8728259513:AAF1XL2mlxkY60yyt88G5nnRDZtNji7ySZM/setWebhook?url=https://addis-gigfind.vercel.app/api/telegram/webhook&secret_token=Agf_Sec_9x2kLp_4482_v1
```

Check webhook health with:

```text
https://api.telegram.org/bot8728259513:AAF1XL2mlxkY60yyt88G5nnRDZtNji7ySZM/getWebhookInfo
```
