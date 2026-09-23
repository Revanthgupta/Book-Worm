import axiosClient from '../../services/axiosClient';
import type { User } from './authSlice';

/**
 * Authentication service — calls the real backend API.
 * POST /api/auth/login  → returns { id, name, email, token, gift_points }
 * POST /api/auth/register → same shape
 * GET  /api/auth/me     → refresh current user + gift_points
 */

export interface LoginResult {
  success: boolean;
  user?: User;
  giftPoints?: number;
  error?: string;
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await axiosClient.post<{
      id: string;
      name: string;
      email: string;
      token: string;
      gift_points: number;
    }>('/auth/login', { email: email.trim().toLowerCase(), password });
    const { gift_points, ...rest } = res.data;
    return { success: true, user: rest, giftPoints: gift_points };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail ?? 'Login failed. Please check your credentials.';
    return { success: false, error: msg };
  }
}

export async function apiGetMe(): Promise<{
  user: User;
  giftPoints: number;
} | null> {
  try {
    const res = await axiosClient.get<{
      id: string;
      name: string;
      email: string;
      token: string;
      gift_points: number;
    }>('/auth/me');
    const { gift_points, ...user } = res.data;
    return { user, giftPoints: gift_points };
  } catch {
    return null;
  }
}
