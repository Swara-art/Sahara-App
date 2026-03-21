# 🏛️ Sahara — Citizen-Centric E-Governance Platform

> **A structured, transparent, and data-driven platform for local civic issue reporting and tracking.**

[![Made with FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-orange?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Deployment](https://img.shields.io/badge/Deployment-AWS-FF9900?style=flat-square&logo=amazonaws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Motivation](#-motivation)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Roles & Governance Hierarchy](#-roles--governance-hierarchy)
- [Complaint Lifecycle Flow](#-complaint-lifecycle-flow)
- [Analytics Dashboard](#-analytics-dashboard)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Future Scope](#-future-scope)
- [Team](#-team)
- [References](#-references)

---

## 🧭 About the Project

**Sahara** is a web-based citizen-centric e-governance platform built to bridge the communication gap between urban/semi-urban citizens and municipal authorities. It enables structured reporting, hierarchical issue routing, and transparent real-time status tracking of civic complaints such as:

- 🛣️ Road damage
- 🚰 Water supply disruptions
- 🗑️ Sanitation problems
- 💡 Streetlight failures

Traditional complaint mechanisms are opaque, unstructured, and unresponsive. Sahara replaces them with a transparent, accountable, and data-driven governance workflow.

> **Developed as part of the Community Engagement Project (CEP) — Batch F1**
> Pune Institute of Computer Technology, Pune — 16/02/2026

---

## 💡 Motivation

| Problem | Sahara's Solution |
|---|---|
| Citizens receive no real-time updates | Live complaint status tracking per citizen |
| Authorities face unstructured complaints | Role-based hierarchical routing with categorization |
| No prioritization mechanism | Community upvoting + mediator-assigned priority levels |
| No transparency or accountability | End-to-end audit trail and resolution proof uploads |
| No data-driven governance | Ward-based analytics dashboard with performance metrics |

With growing smart city initiatives and digital governance reforms, Sahara aligns with the need for scalable, accessible, and transparent civic platforms.

---

## ✨ Key Features

- **Structured Complaint Submission** — Citizens submit complaints with image, description, and GPS location.
- **Community Validation** — Other citizens can upvote complaints, influencing priority scoring.
- **Four-Layer Governance Workflow** — Citizen → Admin → Mediator → Authority.
- **Real-Time Status Tracking** — Complaints move through statuses: *Submitted → Verified → In Progress → Resolved*.
- **Ward-Based Interactive Map** — Visual city-level heatmap of complaints per municipal ward.
- **Analytics Dashboard** — Charts for complaint volume, category distribution, resolution rates, and ward performance.
- **Role-Based Access Control (RBAC)** — Each role (Citizen, Admin, Mediator, Authority) sees only its relevant interface.
- **Resolution Proof Upload** — Authorities can attach proof of resolution (images/remarks).
- **Spam Prevention** — Admin-level verification filters invalid or duplicate complaints before routing.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   Citizen Web App | Admin Dashboard | Authority Web App     │
│                  Mediator Panel                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  Citizen UI  │  Admin UI  │  Mediator UI  │  Authority UI  │
│              │            │               │                 │
│  - Complaint │  - User     │  - Categorize │  - View Cases  │
│    Form      │    Verify   │  - Set Priority│  - Update     │
│  - Upvote    │  - Approve/ │  - Route to   │    Status      │
│  - Tracking  │    Reject   │    Authority  │  - Upload Proof│
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                          │
│                                                             │
│  ┌───────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  AUTH SERVICE │  │COMPLAINT SERVICE│  │ANALYTICS SVC │  │
│  │  JWT Handler  │  │ CRUD Operations │  │Ward Metrics  │  │
│  │  RBAC         │  │ Status History  │  │Perf Scoring  │  │
│  └───────────────┘  └─────────────────┘  └──────────────┘  │
│                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │  VERIFICATION SERVICE │  │     ROUTING SERVICE        │  │
│  │  Identity Check       │  │  Category → Authority Map  │  │
│  │  Spam Filter          │  │  Notification Dispatch     │  │
│  └───────────────────────┘  └────────────────────────────┘  │
│                                                             │
│                    API GATEWAY                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│                                                             │
│   MongoDB Collections:                                      │
│   ├── users          (accounts, roles, identity)            │
│   ├── complaints     (reports, metadata, status)            │
│   ├── status_logs    (audit trail of state transitions)     │
│   └── wards          (geographic + analytics data)          │
│                                                             │
│   Image Storage:                                            │
│   ├── Local Storage  (prototype)                            │
│   └── AWS S3         (production)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Roles & Governance Hierarchy

Sahara implements a **four-layer governance structure** ensuring structured and abuse-resistant complaint processing:

### 1. 🧑‍💼 Citizen (User)
- Registers/logs in with verified identity.
- Submits complaints with image, description, and location.
- Upvotes existing complaints (community validation).
- Tracks complaint status in real time.

### 2. 🛡️ Admin
- Verifies submitted user identity and complaint authenticity.
- Filters spam, duplicate, or invalid complaints.
- Approves valid complaints, forwarding them to the Mediator.
- Rejects complaints with a notification to the citizen.

### 3. 🔀 Mediator
- Receives admin-approved complaints.
- Categorizes them (e.g., Roads, Water, Sanitation, Electricity).
- Assigns a priority level (influenced by community upvotes).
- Routes complaints to the appropriate municipal authority.

### 4. 🏢 Authority (Municipal Officer)
- Receives categorized and prioritized complaints.
- Updates complaint status: `Received → In Progress → Resolved`.
- Uploads resolution proof (photo/remarks).

---

## 🔄 Complaint Lifecycle Flow

```
[Citizen Registers / Logs In]
         │
         ▼
[Submits Complaint]
 ├─ Image Upload
 ├─ Description
 └─ GPS Location
         │
         ▼
[System Stores Complaint]
         │
         ▼
[Community Validation]        ← Other citizens upvote (influences priority)
         │
         ▼
[Admin Review]
 ├─ Valid?  ──YES──►  [Mediator Actions]
 │                     ├─ Categorize Complaint
 │                     ├─ Assign Priority Level
 │                     └─ Route to Authority
 └─ No  ──────────►  [Reject + Notify Citizen]
                              │
                              ▼
                    [Authority Receives Complaint]
                              │
                              ▼
                    [Authority Updates Status]
                     ├─ Received
                     ├─ In Progress
                     └─ Resolved
                              │
                              ▼
                    [Upload Resolution Proof]
                              │
                              ▼
               [Citizen Notified of Resolution]
                              │
                              ▼
                  [Analytics Dashboard Updated]
```

---

## 📊 Analytics Dashboard

The admin/authority analytics panel provides governance insights across all wards:

| Metric | Description |
|---|---|
| Total Complaints | Count of all submitted reports |
| Ward-wise Distribution | Complaint density per municipal ward |
| Category-wise Breakdown | Roads, water, sanitation, etc. |
| Pending vs Resolved Ratio | Backlog monitoring |
| Average Resolution Time | Efficiency metric per ward/category |
| Civic Performance Score | Composite ward performance index |

### 🗺️ Interactive Ward Map
The dashboard features a clickable city map divided by municipal wards. Selecting a ward reveals:
- Number of complaints
- Active issue categories
- Resolution rate
- High-priority pending cases

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | FastAPI (Python) |
| **Database** | MongoDB / Firebase |
| **Data Visualization** | Chart.js |
| **Authentication** | JWT + RBAC |
| **Image Storage** | Local (prototype) / AWS S3 (production) |
| **Deployment** | AWS (prototype) |
| **Version Control** | GitHub |

---

## 📁 Project Structure

```
sahara/
├── frontend/
│   ├── citizen/           # Citizen UI — complaint form, tracking, upvote
│   ├── admin/             # Admin UI — user verification, complaint approval
│   ├── mediator/          # Mediator UI — categorization, priority, routing
│   ├── authority/         # Authority UI — status update, proof upload
│   └── analytics/         # Analytics UI — ward map, charts dashboard
│
├── backend/
│   ├── auth/              # JWT handler, RBAC middleware
│   ├── complaints/        # CRUD operations, status history
│   ├── routing/           # Category-to-authority routing logic
│   ├── verification/      # Spam filter, identity check
│   ├── analytics/         # Ward metrics, performance scoring
│   └── notifications/     # Status update notification service
│
├── database/
│   ├── models/            # MongoDB schema definitions
│   └── seeds/             # Sample data for development
│
├── storage/               # Image upload handling (local / S3)
│
├── docs/
│   ├── synopsis.pdf
│   ├── flowchart.png
│   ├── system_architecture.png
│   └── use_case.png
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js (for any frontend tooling)
- MongoDB instance (local or Atlas)
- AWS account (optional, for S3 and deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/swara.art/sahara.git
cd sahara
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, AWS credentials, etc.
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Backend Server

```bash
uvicorn app.main:app --reload
```

### 5. Open the Frontend

Open the relevant HTML file in your browser, or serve with a simple HTTP server:

```bash
cd frontend
python -m http.server 8080
```

Navigate to `http://localhost:8080` and log in with a role-appropriate test account.

---

## 🔮 Future Scope

| Feature | Description |
|---|---|
| 🤖 ML Spam Detection | Automatically filter invalid complaints at submission |
| 🗂️ NLP Categorization | Auto-classify complaints by text analysis |
| 🖼️ Image Recognition | Detect issue type from photos (e.g., pothole detection) |
| ⚡ Auto Priority Assignment | AI-driven priority scoring without mediator input |
| 📈 AI Ward Performance Scoring | Machine learning models for municipal analytics |
| 🌐 Smart City API Integration | Connect with government smart city data platforms |
| 🔧 Database Sharding | Scale database for high-volume wards |
| 🗄️ Complaint Archiving | Auto-archive resolved complaints to reduce query load |

> In the future, AI systems can partially replace manual administrative verification, significantly improving efficiency and scalability.

---

## 👨‍💻 Team

| Name | Roll No. |
|---|---|
| Swara Deshpande | 21123 |
| Mrudul Ganvir | 21130 |
| Apoorv Karhade | 21142 |

**Institution:** Pune Institute of Computer Technology (PICT), Pune — 411043
**Department:** Computer Engineering
**Project:** Community Engagement Project (CEP), Batch F1
**Date:** 16/02/2026

---

## 📚 References

1. R. Aijaz and S. Kaushik — *"E-Governance and Citizen Engagement: Pathways to Resilient and Equitable Cities"* — ORF Online. Highlights the role of ICT for real-time citizen feedback in urban governance.

2. *Citizen Driven Civic Issue Platform* — IEEE Conference (Scribd). A crowd-enabled digital system where citizens report and track civic issues with community voting and status tracking.

3. C. Vrabie — *"Improving Municipal Responsiveness through AI-Powered Image Analysis in E-Government"* — arXiv. Discusses modern adoption of advanced AI features for automating interpretation of citizen data in governance.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for smarter, more responsive cities.
</p>
