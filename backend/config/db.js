// const mysql = require("mysql2");
// const bcrypt = require('bcryptjs');

// // Create connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Jananiravi@2006",
//   database: "billing_app",
//   multipleStatements: true
// });

// db.connect((err) => {
//   if (err) {
//     console.error("MySQL connection error:", err);
//     return;
//   }
//   console.log("MySQL Connected!");

//   // Create database if not exists
//   db.query("CREATE DATABASE IF NOT EXISTS billing_app", (err) => {
//     if (err) {
//       console.error("Database creation error:", err);
//       return;
//     }
//     console.log("Database checked/created!");

//     // Switch to database
//     db.changeUser({ database: "billing_app" }, (err) => {
//       if (err) {
//         console.error("Database switch error:", err);
//         return;
//       }
//       console.log("Using billing_app DB");

//       // Create tables in sequence
//       createTablesSequentially();
//     });
//   });
// });

// // Create tables in proper sequence
// const createTablesSequentially = () => {
//   const tables = [
//     // Users table first
//     `CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       username VARCHAR(100) UNIQUE,
//       password VARCHAR(255)
//     )`,

//     // Categories table
//     `CREATE TABLE IF NOT EXISTS categories (
//       category_id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(100) UNIQUE NOT NULL
//     )`,

//     // Products table
//     `CREATE TABLE IF NOT EXISTS products (
//       product_id INT AUTO_INCREMENT PRIMARY KEY,
//       categoryName VARCHAR(100) NOT NULL,
//       productName VARCHAR(255) NOT NULL,
//       unitOfMeasurement VARCHAR(50),
//       unitPrice DECIMAL(10,2),
//       hsnCode VARCHAR(50)
//     )`,

//     // Customers table
//     `CREATE TABLE IF NOT EXISTS customers (
//       customer_id INT AUTO_INCREMENT PRIMARY KEY,
//       customer_name VARCHAR(255) NOT NULL,
//       customer_phone VARCHAR(15) UNIQUE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`,

//     // Bills table
//     `CREATE TABLE IF NOT EXISTS bills (
//       bill_id INT AUTO_INCREMENT PRIMARY KEY,
//       bill_no INT NOT NULL,
//       customer_id INT,
//       customer_name VARCHAR(255),
//       customer_phone VARCHAR(15),
//       total_amount DECIMAL(10,2) NOT NULL,
//       paid_amount DECIMAL(10,2) DEFAULT 0,
//       balance_due DECIMAL(10,2) DEFAULT 0,
//       payment_method ENUM('Cash','Credit','GPay') DEFAULT 'Cash',
//       language ENUM('en','ta') DEFAULT 'en',
//       bill_date DATE NOT NULL,
//       created_by INT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`,

//     // Bill items table
//     `CREATE TABLE IF NOT EXISTS bill_items (
//       bill_item_id INT AUTO_INCREMENT PRIMARY KEY,
//       bill_id INT NOT NULL,
//       product_id INT,
//       product_name VARCHAR(255) NOT NULL,
//       quantity DECIMAL(8,2) NOT NULL,
//       unit_price DECIMAL(10,2) NOT NULL,
//       total_price DECIMAL(10,2) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )`,
//     // Packer Entries table
//     `CREATE TABLE IF NOT EXISTS packer_entries (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   date DATE NOT NULL,
//   bill_number VARCHAR(100) NOT NULL,
//   packer_name VARCHAR(255) NOT NULL,
//   time_in TIME NOT NULL,
//   time_out TIME,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   INDEX idx_date (date),
//   INDEX idx_bill_number (bill_number),
//   INDEX idx_packer_name (packer_name)
// )`
//   ];

//   let currentIndex = 0;

//   const createNextTable = () => {
//     if (currentIndex >= tables.length) {
//       console.log("✅ All tables checked/created!");
//       addMissingColumns();
//       return;
//     }

