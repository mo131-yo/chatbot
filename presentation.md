---
marp: true
theme: uncover
backgroundColor: #030712
color: #f3f4f6
style: |
  section { 
    text-align: left; 
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: radial-gradient(circle at 20% 30%, #0f172a 0%, #030712 100%);
    padding: 60px;
    line-height: 1.6;
  }
  h1 { 
    font-size: 3.5em;
    font-weight: 900;
    margin-bottom: 0.2em;
    background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  h2 { 
    color: #38bdf8; 
    font-size: 2em; 
    text-transform: uppercase;
    letter-spacing: -1px;
    margin-top: 1em;
  }
  h3 { color: #94a3b8; font-size: 1.2em; margin-bottom: 2em; }
  .glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 25px;
    margin-top: 20px;
  }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th { text-align: left; color: #38bdf8; border-bottom: 2px solid #1e293b; padding: 15px; }
  td { padding: 15px; border-bottom: 1px solid #1e293b; font-size: 0.9em; }
  strong { color: #f472b6; }
  code { color: #fbbf24; background: #1e293b; padding: 2px 6px; border-radius: 4px; }
---

# 🌐 CONVERSATIONAL COMMERCE 2.0
### **The Convergence of Generative AI & Multi-Vendor Ecosystems**
**Presented by:** Munkh-Orgil
**Role:** Full-Stack & AI Infrastructure Engineer

---

## 🎯 THE PARADIGM SHIFT
### From "Search & Click" to "Ask & Receive"

Уламжлалт e-commerce-ийн хүнд суртлыг халж, **Intent-Based** худалдан авалтын шинэ эрин үеийг эхлүүлж байна.

<div class="glass">

- **Eliminating Cognitive Load:** Хэрэглэгч 10 өөр вэбсайтаар хэсэх шаардлагагүй.
- **Unified Intelligence:** Бүх дэлгүүрийн өгөгдөл нэг ухаалаг чат интерфейст төвлөрнө.
- **Merchant Democracy:** Жижиг дэлгүүрүүд AI-аар дамжуулан "Enterprise" түвшний хайлттай болно.

</div>

---

## 🏗️ CORE ARCHITECTURE: RAG PIPELINE
### Technical Integrity & Scalability

Системийн нуруу болох **Retrieval-Augmented Generation (RAG)** ажиллагаа:

1. **User Query Analysis:** Semantic parsing via **GPT-4o**.
2. **Vector Space Mapping:** Products are transformed into high-dimensional vectors.
3. **Similarity Retrieval:** **Pinecone** performs Cosine Similarity search at `<100ms`.
4. **Contextual Synthesis:** Re-ranking & generation of actionable product cards.



---

## ⚡ PERFORMANCE BENCHMARKS
### Why we lead in Speed and Efficiency

<div class="glass">

- **Runtime (Bun):** Node.js-ээс илүү хурдан package resolution болон native SQLite/HTTP дэмжлэг.
- **The Vector Edge (Pinecone):** 1M+ SKU бүхий өгөгдлөөс утгаар нь хайхад саатал гарахгүй.
- **Full-Stack Synergy:** `Next.js 14` + `Server Actions` ашиглан API latency-г 40%-иар бууруулсан.
- **Real-time Sync:** `Socket.io` ашиглан дэлгүүрийн эзэн болон хэрэглэгчийг шууд холбоно.

</div>

---

## 📊 DUAL-PLATFORM ECOSYSTEM
### Value Proposition for Both Ends

| Dimension | Consumer Interface (The Bot) | Merchant Admin (The Panel) |
| :--- | :--- | :--- |
| **Search Logic** | **Semantic Intent** (Contextual) | **Automated Metadata** (AI Tags) |
| **Experience** | Conversational, High-Touch | Minimalist, High-Efficiency |
| **Transaction** | In-Chat Integrated Checkout | Real-time Inventory Tracking |
| **Insights** | Personal Shopper Feedback | Consumer Demand Forecasting |

---

## 🚀 ROADMAP & MONETIZATION
### Scaling Beyond the MVP

- **Q2 Integration:** `Bonum.mn` Payment Gateway & Logistic webhooks.
- **Q3 Intelligence:** AI-powered image analysis for instant product listing.
- **Q4 Expansion:** API-as-a-Service for 3rd party marketplaces.
- **Long-term:** Voice-commerce & Mongolian Language Native LLM fine-tuning.

---

# **THE FUTURE OF RETAIL IS DIALOGUE.**
### Let's build the OS for Modern Commerce.

**Munkh-Orgil** | *Lead AI Engineer*
Email: `contact@munkhorgil.dev` | GitHub: `@munkh-orgil`