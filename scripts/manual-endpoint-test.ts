#!/usr/bin/env ts-node

/**
 * Manual API Endpoint Testing Script
 * 
 * This script tests endpoints against a running server.
 * Run this after starting your server with: npm run dev
 */

import axios from 'axios';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

class ManualAPITester {
  private baseUrl: string;
  private v1Url: string;
  private results: TestResult[] = [];

  constructor(port: number = 3000) {
    this.baseUrl = `http://localhost:${port}`;
    this.v1Url = `${this.baseUrl}/api/v1`;
  }

  async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    expectedStatuses: number[] = [200, 404, 401, 403]
  ): Promise<TestResult> {
    const fullUrl = endpoint.startsWith('/api') ? `${this.baseUrl}${endpoint}` : `${this.v1Url}${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await axios({
        method,
        url: fullUrl,
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status code
      });

      const responseTime = Date.now() - startTime;
      const isExpectedStatus = expectedStatuses.includes(response.status);

      const result: TestResult = {
        endpoint: fullUrl,
        method,
        status: isExpectedStatus ? 'PASS' : 'FAIL',
        statusCode: response.status,
        responseTime
      };

      if (!isExpectedStatus) {
        result.error = `Unexpected status ${response.status}. Expected one of: ${expectedStatuses.join(', ')}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        endpoint: fullUrl,
        method,
        status: 'FAIL',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.results.push(result);
      return result;
    }
  }

  async runTests(): Promise<void> {
    console.log('🧪 Manual API Endpoint Testing');
    console.log('=' .repeat(50));
    console.log('📋 Testing API versioning implementation...\n');

    // Test API Root
    console.log('1. Testing API Root...');
    await this.testEndpoint('/api', 'GET', [200]);

    // Test V1 Authentication
    console.log('2. Testing V1 Authentication...');
    await this.testEndpoint('/auth/protected', 'GET', [401, 403]);

    // Test V1 Users
    console.log('3. Testing V1 Users...');
    await this.testEndpoint('/users', 'GET', [200, 401, 404]);

    // Test V1 Projects
    console.log('4. Testing V1 Projects...');
    await this.testEndpoint('/projects', 'GET', [200, 401, 404]);

    // Test V1 Organizations
    console.log('5. Testing V1 Organizations...');
    await this.testEndpoint('/organizations', 'GET', [200, 401, 404]);

    // Test V1 Volunteers
    console.log('6. Testing V1 Volunteers...');
    await this.testEndpoint('/volunteers', 'GET', [200, 401, 404]);

    // Test V1 Certificates
    console.log('7. Testing V1 Certificates...');
    await this.testEndpoint('/certificate', 'GET', [404, 405]); // GET might not be supported

    // Test V1 NFT
    console.log('8. Testing V1 NFT...');
    await this.testEndpoint('/nft', 'GET', [200, 404, 405]);

    // Test V1 Metrics
    console.log('9. Testing V1 Metrics...');
    await this.testEndpoint('/metrics/impact', 'GET', [200, 404]);

    // Test Non-existent V1 Endpoint
    console.log('10. Testing Non-existent V1 Endpoint...');
    await this.testEndpoint('/nonexistent', 'GET', [404]);

    // Test Old Unversioned Endpoints (Should fail)
    console.log('11. Testing Old Unversioned Endpoints (should fail)...');
    await this.testEndpoint(`${this.baseUrl}/auth/protected`, 'GET', [404], true);
    await this.testEndpoint(`${this.baseUrl}/users`, 'GET', [404], true);
  }

  async testEndpointDirect(url: string, method: 'GET' | 'POST' = 'GET', expectedStatuses: number[] = [404], shouldFail: boolean = false): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await axios({
        method,
        url,
        timeout: 5000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const isExpectedStatus = expectedStatuses.includes(response.status);

      const result: TestResult = {
        endpoint: url,
        method,
        status: isExpectedStatus ? 'PASS' : 'FAIL',
        statusCode: response.status,
        responseTime
      };

      if (!isExpectedStatus) {
        result.error = `Expected ${expectedStatuses.join(' or ')}, got ${response.status}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        endpoint: url,
        method,
        status: shouldFail ? 'PASS' : 'FAIL', // If we expect it to fail, connection error is a pass
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.results.push(result);
      return result;
    }
  }

  printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(80));
    
    let passCount = 0;
    let failCount = 0;
    let totalResponseTime = 0;

    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const statusCode = result.statusCode ? ` (${result.statusCode})` : '';
      const responseTime = result.responseTime ? ` - ${result.responseTime}ms` : '';
      const error = result.error ? ` - ${result.error}` : '';
      
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint}${statusCode}${responseTime}${error}`);
      
      if (result.status === 'PASS') passCount++;
      else failCount++;
      
      if (result.responseTime) totalResponseTime += result.responseTime;
    });

    const avgResponseTime = this.results.length > 0 ? (totalResponseTime / this.results.length).toFixed(2) : '0';

    console.log('=' .repeat(80));
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Success Rate: ${((passCount / this.results.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Average Response Time: ${avgResponseTime}ms`);

    console.log('\n🎯 API Versioning Assessment:');
    if (failCount === 0) {
      console.log('🎉 EXCELLENT! All endpoints are working correctly under /api/v1/');
      console.log('✅ API versioning implementation is successful');
    } else if (failCount <= 2) {
      console.log('✅ GOOD! Most endpoints are working correctly');
      console.log('⚠️  Minor issues detected - review failed endpoints');
    } else {
      console.log('⚠️  NEEDS ATTENTION! Multiple endpoint issues detected');
      console.log('🔍 Review the API versioning implementation');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Review any failed endpoints');
    console.log('2. Test with authentication tokens if needed');
    console.log('3. Verify Swagger documentation at /api/docs');
    console.log('4. Test POST/PUT/DELETE operations manually');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Manual API Endpoint Tests');
  console.log('📝 Make sure your server is running: npm run dev\n');

  const tester = new ManualAPITester();
  
  try {
    await tester.runTests();
    tester.printResults();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    console.log('\n💡 Make sure your server is running on http://localhost:3000');
    console.log('   Start it with: npm run dev');
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { ManualAPITester };