//     db.query(tables[currentIndex], (err) => {
//       if (err) {
//         console.error(`Error creating table ${currentIndex + 1}:`, err);
//       } else {
//         console.log(`✅ Table ${currentIndex + 1} checked/created`);
//       }
      
//       currentIndex++;
//       createNextTable();
//     });
//   };

//   createNextTable();
// };

// // Add missing columns to bills table
// const addMissingColumns = () => {
//   const columnsToAdd = [
//     { name: 'balance_due', type: 'DECIMAL(10,2) DEFAULT 0' },
//     { name: 'customer_name', type: 'VARCHAR(255)' },
//     { name: 'customer_phone', type: 'VARCHAR(15)' },
//     { name: 'created_by', type: 'INT' }
//   ];

//   let completed = 0;

//   columnsToAdd.forEach((column) => {
//     const checkQuery = `
//       SELECT COUNT(*) as count 
//       FROM information_schema.COLUMNS 
//       WHERE TABLE_SCHEMA = 'billing_app' 
//       AND TABLE_NAME = 'bills' 
//       AND COLUMN_NAME = '${column.name}'
//     `;

//     db.query(checkQuery, (err, results) => {
//       if (err) {
//         console.error(`Error checking ${column.name} column:`, err);
//         completed++;
//         checkCompletion();
//         return;
//       }

//       const columnExists = results[0] && results[0].count > 0;

//       if (!columnExists) {
//         const addQuery = `ALTER TABLE bills ADD COLUMN ${column.name} ${column.type}`;
        
//         db.query(addQuery, (err) => {
//           if (err) {
//             console.error(`Error adding ${column.name} column:`, err);
//           } else {
//             console.log(`✅ Added ${column.name} column to bills table`);
//           }
//           completed++;
//           checkCompletion();
//         });
//       } else {
//         console.log(`✅ Column ${column.name} already exists`);
//         completed++;
//         checkCompletion();
//       }
//     });
//   });

//   function checkCompletion() {
//     if (completed === columnsToAdd.length) {
//       console.log("✅ All columns checked/added to bills table!");
//       createDefaultUser();
//     }
//   }
// };

// // Create default user
// const createDefaultUser = () => {
//   db.query("SELECT * FROM users WHERE username = 'Rajeswari'", (err, results) => {
//     if (err) {
//       console.error("Error checking user:", err);
//       return;
//     }
    
//     if (results.length === 0) {
//       const plainPassword = '123456789';
//       bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
//         if (err) {
//           console.error("Error hashing password:", err);
//           return;
//         }
        
//         db.query(
//           "INSERT INTO users (username, password) VALUES (?, ?)",
//           ['Rajeswari', hashedPassword],
//           (err) => {
//             if (err) {
//               console.error("Error creating user:", err);
//             } else {
//               console.log('✅ Default user created: Rajeswari / 123456789');
//             }
//           }
//         );
//       });
//     } else {
//       console.log('✅ User Rajeswari already exists');
//     }
//   });
// };

// module.exports = db;


// const mysql = require("mysql2");
// const bcrypt = require('bcryptjs');

// // Create connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "Jananiravi@2006",
//   database: process.env.DB_NAME || "billing_app",
//   multipleStatements: true
// });
// db.connect((err) => {
//   if (err) {
//     console.error("MySQL connection error:", err);
//     return;
//   }
//   console.log("MySQL Connected!");

//   // Create database if not exists
//   db.query("CREATE DATABASE IF NOT EXISTS billing_app", (err) => {
//     if (err) {
//       console.error("Database creation error:", err);
//       return;
//     }
//     console.log("Database checked/created!");

//     // Switch to database
//     db.changeUser({ database: "billing_app" }, (err) => {
//       if (err) {
//         console.error("Database switch error:", err);
//         return;
//       }
//       console.log("Using billing_app DB");

//       // Create tables in sequence
//       createTablesSequentially();
//     });
//   });
// });

// // Create tables in proper sequence
// const createTablesSequentially = () => {
//   const tables = [
//     // Users table first
//     `CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       username VARCHAR(100) UNIQUE,
//       password VARCHAR(255)
//     )`,

