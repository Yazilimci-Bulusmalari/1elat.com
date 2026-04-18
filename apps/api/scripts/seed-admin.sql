-- Bu script mevcut kullanıcıyı admin rolüne yükseltir.
-- Idempotent: aynı komut tekrar çalıştırılabilir, yan etkisi yok.
-- Email değerini değiştirmeden kullanım: aşağıdaki email zaten hedef admindir.

UPDATE users
SET role = 'admin'
WHERE LOWER(email) = LOWER('abdulahcicekli@gmail.com')
  AND role != 'admin';

SELECT id, email, username, role FROM users WHERE LOWER(email) = LOWER('abdulahcicekli@gmail.com');
