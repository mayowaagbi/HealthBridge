const User = require("../models/User");
const { comparePassword } = require("../utils/hash");
const { generateTokens, verifyToken } = require("../utils/tokenService");
const { ApiError } = require("../utils/apiError");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
class AuthService {
  /**
   * Register a new user.
   * @param {Object} userData - User data to register.
   * @returns {Promise<User>} - The newly registered user.
   * @throws {ApiError} - If the email is already in use.
   */
  // async registerUser(userData) {
  //   // Check if user already exists
  //   console.log("User Model:", User);
  //   const existingUser = await User.findByEmail(userData.email);

  //   if (existingUser) {
  //     throw new Error("User already exists with this email");
  //   }

  //   // Proceed with registration logic...
  //   return User.createWithProfile(userData);
  // }

  async registerUser(userData) {
    // Check if user already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash the password before saving
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Proceed with registration using hashed password
    return User.createWithProfile({
      ...userData,
      passwordHash, // Ensure this is passed as a string
    });
  }
  /**
   * Login user and generate tokens.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<{ user: User, tokens: Object }>} - User and generated tokens.
   * @throws {ApiError} - If credentials are invalid.
   */
  async login(email, password, res) {
    try {
      // Step 1: Find the user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Step 2: Validate the password
      const isPasswordValid = await comparePassword(
        password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Step 3: Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        role: user.role,
      });

      // Step 4: Set the refresh token as an HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: "localhost",
      });
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        domain: "localhost",
      });
      // Step 5: Return the user and access token in the response body
      logger.info(`User logged in: ${user.id}`);
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          token: { accessToken, refreshToken },
        },
        // Sent in the response body
      };
    } catch (error) {
      logger.error("Login error:", error);
      throw new ApiError(500, "Internal Server Error");
    }
  }

  /**
   * Refresh access token using a refresh token.
   * @param {string} refreshToken - Refresh token.
   * @returns {Promise<Object>} - New access and refresh tokens.
   * @throws {ApiError} - If the refresh token is invalid.
   */
  async refreshToken(refreshToken) {
    try {
      const { id } = verifyToken(refreshToken, "refresh");
      const user = await User.findByPk(id);

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      return generateTokens({ id: user.id, role: user.role });
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      throw new ApiError(401, "Invalid refresh token");
    }
  }

  /**
   * Logout user (optional functionality).
   * @param {string} userId - User ID to log out.
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    try {
      const { id, exp } = verifyToken(refreshToken, "refresh");
      const currentTime = Math.floor(Date.now() / 1000);
      const ttl = exp - currentTime;

      if (ttl > 0) {
        await redisClient.set(`blacklist:${refreshToken}`, "true", "EX", ttl);
        logger.info(`User ${id} logged out. Token invalidated.`);
      }

      return { success: true, message: "Logout successful" };
    } catch (error) {
      // Error handling
    }
  }
}

module.exports = new AuthService();
