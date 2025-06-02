import axios from 'axios';

/**
 * API Versioning Test Script
 * 
 * This script tests the new API versioning implementation to ensure:
 * 1. All endpoints are accessible under /api/v1/
 * 2. API root endpoint provides version information
 * 3. All routes maintain their functionality
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_V1_URL = `${BASE_URL}/api/v1`;
const API_ROOT_URL = `${BASE_URL}/api`;

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
}

class APIVersioningTester {
  private results: TestResult[] = [];

  async testEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET',
    expectedStatus: number = 200,
    data?: any
  ): Promise<TestResult> {
    const fullUrl = `${API_V1_URL}${endpoint}`;
    
    try {
      const config = {
        method,
        url: fullUrl,
        data,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status code
      };

      const response = await axios(config);
      
      const result: TestResult = {
        endpoint: fullUrl,
        method,
        status: response.status === expectedStatus ? 'PASS' : 'FAIL',
        statusCode: response.status
      };

      if (response.status !== expectedStatus) {
        result.error = `Expected ${expectedStatus}, got ${response.status}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: TestResult = {
        endpoint: fullUrl,
        method,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testApiRoot(): Promise<TestResult> {
    try {
      const response = await axios.get(API_ROOT_URL, { timeout: 5000 });
      
      const result: TestResult = {
        endpoint: API_ROOT_URL,
        method: 'GET',
        status: 'PASS',
        statusCode: response.status
      };

      // Validate response structure
      const data = response.data;
      if (!data.message || !data.versions || !data.versions.v1 || !data.versions.v2) {
        result.status = 'FAIL';
        result.error = 'Invalid API root response structure';
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: TestResult = {
        endpoint: API_ROOT_URL,
        method: 'GET',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.results.push(result);
      return result;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Versioning Tests...\n');

    // Test API root endpoint
    console.log('📋 Testing API Root Endpoint...');
    await this.testApiRoot();

    // Test health endpoints
    console.log('📋 Testing Health Endpoints...');
    await this.testEndpoint('/', 'GET', 200); // This should fail as it's not under v1
    
    // Test authentication endpoints
    console.log('📋 Testing Authentication Endpoints...');
    await this.testEndpoint('/auth/protected', 'GET', 401); // Should return 401 without auth
    
    // Test other endpoints (expecting various responses)
    console.log('📋 Testing Other V1 Endpoints...');
    await this.testEndpoint('/users', 'GET'); // May return 200 or 404
    await this.testEndpoint('/projects', 'GET'); // May return 200 or 404
    await this.testEndpoint('/organizations', 'GET'); // May return 200 or 404
    await this.testEndpoint('/volunteers', 'GET'); // May return 200 or 404
    await this.testEndpoint('/metrics/impact', 'GET'); // May return 200 or 404
    
    // Test non-existent endpoints
    console.log('📋 Testing Non-existent Endpoints...');
    await this.testEndpoint('/nonexistent', 'GET', 404);
  }

  printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(80));
    
    let passCount = 0;
    let failCount = 0;

    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const statusCode = result.statusCode ? ` (${result.statusCode})` : '';
      const error = result.error ? ` - ${result.error}` : '';
      
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint}${statusCode}${error}`);
      
      if (result.status === 'PASS') passCount++;
      else failCount++;
    });

    console.log('=' .repeat(80));
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Success Rate: ${((passCount / this.results.length) * 100).toFixed(1)}%`);

    if (failCount === 0) {
      console.log('\n🎉 All tests passed! API versioning implementation is successful.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new APIVersioningTester();
  
  try {
    await tester.runAllTests();
    tester.printResults();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { APIVersioningTester };
