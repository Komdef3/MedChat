# MedChat
An AI-Powered Medical Research Assistant

Overview:
MedChat is a full-stack, AI-powered web application designed to serve as an intelligent research assistant for the biomedical domain. The platform provides a conversational interface through which users can query a large language model (LLM) on topics encompassing clinical concepts, drug mechanisms, biomedical research, and medical literature. The system is built on a modern, production-grade technology stack, combining a Next.js frontend with a NestJS backend, PostgreSQL database, and the Groq inference API.

MedChat is designed for three primary user groups:
• Medical students seeking to supplement their coursework with interactive,
context-aware explanations of clinical and pharmacological topics.
• Researchers and academics requiring a fast, conversational interface for literature
synthesis, hypothesis generation, and background research.
• Healthcare professionals who need rapid access to drug mechanisms, dosage guidelines,
or clinical decision support information.

Tools and Technology Stack:
The frontend is built with Next.js 16 using the App Router paradigm, React 19, and TypeScript 6. Tailwind CSS 4 provides utility-first styling, while next-themes enables persistent dark/lightmode toggling. Icons are rendered via the Lucide React library, and observability is instrumented through Datadog Browser Real User Monitoring (RUM).
The backend is implemented with NestJS 11 and TypeScript 6, following NestJS’s opinionated modular architecture. Each functional domain is encapsulated in a dedicated module: auth, chat, session, message, user, database, and health. This separation of concerns facilitates independent testing, clear dependency injection boundaries, and maintainable scalability.
Code Quality Enforcement: Code Quality Enforcement
Containerisation: Docker
CI/CD: Jenkins
