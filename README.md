# Case Study: Business Contact Form Micro App  
**Built using AWS KIRO GenAI IDE with Spec-Driven Development & Prompt Engineering**  
**Domain**: [`thunk-it.com`](https://thunk-it.com)  
**Hosting**: AWS (cost-optimized, serverless)

---

## 🔧 Overview

This case study documents the successful implementation of a **React + Node.js micro app** using a **spec-driven development methodology** powered by **KIRO’s genAI IDE** and **prompt engineering best practices**. The goal was to develop a **business contact form** hosted as inexpensively as possible on AWS.

---

## ⚙️ Technologies Used

- **Frontend**: React
- **Backend**: AWS Lambda (Node.js)
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Domain Management**: Route53
- **Development IDE**: AWS KIRO genAI IDE
- **IaC Considerations**: AWS SAM (with later exploration of Terraform)
- **Hosting Region**: AWS default regions optimized for cost

---

## 📌 Initial Prompt

The project was initiated with a focused and effective starting prompt:

```
create spec-driven development nodejs react micro app for business contact web form hosted on AWS as inexpensive as possible the domain name is "thunk-it.com" registered with AWS route53
```

This enabled KIRO to generate the foundation for requirements, design, and infrastructure tailored for AWS.

---

## 🧭 Spec-Driven Development Process

### 1. Requirements Gathering
- Used **user stories** and **EARS syntax** to translate goals into actionable requirements.
- Categories:
  - Contact form UI
  - Backend form processing
  - Admin view
  - Infrastructure provisioning
  - Security and performance

### 2. Design Phase
- Selected **AWS SAM** for cost-effective, serverless infrastructure.
- Architectural decisions based on:
  - Scalability and cost
  - Local development compatibility (MacOS 15.5)
  - Simplicity and future extensibility
- Components:
  - React-based frontend form
  - AWS Lambda + API Gateway backend
  - Route53 integration
  - S3 static hosting

### 3. Task Breakdown
Each requirement was translated into discrete, traceable tasks:
- Infrastructure templates
- React component structure
- Lambda handlers for POST/GET
- Basic admin log view
- Deployment scripts and documentation

### 4. Implementation
- Iterated using KIRO’s IDE with incremental prompt refinements.
- Developed locally with full Mac compatibility.
- Final deployment through AWS CLI and SAM.

---

## 🧠 Prompt Engineering Best Practices

### Key Prompting Techniques:
| Technique | Example |
|----------|---------|
| **Concise goal-setting** | “Create spec-driven development nodejs react micro app…” |
| **Tech stack clarification** | “Can I use Terraform instead of CDK?” |
| **Cost emphasis** | “Please choose the most cost-effective solution…” |
| **Local dev context** | “Can I test this locally on Mac OSX 15.5?” |
| **Deployment clarity** | “Deploy to my AWS environment” |
| **Documentation requests** | “Can you include a complete README?” |

### Sample Prompt Templates:

- **Init**:  
  ```
  create spec-driven development [stack] app for [goal] on [platform] with [constraints]
  ```

- **Tech Alternatives**:  
  ```
  is it possible to use [tech1] instead of [tech2]
  ```

- **Deploy/Testing**:  
  ```
  can I test and review this locally on [OS version] before deploying
  ```

---

## 📘 Lessons Learned

1. **Begin with a crisp objective** — clarity drives better AI results.
2. **Break large requests into small, directed prompts**.
3. **Include system and infrastructure details early**.
4. **Prompt for documentation, testing, and deployment artifacts**.
5. **Use traceable tasks** tied to specs for agile and transparent sprints.

---

## 📈 Agile Sprint Benefits

- **Accelerated Development**: Using KIRO’s prompt-response loop, the team moved from concept to working prototype in under a week.
- **Traceable Requirements**: All tasks directly tied to EARS-based user stories.
- **Business Alignment**: Sprints tracked against business outcomes (cost savings, scalability, user feedback).
- **Reusable Prompt Patterns**: Prompt templates and design flows reused across future micro apps.

---

## 📄 Conclusion

This project validates the **power of combining GenAI + prompt engineering + spec-driven development**. By starting with clear prompts and incrementally refining through iteration, we delivered:

- A working micro app hosted on AWS
- Serverless, low-cost infrastructure
- Local dev and test capability
- End-to-end documentation and traceability

The **Kiro GenAI IDE** proved highly effective in guiding both the engineering workflow and ensuring alignment with agile business outcomes.

---
## 🙌 Credits
Created and shared in the **public domain** by **Brian Uckert** at [Be-Digital.Biz](https://be-digital.biz)
