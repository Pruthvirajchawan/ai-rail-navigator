# Deployment Guide

This guide covers deploying the AI Railway Section Controller to various platforms.

---

## Prerequisites

- Built artifact: `npm run build` → outputs to `dist/`
- The app is a **static SPA** — any static host works

---

## Option 1: Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on every push.

**Build settings:**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

---

## Option 2: Netlify

1. Connect GitHub repo at [app.netlify.com](https://app.netlify.com)
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add `_redirects` file in `public/`:
   ```
   /*  /index.html  200
   ```

---

## Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

CloudFront error-page config:
- 403 → `/index.html` (200)
- 404 → `/index.html` (200)

---

## Option 4: Docker + Nginx

**Dockerfile**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

```bash
docker build -t railway-controller .
docker run -p 8080:80 railway-controller
```

---

## CI/CD with GitHub Actions

The repository ships with `.github/workflows/ci.yml` that runs:
- ESLint
- TypeScript typecheck
- Vitest unit tests
- Production build

To add automatic deployment, append a deploy job after `build`:

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/download-artifact@v4
      with:
        name: dist
        path: dist
    - name: Deploy to Vercel
      run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Environment Variables

The current frontend has no required environment variables. When integrating a backend, prefix client-side vars with `VITE_`:

```bash
# .env.local
VITE_API_BASE_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com/stream
```

⚠️ **Never** put secrets in `VITE_` variables — they are bundled into the client.

---

## Performance Tips

- Enable **Brotli** compression at the edge
- Set **long cache headers** for hashed assets in `dist/assets/`
- Set **no-cache** for `index.html`
- Enable **HTTP/2** or **HTTP/3**
- Lazy-load heavy panels with `React.lazy()` if bundle exceeds 500 KB

---

## Health Checks

Static SPAs respond `200` on `/index.html`. For ALB/Kubernetes liveness probes, point to `/`:

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 10
```
