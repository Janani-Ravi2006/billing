🧾 Smart Billing and Inventory Management System


A web-based (and desktop-ready) application that automates billing, inventory tracking, purchases, and financial reporting for small to medium-sized businesses.
It reduces manual errors, keeps a digital record of every transaction, and gives real-time insight into stock, sales, and overdue payments.
________________________________________
✨ Features
•	🔐 Authentication – Signup, login, logout, and session handling
•	📊 Dashboard – Key business metrics, date-filtered financial overview (All Time / Today / Custom), and a notification panel
•	🗂️ Category & Product Management – Add, edit, delete, and search categories and products (with HSN code support)
•	🛒 Purchase Management – Record purchases with auto-calculated totals, Paid/Pending status, printable receipts, and Razorpay payment integration
•	📦 Stock Management – Real-time stock tracking with price-limit validation and low-stock alerts (toast, browser/desktop notification, email, and red highlighting at ≤ 20 units)
•	🧮 Smart Billing – Multi-tab billing, phone-based customer lookup, previous-due detection, Cash / Credit / GPay payments, partial payments, and multi-copy printing
•	🌐 Bilingual Bills – English and Tamil (தமிழ்) billing and receipts
•	👥 Customer Accounts – Searchable customer list, due amounts, and full purchase history
•	⏰ Overdue Bills – Overdue tracking with colour-coded aging, filters (7+/30+/60+ days), alerts, and in-app payment collection
•	👷 Executive & Packer Management – Salary processing, packer entry (time in/out), and performance reports
•	📈 Reports – Product Sales Report (charts), Executive Report, Packer Report, and Package Section Report with CSV export and print
•	💰 Transactions – Income, Expense, and Profit calculation by date range
•	📧 Email Alerts – Instant low-stock alerts and a daily low-stock summary report
________________________________________
🛠️ Tech Stack
Layer	Technologies
Frontend	React.js, Vite, Tailwind CSS
Backend	Node.js, Express.js
Database	MySQL (Sequelize ORM + raw queries)
Middleware	Authentication, File Upload, CORS, Body Parser
Payments	Razorpay
Desktop	Electron
DevOps	Docker
Architecture	MVC, RESTful API design, modular structure, async/await
________________________________________
📁 Project Structure
billing-software/
├── backend/
│   ├── config/            # Database configuration (db.js)
│   ├── controllers/       # auth, category, product, purchase controllers
│   ├── models/            # Sequelize models (Cart, Category, Product, Purchase, User)
│   ├── routes/            # auth, bill, category, dashboard, executive, overdueBills,
│   │                      # packer, payment, product, purchase, stock, transaction
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── electron/          # Electron main process (main.js)
    ├── public/
    ├── src/
    │   ├── components/    # Billing, Dashboard, Category, Products, Purchase, Stock,
    │   │                  # AccountPage, Overdue, Transaction, Packers, reports, etc.
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── Dockerfile
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
________________________________________
🗄️ Database Overview
Main tables: User, Category, Product, Purchase, Purchase Item, Stock, Bills, Bills Item, Customer, Packer, Transaction.
Key relationships:
•	Product → Category (via category name)
•	Purchase Item → Purchase
•	Bills → Customer
•	Bills Item → Bills and Product
________________________________________
🚀 Getting Started
Prerequisites
•	Node.js (v18 or later recommended)
•	MySQL (v8+)
•	A Razorpay account (test keys are fine) for payments
•	An email account / app password for stock alert emails
1. Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
2. Set up the database
CREATE DATABASE billing_db;
Tables are created from the Sequelize models / backend setup. Update the database name to match your config/db.js.
3. Configure environment variables
Create a .env file inside backend/ (adjust names to match your code):
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=billing_db

JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
⚠️ Never commit your .env file. Make sure it is listed in .gitignore.
4. Run the backend
cd backend
npm install
npm start        # or: node server.js
5. Run the frontend
cd frontend
npm install
npm run dev
The app will be available at http://localhost:5173 (Vite default).
6. (Optional) Run as a desktop app with Electron
cd frontend
npm run electron   # use the script defined in your package.json
7. (Optional) Run with Docker
# Backend
cd backend
docker build -t billing-backend .

# Frontend
cd ../frontend
docker build -t billing-frontend .
________________________________________
📸 Screenshots
Add your screenshots to a screenshots/ folder and reference them here.
Dashboard	Billing
 	 
Stock Alerts	Overdue Bills
 	 
________________________________________
🧩 Modules at a Glance
Module	Description
Authentication	Signup, login, secure logout
Dashboard	Metrics, financial overview, alerts
Category / Product	CRUD with search and validation
Purchase	Supplier purchases, Razorpay payments, receipts
Stock	Real-time stock, low-stock multi-channel alerts
Billing	Multi-tab, bilingual billing with dues handling
Accounts	Customer details and purchase history
Overdue	Aging-based overdue tracking and payments
Executive / Packer	Salary processing, packing logs, reports
Transactions	Income, expense, and profit analysis
________________________________________
🔮 Future Enhancements
•	Role-based access control (admin / staff)
•	Barcode scanning for faster billing
•	GST-compliant invoice formats
•	Mobile app and cloud deployment
•	Advanced analytics and forecasting
________________________________________
📄 Conclusion
The Smart Billing and Inventory Management System automates product management, purchase tracking, stock maintenance, billing, and overdue payment monitoring. 
It reduces manual effort, minimizes billing errors, and gives shop owners real-time insight into sales, stock, and finances.
________________________________________
📜 License
This project was developed for academic purposes. Add a license of your choice (e.g., MIT) if you plan to make it open source.

