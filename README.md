# Higher-Lower Movie Game

**Submitted by:** [Your Name] ([Your Directory ID])

**Group Members:** [Abhinav Verma] ([118972497]), [Armin Moattari] ([119858431]), [Justin Chai] ([jchai])

**App Description:** A fun movie guessing game where players test their movie knowledge by predicting whether the real IMDb rating is higher or lower than a fake rating shown for each film. Track your accuracy and compete against your own streaks!

**YouTube Video Link:** [(https://youtu.be/ORjXKpUDoMg)]

**APIs Used:**
- [OMDB API](https://www.omdbapi.com/) - Fetches real movie data and IMDb ratings

**Contact Email:** [Your email address]

**Deployed App Link:** [https://movie-higher-lower.onrender.com]

---

## Features

- Play rounds guessing movie ratings
- View your game history with accuracy stats
- Responsive design with modern styling
- Session-based game tracking

## How to Run Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory with:
   ```
   OMDB_API_KEY=your_omdb_api_key
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```
4. Start the server: `npm start` (or `npm run dev` for development with nodemon)
5. Open http://localhost:3000 in your browser

## Tech Stack

- **Frontend:** EJS, CSS3
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **APIs:** OMDB
