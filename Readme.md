# 🎥 Flixora – Create. Connect. Inspire.

This is the backend for Flixora, a comprehensive video streaming platform similar to YouTube. It's built with Node.js, Express, and MongoDB, providing a robust and scalable foundation for a modern video-sharing application.

## ✨ Features

-   **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens) with access and refresh tokens.
-   **Profile Management**: Users can manage their profiles, including updating their avatar and cover images.
-   **Video Operations**: Full CRUD (Create, Read, Update, Delete) functionality for videos.
-   **File Uploads**: Efficiently handles video and image uploads using `multer` and stores them on `Cloudinary`.
-   **Subscription System**: Users can subscribe to channels and view subscriber/subscription lists.
-   **Social Interactions**: Like/unlike videos, comments, and tweets.
-   **Commenting**: Add, update, and delete comments on videos.
-   **Tweets**: A simple tweeting feature for users to share short updates.
-   **Playlists**: Create, update, and manage video playlists.
-   **Dashboard**: View channel statistics like total video views, subscribers, and likes.
-   **Advanced Backend**:
    -   **MongoDB Aggregation Pipelines**: Complex queries for optimized data retrieval.
    -   **Pagination**: Implemented for lists like comments and videos.
    -   **Security**: Middleware for JWT verification and robust error handling.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JWT (jsonwebtoken), bcrypt
-   **File Handling**: Cloudinary for cloud storage, Multer for multipart/form-data
-   **Middleware**: CORS, cookie-parser
-   **Dev Tools**: Nodemon, Prettier

## ⚙️ Setup and Installation

1.  **Clone the repository:**
    ```sh
    https://github.com/bisVo159/Flixora.git
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following variables. You can use the provided `.env` file as a reference.

    ```env
    PORT=8000
    MONGODB_URI=<your_mongodb_connection_string>
    CORS_ORIGIN=*
    DB_NAME=flixora

    ACCESS_TOKEN_SECRET=<your_access_token_secret>
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
    REFRESH_TOKEN_EXPIRY=7d

    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    NODE_ENV=development
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```

---
## 👨‍💻 Author

**Anik Biswas**  
📍 Kolkata, India  
🚀 Building backend, generative AI, and AIML applications.