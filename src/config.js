// ---------------------------------------------------------------
// Fill these in with the values from your own build:
//   - USER_POOL_ID / USER_POOL_CLIENT_ID → BUILD.md, Phase 2, section 4.2
//   - API_URL                            → BUILD.md, Phase 6, section 8.4
//     (the API Gateway "Invoke URL" for the `prod` stage, no trailing slash)
// ---------------------------------------------------------------

export const AWS_REGION = "us-east-1";

export const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID || "us-east-1_XXXXXXXXX";
export const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID || "YOUR_CLIENT_ID";

export const API_URL = import.meta.env.VITE_API_URL || "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod";

export const PRODUCT_NAME = "TaskFlow";
