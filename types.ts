// types.ts

/**
 * Represents the different overall views of the application.
 */
export enum ViewMode {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  GAME = 'GAME',
  HISTORY = 'HISTORY',
  LEADERBOARD = 'LEADERBOARD',
  ACTIVE_CHALLENGES = 'ACTIVE_CHALLENGES', // Renamed from CHALLENGE_SELECT to ACTIVE_CHALLENGES
  STATISTICS = 'STATISTICS', // New view mode for personal statistics
}

/**
 * Represents the different phases of the game itself (when ViewMode is GAME).
 */
export enum GamePhase {
  IDLE = 'IDLE',
  LOADING_QUESTIONS = 'LOADING_QUESTIONS',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

/**
 * Represents a single math question with its components and the correct answer.
 */
export interface MathQuestion {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*' | '/';
  answer: number;
  questionText: string;
}

/**
 * Defines the schema for the JSON response expected from the Gemini API
 * when generating math questions.
 */
export interface MathQuestionSchema {
  questions: MathQuestion[];
}

/**
 * Represents a user account.
 * NOTE: Storing passwordHash in localStorage is NOT secure for a real application.
 * This is for demonstration purposes only.
 */
export interface User {
  username: string;
  passwordHash: string; // Storing hashed password for simulation, but actual apps need robust security.
}

/**
 * Represents a record of a single game session.
 */
export interface GameRecord {
  id: string; // Unique ID for the record
  username: string;
  score: number;
  totalQuestions: number;
  date: string; // ISO 8601 string representation of the date
}

/**
 * Represents a game record that has been posted as an active challenge.
 */
export interface ChallengePosting {
  id: string; // Unique ID for the challenge posting
  originalRecordId: string; // The ID of the GameRecord this challenge is based on
  username: string;
  score: number;
  totalQuestions: number;
  datePosted: string; // ISO 8601 string representation of when the challenge was posted
}