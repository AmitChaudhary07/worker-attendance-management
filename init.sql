CREATE TABLE IF NOT EXISTS workers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  daily_wage DECIMAL(10,2),
  designation VARCHAR(100),
  status VARCHAR(50),
  advance DECIMAL(10,2) DEFAULT 0,
  remaining DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  worker_id INT,
  date DATE,
  status VARCHAR(50),
  PRIMARY KEY (worker_id, date),
  FOREIGN KEY (worker_id) REFERENCES workers(id)
);

CREATE TABLE IF NOT EXISTS processed_payouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  worker_id INT,
  amount DECIMAL(10,2),
  week_start DATE,
  week_end DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id)
); 