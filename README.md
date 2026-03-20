# Inventory Management System

A full-stack **Inventory Management System** that allows users to manage products, track inventory, and upload product images.
This project includes a **Python backend API** and a **modern JavaScript frontend** interface.

---

## 🚀 Features

* Add new products to inventory
* Update product details
* Delete products
* Upload product images
* View all inventory items
* Backend API for product management
* Modern frontend UI

---

## 🛠️ Technologies Used

### Backend

* Python
* Flask
* REST API
* File Upload Handling

### Frontend

* JavaScript
* Vite
* HTML
* CSS

---

## 📂 Project Structure

```
inventory_backend
│
├── app
│   ├── models.py        # Database models
│   ├── routes.py        # API routes
│   ├── utils.py         # Helper functions
│   └── uploads          # Uploaded product images
│
├── app.py               # Main backend server
├── config.py            # Configuration settings
│
└── inventory_frontend   # Frontend application
    ├── index.html
    ├── src
    └── package.json
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/inventory-management-system.git
cd inventory-management-system
```

---

### 2️⃣ Setup Backend

Install Python dependencies:

```
pip install flask
```

Run the backend server:

```
python app.py
```

Server will start on:

```
http://localhost:5000
```

---

### 3️⃣ Setup Frontend

Go to the frontend folder:

```
cd inventory_frontend
```

Install dependencies:

```
npm install
```

Run the frontend:

```
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | /products     | Get all products |
| POST   | /products     | Add new product  |
| PUT    | /products/:id | Update product   |
| DELETE | /products/:id | Delete product   |

---

## 📸 Image Upload

Product images are stored inside:

```
app/uploads/
```

---

## 📈 Future Improvements

* User authentication
* Admin dashboard
* Inventory analytics
* Database integration (MongoDB / MySQL)
* Deployment on cloud

---

## 👨‍💻 Author

Developed as part of an academic project for learning **full-stack development and inventory management systems**.

---

## 📄 License

This project is created for **educational purposes**.
