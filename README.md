🔐 SecureShare
A secure file sharing system that encrypts files before storing and sharing them, ensuring safe and controlled access.

🚀 Features
🔑 User Authentication (JWT)
🔐 AES-256 File Encryption
☁️ Cloud Storage (Cloudinary)
📁 Upload & Share Files
👤 Role-based Access (User & Admin)
✅ Admin Approval for Downloads
📜 Audit Logging
🔍 Secure File Search
🛠️ Tech Stack
Frontend: React (Vite), TypeScript Backend: Node.js, Express.js Database: MongoDB (Mongoose) Other: Cloudinary, Multer, JWT, Crypto

🔐 How It Works
User signs up / logs in
Generates a personal encryption key
File is encrypted before upload
Stored securely in cloud
Recipient requests download
Admin approves
File is decrypted during download
⚙️ Setup Instructions
1. Clone the Repository
git clone https://github.com/DDevakiD/major.git
cd SecureShare
2. Backend Setup
cd FileSharing-main
npm install
Create .env file:

PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MASTER_ENCRYPTION_KEY=your_master_key
ENCRYPTION_IV=your_iv
Run backend:

npm run dev
3. Frontend Setup
cd FileSharing-FE-main
npm install
npm run dev
🌐 Running the App
Frontend: http://localhost:8080
Backend: http://localhost:5000
⚠️ Notes
.env file is not included for security reasons
Ensure ports are public in Codespaces
📌 Future Improvements
🌍 Deployment
🔗 Shareable file links
⏳ File expiry
📊 Dashboard analytics
👩‍💻 Author
Gokul avinash raj

⭐ Support
If you like this project, give it a ⭐# secure-share
