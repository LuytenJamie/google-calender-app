# Project Setup Guide

This guide will walk you through the steps to set up and run the project locally.

## Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [OpenSSL](https://www.openssl.org/) (for generating a session secret)
- A Google account (for OAuth and API key)
- A GitHub account (for Personal Access Token)

---

## Steps to Set Up

### 1. Install Dependencies

First, you need to install all required dependencies:

```bash
npm install
```

---

### 2. Copy `.env.example` and Rename to `.env`

Next, make a copy of the `.env.example` file and rename it to `.env`. This file will hold your environment variables.

```
cp .env.example .env
```

---

### 3. Fill in the `.env` File

Open the `.env` file and provide the following details:

#### 3.1 Google Client ID and Secret

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Create a **new project** or use an existing one.
- Navigate to **APIs & Services > Credentials**.
- Click **Create Credentials** and select **OAuth 2.0 Client IDs**.
- Set the **Authorized redirect URI** to:  
  `http://localhost:3000/auth/google/callback`
- Take the **Client ID** and **Client Secret**, and paste them into the `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### 3.2 Google API Key

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Navigate to **APIs & Services > Credentials**.
- Click **Create Credentials** and choose **API Key**.
- Copy the generated **API Key** and paste it into the `.env` file:

```env
GOOGLE_API_KEY=your-google-api-key-here
```

#### 3.3 Github repo & Personal Access Token

- Go to your repository with milestones, and copy the github repo name from the URL. For example: https://github.com/LuytenJamie/google-calender-app
- We are only intrested in the following part: **LuytenJamie/google-calender-app**
- Copy this part and paste it into the `.env` file:

```env
GITHUB_REPO=your-github-repo-name-here
```

- Go to [GitHub Token Settings](https://github.com/settings/tokens).
- Click **Generate new token**.
- Choose the required scopes for your project (for example, `repo` for repository access).
- Copy the generated token and paste it into the `.env` file:

```env
GITHUB_TOKEN=your-github-token-here
```

#### 3.4 Session Secret

Generate a secure session secret using OpenSSL. Run the following command in your terminal:

```bash
openssl rand -base64 64
```

Copy the generated token and paste it into the `.env` file:

```env
SESSION_SECRET=your-session-secret-here
```

---

### 4. Update `rbac/rbac_policy.csv`

In the `rbac/rbac_policy.csv` file, update the role-based access control policy with your Google email and the role you want to test with. (add a new row)

Example entry:

```csv
g, free_user@gmail.com, free
```

---

### 5. Start the Project

Finally, start the project by running:

```bash
npm start
```

Your app should now be running locally at `http://localhost:3000`.

---

## Troubleshooting

If you run into any issues, check the following:

- Ensure that all environment variables are correctly set in the `.env` file.
- Make sure you've installed all dependencies with `npm install`.
- Check the terminal for any error messages and ensure the necessary services (Google, GitHub, etc.) are properly configured.

---

## Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [OpenSSL Command Line Tool](https://www.openssl.org/)
