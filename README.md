<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

Specification

1. Overall Application Flow:
* The application will start in a LOGIN view.
* From the LOGIN view, users can switch to a REGISTER view.
* Upon successful login or registration, the user will be redirected to the GAME_IDLE state of the math game.
* While playing the game, a "Logout" button will be available, leading back to the LOGIN view.
* A "History" button will be available from the game's idle/finished states, allowing users to view their past game records.
* From the HISTORY view, users can navigate back to the game.

2. Authentication (Login/Register):
* User Data Storage: User credentials (username and a simulated password hash) will be stored in localStorage. This is for demonstration purposes only; a real application would use a secure backend.
* Login Form:
* Fields: Username, Password.
* Action: Authenticates the user. If successful, stores the loggedInUser in App.tsx state and navigates to the GAME_IDLE view.
* Validation: Checks if username exists and password matches. Displays error messages for invalid credentials.
* Register Form:
* Fields: Username, Password.
* Action: Creates a new user. If successful, logs the user in and navigates to the GAME_IDLE view.
* Validation: Checks if username is already taken, and if password meets minimum requirements (e.g., non-empty). Displays error messages.
* Logout: A button will be available in the game view to log out, clearing the loggedInUser state and returning to the LOGIN view.

3. Game History:
* Game Record Storage: When a game finishes, a GameRecord (containing username, score, total questions, and date) will be saved to localStorage, specific to the logged-in user.
* History View:
* Displays a list of past game records for the currently logged-in user.
* Records will be displayed with the date, score, and total questions.
* Sorted by date in descending order (most recent first).
* Includes a "Back to Game" button to return to the GAME_IDLE state.

4. UI/UX Enhancements:
* Navigation: Clear buttons or links to switch between login/register and to access history/logout.
* Feedback: Informative messages for successful actions (e.g., "Registration successful, logging in...") and errors (e.g., "Username already taken").
* Accessibility: Ensure all new interactive elements (buttons, inputs) have appropriate ARIA attributes.
* Responsiveness: All new components will be responsive and adapt to different screen sizes using Tailwind CSS.
* Visual Appearance:
* Login/Register forms will share a similar card-like design to the game questions, maintaining a consistent aesthetic.
* History records will be presented in an easy-to-read list, potentially with alternating row backgrounds or clear separators.
* New buttons for navigation (e.g., "History", "Logout") will use existing button styles but might adopt secondary variant where appropriate.

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/184GG4mMpCAQGtpvNw-GDHw6bnPHsRybl

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
