# Spec2Backlog

**Spec2Backlog** is an AI-powered productivity engine designed to bridge the gap between product requirements and technical execution. By leveraging the **Gemini API**, it automatically transforms high-level software specifications into structured, actionable development backlogs—complete with user stories, technical tasks, and epics.

## 🚀 Key Features

* **AI-Driven Extraction:** Uses Google Gemini to parse natural language specifications into detailed, structured backlog items.
* **Full-Stack Management:** A dynamic dashboard to create, view, and organize generated backlogs.
* **Subscription Management:** Integrated with **Stripe** for handling payments, usage tiers, and billing.
* **Traffic Control:** Integrated **Rate Limiting** to prevent API abuse and ensure system stability.
* **Custom Security Architecture:** Secure authentication flow using **JWT (JSON Web Tokens)** and **OAuth 2.0** for social logins.
* **Real-time Performance:** Optimized with **Redis** for efficient caching and session handling.
* **Scalable Data Layer:** Robust relational data management using **PostgreSQL** and **Prisma ORM**.

## 🛡️ Security & Data Protection

### Automated Key Rotation
To maintain a high security posture, Spec2Backlog features an **automated key rotation system** managed by **Cron jobs**.
* **Scheduled Rotation:** Sensitive credentials, such as JWT secrets, are automatically rotated at regular intervals using scheduled tasks (via `node-cron` or system-level crontab).
* **Zero Downtime:** The rotation logic is designed to update signing keys without interrupting active user sessions or requiring manual server restarts.
* **Cryptographic Integrity:** Utilizes the Node.js `crypto` module for high-entropy secret generation.

### Data Privacy & Reliability
* **Encryption at Rest:** All sensitive data stored within the **PostgreSQL** database is encrypted at rest. This ensures that the underlying data remains unreadable even in the event of unauthorized physical or disk-level access.
* **Rate Limiting:** Implements request throttling to protect the backend and Gemini API from brute-force attacks and excessive resource consumption.
* **In-Transit Security:** All communication between the client, server, and database is handled over secure protocols to prevent unauthorized interception.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL, Prisma ORM |
| **AI Engine** | Google Gemini API |
| **Payments** | Stripe API |
| **Caching/State** | Redis |
| **Automation** | Cron Jobs / node-cron |
| **Security** | AES-256 Encryption, JWT, Rate Limiter, OAuth 2.0 |

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/yourusername/spec2backlog.git](https://github.com/yourusername/spec2backlog.git)
    cd spec2backlog
    ```

2.  **Install Dependencies**
    ```bash
    # Backend
    cd server && npm install

    # Frontend
    cd ../client && npm install
    ```

3.  **Environment Configuration**
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

4.  **Database Migration**
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the Application**
    ```bash
    # Server (from /server)
    npm run dev

    # Client (from /client)
    npm start
    ```

## 📖 Usage

1.  **Input:** Paste your project requirements or a rough "napkin sketch" of your app idea.
2.  **Generate:** The Gemini-powered engine decomposes the text into a hierarchical backlog.
3.  **Manage:** Review and edit your backlog directly in the dashboard.
4.  **Secure:** Manage your projects with the confidence that your data is encrypted, your billing is handled via Stripe, and your credentials are automatically rotated.

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

