import sqlite3
conn = sqlite3.connect('epix.db')
c = conn.cursor()
c.execute("SELECT id, error, substr(image_url,1,80) FROM generations WHERE status='failed' ORDER BY created_at DESC LIMIT 3")
[print(r) for r in c.fetchall()]
conn.close()
