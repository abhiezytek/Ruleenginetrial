# ClientApp (React host)

This directory holds the React SPA that will live alongside the ASP.NET Core API. It is a minimal Vite + React setup ready to receive the existing UI from `/frontend`.

## Integration approach

- **Build → wwwroot**: `vite.config.js` emits production assets to `../wwwroot`, letting ASP.NET Core serve the SPA with static files once `UseStaticFiles()`/fallback routing is wired in `Program.cs`.
- **Dev proxy**: The dev server proxies `/api` to `http://localhost:5115` so calls match production paths without CORS issues.
- **Migration path**: Move pages/components from `/frontend/src` into `ClientApp/src`, wire routes with React Router, and reuse existing API clients and styles.

## Commands

```bash
cd ClientApp
npm install
npm run dev     # localhost:5173 with /api proxy
npm run build   # outputs to ../wwwroot for ASP.NET hosting
npm run preview
```

## Next steps

1) Copy over shared utilities (API client, routing, layout) from the current `/frontend`.
2) Add `app.UseStaticFiles()` and SPA fallback middleware in `Program.cs` when you are ready to serve the built assets.
3) Optionally add Tailwind/PostCSS config here if you migrate the existing styling system.
