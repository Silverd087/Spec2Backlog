# Spec2Backlog

**Spec2Backlog** is an AI-powered productivity engine designed to bridge the gap between product requirements and technical execution. By leveraging the **Gemini API**, it automatically transforms high-level software specifications into structured, actionable development backlogs—complete with user stories, technical tasks, and epics.

## 🚀 Key Features

* **AI-Driven Extraction:** Uses Google Gemini to parse natural language specifications into detailed, structured backlog items.
* **Full-Stack Management:** A dynamic dashboard to create, view, and organize generated backlogs.
* **Subscription & Billing:** Integrated with **Stripe** for handling payments, usage tiers, and secure webhook processing.
* **Multi-Provider Auth:** Custom authentication flow supporting **JWT**, **Google OAuth 2.0**, and **GitHub OAuth**.
* **Traffic Control:** Integrated **Rate Limiting** via Redis to prevent API abuse and ensure system stability.
* **Real-time Performance:** Optimized with **Redis** for efficient caching and session handling.
* **Scalable Data Layer:** Robust relational data management using **PostgreSQL** and **Prisma ORM**.

## 🛡️ Security & Data Protection

### Automated Key Rotation
To maintain a high security posture, Spec2Backlog features an **automated key rotation system** managed by **Cron jobs**.
* **Scheduled Rotation:** Sensitive credentials, such as JWT secrets, are automatically rotated at regular intervals using scheduled tasks (via `node-cron` or system-level crontab).
* **Zero Downtime:** The rotation logic is designed to update signing keys without interrupting active user sessions.
* **Cryptographic Integrity:** Utilizes the Node.js `crypto` module for high-entropy secret generation.

### Data Privacy & Reliability
* **Encryption at Rest:** All sensitive data stored within the **PostgreSQL** database is encrypted at rest to ensure data sovereignty.
* **Rate Limiting:** Implements request throttling to protect the backend and Gemini API from brute-force attacks.
* **In-Transit Security:** All communication is handled over secure protocols to prevent unauthorized interception.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL, Prisma ORM |
| **AI Engine** | Google Gemini API |
| **Payments** | Stripe API (Subscriptions & Webhooks) |
| **Caching/State** | Redis |
| **Automation** | Cron Jobs / node-cron |
| **Security** | AES-256 Encryption, JWT, Rate Limiter, OAuth 2.0 |

## 📦 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Silverd087/Spec2Backlog.git
   cd Spec2Backlog
   ```

2. **Environment Configuration**
   Create a `.env` file in the `server` directory using the following template:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spec2backlog"
   GEMINI_API_KEY="your_api_key"
   JWT_SECRET="initial_secret"
   CLIENT_URL="http://localhost:5173"
   
   # OAuth
   GOOGLE_CLIENT_ID="your_google_id"
   GOOGLE_CLIENT_SECRET="your_google_secret"
   GITHUB_CLIENT_ID="your_github_id"
   GITHUB_CLIENT_SECRET="your_github_secret"

   # Stripe
   STRIPE_SECRET_KEY="your_stripe_key"
   STRIPE_WEBHOOK_SECRET="your_webhook_secret"

   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install
   ```

4. **Infrastructure Setup (Redis on WSL)**
   Spec2Backlog requires Redis for session management and rate limiting. On Windows, it is recommended to use WSL (Ubuntu):
   ```bash
   # Update WSL packages
   sudo apt update && sudo apt upgrade

   # Install Redis server
   sudo apt install redis-server

   # Start the Redis service
   sudo service redis-server start

   # Verify Redis is running
   redis-cli ping
   # Expected output: PONG
   ```

5. **Database Migration**
   ```bash
   cd server
   npx prisma migrate dev
   ```

6. **Start the Application**
   ```bash
   # Start the Backend (from /server)
   npm run dev

   # Start the Frontend (from /client)
   npm start
   ```

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
