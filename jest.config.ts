// import { config } from "dotenv";

// config({ path: ".env.test" });

// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   transform: {
//     "^.+\\.tsx?$": [
//       "ts-jest",
//       {
//         tsconfig: "./tsconfig.json",
//       },
//     ],
//   },
//   testMatch: ["**/tests/**/*.test.ts", "**/__tests__/**/*.test.ts"],
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
// };

// jest.config.js;
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
  coverageDirectory: "coverage",
  testTimeout: 30000, // Increased timeout for async tests
};
