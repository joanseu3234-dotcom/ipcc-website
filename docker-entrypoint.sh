#!/bin/sh
# 將 nginx.conf 中的 NGINX_PORT 替換為 Zeabur 傳入的 $PORT（預設 8080）
PORT=${PORT:-8080}
sed -i "s/NGINX_PORT/$PORT/g" /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
