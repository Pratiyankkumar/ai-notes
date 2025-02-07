# Setting up axiosInstance.ts for CodeSandbox Backend

This guide explains how to configure your frontend to communicate with a backend running on CodeSandbox (port 3000).
Repo link : https://github.com/Pratiyankkumar/ai-notes

## Overview

When importing a TurboRepo project into CodeSandbox, you'll need to update the backend URL configuration to ensure proper communication between frontend and backend services.

## 1. Locate Configuration File

Navigate to the following file in your project structure:
```
apps/web/api/axiosInstance.ts
```

## 2. Current Configuration

Your existing configuration might look like this:

```typescript
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000", // Old backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
```

## 3. Update Backend URL

Replace the configuration with the CodeSandbox backend URL:

```typescript
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://your-sandbox-id-3000.app.codesandbox.io", // Replace with actual CodeSandbox URL
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
```

## 4. Environment Variables (Optional)

For better configuration management, you can use environment variables:

1. Create or edit `.env` file in your frontend directory:
```ini
REACT_APP_API_URL=https://your-sandbox-id-3000.app.codesandbox.io
```

2. Update `axiosInstance.ts` to use the environment variable:
```typescript
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
```

## 5. Implementation Steps

1. Update the configuration file with the new backend URL
2. Restart your frontend application
3. Verify API requests are properly routed

## 6. Verifying the Setup

To confirm your backend is running correctly:
1. Check the hosted URL in CodeSandbox's Server Console
2. Test an API endpoint: `https://your-sandbox-id-3000.app.codesandbox.io/api/your-endpoint`

## Troubleshooting

### CORS Issues

If you encounter CORS errors, update your backend CORS policy:

```typescript
import cors from "cors";

app.use(cors({ 
    origin: "*" // Adjust based on your security requirements
}));
```

### Common Issues

1. **Changes not reflected:**
   - Ensure frontend has been restarted
   - Verify the exact backend URL from CodeSandbox
   - Check browser console (F12 → Console) for API request errors

2. **Connection failures:**
   - Confirm backend is running
   - Verify URL format matches CodeSandbox's format
   - Check for any network restrictions

## Additional Notes

- Always replace `your-sandbox-id` with your actual CodeSandbox project identifier
- Consider security implications when setting CORS policies
- Keep environment variables secure and never commit them to version control
