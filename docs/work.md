### webhook docker test stripe checkout session

```bash
docker run --rm -it \
  --add-host=host.docker.internal:host-gateway \
  -v "$HOME/.config/stripe:/root/.config/stripe" \
  stripe/stripe-cli:latest listen \
  --forward-to http://host.docker.internal:3000/api/v1/payments/webhook
```

###
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

### Deployment & EC2 Server Management Commands

#### 1. SSH Connection & File Management
* **SSH to EC2 Server (from local)**:
  ```bash
  ssh -i /path/to/sports-key.pem ubuntu@<EC2_IP_OR_DOMAIN>
  ```
* **Copy local file/folder to EC2**:
  ```bash
  scp -i /path/to/sports-key.pem /path/to/local/file ubuntu@<EC2_IP_OR_DOMAIN>:~/sports-booking-platform/
  ```
* **Copy EC2 folder back to local (e.g., database backups)**:
  ```bash
  scp -i /path/to/sports-key.pem -r ubuntu@<EC2_IP_OR_DOMAIN>:~/sports-booking-platform/backups /path/to/local/
  ```

#### 2. EC2 Initial Server Setup
* **Install Docker & Docker Compose**:
  ```bash
  sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
  sudo usermod -aG docker ubuntu
  ```
  *(Note: Log out of SSH and log back in to apply Docker group permissions).*
* **Generate Self-Signed SSL (Temporary bootstrap)**:
  ```bash
  mkdir -p ~/sports-booking-platform/certbot/conf/live/yourdomain.com
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout ~/sports-booking-platform/certbot/conf/live/yourdomain.com/privkey.pem \
    -out ~/sports-booking-platform/certbot/conf/live/yourdomain.com/fullchain.pem \
    -subj "/CN=localhost"
  ```

#### 3. Application Lifecycle Management (Docker Compose)
*All commands below should be run inside `~/sports-booking-platform` on EC2.*
* **Check status of running containers**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production ps
  ```
* **View container resource consumption (CPU & Memory)**:
  ```bash
  docker stats
  ```
* **Pull latest built images from Docker Hub manually**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production pull
  ```
* **Start services in background (Detached mode)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --remove-orphans
  ```
* **Stop all services**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production down
  ```
* **Restart specific services (e.g. backend-1 and backend-2)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart backend-1 backend-2
  ```
* **Stop and remove all containers, volumes, and networks**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production down -v
  ```

#### 4. Logs Analysis & Debugging
* **View logs of all services (real-time stream)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail 100
  ```
* **View backend service logs only**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend-1 backend-2
  ```
* **View Nginx frontend server access & error logs**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f frontend
  ```

#### 5. Database & Migration Operations

* **seed**:
```bash
cd ~/sports-booking-platform

# Chạy seed dữ liệu mẫu
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 npx prisma db seed
```
* **Run Prisma Migrations manually inside backend container**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend-1 npx prisma migrate deploy
  ```
    Mục đích: Áp dụng các thay đổi trong cơ sở dữ liệu (các file migrations mới) lên database production.
* **Check Prisma Schema status**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend-1 npx prisma migrate status
  ```
  Mục đích: Kiểm tra trạng thái của các migrations trong cơ sở dữ liệu hiện tại để xem DB đã cập nhật đúng theo Prisma schema mới nhất hay chưa.

* **Dump PostgreSQL database backup (Export)**:
  ```bash
  docker exec -t sports-booking-db pg_dump -U your_db_user -d sports_db > ~/sports-booking-platform/backups/backup_$(date +%Y%m%d_%H%M%S).sql
  ```
  Mục đích: Sao lưu (Backup/Export) toàn bộ cấu trúc và dữ liệu của PostgreSQL ra một file .sql.
* **Restore PostgreSQL database from backup (Import)**:
  ```bash
  docker exec -i sports-booking-db psql -U your_db_user -d sports_db < ~/sports-booking-platform/backups/your_backup_file.sql
  ```
  Mục đích: Khôi phục (Restore/Import) dữ liệu từ file backup .sql vào PostgreSQL.

#### 6. SSL Administration (Certbot)
* **Generate real SSL certificates (Run once)**:
  ```bash
  docker run --rm \
    -v ~/sports-booking-platform/certbot/conf:/etc/letsencrypt \
    -v ~/sports-booking-platform/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
    --email your-email@example.com --agree-tos --no-eff-email \
    -d yourdomain.com -d www.yourdomain.com --force-renewal
  ```
* **Force Nginx to reload SSL certificates**:
  ```bash
  docker exec sports-booking-frontend nginx -s reload
  ```
* **Manually test SSL renewal process (Dry run)**:
  ```bash
  docker run --rm \
    -v ~/sports-booking-platform/certbot/conf:/etc/letsencrypt \
    -v ~/sports-booking-platform/certbot/www:/var/www/certbot \
    certbot/certbot renew --dry-run
  ```

#### 7. System Diagnostics & Maintenance
* **Check Disk Space usage (Crucial on Free Tier EC2)**:
  ```bash
  df -h
  ```
* **Dangling Docker resources clean up (Images, Cache, Volumes to save disk)**:
  ```bash
  docker system prune -af --volumes
  ```
* **View RAM utilization**:
  ```bash
  free -h
  ```
* **Monitor system processes (Interactive)**:
  ```bash
  htop
  ```
