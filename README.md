<!-- LOGO & TITLE -->
<p align="center">
  <img src="client/public/logo.svg" alt="StackIt Logo" width="120" />
</p>

<h1 align="center">StackIt — Singularity 🚀🤖</h1>
<p align="center">
  <b>The next-gen Q&A platform for communities, powered by humans & AI.</b>
</p>

<p align="center">
  <img src="client/public/loop-animation.webm" alt="StackIt Animation" width="600"/>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React-18-blue?logo=react" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-DB-blue?logo=postgresql" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Socket.io-Chat-black?logo=socket.io" /></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-yellow" /></a>
</p>

---

## ✨ Overview

StackIt is a **full-stack, community-driven Q&A platform** inspired by Stack Overflow and Reddit, but with a modern twist:
- **Communities** (subreddits) with join/leave, banners, and trending tags
- **Rich Questions & Answers** with images 🖼️, emojis 😎, and code blocks
- **Voting, Reputation, Leaderboards** — reward the best contributors!
- **Real-time Chat & Notifications** 🔔
- **Admin Dashboard** for moderation
- **Beautiful, responsive UI** with effects, animations, and dark mode

---

## 📚 Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🚀 Features

- 🏠 **Home Feed:** See trending questions, upvote/downvote, filter by tags
- 🏘️ **Communities:** Join, leave, create, and explore subreddits with custom banners
- 📝 **Ask & Answer:** Rich text editor with image upload, emoji picker, code formatting, and more!
- 🏷️ **Tags:** Dynamic, trending, and filterable
- 💬 **Real-time Chat:** Connect with experts and peers instantly
- 🔔 **Notifications:** Stay updated on answers, mentions, and more
- 🏆 **Leaderboard:** See top contributors and your own stats
- 👤 **User Profiles:** Avatars, bios, activity, and messaging preferences
- 🛡️ **Admin Tools:** Moderate posts, users, and communities
- 🌈 **Modern UI:** Responsive, animated, and beautiful (with custom backgrounds and effects)
- 🔒 **Secure:** JWT auth, input sanitization, and more

---

## 🖼️ Screenshots

<p align="center">
  <img src="client/public/hero-image.jpg" alt="Hero" width="400"/>
  <img src="client/public/combg.jpg" alt="Community Banner" width="400"/>
  <img src="client/public/new-og-image.png" alt="OG Image" width="400"/>
</p>

> _“Ask anything. Help anyone. Build the singularity.”_

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Realtime | Auth | Storage |
|----------|---------|----------|----------|------|---------|
| <img src="https://img.shields.io/badge/React-18-blue?logo=react" /> <br> TypeScript <br> TailwindCSS <br> Vite | <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" /> | <img src="https://img.shields.io/badge/PostgreSQL-DB-blue?logo=postgresql" /> | <img src="https://img.shields.io/badge/Socket.io-Chat-black?logo=socket.io" /> | JWT | Cloudinary |

---

## ⚡ Getting Started

### 1. Clone the repo

```sh
git clone https://github.com/yourusername/StackIt---Singularity.git
cd StackIt---Singularity
```

### 2. Install dependencies

```sh
cd client
npm install
cd ../server
npm install
```

### 3. Set up environment variables

- Copy `.env.example` to `.env` in both `client/` and `server/` and fill in your secrets (DB, JWT, Cloudinary, etc).

### 4. Run the app

**Backend:**
```sh
cd server
npm run dev
```

**Frontend:**
```sh
cd client
npm run dev
```

- Visit [http://localhost:8081](http://localhost:8081) (or your configured port)

---

## 🔌 API Overview

- **Auth:** `POST /users/login`, `POST /users/register`
- **Questions:** `GET /posts`, `POST /posts/create`, `POST /posts/:id/upvote`, `POST /posts/:id/downvote`
- **Answers:** `POST /posts/:id/comment`, `POST /posts/:postId/accept-answer/:commentId`
- **Communities:** `GET /api/communities`, `POST /api/communities/create`, `POST /api/communities/:slug/join`
- **Tags:** `GET /tags`
- **Uploads:** `POST /api/uploads/post-image`, `POST /api/uploads/avatar`
- **Notifications:** `GET /api/notifications`
- **Admin:** `GET /api/admin/users`, `GET /api/admin/posts`

> See [server/routes/](server/routes/) for all endpoints.

---

## 🎉 Effects & UI Magic

- ✨ **Animated backgrounds** and banners
- 🖼️ **Image upload** in posts and answers
- 😍 **Emoji picker** in the editor
- 🪄 **Smooth transitions** and hover effects
- 🌙 **Dark mode** (coming soon!)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Please open an issue or PR, or just drop by and say hi!  
**Let’s build the future of Q&A together.**

---

## 📄 License

MIT © [Your Name]

---

## 📬 Contact

- **Project Lead:** [yourname@domain.com](mailto:yourname@domain.com)
- **GitHub:** [github.com/yourusername/StackIt---Singularity](https://github.com/yourusername/StackIt---Singularity)

---

<p align="center">
  <b>Made with ❤️, ☕, and way too many emojis.</b>
</p>
