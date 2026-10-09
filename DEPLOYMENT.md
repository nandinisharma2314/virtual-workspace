# Production Deployment & Company Onboarding Guide

## 1. Overview & Architecture

The platform is an **All-in-One Multi-Tenant B2B SaaS Collaboration Platform** providing full feature parity with **Trello, Slack, Microsoft Teams, and Jira**, governed by a strict Role-Based Access Control (RBAC) engine and complete tenant data isolation.

| Service | Technology | Port | Purpose |
|---|---|---|---|
| **Database** | PostgreSQL 16 + Drizzle ORM | `5432` | Relational storage across 29 tenant-scoped tables |
| **Backend** | NestJS 11 + Socket.IO | `3001` | REST APIs, real-time presence, WebSockets, RBAC guards |
| **Customer App** | Next.js 16 (Turbopack) | `3000` | Customer-facing SaaS workspace dashboard |
| **Operator Console** | Next.js 16 (Turbopack) | `3002` | Platform developer/operator super-admin tool |

---

## 2. One-Command Docker Deployment (Recommended)

All services can be orchestrated with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/nandinisharma2314/virtual-workspace.git
cd virtual-workspace

# 2. Configure environment variables (optional, defaults provided)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin-panel/.env.example admin-panel/.env.local

# 3. Build and launch all containers in detached mode
docker compose up -d --build
```

### Stopping & Inspecting Containers
```bash
# Check service logs
docker compose logs -f backend

# Stop the stack
docker compose down
```

---

## 3. Reverse Proxy & Domain Routing (Nginx Configuration)

For production with SSL (Let's Encrypt / Certbot), route your subdomains to the respective local ports:

```nginx
# 1. Customer Workspace App (e.g. app.yourcompany.com)
server {
    server_name app.yourcompany.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 2. Backend API & WebSockets (e.g. api.yourcompany.com)
server {
    server_name api.yourcompany.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. Operator Console (e.g. admin.yourcompany.com)
server {
    server_name admin.yourcompany.com;
    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Bare-Metal / PM2 Production Deployment

```bash
# 1. Database Migration
cd backend
npm install
npm run build
npx drizzle-kit push   # Synchronizes PostgreSQL schema

# 2. Start Backend with PM2
pm2 start dist/main.js --name "workflow-backend"

# 3. Build & Start Customer Frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name "workflow-frontend" -- start -- -p 3000

# 4. Build & Start Operator Admin Panel
cd ../admin-panel
npm install
npm run build
pm2 start npm --name "workflow-admin" -- start -- -p 3002
```

---

## 5. Company Onboarding & Multi-Tenant Lifecycle

### Step 1: Company Owner Registration
- A new customer (e.g., Acme Corp) signs up at `https://app.yourcompany.com/register`.
- The system automatically provisions their primary company workspace (`Acme Corp`) and assigns the registrant as **Workspace Owner**.
- Default workspace roles are automatically seeded: `Admin`, `Manager`, `Member`, and `Guest`.

### Step 2: Custom Roles & Permissions Configuration
- The Owner navigates to **Workspace Settings** (`/workspaces/settings`).
- Under **Roles & Permissions**, the Owner can define custom roles (e.g. *Frontend Contractor*, *Product Manager*, *QA Engineer*) selecting exact permissions from the permission matrix:
  - `projects:read_all` vs. `projects:read_assigned`
  - `tasks:read_all` vs. `tasks:read_assigned`
  - `boards:read_all` vs. `boards:create`
  - `sprints:manage`
  - `meetings:manage` vs. `meetings:rsvp`

### Step 3: Inviting Teammates
- Under the **Invitations** tab, the Owner enters teammate emails and selects their role.
- Transactional invitation emails or shareable tokens (`/invite/[token]`) are issued.

### Step 4: Member Acceptance & Strictly Scoped Access
- The invited member accepts the invitation, logs in, and enters the company workspace.
- **Leak-Proof Scoping**:
  - The UI dynamically hides unauthorized navigation items, creation actions, board columns, sprint controls, and scheduling buttons.
  - The backend guarantees zero data leaks: members with restricted access cannot view unassigned projects or unassigned tasks (IDOR attacks return `403 Forbidden`).
