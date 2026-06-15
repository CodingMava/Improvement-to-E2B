#  Sandbox Uptime Monitor

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

> An enterprise-grade telemetry dashboard for monitoring, managing, and analyzing ephemeral cloud environments (E2B microVMs) in real-time.

## Overview

As AI agents and cloud functions scale, tracking the health of isolated execution environments becomes critical. The **Sandbox Uptime Monitor** provides a centralized, real-time control plane to spawn cloud sandboxes, track hardware metrics at the millisecond level, and automatically detect anomalous behavior before it causes system failures.

## Core Features

* **Real-Time Telemetry:** Live streaming of CPU, Memory, and Disk usage with zero-refresh charting via WebSockets.
* **One-Click Cloud Provisioning:** Spawn and destroy E2B cloud execution environments directly from the dashboard.
* **Intelligent Anomaly Detection:** Automated background workers analyze telemetry to detect infinite loops, resource spikes, and idle agents.
* **Live File Forensics:** Stream real-time filesystem events (creations, modifications, deletions) occurring inside the microVMs.
* **Containerized Architecture:** Fully Dockerized backend, frontend, and database for instant, environment-agnostic deployment.

## Tech Stack

* **Frontend:** Next.js 15, React, TailwindCSS, Recharts (Data Visualization)
* **Backend:** Express.js, Node.js, WebSockets (Socket.io)
* **Database:** Prisma ORM, SQLite
* **Cloud Infrastructure:** E2B SDK
* **DevOps:** Docker, Docker Compose

## Quick Start (Docker)

The fastest way to run the application is via Docker Compose.

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/sandbox-uptime-monitor.git](https://github.com/yourusername/sandbox-uptime-monitor.git)
cd sandbox-uptime-monitor
2. Configure your environment
Create a .env file in the root directory and add your E2B API Key:

Code snippet
E2B_API_KEY="e2b_your_api_key_here"

3. Build and launch the containers

Bash
docker-compose up --build -d

4. Access the Dashboard
Open your browser and navigate to http://localhost:3000.

Built with modern architecture for scale, speed, and reliability.
