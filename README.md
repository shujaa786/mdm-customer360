# MDM Customer360 – Reltio-Inspired Master Data Management Platform

A full-stack **Master Data Management (MDM)** platform inspired by enterprise-grade systems like **Reltio**, designed to ingest, unify, deduplicate, govern, and visualize customer data across multiple source systems.

The project demonstrates modern MDM concepts including:

- Entity Resolution
- Golden Record Creation
- Survivorship Rules
- Customer 360 Views
- Stewardship Workflows
- Relationship Graphs
- Real-time Processing
- Event-driven Architecture

This platform simulates how enterprises maintain a **single source of truth** for customer data originating from CRM, ERP, marketing, and external systems.

---

# 🚀 Features

## ✅ Data Ingestion Pipeline

- CSV-based ingestion system
- Simulates ingestion from:
  - CRM systems
  - ERP systems
  - Marketing platforms
- Real-time ingestion notifications using Socket.io
- Incremental ingestion workflow support

---

## ✅ Entity Resolution Engine

Custom duplicate detection engine using:

- Levenshtein Distance Algorithm
- Weighted Scoring
- Exact email/phone matching
- Fuzzy name matching
- Confidence-based duplicate detection

The matching engine identifies potential duplicate entities across multiple systems.

---

## ✅ Golden Record Creation

Automatically creates **Golden Records** using advanced survivorship rules:

- Prefer most complete values
- Prioritize trusted source systems
- Preserve lineage to source entities
- Link duplicate records to master profile

Golden records serve as the trusted unified customer profile.

---

## ✅ Advanced Survivorship Rules

Implemented survivorship logic including:

- Non-null value prioritization
- Source priority ranking
- Longest/most complete attribute selection
- Record lineage tracking
- Merge conflict handling

---

## ✅ Stewardship Workflows

Built enterprise-style stewardship workflows for manual governance.

### Supported Actions
- Merge duplicate entities
- Reject false matches
- Review confidence scores
- Manual override of automated matching

This simulates real-world MDM governance processes.

---

## ✅ Customer 360 View

Implemented a dedicated Customer 360 page providing:

- Unified customer profile
- Linked source records
- Relationship insights
- Golden record visibility
- Source lineage tracking
- Complete entity overview

---

## ✅ Dynamic Relationship Graph

Interactive graph visualization using React Flow.

### Features
- Database-driven graph generation
- Dynamic nodes & edges
- Household relationships
- Organizational relationships
- Linked entity visualization

---

## ✅ Real-Time Architecture

Socket.io integration enables:

- Real-time ingestion events
- Live dashboard refresh
- Instant UI synchronization
- Event-driven notifications

---

# 🏗️ System Architecture

## High-Level Architecture

```text
┌─────────────────────────────────────┐
│              Frontend               │
│         Next.js + Tailwind          │
│                                     │
│  Dashboard                          │
│  Customer 360                       │
│  Matches & Stewardship              │
│  Ingestion                          │
│  Relationship Graph                 │
└────────────────┬────────────────────┘
                 │ REST APIs + WebSockets
                 ▼
┌─────────────────────────────────────┐
│              Backend                │
│         Node.js + Express           │
│                                     │
│  Ingestion Service                  │
│  Matching Service                   │
│  Golden Record Service              │
│  Stewardship Service                │
│  Relationship Service               │
│  Socket.io Events                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│           MongoDB Atlas             │
│                                     │
│  entities                           │
│  relationships                      │
│  stewardship_logs                   │
└─────────────────────────────────────┘
```

---

# 🔄 Data Flow

```text
CSV Upload
    ↓
Ingestion Service
    ↓
Store Raw Source Entities
    ↓
Matching Engine
    ↓
Duplicate Detection
    ↓
Advanced Survivorship Rules
    ↓
Golden Record Creation
    ↓
Relationship Mapping
    ↓
Socket.io Event Emitted
    ↓
Frontend Updates in Real-Time
```

---

# 🧠 Core MDM Concepts Implemented

| Concept | Description |
|---|---|
| Entity Resolution | Detecting duplicate entities across systems |
| Golden Record | Unified trusted customer profile |
| Survivorship Rules | Selecting best values across duplicate records |
| Customer 360 | Complete customer visibility |
| Stewardship | Manual governance workflows |
| Relationship Graph | Connected entity visualization |
| Data Governance | Merge/reject review workflows |
| Real-time Processing | Event-driven updates using WebSockets |

