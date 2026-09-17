import { Request, Response, NextFunction } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Ensure Firebase Admin is initialized once
let isFirebaseAdminInitialized = false;

function initFirebaseAdmin() {
  if (isFirebaseAdminInitialized || getApps().length > 0) {
    isFirebaseAdminInitialized = true;
    return;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || "genai3-506610";
    initializeApp({
      projectId,
    });
    isFirebaseAdminInitialized = true;
  } catch (error) {
    console.error("[Auth] Firebase Admin initialization error:", error);
  }
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Express middleware to verify Firebase ID Tokens on incoming API requests.
 * Extracts token from 'Authorization: Bearer <ID_TOKEN>'.
 * Never trusts req.body.userId.
 * Never logs raw tokens or private user input.
 */
export async function authenticateFirebaseUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Allow test mock bypass only during test suite runs
  if (process.env.NODE_ENV === "test" && req.headers["x-test-mock-user"]) {
    req.user = {
      uid: String(req.headers["x-test-mock-user"]),
      email: "testuser@example.com",
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Authentication required",
      message: "Missing or malformed Authorization header. Expected 'Bearer <ID_TOKEN>'.",
    });
    return;
  }

  const idToken = authHeader.split(" ")[1]?.trim();
  if (!idToken) {
    res.status(401).json({
      error: "Authentication required",
      message: "Bearer token is empty.",
    });
    return;
  }

  initFirebaseAdmin();

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    return next();
  } catch (err: any) {
    // Distinguish expired vs invalid
    const isExpired = err?.code === "auth/id-token-expired";
    res.status(401).json({
      error: "Invalid or expired credentials",
      message: isExpired
        ? "Session token expired. Please refresh or sign in again."
        : "Failed to authenticate session token.",
    });
    return;
  }
}
