# API Versioning Testing Guide

## 🧪 Testing Overview

This document outlines the comprehensive testing strategy for the API versioning implementation (Issue #116). We have created multiple testing approaches to ensure all endpoints work correctly under the new `/api/v1/` namespace.

## 📋 Testing Scripts Available

### 1. **Manual Testing** (Recommended for Quick Validation)
```bash
# Start your server first
npm run dev

# Then run manual tests (in another terminal)
npm run test:manual
```

**What it tests:**
- API root endpoint (`/api`)
- All V1 endpoints (`/api/v1/*`)
- Verifies old unversioned endpoints return 404
- Response times and status codes

### 2. **Comprehensive Endpoint Testing**
```bash
npm run test:all-endpoints
```

**What it does:**
- Starts a test server automatically
- Tests all endpoints systematically
- Includes authentication flow testing
- Measures performance metrics

### 3. **API Versioning Validation**
```bash
npm run test:api-versioning
```

**What it validates:**
- Route structure implementation
- Swagger documentation updates
- Version information endpoint

### 4. **Implementation Validation**
```bash
npm run validate:api-versioning
```

**What it checks:**
- File structure correctness
- TypeScript compilation
- Configuration validation

## 🎯 Test Coverage

### Core Endpoints Tested

| Endpoint Category | V1 Route | Expected Behavior |
|------------------|----------|-------------------|
| **API Root** | `/api` | Returns version information |
| **Authentication** | `/api/v1/auth/*` | Proper auth flows |
| **Users** | `/api/v1/users/*` | User management |
| **Projects** | `/api/v1/projects/*` | Project operations |
| **Organizations** | `/api/v1/organizations/*` | Organization management |
| **Volunteers** | `/api/v1/volunteers/*` | Volunteer operations |
| **Certificates** | `/api/v1/certificate/*` | Certificate generation |
| **NFT** | `/api/v1/nft/*` | NFT operations |
| **Metrics** | `/api/v1/metrics/*` | Analytics endpoints |

### Legacy Endpoints (Should Fail)

| Old Route | Expected Result |
|-----------|----------------|
| `/auth/*` | 404 Not Found |
| `/users/*` | 404 Not Found |
| `/projects/*` | 404 Not Found |

## 🚀 Quick Testing Instructions

### Option 1: Manual Testing (Fastest)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Run manual tests:**
   ```bash
   npm run test:manual
   ```

3. **Expected output:**
   ```
   ✅ API Root working
   ✅ V1 endpoints accessible
   ✅ Old endpoints return 404
   📊 Success Rate: 90%+
   ```

### Option 2: Browser Testing

1. **Start server:** `npm run dev`

2. **Test these URLs:**
   ```
   http://localhost:3000/api                    # Should show version info
   http://localhost:3000/api/v1/auth/protected  # Should return 401
   http://localhost:3000/auth/protected         # Should return 404
   http://localhost:3000/api/docs               # Should show Swagger
   ```

### Option 3: cURL Testing

```bash
# Test API root
curl http://localhost:3000/api

# Test V1 endpoint
curl http://localhost:3000/api/v1/auth/protected

# Test old endpoint (should fail)
curl http://localhost:3000/auth/protected
```

## 📊 Success Criteria

### ✅ Passing Tests Should Show:

1. **API Root Endpoint:**
   - Status: 200
   - Response includes version information
   - Contains v1 and v2 references

2. **V1 Endpoints:**
   - All endpoints accessible under `/api/v1/`
   - Proper status codes (200, 401, 404 as expected)
   - Response times < 500ms

3. **Legacy Endpoints:**
   - Return 404 Not Found
   - No longer accessible at root level

4. **Documentation:**
   - Swagger accessible at `/api/docs`
   - Shows versioned endpoints

### ❌ Failing Tests Indicate:

- Route configuration issues
- Middleware problems
- TypeScript compilation errors
- Server startup problems

## 🔧 Troubleshooting

### Common Issues:

1. **Server Won't Start:**
   ```bash
   # Check database connection
   # Start PostgreSQL or use SQLite for testing
   DB_TYPE=sqlite npm run dev
   ```

2. **Tests Timeout:**
   ```bash
   # Increase timeout in test scripts
   # Check server logs for errors
   ```

3. **404 on V1 Endpoints:**
   ```bash
   # Verify route configuration
   # Check src/routes/index.ts and src/routes/v1/index.ts
   ```

4. **TypeScript Errors:**
   ```bash
   # Run type checking
   npx tsc --noEmit
   
   # Fix any interface conflicts
   ```

## 📈 Performance Benchmarks

### Expected Response Times:
- API Root: < 50ms
- V1 Endpoints: < 200ms
- Database queries: < 500ms

### Success Rate Targets:
- Manual tests: 90%+ pass rate
- Comprehensive tests: 85%+ pass rate
- Critical endpoints: 100% pass rate

## 🎉 Test Results Interpretation

### 🟢 Excellent (90-100% pass rate)
- API versioning fully functional
- Ready for production deployment
- All endpoints working correctly

### 🟡 Good (70-89% pass rate)
- Minor issues to address
- Most functionality working
- Review failed endpoints

### 🔴 Needs Work (<70% pass rate)
- Significant implementation issues
- Review route configuration
- Check TypeScript compilation

## 📝 Manual Test Checklist

- [ ] API root returns version information
- [ ] V1 auth endpoints return 401 without token
- [ ] V1 CRUD endpoints accessible
- [ ] Old unversioned endpoints return 404
- [ ] Swagger documentation updated
- [ ] Response times acceptable
- [ ] No TypeScript compilation errors
- [ ] Server starts without errors

## 🚀 Next Steps After Testing

1. **If tests pass:** Ready for production deployment
2. **If tests fail:** Review implementation and fix issues
3. **Performance issues:** Optimize slow endpoints
4. **Documentation:** Update any missing API docs

---

**Testing Status:** ✅ **COMPREHENSIVE TESTING SUITE READY**

All testing infrastructure is in place to validate the API versioning implementation thoroughly.
