import { supabase } from './supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * Authentication Service
 * Provides methods for user authentication using Supabase
 */
export class AuthService {
    /**
     * Sign up a new user with email and password
     */
    static async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || '',
                    },
                },
            });

            if (error) {
                return {
                    success: false,
                    error: this.getErrorMessage(error),
                };
            }

            return {
                success: true,
                user: data.user || undefined,
            };
        } catch (error) {
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
            };
        }
    }

    /**
     * Sign in an existing user with email and password
     */
    static async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return {
                    success: false,
                    error: this.getErrorMessage(error),
                };
            }

            return {
                success: true,
                user: data.user,
            };
        } catch (error) {
            return {
                success: false,
                error: 'An unexpected error occurred. Please try again.',
            };
        }
    }

    /**
     * Sign in with Google OAuth
     */
    static async signInWithGoogle(): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });

            if (error) {
                return {
                    success: false,
                    error: this.getErrorMessage(error),
                };
            }

            // OAuth redirect will happen, so we return success
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to initiate Google sign-in. Please try again.',
            };
        }
    }

    /**
     * Sign out the current user
     */
    static async signOut(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    success: false,
                    error: this.getErrorMessage(error),
                };
            }

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to sign out. Please try again.',
            };
        }
    }

    /**
     * Get the current authenticated user
     */
    static async getCurrentUser(): Promise<User | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Listen for authentication state changes
     */
    static onAuthStateChange(callback: (user: User | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user || null);
        });
    }

    /**
     * Convert Supabase auth errors to user-friendly messages
     */
    private static getErrorMessage(error: AuthError): string {
        switch (error.message) {
            case 'Invalid login credentials':
                return 'Invalid email or password. Please try again.';
            case 'User already registered':
                return 'An account with this email already exists.';
            case 'Email not confirmed':
                return 'Please check your email and confirm your account.';
            case 'Password should be at least 6 characters':
                return 'Password must be at least 6 characters long.';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    }

    /**
     * Check if Supabase is properly configured
     */
    static isConfigured(): boolean {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        return !!(url && key && url !== 'your_supabase_project_url_here' && key !== 'your_supabase_anon_key_here');
    }
}
