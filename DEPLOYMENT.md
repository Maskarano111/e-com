# Deploy NovaMart with Netlify and Render

Netlify can host the frontend in browser-only demo mode, or connect to the Express API hosted as a separate Render web service.

## Demo-only Netlify mode

Leave `VITE_API_BASE_URL` unset in Netlify. Production builds without an API URL automatically use the app's local demo data, so guest browsing, demo personas, and supported shopping flows work without an API service. Demo changes are saved only in that browser and are not shared with other visitors. Online payments and any action that needs server-side services are unavailable in this mode.

To reset the local demo data, clear this site's browser storage and reload.

## Live API mode

Follow the steps below when you want accounts and store changes backed by the Express API instead of local demo data.

## 1. Create the API service

1. Push this repository to the Git branch you want to deploy.
2. In Render, choose **New → Blueprint**, connect the repository, and select its `render.yaml` file.
3. Create the service. The Blueprint builds with `npm ci && npm run build`, starts with `npm start`, and configures a persistent disk at `/var/data` for the JSON store.
4. Wait for the first deploy to finish, then copy the service's public URL (for example, `https://novamart-api.onrender.com`). Check that `<service-url>/api/health` returns JSON with `"status":"ok"`.

The disk is necessary because the API writes accounts, vendor links, products, and orders to `store.json`. Render's persistent disks require a paid web service; this Blueprint selects the smallest listed paid compute plan and a 1 GB disk. Review the current price in Render before creating the service.

## 2. Point Netlify at the API

In **Netlify → Site configuration → Environment variables**, add:

| Name | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api` |

Use your actual Render URL, with `/api` at the end. Trigger a new Netlify deploy after saving the variable because Vite embeds it during the frontend build.

## 3. Configure the frontend origin

The Blueprint currently allows `https://ecomassite.netlify.app`. If your Netlify site uses another domain or a custom domain, update both `APP_URL` and `CORS_ORIGINS` in `render.yaml` to the exact frontend origin, then sync the Blueprint and redeploy the API. For more than one frontend URL, put comma-separated origins in `CORS_ORIGINS`.

## Notes

- Keep `JWT_SECRET` private. Render generates it through the Blueprint.
- The current database is a JSON file intended for one API instance. Keep the service at one instance while using the persistent disk. A managed database is the next step before scaling to multiple instances.
- Add optional service secrets such as `GEMINI_API_KEY` or SMTP credentials in Render's environment settings if those features are needed in production.
