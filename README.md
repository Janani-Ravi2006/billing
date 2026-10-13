<h1 align="center">🧾 Smart Billing and Inventory Management System</h1> <p align="center"> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" /> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /> <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" /> </p> <h3 align="center"> A web-based (and desktop-ready) application that automates billing, inventory tracking, purchases, and financial reporting for small to medium-sized businesses. </h3> <p align="center"> It reduces manual errors, keeps a digital record of every transaction, and gives real-time insight into stock, sales, and overdue payments. </p> <p align="center"> 
________________________________________
<h2>✨ Features</h2> <table> <tr> <th width="60"></th> <th align="left" width="280"><h3>Feature</h3></th> <th align="left"><h3>What it does</h3></th> </tr> <tr> <td align="center"><h2>🔐</h2></td> <td><h4>Authentication</h4></td> <td>Signup, login, logout, and secure session handling</td> </tr> <tr> <td align="center"><h2>📊</h2></td> <td><h4>Dashboard</h4></td> <td>Key business metrics, date-filtered financial overview (All Time / Today / Custom), and a notification panel</td> </tr> <tr> <td align="center"><h2>🗂️</h2></td> <td><h4>Category & Product Management</h4></td> <td>Add, edit, delete, and search categories and products with HSN code support</td> </tr> <tr> <td align="center"><h2>🛒</h2></td> <td><h4>Purchase Management</h4></td> <td>Auto-calculated totals, Paid/Pending status, printable receipts, and Razorpay payment integration</td> </tr> <tr> <td align="center"><h2>📦</h2></td> <td><h4>Stock Management</h4></td> <td>Real-time stock tracking, price-limit validation, and low-stock alerts (toast, desktop notification, email, red highlight at ≤ 20 units)</td> </tr> <tr> <td align="center"><h2>🧮</h2></td> <td><h4>Smart Billing</h4></td> <td>Multi-tab billing, phone-based customer lookup, previous-due detection, Cash / Credit / GPay, partial payments, and multi-copy printing</td> </tr> <tr> <td align="center"><h2>🌐</h2></td> <td><h4>Bilingual Bills</h4></td> <td>English and Tamil (தமிழ்) billing and receipts</td> </tr> <tr> <td align="center"><h2>👥</h2></td> <td><h4>Customer Accounts</h4></td> <td>Searchable customer list, due amounts, and full purchase history</td> </tr> <tr> <td align="center"><h2>⏰</h2></td> <td><h4>Overdue Bills</h4></td> <td>Colour-coded aging, 7+/30+/60+ day filters, alerts, and in-app payment collection</td> </tr> <tr> <td align="center"><h2>👷</h2></td> <td><h4>Executive & Packer Management</h4></td> <td>Salary processing, packer entry (time in/out), and performance reports</td> </tr> <tr> <td align="center"><h2>📈</h2></td> <td><h4>Reports</h4></td> <td>Product Sales, Executive, Packer, and Package Section reports with charts, CSV export, and print</td> </tr> <tr> <td align="center"><h2>💰</h2></td> <td><h4>Transactions</h4></td> <td>Income, Expense, and Profit calculation by date range</td> </tr> <tr> <td align="center"><h2>📧</h2></td> <td><h4>Email Alerts</h4></td> <td>Instant low-stock alerts and a daily low-stock summary report</td> </tr> </table> 
________________________________________
<h2>🛠️ Tech Stack</h2> 
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
<h2>📁 Project Structure</h2> <h3>🗂️ Overview</h3> 
billing-software/
├── backend/        → Node.js + Express REST API
└── frontend/       → React + Vite UI (with Electron desktop wrapper)
<h3>⚙️ Backend</h3> 
backend/
├── config/
│   └── db.js                    # MySQL connection
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── productController.js
│   └── purchaseController.js
├── models/
│   ├── Cart.js
│   ├── categoryModel.js
│   ├── productModel.js
│   ├── purchaseModel.js
│   └── userModel.js
├── routes/
│   ├── authRoutes.js
│   ├── billRoutes.js
│   ├── categoryRoutes.js
│   ├── dashboardRoutes.js
│   ├── executiveRoutes.js
│   ├── overdueBills.js
│   ├── packerRoutes.js
│   ├── payment.js
│   ├── productRoutes.js
│   ├── purchaseRoutes.js
│   ├── stockRoutes.js
│   └── transactionRoutes.js
├── Dockerfile
├── package.json
└── server.js                    # App entry point
<h3>🎨 Frontend</h3> 
frontend/
├── electron/
│   └── main.js                  # Electron main process
├── public/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Navbar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Category.jsx
│   │   ├── SavedCategories.jsx
│   │   ├── Products.jsx
│   │   ├── SavedProducts.jsx
│   │   ├── Purchase.jsx
│   │   ├── Stock.jsx
│   │   ├── Billing.jsx
│   │   ├── AccountPage.jsx
│   │   ├── Overdue.jsx
│   │   ├── Transaction.jsx
│   │   ├── ExecutiveSalary.jsx
│   │   ├── ExecutiveReport.jsx
│   │   ├── Packers.jsx
│   │   ├── PackerEntry.jsx
│   │   ├── PackerReport.jsx
│   │   ├── PackageSectionReport.jsx
│   │   └── ProductSalesReport.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
________________________________________
<h2>🗄️ Database Overview</h2> 
Main tables: User, Category, Product, Purchase, Purchase Item, Stock, Bills, Bills Item, Customer, Packer, Transaction.
Key relationships:
•	Product → Category (via category name)
•	Purchase Item → Purchase
•	Bills → Customer
•	Bills Item → Bills and Product
________________________________________
<h2>🚀 Getting Started</h2> <h3>Prerequisites</h3> 
•	Node.js (v18 or later recommended)
•	MySQL (v8+)
•	A Razorpay account (test keys are fine) for payments
•	An email account / app password for stock alert emails
<h3>1. Clone the repository</h3> 
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
<h3>2. Set up the database</h3> 
CREATE DATABASE billing_db;
Tables are created from the Sequelize models / backend setup. Update the database name to match your config/db.js.
<h3>3. Configure environment variables</h3> 
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
<h3>4. Run the backend</h3> 
cd backend
npm install
npm start        # or: node server.js
<h3>5. Run the frontend</h3> 
cd frontend
npm install
npm run dev
The app will be available at http://localhost:5173 (Vite default).
<h3>6. (Optional) Run as a desktop app with Electron</h3> 
cd frontend
npm run electron   # use the script defined in your package.json
<h3>7. (Optional) Run with Docker</h3> 
# Backend
cd backend
docker build -t billing-backend .

