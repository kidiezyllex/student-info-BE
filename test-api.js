// Test script for new APIs
const baseURL = 'https://student-info-be.onrender.com/api';

// Test data
const testUser = {
  name: "Test User",
  email: "test@example.com", 
  password: "test123456",
  role: "student",
  fullName: "Test Full Name"
};

console.log('Testing API endpoints...');

// Test 1: Check if POST /api/users exists
fetch(`${baseURL}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testUser)
})
.then(response => {
  console.log(`POST /api/users: Status ${response.status}`);
  if (response.status === 401) {
    console.log('✓ Route exists but requires authentication (expected)');
  } else if (response.status === 404) {
    console.log('✗ Route still not found');
  }
  return response.json();
})
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));

// Test 2: Check if POST /api/upload exists
setTimeout(() => {
  fetch(`${baseURL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`POST /api/upload: Status ${response.status}`);
    if (response.status === 401) {
      console.log('✓ Route exists but requires authentication (expected)');
    } else if (response.status === 404) {
      console.log('✗ Route still not found');
    }
    return response.json();
  })
  .then(data => console.log('Response:', data))
  .catch(error => console.error('Error:', error));
}, 1000);

// Test 3: Check health endpoint
setTimeout(() => {
  fetch(`${baseURL}/health`)
  .then(response => response.json())
  .then(data => {
    console.log('Health check:', data);
    console.log('Server is running!');
  })
  .catch(error => console.error('Health check failed:', error));
}, 2000); 