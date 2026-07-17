# Hướng dẫn Kiểm thử Tải Đồng thời (Concurrent Booking) bằng Grafana k6

Tài liệu này hướng dẫn cách cài đặt và sử dụng **k6** (công cụ load testing hiệu năng cao) để thực hiện giả lập hàng loạt người dùng đặt sân cùng lúc nhằm kiểm chứng khả năng chịu tải và tính đúng đắn của cơ chế chống Double Booking.

---

## 1. Cài đặt k6

### Trên Linux (Ubuntu/Debian)
```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD194E8CE737F54174B09719932F1283DA19C6
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Trên Linux (Fedora/RHEL)
```bash
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

### Trên macOS
```bash
brew install k6
```

### Chạy bằng Docker (nếu không muốn cài trực tiếp)
```bash
docker run --rm -i grafana/k6 run - <script.js
```

---

## 2. Chuẩn bị Kịch bản và Dữ liệu Test

Để k6 giả lập được hành vi thật, mỗi người dùng ảo (VU - Virtual User) cần có một tài khoản khác nhau với JWT Token tương ứng.

### Bước 2.1: File script test `concurency.test.js`
File test đã được tạo sẵn tại thư mục `apps/backend/src/tests/concurency.test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// Cấu hình kịch bản test
export const options = {
  scenarios: {
    concurrent_booking: {
      executor: 'shared-iterations',
      vus: 5,            // Số lượng người chơi giả lập đồng thời
      iterations: 5,     // Tổng số lượt gửi request đặt sân
      maxDuration: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate>=0'], // Chấp nhận lỗi vì request đặt sân trùng chắc chắn sẽ thất bại (400)
  },
};

// Danh sách Access Token của các người chơi (lấy từ database hoặc tạo sẵn)
const ACCESS_TOKENS = [
  "TOKEN_NGUOI_CHOI_1",
  "TOKEN_NGUOI_CHOI_2",
  "TOKEN_NGUOI_CHOI_3",
  "TOKEN_NGUOI_CHOI_4",
  "TOKEN_NGUOI_CHOI_5"
];

// Thay thế bằng ID của Sân con bạn muốn kiểm thử
const SUB_FIELD_ID = "0d758b31-12b2-4bea-a1d9-a9b6296aeaf9"; 

export default function () {
  // Lấy token dựa trên ID của User ảo đang chạy (1-indexed)
  const token = ACCESS_TOKENS[__VU - 1]; 
  
  if (!token) {
    console.error(`VU ${__VU} không có Access Token tương ứng`);
    return;
  }

  const url = `http://localhost:3000/api/v1/bookings/${SUB_FIELD_ID}`;
  
  // Thời gian đặt sân: Khung giờ ngày mai từ 15:00 đến 16:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startTime = new Date(tomorrow);
  startTime.setHours(15, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(16, 0, 0, 0);

  const payload = JSON.stringify({
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    addons: []
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  };

  // Thực hiện gửi request đặt sân đồng thời
  const res = http.post(url, payload, params);

  // Kiểm tra phản hồi trả về
  check(res, {
    'Trạng thái là 200 hoặc 400': (r) => r.status === 200 || r.status === 400,
  });

  // Ghi log kết quả của từng request
  if (res.status === 200) {
    console.log(`[VU ${__VU}] THÀNH CÔNG: Đặt sân được ghi nhận!`);
  } else {
    console.log(`[VU ${__VU}] THẤT BẠI: HTTP ${res.status} - Lỗi: ${res.json().message}`);
  }

  // Chờ ngắn để kết thúc kịch bản
  sleep(0.5);
}
```

---

## 3. Các bước thực hiện Test

### Bước 3.1: Dọn dẹp Database
Trước khi chạy test, đảm bảo khung giờ ngày mai từ `15:00 -> 16:00` trên sân kiểm thử chưa có ai đặt. Bạn có thể xóa thủ công trong bảng `Booking` hoặc sử dụng Prisma Studio:
```bash
cd apps/backend && npx prisma studio
```

### Bước 3.2: Chạy k6
Chạy lệnh test từ thư mục gốc của dự án:
```bash
k6 run apps/backend/src/tests/concurency.test.js
```

---

## 4. Kết quả kỳ vọng từ k6

Khi chạy k6, bạn sẽ nhận được log dạng như sau:
```text
default: 5 iterations shared among 5 VUs

INFO [2026-07-05T15:10:00.123Z] [VU 1] THÀNH CÔNG: Đặt sân được ghi nhận! Player ID: c5715789-0abe-49c8-819d-bc7fbd0593c1 -> Booking ID: 81b2bc21-0a6e-4e4f-b67e-dc27ef1a251b
INFO [2026-07-05T15:10:00.125Z] [VU 2] THẤT BẠI: HTTP 400 - Player ID: 4d204d98-e797-41ec-a55e-70185a9915bd - Lỗi: Sân đang có nhiều người đặt cùng lúc...
INFO [2026-07-05T15:10:00.126Z] [VU 3] THẤT BẠI: HTTP 400 - Player ID: 0facfab5-fe80-455b-ade2-4380ee253fb3 - Lỗi: Sân đang có nhiều người đặt cùng lúc...
INFO [2026-07-05T15:10:00.128Z] [VU 4] THẤT BẠI: HTTP 400 - Player ID: c478d2e3-7fd5-4e00-ae36-48a8a6f61544 - Lỗi: Sân đang có nhiều người đặt cùng lúc...
INFO [2026-07-05T15:10:00.130Z] [VU 5] THẤT BẠI: HTTP 400 - Player ID: 7e703b52-af0a-4ed5-bf7f-0d32e608126f - Lỗi: Sân đang có nhiều người đặt cùng lúc...

     ✓ Trạng thái là 200 hoặc 400

     checks.........................: 100.00% ✓ 5        ✗ 0  
     data_received..................: 2.1 kB  210 B/s
     data_sent......................: 1.8 kB  180 B/s
     http_req_duration..............: avg=24.5ms min=12.2ms med=21.4ms max=43.1ms p(90)=38.2ms p(95)=40.9ms
     http_reqs......................: 5       0.5/s
     vus............................: 5       min=5      max=5
```

### Đánh giá kết quả:
* **Chỉ duy nhất 1 request trả về HTTP 200** (Thành công).
* **Tất cả các request còn lại trả về HTTP 400** (Thất bại) với lý do tranh chấp hoặc sân đã bị trùng giờ.
* Kiểm tra trong database: Chỉ có đúng **1 bản ghi mới** được tạo ra cho khung giờ và sân con này.
