<p align="center">
    <img src="https://github.com/user-attachments/assets/204e2ed8-0880-4b6e-9eac-b4c7b67ce1c8" align="center" width="30%">
</p>
<p align="center"><h1 align="center">FLAGR</h1></p>
<p align="center">
	<em>🚩 Finally understand what you're agreeing to - making legal jargon actually readable</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/sameezy667/Flagr?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/sameezy667/Flagr?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/sameezy667/Flagr?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/sameezy667/Flagr?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center">
	<img src="https://img.shields.io/badge/React-61DAFB.svg?style=default&logo=React&logoColor=black" alt="React">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=default&logo=Vite&logoColor=white" alt="Vite">
</p>
<br>

## 📋 Table of Contents

- [🔍 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Project Structure](#️-project-structure)
  - [📂 Project Index](#-project-index)
- [🚀 Getting Started](#-getting-started)
  - [📋 Prerequisites](#-prerequisites)
  - [⚙️ Installation](#️-installation)
  - [💻 Usage](#-usage)
  - [🧪 Testing](#-testing)
- [🛣️ Project Roadmap](#️-project-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 🔍 Overview

**Flagr** is a modern, intelligent document analysis and chat platform built with React and TypeScript. It combines the power of AI-driven document processing with an intuitive chat interface, enabling users to upload, analyze, and interact with their documents through natural language conversations.

The platform leverages advanced language models to provide comprehensive document insights, making it easier for users to extract meaningful information from complex documents through an interactive chat experience. Whether you're dealing with legal contracts, technical documentation, or research papers, Flagr transforms dense text into understandable, actionable insights.

---

## ✨ Features

### 🔥 Core Capabilities
- **📄 Document Upload & Parsing** - Support for multiple document formats with intelligent content extraction
- **🤖 AI-Powered Analysis** - Advanced document analysis using state-of-the-art language models
- **💬 Interactive Chat Interface** - Natural language conversations about your documents
- **🔐 User Authentication** - Secure login and user profile management
- **💾 Local Storage Integration** - Persistent data storage for chat history and user preferences
- **📊 Analysis Results Visualization** - Comprehensive display of document insights and analysis results

### 🛠️ Technical Features
- **⚡ Modern React Architecture** - Built with React 18+ and TypeScript for type safety
- **🎨 Responsive Design** - Mobile-first approach with adaptive UI components
- **🔧 Modular Component Structure** - Well-organized, reusable components for maintainability
- **🚀 Fast Development** - Powered by Vite for lightning-fast development and builds
- **🔌 API Integration** - Seamless integration with multiple AI service providers

---

## 🏗️ Project Structure

```sh
└── Flagr/
    ├── App.tsx                          # Main application component
    ├── README.md                        # Project documentation
    ├── components/                     
    │   ├── AnalysisLoadingView.tsx     
    │   ├── AnalysisModal.tsx           
    │   ├── AnalysisResultsView.tsx     
    │   ├── ChatInput.tsx               
    │   ├── ChatMessage.tsx            
    │   ├── ChatPanel.tsx               
    │   ├── ChatView.tsx               
    │   ├── InitialView.tsx             
    │   ├── LoginPage.tsx               
    │   ├── Sidebar.tsx                
    │   └── UserProfile.tsx          
    ├── constants.tsx                   
    ├── index.html                     
    ├── index.tsx                      
    ├── metadata.json                   
    ├── package-lock.json              
    ├── package.json                   
    ├── services/                      
    │   ├── documentParser.ts           # Document parsing and content extraction utilities
    │   ├── firebaseService.ts          # Firebase integration for backend services
    │   ├── geminiService.ts.bak        # Gemini AI service (backup)
    │   ├── llama-api.services.ts       # Llama API integration for AI-powered analysis
    │   └── storageService.ts           # Local storage management and data persistence
    ├── tsconfig.json                  
    ├── types.ts                       
    ├── vite-env.d.ts                  
    └── vite.config.ts                  
```

### 📂 Project Index

<details open>
	<summary><b><code>FLAGR/</code></b></summary>
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/types.ts'>types.ts</a></b></td>
				<td>TypeScript type definitions for the entire application</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/constants.tsx'>constants.tsx</a></b></td>
				<td>Application-wide constants and configuration values</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/App.tsx'>App.tsx</a></b></td>
				<td>Main React application component and routing logic</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/package.json'>package.json</a></b></td>
				<td>NPM package configuration and dependencies</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/vite.config.ts'>vite.config.ts</a></b></td>
				<td>Vite build tool configuration</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/index.tsx'>index.tsx</a></b></td>
				<td>React application entry point and root rendering</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details>
		<summary><b>components</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/InitialView.tsx'>InitialView.tsx</a></b></td>
				<td>Landing page and welcome screen component</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/LoginPage.tsx'>LoginPage.tsx</a></b></td>
				<td>User authentication and login interface</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/ChatView.tsx'>ChatView.tsx</a></b></td>
				<td>Main chat conversation display component</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/ChatPanel.tsx'>ChatPanel.tsx</a></b></td>
				<td>Chat interface container and management</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/ChatInput.tsx'>ChatInput.tsx</a></b></td>
				<td>Message input component with file upload</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/ChatMessage.tsx'>ChatMessage.tsx</a></b></td>
				<td>Individual chat message display component</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/AnalysisModal.tsx'>AnalysisModal.tsx</a></b></td>
				<td>Document analysis configuration modal</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/AnalysisLoadingView.tsx'>AnalysisLoadingView.tsx</a></b></td>
				<td>Loading state display during analysis</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/AnalysisResultsView.tsx'>AnalysisResultsView.tsx</a></b></td>
				<td>Analysis results display and visualization</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/Sidebar.tsx'>Sidebar.tsx</a></b></td>
				<td>Navigation sidebar and menu component</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/components/UserProfile.tsx'>UserProfile.tsx</a></b></td>
				<td>User profile management and settings</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details>
		<summary><b>services</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/services/documentParser.ts'>documentParser.ts</a></b></td>
				<td>Document parsing and content extraction utilities</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/services/llama-api.services.ts'>llama-api.services.ts</a></b></td>
				<td>Llama API integration for AI-powered analysis</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/services/storageService.ts'>storageService.ts</a></b></td>
				<td>Local storage management and data persistence</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/sameezy667/Flagr/blob/master/services/firebaseService.ts'>firebaseService.ts</a></b></td>
				<td>Firebase integration for backend services</td>
			</tr>
			</table>
		</blockquote>
	</details>
</details>

---

## 🚀 Getting Started

### 📋 Prerequisites

Before getting started with Flagr, ensure your development environment meets the following requirements:

- **Node.js**: Version 16.0 or higher
- **NPM**: Version 8.0 or higher (or Yarn 1.22+)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Browser**: Modern browser with ES2020 support (Chrome 88+, Firefox 85+, Safari 14+)

### ⚙️ Installation

Install Flagr using the following steps:

1. **Clone the repository:**
```bash
git clone https://github.com/sameezy667/Flagr.git
```

2. **Navigate to the project directory:**
```bash
cd Flagr
```

3. **Install dependencies:**

Using **npm**:
```bash
npm install
```

Using **yarn**:
```bash
yarn install
```

4. **Set up environment variables (if needed):**
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 💻 Usage

Run Flagr in development mode:

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

**Build for production:**
```bash
npm run build
# or
yarn build
```

**Preview production build:**
```bash
npm run preview
# or
yarn preview
```

The application will be available at `http://localhost:5173` (or the port specified in your configuration).



## 🛣️ Project Roadmap

### 🔄 In Progress
- [ ] **Enhanced Document Analysis** - Advanced parsing for multiple file formats (PDF, DOCX, TXT)
- [ ] **Real-time Collaboration** - Multi-user document sharing and collaboration
- [ ] **Advanced Search** - Full-text search across uploaded documents

### 🎯 Upcoming Features
- [ ] **Document Summarization** - AI-powered document summaries and key insights
- [ ] **Export Functionality** - Export chat conversations and analysis results
- [ ] **Mobile App** - React Native mobile application
- [ ] **API Documentation** - Comprehensive API documentation and SDK
- [ ] **Integration Plugins** - Third-party integrations (Google Drive, Dropbox, etc.)
- [ ] **Advanced Analytics** - Usage analytics and performance metrics

### 🔮 Future Enhancements
- [ ] **Voice Input** - Speech-to-text for hands-free interaction
- [ ] **Multi-language Support** - Internationalization and localization
- [ ] **Custom AI Models** - Support for custom-trained language models
- [ ] **Workflow Automation** - Automated document processing workflows

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make Flagr better:

### 🔗 Quick Links
- **💬 [Join Discussions](https://github.com/sameezy667/Flagr/discussions)**: Share ideas, ask questions, and connect with the community
- **🐛 [Report Issues](https://github.com/sameezy667/Flagr/issues)**: Found a bug? Let us know!
- **💡 [Feature Requests](https://github.com/sameezy667/Flagr/issues)**: Suggest new features and improvements
- **📖 [Documentation](https://github.com/sameezy667/Flagr/wiki)**: Help improve our documentation

### 🛠️ Development Workflow

<details>
<summary>Contributing Guidelines</summary>

1. **🍴 Fork the Repository**
   ```bash
   # Fork the project to your GitHub account
   ```

2. **📥 Clone Locally**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Flagr.git
   cd Flagr
   ```

3. **🌿 Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

4. **⚙️ Set Up Development Environment**
   ```bash
   npm install
   npm run dev
   ```

5. **✨ Make Your Changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

6. **🧪 Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

7. **💾 Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
   
   Follow [Conventional Commits](https://conventionalcommits.org/) format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for test additions/modifications

8. **🚀 Push to GitHub**
   ```bash
   git push origin feature/amazing-new-feature
   ```

9. **🔄 Submit a Pull Request**
   - Create a PR with a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

</details>

### 📊 Contributor Recognition

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com/sameezy667/Flagr/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=sameezy667/Flagr">
   </a>
</p>
</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### 🛠️ Technologies & Libraries
- **[React](https://reactjs.org/)** - UI library for building interactive interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server
- **[Firebase](https://firebase.google.com/)** - Backend services and authentication
- **[Llama API](https://llama-api.com/)** - AI language model integration

### 🎨 Design & Assets
- **[Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme)** - Beautiful icons for the project
- **[Shields.io](https://shields.io/)** - Clean and informative badges

### 🌟 Special Thanks
- **IEEE RAS team** for inspiring and motivating us to build this project for the PIXEL PALETTES hackathon
- The open-source community for inspiration and support

### 📚 Resources & Inspiration
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Modern Web Development Best Practices](https://web.dev/)

---

<p align="center">
  <strong>Made with ❤️ by the Flagr Team</strong>
</p>

<p align="center">
  <a href="https://github.com/sameezy667/Flagr">⭐ Star this project</a> |
  <a href="https://github.com/sameezy667/Flagr/issues">🐛 Report Bug</a> |
  <a href="https://github.com/sameezy667/Flagr/discussions">💬 Join Discussion</a>
</p>
