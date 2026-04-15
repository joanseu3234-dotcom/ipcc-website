FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    rm -f /etc/nginx/conf.d/default.conf.bak
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
