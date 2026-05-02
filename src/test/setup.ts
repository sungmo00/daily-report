import "@testing-library/jest-dom";

// Set test environment variables
process.env.JWT_SECRET = "test-secret-key-for-vitest";
process.env.JWT_EXPIRES_IN = "86400";
process.env.DATABASE_URL = "file:./test.db";
