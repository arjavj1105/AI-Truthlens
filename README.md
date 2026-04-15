# 🔬 AI Truthlens

AI Truthlens is a modern web application designed to compare and evaluate responses from various Large Language Models (LLMs) in real-time. By leveraging the **Hugging Face Router API**, it providing insights into model reasoning, speed, and accuracy across different providers like Qwen, Llama, and DeepSeek.

## 🚀 Features

- **Real-time Comparison**: Query multiple models simultaneously and compare their outputs side-by-side.
- **Model Ranking System**: Automatically scores and ranks models based on response speed and reasoning heuristics.
- **Persistent History**: Saves your previous comparisons for future reference and analysis.
- **Modern UI**: Built with Next.js 15, providing a sleek, responsive experience with dark mode support.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS / Vanilla CSS
- **API**: Hugging Face Inference API (Router Endpoint)
- **Language**: TypeScript

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm
- A **Hugging Face API Token** (Inference API access)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/arjavj1105/AI-Truthlens.git
cd AI-Truthlens
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (you can copy `.env.example`):
```bash
cp .env.example .env
```
Add your Hugging Face token to `.env`:
```env
HF_TOKEN=your_hf_token_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Repository Structure
- `src/app`: Next.js pages and API routes.
- `src/lib`: Core logic for model aggregation and ranking.
- `src/components`: Reusable UI components.
- `data/`: Local JSON storage for history (development mode).

## 📄 License
This project is licensed under the MIT License.
