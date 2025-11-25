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
  ACTIVE_CHALLENGES = 'ACTIVE_CHALLENGES',
  STATISTICS = 'STATISTICS',
  PROFILE = 'PROFILE', // New view mode for user profile management
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
export interface Question { // Renamed from MathQuestion
  type: 'arithmetic' | 'situation'; // New property to distinguish question types
  num1?: number; // Optional for situation questions
  num2?: number; // Optional for situation questions
  operation?: '+' | '-' | '*' | '/'; // Optional for situation questions
  answer: number;
  questionText: string;
  situationText?: string; // New property for situation-based questions
}

/**
 * Defines the schema for the JSON response expected from the Gemini API
 * when generating math questions.
 */
export interface QuestionSchema { // Renamed from MathQuestionSchema
  questions: Question[];
}

/**
 * Represents a user account.
 * NOTE: Storing passwordHash in localStorage is NOT secure for a real application.
 * This is for demonstration purposes only.
 */
export interface User {
  username: string;
  passwordHash: string; // Storing hashed password for simulation, but actual apps need robust security.
  displayName?: string;
  email?: string;
  profilePictureBase64?: string;
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