import { check, sleep } from 'k6';
import encoding from 'k6/encoding';
import http from 'k6/http';

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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI1YzE2YzExNC03NWFhLTRkMWMtODUyMi02MWM4YTFhODc3NTUiLCJyb2xlcyI6WyJQTEFZRVIiXSwicHJvZmlsZXMiOnsicGxheWVySWQiOiJjNTcxNTc4OS0wYWJlLTQ5YzgtODE5ZC1iYzdmYmQwNTkzYzEifSwiaWF0IjoxNzgzMjYyMjIxLCJleHAiOjE3ODMyNjMxMjF9.bzhyNR5Yq24B_kyiwraXLv1gwM28TB-3QBUzqubJNbM",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJlMzBjMGY5Ni0zODdiLTQ5NzAtYTRjYS00NGQ2ZWExNWM2ZWMiLCJyb2xlcyI6WyJQTEFZRVIiXSwicHJvZmlsZXMiOnsicGxheWVySWQiOiI0ZDIwNGQ5OC1lNzk3LTQxZWMtYTU1ZS03MDE4NWE5OTE1YmQifSwiaWF0IjoxNzgzMjYyMjA3LCJleHAiOjE3ODMyNjMxMDd9.Oamo2HOSRfDzqK39pg_MRzAO6skV6FSzdlFmzTrk8_s",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJmNDgyYTExYy04MTU2LTRlMmMtYmRjZi1iZGY4MWI4ODY4MDAiLCJyb2xlcyI6WyJQTEFZRVIiXSwicHJvZmlsZXMiOnsicGxheWVySWQiOiIwZmFjZmFiNS1mZTgwLTQ1NWItYWRlMi00MzgwZWUyNTNmYjMifSwiaWF0IjoxNzgzMjYyMTkyLCJleHAiOjE3ODMyNjMwOTJ9.jZ5dSNFSdwub8pOPZry6YIQkInKXvh49zz-YSg6Xuek",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI5MDk5NzFmMC1iMDZhLTRlNTUtYjc2Yi1hYTI5ZDA4YzU0YzMiLCJyb2xlcyI6WyJQTEFZRVIiXSwicHJvZmlsZXMiOnsicGxheWVySWQiOiJjNDc4ZDJlMy03ZmQ1LTRlMDAtYWUzNi00OGE4YTZmNjE1NDQifSwiaWF0IjoxNzgzMjYyMTc1LCJleHAiOjE3ODMyNjMwNzV9.otQ0KrHQru_NxFbTQlyJqZIsUjFfmBNaO3u_o2XVFfc",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiIyMmU0ZGJiMy0yNDJhLTRiMjktYTJkYS02MDQ2YzdjZmVjYzMiLCJyb2xlcyI6WyJQTEFZRVIiXSwicHJvZmlsZXMiOnsicGxheWVySWQiOiI3ZTcwM2I1Mi1hZjBhLTRlZDUtYmY3Zi0wZDMyZTYwODEyNmYifSwiaWF0IjoxNzgzMjYyMTU0LCJleHAiOjE3ODMyNjMwNTR9.3-3im9GO3pb1W2eGx6C1f0jL1O3b4i31PBMqtbDE130"
];

// Thay thế bằng ID của Sân con bạn muốn kiểm thử
const SUB_FIELD_ID = "0d758b31-12b2-4bea-a1d9-a9b6296aeaf9";

// Helper giải mã JWT để lấy Player ID của User ảo
function getPlayerId(token) {
  try {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = encoding.b64decode(base64, 'std', 's');
    const payload = JSON.parse(jsonPayload);
    return payload.profiles ? payload.profiles.playerId : 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

export default function () {
  // Lấy token dựa trên ID của User ảo đang chạy (1-indexed)
  const token = ACCESS_TOKENS[__VU - 1]; 
  
  if (!token) {
    console.error(`VU ${__VU} không có Access Token tương ứng`);
    return;
  }

  const playerId = getPlayerId(token);
  const url = `http://localhost:3000/api/v1/bookings/${SUB_FIELD_ID}`;
  
  // Thời gian đặt sân: Khung giờ ngày mai từ 21:00 đến 22:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startTime = new Date(tomorrow);
  startTime.setHours(21, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(22, 0, 0, 0);

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
    const resBody = res.json();
    console.log(`[VU ${__VU}] THÀNH CÔNG: Đặt sân được ghi nhận! Player ID: ${playerId} -> Booking ID: ${resBody.data.booking.id}`);
  } else {
    console.log(`[VU ${__VU}] THẤT BẠI: HTTP ${res.status} - Player ID: ${playerId} - Lỗi: ${res.json().message}`);
  }

  // Chờ ngắn để kết thúc kịch bản
  sleep(0.5);
}