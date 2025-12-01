import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Google OAuth Strategy Configuration
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
};

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    googleConfig,
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // Extract user information from Google profile
        const googleUser = {
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value || '',
          fullName: profile.displayName || '',
          avatarUrl: profile.photos?.[0]?.value || '',
        };

        // Pass the user data to the callback
        // The actual user creation/linking logic will be handled in the OAuth service
        return done(null, googleUser as any);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Facebook OAuth Strategy Configuration
const facebookConfig = {
  clientID: process.env.FACEBOOK_APP_ID || '',
  clientSecret: process.env.FACEBOOK_APP_SECRET || '',
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3001/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
};

// Configure Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    facebookConfig,
    async (accessToken: string, refreshToken: string, profile: FacebookProfile, done: VerifyCallback) => {
      try {
        // Extract user information from Facebook profile
        const facebookUser = {
          provider: 'facebook',
          providerId: profile.id,
          email: profile.emails?.[0]?.value || '',
          fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
          avatarUrl: profile.photos?.[0]?.value || '',
        };

        // Pass the user data to the callback
        // The actual user creation/linking logic will be handled in the OAuth service
        return done(null, facebookUser as any);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session (not used in JWT-based auth, but required by Passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from session (not used in JWT-based auth, but required by Passport)
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