//     // Categories table
//     `CREATE TABLE IF NOT EXISTS categories (
//       category_id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(100) UNIQUE NOT NULL
//     )`,

//     // Products table
//     `CREATE TABLE IF NOT EXISTS products (
//       product_id INT AUTO_INCREMENT PRIMARY KEY,
//       categoryName VARCHAR(100) NOT NULL,
//       productName VARCHAR(255) NOT NULL,
//       unitOfMeasurement VARCHAR(50),
//       unitPrice DECIMAL(10,2),
//       hsnCode VARCHAR(50)
//     )`,

//     // Stocks table
//     `CREATE TABLE IF NOT EXISTS stocks (
//       stock_id INT AUTO_INCREMENT PRIMARY KEY,
//       date DATE NOT NULL,
//       category VARCHAR(100),
//       product_name VARCHAR(255) NOT NULL,
//       quantity DECIMAL(10,2) NOT NULL,
//       purchase_rate DECIMAL(10,2) NOT NULL,
//       selling_rate DECIMAL(10,2) NOT NULL,
//       price_limit DECIMAL(10,2),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       INDEX idx_date (date),
//       INDEX idx_category (category),
//       INDEX idx_product_name (product_name)
//     )`,

//     // Transactions table
//     `CREATE TABLE IF NOT EXISTS transactions (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       date DATE NOT NULL,
//       reason VARCHAR(255) NOT NULL,
//       amount DECIMAL(10,2) NOT NULL,
//       type ENUM('income','expense') NOT NULL,
//       category VARCHAR(100),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       INDEX idx_date (date),
//       INDEX idx_type (type),
//       INDEX idx_category (category)
//     )`,

//     // Customers table
//     `CREATE TABLE IF NOT EXISTS customers (
//       customer_id INT AUTO_INCREMENT PRIMARY KEY,
//       customer_name VARCHAR(255) NOT NULL,
//       customer_phone VARCHAR(15) UNIQUE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`,

//     // Bills table
//     `CREATE TABLE IF NOT EXISTS bills (
//       bill_id INT AUTO_INCREMENT PRIMARY KEY,
//       bill_no INT NOT NULL,
//       customer_id INT,
//       customer_name VARCHAR(255),
//       customer_phone VARCHAR(15),
//       total_amount DECIMAL(10,2) NOT NULL,
//       paid_amount DECIMAL(10,2) DEFAULT 0,
//       balance_due DECIMAL(10,2) DEFAULT 0,
//       payment_method ENUM('Cash','Credit','GPay') DEFAULT 'Cash',
//       language ENUM('en','ta') DEFAULT 'en',
//       bill_date DATE NOT NULL,
//       created_by INT,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`,

//     // Bill items table
//     `CREATE TABLE IF NOT EXISTS bill_items (
//       bill_item_id INT AUTO_INCREMENT PRIMARY KEY,
//       bill_id INT NOT NULL,
//       product_id INT,
//       product_name VARCHAR(255) NOT NULL,
//       quantity DECIMAL(8,2) NOT NULL,
//       unit_price DECIMAL(10,2) NOT NULL,
//       total_price DECIMAL(10,2) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )`,

//     // Packer Entries table
//     `CREATE TABLE IF NOT EXISTS packer_entries (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       date DATE NOT NULL,
//       bill_number VARCHAR(100) NOT NULL,
//       packer_name VARCHAR(255) NOT NULL,
//       time_in TIME NOT NULL,
//       time_out TIME,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       INDEX idx_date (date),
//       INDEX idx_bill_number (bill_number),
//       INDEX idx_packer_name (packer_name)
//     )`,

//     // Purchases table
//     `CREATE TABLE IF NOT EXISTS purchases (
//       purchase_id INT AUTO_INCREMENT PRIMARY KEY,
//       purchase_date DATE NOT NULL,
//       buyer_name VARCHAR(255) NOT NULL,
//       total_amount DECIMAL(10,2) NOT NULL,
//       paid TINYINT(1) DEFAULT 0,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     )`,

