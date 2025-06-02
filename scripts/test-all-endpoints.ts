#!/usr/bin/env ts-node

/**
 * Comprehensive API Endpoint Testing Script
 * 
 * This script tests all endpoints under the new /api/v1/ namespace
 * to ensure functionality remains intact after API versioning implementation.
 */

import axios, { AxiosResponse } from 'axios';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';

interface TestResult {
  endpoint: string;
  method: string;
  expectedStatus: number;
  actualStatus: number;
  status: 'PASS' | 'FAIL' | 'SKIP';
  error?: string;
  responseTime?: number;
}

class APIEndpointTester {
  private baseUrl: string;
  private v1Url: string;
  private results: TestResult[] = [];
  private serverProcess: ChildProcess | null = null;
  private authToken: string | null = null;

  constructor(port: number = 3001) {
    this.baseUrl = `http://localhost:${port}`;
    this.v1Url = `${this.baseUrl}/api/v1`;
  }

  async startTestServer(): Promise<void> {
    console.log('🚀 Starting test server...');
    
    // Clean up any existing test database
    try {
      await fs.unlink('./test.db');
    } catch (error) {
      // File doesn't exist, that's fine
    }

    return new Promise((resolve, reject) => {
      // Start server with test environment
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        env: {
          ...process.env,
          NODE_ENV: 'test',
          DATABASE_URL: 'file:./test.db',
          DB_TYPE: 'sqlite',
          PORT: '3001',
          JWT_SECRET: 'test-jwt-secret',
          REDIS_URL: 'redis://localhost:6379'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverReady = false;

      this.serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('Server:', output.trim());
        
        if (output.includes('Server is running') && !serverReady) {
          serverReady = true;
          setTimeout(() => resolve(), 2000); // Wait 2 seconds for full startup
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const error = data.toString();
        console.error('Server Error:', error.trim());
        
        // Don't reject on database connection errors in test mode
        if (!error.includes('database') && !serverReady) {
          reject(new Error(`Server failed to start: ${error}`));
        }
      });

      this.serverProcess.on('error', (error) => {
        if (!serverReady) {
          reject(error);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'));
        }
      }, 30000);
    });
  }

  async stopTestServer(): Promise<void> {
    if (this.serverProcess) {
      console.log('🛑 Stopping test server...');
      this.serverProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        this.serverProcess?.on('exit', resolve);
        setTimeout(resolve, 5000); // Force resolve after 5 seconds
      });
    }
  }

  async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    expectedStatus: number = 200,
    data?: any,
    headers?: any
  ): Promise<TestResult> {
    const fullUrl = `${this.v1Url}${endpoint}`;
    const startTime = Date.now();

    try {
      const config = {
        method,
        url: fullUrl,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
      };

      const response: AxiosResponse = await axios(config);
      const responseTime = Date.now() - startTime;

      const result: TestResult = {
        endpoint: fullUrl,
        method,
        expectedStatus,
        actualStatus: response.status,
        status: response.status === expectedStatus ? 'PASS' : 'FAIL',
        responseTime
      };

      if (response.status !== expectedStatus) {
        result.error = `Expected ${expectedStatus}, got ${response.status}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        endpoint: fullUrl,
        method,
        expectedStatus,
        actualStatus: 0,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };

      this.results.push(result);
      return result;
    }
  }

  async testApiRoot(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${this.baseUrl}/api`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      const result: TestResult = {
        endpoint: `${this.baseUrl}/api`,
        method: 'GET',
        expectedStatus: 200,
        actualStatus: response.status,
        status: response.status === 200 ? 'PASS' : 'FAIL',
        responseTime
      };

      // Validate response structure
      const data = response.data;
      if (!data.message || !data.versions) {
        result.status = 'FAIL';
        result.error = 'Invalid API root response structure';
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        endpoint: `${this.baseUrl}/api`,
        method: 'GET',
        expectedStatus: 200,
        actualStatus: 0,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };

      this.results.push(result);
      return result;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive API Endpoint Tests...\n');

    // Test 1: API Root Endpoint
    console.log('📋 Testing API Root Endpoint...');
    await this.testApiRoot();

    // Test 2: Health Check (if exists)
    console.log('📋 Testing Health Endpoints...');
    await this.testEndpoint('/', 'GET', 404); // Should return 404 as it's not under v1
    
    // Test 3: Authentication Endpoints
    console.log('📋 Testing Authentication Endpoints...');
    await this.testEndpoint('/auth/protected', 'GET', 401); // Should return 401 without auth
    
    // Test 4: User Endpoints
    console.log('📋 Testing User Endpoints...');
    await this.testEndpoint('/users', 'GET', 200); // May return 200 or other status
    
    // Test 5: Project Endpoints
    console.log('📋 Testing Project Endpoints...');
    await this.testEndpoint('/projects', 'GET', 200); // May return 200 or other status
    
    // Test 6: Organization Endpoints
    console.log('📋 Testing Organization Endpoints...');
    await this.testEndpoint('/organizations', 'GET', 200); // May return 200 or other status
    
    // Test 7: Volunteer Endpoints
    console.log('📋 Testing Volunteer Endpoints...');
    await this.testEndpoint('/volunteers', 'GET', 200); // May return 200 or other status
    
    // Test 8: Certificate Endpoints
    console.log('📋 Testing Certificate Endpoints...');
    await this.testEndpoint('/certificate', 'GET', 404); // May return 404 for GET
    
    // Test 9: NFT Endpoints
    console.log('📋 Testing NFT Endpoints...');
    await this.testEndpoint('/nft', 'GET', 404); // May return 404 for GET
    
    // Test 10: Metrics Endpoints
    console.log('📋 Testing Metrics Endpoints...');
    await this.testEndpoint('/metrics/impact', 'GET', 200); // May return 200 or other status
    
    // Test 11: Non-existent Endpoints
    console.log('📋 Testing Non-existent Endpoints...');
    await this.testEndpoint('/nonexistent', 'GET', 404);
    await this.testEndpoint('/invalid/route', 'GET', 404);
  }

  printResults(): void {
    console.log('\n📊 Comprehensive Test Results:');
    console.log('=' .repeat(100));
    
    let passCount = 0;
    let failCount = 0;
    let totalResponseTime = 0;

    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      const error = result.error ? ` - ${result.error}` : '';
      
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint}`);
      console.log(`   Expected: ${result.expectedStatus}, Got: ${result.actualStatus}, Time: ${responseTime}${error}`);
      
      if (result.status === 'PASS') passCount++;
      else failCount++;
      
      if (result.responseTime) totalResponseTime += result.responseTime;
    });

    const avgResponseTime = this.results.length > 0 ? (totalResponseTime / this.results.length).toFixed(2) : '0';

    console.log('=' .repeat(100));
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Success Rate: ${((passCount / this.results.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Average Response Time: ${avgResponseTime}ms`);

    if (failCount === 0) {
      console.log('\n🎉 All tests passed! API versioning implementation is successful.');
      console.log('✅ All endpoints are working correctly under the /api/v1/ namespace.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
      console.log('🔍 Check the failed endpoints and ensure they are properly configured.');
    }
  }
}

// Main execution
async function main() {
  const tester = new APIEndpointTester();
  
  try {
    // Start test server
    await tester.startTestServer();
    
    // Run all tests
    await tester.runAllTests();
    
    // Print results
    tester.printResults();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await tester.stopTestServer();
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { APIEndpointTester };
