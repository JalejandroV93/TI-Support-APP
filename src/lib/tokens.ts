// src/lib/tokens.ts
import { SignJWT, jwtVerify, JWTVerifyResult } from 'jose';
import { UserPayload } from '@/types/user';
import { config } from './config';  // Import config

// Function to create the token
export const createToken = async (user: UserPayload): Promise<string> => {
  //console.log("createToken - Payload received:", user); // IMPORTANT LOGGING
  if (!user) {
    console.error("createToken - Payload is NULL!"); // Add a log for explicit null check
    throw new Error("User payload cannot be null or undefined.");
  }
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d') // Expires in 1 day
    .sign(new TextEncoder().encode(config.authSecret)); // Use from config
};

// Function to verify the token
export const verifyToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const { payload }: JWTVerifyResult = await jwtVerify(token, new TextEncoder().encode(config.authSecret)); // Use from config
    return payload as UserPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    // No need to re-throw.  Just return null.
    return null;
  }
};