//     // Purchase items table
//     `CREATE TABLE IF NOT EXISTS purchase_items (
//       item_id INT AUTO_INCREMENT PRIMARY KEY,
//       purchase_id INT NOT NULL,
//       category VARCHAR(100),
//       product_name VARCHAR(255) NOT NULL,
//       hsn_code VARCHAR(50),
//       quantity DECIMAL(10,2) NOT NULL,
//       rate DECIMAL(10,2) NOT NULL,
//       total DECIMAL(10,2) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE
//     )`,
    
//     `CREATE TABLE IF NOT EXISTS executive_salaries (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   date DATE NOT NULL,
//   username VARCHAR(100) NOT NULL,
//   total_bills INT NOT NULL DEFAULT 0,
//   salary_amount DECIMAL(10, 2) NOT NULL,
//   total_revenue DECIMAL(10, 2) DEFAULT 0,
//   first_bill_date DATE,
//   last_bill_date DATE,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   INDEX idx_username (username),
//   INDEX idx_date (date)
// )`
//   ];

//   let currentIndex = 0;

//   const createNextTable = () => {
//     if (currentIndex >= tables.length) {
//       console.log("✅ All tables checked/created!");
//       addMissingColumns();
//       return;
//     }

//     db.query(tables[currentIndex], (err) => {
//       if (err) {
//         console.error(`Error creating table ${currentIndex + 1}:`, err);
//       } else {
//         console.log(`✅ Table ${currentIndex + 1} checked/created`);
//       }
      
//       currentIndex++;
//       createNextTable();
//     });
//   };

//   createNextTable();
// };

// // Add missing columns to bills table
// const addMissingColumns = () => {
//   const columnsToAdd = [
//     { name: 'balance_due', type: 'DECIMAL(10,2) DEFAULT 0' },
//     { name: 'customer_name', type: 'VARCHAR(255)' },
//     { name: 'customer_phone', type: 'VARCHAR(15)' },
//     { name: 'created_by', type: 'INT' }
//   ];

//   let completed = 0;

//   columnsToAdd.forEach((column) => {
//     const checkQuery = `
//       SELECT COUNT(*) as count 
//       FROM information_schema.COLUMNS 
//       WHERE TABLE_SCHEMA = 'billing_app' 
//       AND TABLE_NAME = 'bills' 
//       AND COLUMN_NAME = '${column.name}'
//     `;

//     db.query(checkQuery, (err, results) => {
//       if (err) {
//         console.error(`Error checking ${column.name} column:`, err);
//         completed++;
//         checkCompletion();
//         return;
//       }

//       const columnExists = results[0] && results[0].count > 0;

//       if (!columnExists) {
//         const addQuery = `ALTER TABLE bills ADD COLUMN ${column.name} ${column.type}`;
        
//         db.query(addQuery, (err) => {
//           if (err) {
//             console.error(`Error adding ${column.name} column:`, err);
//           } else {
//             console.log(`✅ Added ${column.name} column to bills table`);
//           }
//           completed++;
//           checkCompletion();
//         });
//       } else {
//         console.log(`✅ Column ${column.name} already exists`);
//         completed++;
//         checkCompletion();
//       }
//     });
//   });

//   function checkCompletion() {
//     if (completed === columnsToAdd.length) {
//       console.log("✅ All columns checked/added to bills table!");
//       createDefaultUser();
//     }
//   }
// };

// // Create default user
// const createDefaultUser = () => {
//   db.query("SELECT * FROM users WHERE username = 'Rajeswari'", (err, results) => {
//     if (err) {
//       console.error("Error checking user:", err);
//       return;
//     }
    
//     if (results.length === 0) {
//       const plainPassword = '123456789';
//       bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
//         if (err) {
//           console.error("Error hashing password:", err);
//           return;
//         }
        
