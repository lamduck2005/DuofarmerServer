import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  /**
   * Decode JWT token to get payload
   * @param jwtToken - JWT token string
   * @returns Decoded JWT payload with sub, exp, iat
   */
  decodeJwt(jwtToken: string): { sub: number; exp: number; iat: number } {
    try {
      const decoded = jwt.decode(jwtToken) as { sub: number; exp: number; iat: number };
      if (!decoded || !decoded.sub) {
        throw new Error('Invalid JWT token: missing sub field');
      }
      return decoded;
    } catch (error) {
      throw new Error(`Failed to decode JWT: ${error.message}`);
    }
  }

  /**
   * Extract user ID (sub) from JWT token
   * @param jwtToken - JWT token string
   * @returns User ID (sub)
   */
  getUserId(jwtToken: string): number {
    const decoded = this.decodeJwt(jwtToken);
    return decoded.sub;
  }

  /**
   * Validate JWT token format and expiration
   * @param jwtToken - JWT token string
   * @returns true if valid, throws error if invalid
   */
  validateJwt(jwtToken: string): boolean {
    if (!jwtToken || typeof jwtToken !== 'string') {
      throw new Error('JWT token is required and must be a string');
    }

    const decoded = this.decodeJwt(jwtToken);
    
    // Check expiration (optional, since Duolingo tokens might have long expiry)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error('JWT token has expired');
    }

    return true;
  }
}
