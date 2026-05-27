import re

def search_vietnamese_in_png(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    
    # Let's search for sequences of ASCII letters plus spaces or common Vietnamese characters
    # encoded in UTF-8
    words = re.findall(b'[a-zA-Z\\s\\x80-\\xff]{4,}', data)
    print(f"Searching Vietnamese/readable words in {file_path}:")
    
    keywords = [
        'đặt', 'sân', 'kèo', 'thanh toán', 'chủ', 'quản', 'quyết toán', 'doanh thu',
        'người', 'chơi', 'hoạt động', 'nghiệp vụ', 'lịch sử', 'admin', 'player', 'owner',
        'chất lượng', 'đánh giá', 'tạo kèo', 'giao lưu'
    ]
    
    found_count = 0
    for w in words:
        try:
            decoded = w.decode('utf-8', errors='ignore').strip()
            decoded_lower = decoded.lower()
            if any(kw in decoded_lower for kw in keywords):
                print(f"  Match: {decoded}")
                found_count += 1
                if found_count > 30:
                    print("  ... truncated ...")
                    break
        except Exception:
            pass

search_vietnamese_in_png('/home/thainv/workspace/sports-booking-platform/images/sports-booking.png')
