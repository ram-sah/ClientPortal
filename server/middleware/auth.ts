import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { storage } from '../storage';
import type { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function generateToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 Auth: Checking authorization header...');
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth: No token provided or wrong format');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Auth: Token received:', token.substring(0, 20) + '...');
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    console.log('❌ Auth: Invalid token');
    return res.status(401).json({ error: 'Invalid token' });
  }

  console.log('🔐 Auth: Token valid, userId:', payload.userId);
  const user = await storage.getUser(payload.userId);
  
  if (!user || !user.isActive) {
    console.log('❌ Auth: User not found or inactive');
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  console.log('✅ Auth: User authenticated:', user.email, 'role:', user.role);
  req.user = user;
  
  // Log the access
  await storage.logActivity(
    user.id,
    `${req.method} ${req.path}`,
    undefined,
    undefined,
    { ip: req.ip, userAgent: req.headers['user-agent'] }
  );

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 RequireOwnerOrAdmin: Starting middleware chain');
  requireAuth(req, res, (err) => {
    if (err) {
      console.log('❌ RequireOwnerOrAdmin: Auth failed');
      return;
    }
    
    console.log('✅ RequireOwnerOrAdmin: Auth passed, checking role');
    // After authentication, check role
    requireRole('owner', 'admin')(req, res, next);
  });
}