---

# 🗄️ Database Schema

## Entity Schema

```js
{
  _id: ObjectId,
  goldenId: ObjectId | null,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  sourceSystem: String,
  rawData: Object,
  isGolden: Boolean,
  mergeStatus: String,
  rejectedMatches: [ObjectId]
}
```

---

## Relationship Schema

```js
{
  _id: ObjectId,
  fromId: ObjectId,
  toId: ObjectId,
  type: "HOUSEHOLD" | "EMPLOYER" | "INTERACTION"
}
```

---

# ⚙️ Tech Stack

## Frontend
- Next.js (JavaScript)
- Tailwind CSS
- Axios
- React Flow
- Socket.io Client

---

## Backend
- Node.js
- Express.js
- Socket.io
- Mongoose

---

## Database
- MongoDB Atlas

---

## DevOps & Deployment
- GitHub Actions (Backend CI/CD)
- AWS Amplify (Frontend Deployment)
- MongoDB Atlas Cloud Database

---

# 📁 Project Structure

```text
mdm-customer360/
│
├── backend/
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── data/
│   └── sample-customers.csv
│
├── .github/
│   └── workflows/
│
└── README.md
```

---

# 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ingest` | POST | Ingest customer CSV data |
| `/api/match` | POST | Run entity matching |
| `/api/entities` | GET | Fetch all entities |
| `/api/entities/:id` | GET | Fetch Customer 360 view |
| `/api/entities/create-golden` | POST | Generate golden records |
| `/api/merge` | POST | Merge duplicate entities |
| `/api/reject-match` | POST | Reject duplicate match |
| `/api/relationships` | GET | Fetch relationships |

---

# 🌐 Frontend Features

## Dashboard
Displays:
- Total entities
- Golden records
- Duplicate matches
- Source systems

---

## Matches & Stewardship
Supports:
- Match review
- Merge actions
- Reject actions
- Match confidence visibility

---

## Customer 360 Page
Displays:
- Unified profile
- Linked source entities
- Golden record
- Relationship graph
- Source lineage

---

## Dynamic Graph
Visualizes:
- Entity relationships
- Household structures
- Organizational connections

---

# 🔄 Real-Time Architecture

Socket.io is used for:
- Ingestion completion events
- Dashboard auto-refresh
- Match notifications
- Live entity synchronization

---

## Example Flow

```text
User clicks Ingest
    ↓
Backend ingests CSV
    ↓
Matching engine runs
    ↓
Golden records generated
    ↓
Socket event emitted
    ↓
Frontend auto-refreshes
```

---

# ⚙️ Environment Variables

## Backend (`backend/.env`)

```env
MONGO_URI=your_mongodb_connection
PORT=5000
frontendOrigin=http://localhost:3000
```

---

## Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL_STAGING=http://localhost:5000
```

---

# ▶️ Running Locally

## Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 🚀 Deployment

## Frontend Deployment
- Hosted on AWS Amplify
- Automatic deployments connected to GitHub

---

## Backend Deployment
- CI/CD pipeline using GitHub Actions
- Automated backend deployment workflow

---

# 📈 Current Status

## ✅ Completed
- CSV ingestion pipeline
- Entity resolution engine
- Golden record creation
- Advanced survivorship rules
- Stewardship workflows
- Customer 360 page
- Dynamic relationship graph
- Real-time updates
- GitHub Actions deployment pipeline
- AWS Amplify frontend deployment

---

# 🎯 Future Enhancements

- AI-powered entity matching
- Role-based access control
- Audit logs
- Multi-domain MDM
- Event streaming (Kafka)
- Graph database integration
- ML-based confidence scoring

---

# 📚 Key Learnings

This project demonstrates:
- Real-world MDM implementation
- Enterprise data governance concepts
- Event-driven architecture
- Real-time systems
- Scalable backend architecture
- Customer 360 design principles
- Production deployment workflows

---

# 📌 Summary

MDM Customer360 is a practical implementation of a modern enterprise-style Master Data Management platform inspired by systems like Reltio.

The platform provides:
- Trusted customer profiles
- Duplicate resolution
- Data governance workflows
- Real-time synchronization
- Relationship intelligence
- Unified customer visibility

It showcases how organizations can build scalable systems to maintain a single source of truth for critical customer data across distributed enterprise systems.