# Frontend
cd ../frontend
docker build -t billing-frontend .
________________________________________
<h2>📸 Screenshots</h2> 
Add your screenshots to a screenshots/ folder and reference them here.
<table> <tr> <td align="center"><b>Dashboard</b><br><img src="screenshots/dashboard.png" width="400"></td> <td align="center"><b>Billing</b><br><img src="screenshots/billing.png" width="400"></td> </tr> <tr> <td align="center"><b>Stock Alerts</b><br><img src="screenshots/stock.png" width="400"></td> <td align="center"><b>Overdue Bills</b><br><img src="screenshots/overdue.png" width="400"></td> </tr> </table> 
________________________________________
<h2>🧩 Modules at a Glance</h2> 
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
<h2>🔮 Future Enhancements</h2> 
•	Role-based access control 
•	Barcode scanning for faster billing
•	GST-compliant invoice formats
•	Mobile app and cloud deployment
•	Advanced analytics and forecasting
________________________________________
<h2>📄 Conclusion</h2> 
The Smart Billing and Inventory Management System automates product management, purchase tracking, stock maintenance, billing, and overdue payment monitoring. It reduces manual effort, minimizes billing errors, and gives shop owners real-time insight into sales, stock, and finances.
________________________________________
<h2>📜 License</h2> 
This project was developed for academic purposes. Add a license of your choice (e.g., MIT) if you plan to make it open source.
________________________________________
<p align="center"><b>Made with  by Janani R</b></p>

