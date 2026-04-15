FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml* package-lock.json* npm-shrinkwrap.json* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm -v && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY . .

RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build:prod; \
    else \
      npm run build:prod; \
    fi

# 直接用轻量 nginx
FROM xczx-2026-registry.cn-hangzhou.cr.aliyuncs.com/frontend/nginx:latest AS runner

# 把构建产物复制到 nginx 网页目录
COPY --from=builder /app/dist-prod/ /usr/share/nginx/html/

# 可选：解决前端路由刷新404
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