//         db.query(
//           "INSERT INTO users (username, password) VALUES (?, ?)",
//           ['Rajeswari', hashedPassword],
//           (err) => {
//             if (err) {
//               console.error("Error creating user:", err);
//             } else {
//               console.log('✅ Default user created: Rajeswari / 123456789');
//             }
//           }
//         );
//       });
//     } else {
//       console.log('✅ User Rajeswari already exists');
//     }
//   });
// };

// module.exports = db;


const mysql = require("mysql2");
const bcrypt = require('bcryptjs');

// Create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Jananiravi@2006",
  database: process.env.DB_NAME || "billing_app",
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("MySQL Connected!");

  // Create database if not exists
  db.query("CREATE DATABASE IF NOT EXISTS billing_app", (err) => {
    if (err) {
      console.error("Database creation error:", err);
      return;
    }
    console.log("Database checked/created!");

    // Switch to database
    db.changeUser({ database: "billing_app" }, (err) => {
      if (err) {
        console.error("Database switch error:", err);
        return;
      }
      console.log("Using billing_app DB");

      // Create tables in sequence
      createTablesSequentially();
    });
  });
});

// Create tables in proper sequence
const createTablesSequentially = () => {
  const tables = [
    // Users table first
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE,
      password VARCHAR(255)
    )`,

    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    )`,

    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      categoryName VARCHAR(100) NOT NULL,
      productName VARCHAR(255) NOT NULL,
      unitOfMeasurement VARCHAR(50),
      unitPrice DECIMAL(10,2),
      hsnCode VARCHAR(50)
    )`,

    // Stocks table
    `CREATE TABLE IF NOT EXISTS stocks (
      stock_id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      category VARCHAR(100),
      product_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      purchase_rate DECIMAL(10,2) NOT NULL,
      selling_rate DECIMAL(10,2) NOT NULL,
      price_limit DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_category (category),
      INDEX idx_product_name (product_name)
    )`,

    // Transactions table
    `CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      reason VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type ENUM('income','expense') NOT NULL,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_type (type),
      INDEX idx_category (category)
    )`,

    // Customers table
    `CREATE TABLE IF NOT EXISTS customers (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(15) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Bills table
    `CREATE TABLE IF NOT EXISTS bills (
      bill_id INT AUTO_INCREMENT PRIMARY KEY,
      bill_no INT NOT NULL,
      customer_id INT,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(15),
      total_amount DECIMAL(10,2) NOT NULL,
      paid_amount DECIMAL(10,2) DEFAULT 0,
      balance_due DECIMAL(10,2) DEFAULT 0,
      payment_method ENUM('Cash','Credit','GPay') DEFAULT 'Cash',
      language ENUM('en','ta') DEFAULT 'en',
      bill_date DATE NOT NULL,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Bill items table
    `CREATE TABLE IF NOT EXISTS bill_items (
      bill_item_id INT AUTO_INCREMENT PRIMARY KEY,
      bill_id INT NOT NULL,
      product_id INT,
      product_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(8,2) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Packer Entries table
    `CREATE TABLE IF NOT EXISTS packer_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      bill_number VARCHAR(100) NOT NULL,
      packer_name VARCHAR(255) NOT NULL,
      time_in TIME NOT NULL,
      time_out TIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_bill_number (bill_number),
      INDEX idx_packer_name (packer_name)
    )`,

    // Purchases table
    `CREATE TABLE IF NOT EXISTS purchases (
      purchase_id INT AUTO_INCREMENT PRIMARY KEY,
      purchase_date DATE NOT NULL,
      buyer_name VARCHAR(255) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      paid TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Purchase items table
    `CREATE TABLE IF NOT EXISTS purchase_items (
      item_id INT AUTO_INCREMENT PRIMARY KEY,
      purchase_id INT NOT NULL,
      category VARCHAR(100),
      product_name VARCHAR(255) NOT NULL,
      hsn_code VARCHAR(50),
      quantity DECIMAL(10,2) NOT NULL,
      rate DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE
    )`,
    
    // Executive Salaries table - UPDATED WITH salary_month column
    `CREATE TABLE IF NOT EXISTS executive_salaries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      username VARCHAR(100) NOT NULL,
      salary_month VARCHAR(7) NOT NULL,
      total_bills INT NOT NULL DEFAULT 0,
      salary_amount DECIMAL(10, 2) NOT NULL,
      first_bill_date DATE,
      last_bill_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_salary_month (salary_month),
      INDEX idx_date (date)
    )`
  ];

  let currentIndex = 0;

  const createNextTable = () => {
    if (currentIndex >= tables.length) {
      console.log("✅ All tables checked/created!");
      addMissingColumns();
      return;
    }

    db.query(tables[currentIndex], (err) => {
      if (err) {
        console.error(`Error creating table ${currentIndex + 1}:`, err);
      } else {
        console.log(`✅ Table ${currentIndex + 1} checked/created`);
      }
      
      currentIndex++;
      createNextTable();
    });
  };

  createNextTable();
};

// Add missing columns to bills table
const addMissingColumns = () => {
  const columnsToAdd = [
    { name: 'balance_due', type: 'DECIMAL(10,2) DEFAULT 0' },
    { name: 'customer_name', type: 'VARCHAR(255)' },
    { name: 'customer_phone', type: 'VARCHAR(15)' },
    { name: 'created_by', type: 'INT' }
  ];

  let completed = 0;

  columnsToAdd.forEach((column) => {
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'billing_app' 
      AND TABLE_NAME = 'bills' 
      AND COLUMN_NAME = '${column.name}'
    `;

    db.query(checkQuery, (err, results) => {
      if (err) {
        console.error(`Error checking ${column.name} column:`, err);
        completed++;
        checkCompletion();
        return;
      }

      const columnExists = results[0] && results[0].count > 0;

      if (!columnExists) {
        const addQuery = `ALTER TABLE bills ADD COLUMN ${column.name} ${column.type}`;
        
        db.query(addQuery, (err) => {
          if (err) {
            console.error(`Error adding ${column.name} column:`, err);
          } else {
            console.log(`✅ Added ${column.name} column to bills table`);
          }
          completed++;
          checkCompletion();
        });
      } else {
        console.log(`✅ Column ${column.name} already exists`);
        completed++;
        checkCompletion();
      }
    });
  });

  function checkCompletion() {
    if (completed === columnsToAdd.length) {
      console.log("✅ All columns checked/added to bills table!");
      addSalaryMonthColumn();
    }
  }
};

