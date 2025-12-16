# 🛒 Engrossery

**Engrossery** is a full-stack **Grocery Shopping Web Application** featuring **user authentication, product management, order handling, and a Seller Dashboard**.  
The application is built using **React (Vite)** for the frontend and **Node.js + Express + MongoDB** for the backend, and is fully deployed on the cloud.

🔗 **Live Website:** https://engrossery-upd.vercel.app/  
🔗 **Backend API:** https://engrossery-d6eg.onrender.com  

---

## 🚀 Key Features

### 👤 User Features
- User registration & login (JWT authentication)
- Browse grocery products
- Add products to cart
- Place orders
- Secure API communication

### 🧑‍💼 Seller Dashboard
- Dedicated seller interface
- Manage products (view & control listings)
- Access seller-specific routes
- Role-based access control (User vs Seller)

### 🛡️ Backend & Security
- JWT-based authentication
- Role-aware API routing
- MongoDB data persistence
- Secure environment variable handling

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router
- Zustand (state management)
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- CORS & Morgan

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 📁 Project Structure (Monorepo)

```bash
Engrossery/
├── grocery-backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── grocery-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── .gitignore
└── README.md  

```

### 🔐 Environment Variables
Backend (Render)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

## Frontend (Vercel)
VITE_API_URL=https://engrossery-d6eg.onrender.com/api

### ⚙️ Local Development Setup
## 1️⃣ Clone the Repository
git clone https://github.com/Sadvikha/Engrossery_.git
cd Engrossery_

## 2️⃣ Backend Setup
cd grocery-backend
npm install
npm start


Backend runs at:

http://localhost:5000

## 3️⃣ Frontend Setup
cd grocery-frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

### 🌐 API Endpoints Overview
- Method	Endpoint	Description
- POST	/api/auth/register	Register user
- POST	/api/auth/login	Login user
- GET	/api/products	Fetch products
- POST	/api/orders	Create order
- GET	/api/user	User / Seller details

### 🧪 Notes

1) Render free tier services sleep on inactivity, so the first API request may take a few seconds.

2) Frontend and backend are fully decoupled and communicate only via hosted APIs.

3) No sensitive information is committed to the repository.


### 📌 Future Enhancements

- Admin-level dashboard

- Payment gateway integration

- Advanced product filtering & search

- Order tracking system

- Improved analytics for sellers

### 👤 Author

Sadvikha
GitHub: https://github.com/Sadvikha