// Add salary_month column to executive_salaries if it doesn't exist
const addSalaryMonthColumn = () => {
  const checkQuery = `
    SELECT COUNT(*) as count 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'billing_app' 
    AND TABLE_NAME = 'executive_salaries' 
    AND COLUMN_NAME = 'salary_month'
  `;

  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error("Error checking salary_month column:", err);
      createDefaultUser();
      return;
    }

    const columnExists = results[0] && results[0].count > 0;

    if (!columnExists) {
      const addQuery = `ALTER TABLE executive_salaries ADD COLUMN salary_month VARCHAR(7) NOT NULL AFTER username`;
      
      db.query(addQuery, (err) => {
        if (err) {
          console.error("Error adding salary_month column:", err);
        } else {
          console.log("✅ Added salary_month column to executive_salaries table");
        }
        createDefaultUser();
      });
    } else {
      console.log("✅ Column salary_month already exists in executive_salaries");
      createDefaultUser();
    }
  });
};

// Create default user
const createDefaultUser = () => {
  db.query("SELECT * FROM users WHERE username = 'Rajeswari'", (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return;
    }
    
    if (results.length === 0) {
      const plainPassword = '123456789';
      bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return;
        }
        
        db.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          ['Rajeswari', hashedPassword],
          (err) => {
            if (err) {
              console.error("Error creating user:", err);
            } else {
              console.log('✅ Default user created: Rajeswari / 123456789');
            }
          }
        );
      });
    } else {
      console.log('✅ User Rajeswari already exists');
    }
  });
};

module.exports = db;