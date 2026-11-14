import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import { deleteRegistrationFromFile } from '../config/fileStorage.js';

describe('Pixela Crew Registration to Approval & Leadership Lifecycle', () => {
  let server;
  let baseUrl;
  let adminToken;
  let testUserId;
  const testEmail = `test_regression_${Date.now()}@oriental.ac.in`;
  const testPassword = 'RegressionPassword@2026';

  before(async () => {
    // Start ephemeral server on random available port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Obtain Super Admin JWT token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pixela@oriental.ac.in', password: 'pixela@2026' })
    });
    const loginData = await loginRes.json();
    assert.ok(loginData.token, 'Super Admin should be able to log in');
    adminToken = loginData.token;
  });

  after(async () => {
    // Cleanup temporary test member if still present
    if (testUserId) {
      deleteRegistrationFromFile(testUserId);
      deleteRegistrationFromFile(testEmail);
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. New crew registration starts in pending status (isApproved === false)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Regression Tester',
        email: testEmail,
        password: testPassword,
        role: 'member',
        department: 'Information Technology',
        year: '2nd Year',
        semester: 4
      })
    });
    assert.equal(res.status, 201, 'Registration should return HTTP 201');
    const data = await res.json();
    assert.equal(data.user?.isApproved, false, 'New registrations must have isApproved: false');
    testUserId = data.user?.id || data.user?._id;
    assert.ok(testUserId, 'User should have an ID');
  });

  test('2. Duplicate registration with the same email is safely rejected with HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Tester',
        email: testEmail,
        password: testPassword
      })
    });
    assert.equal(res.status, 400, 'Duplicate registration should return HTTP 400');
    const data = await res.json();
    assert.match(data.error, /already exists/i, 'Error message should explain that user already exists');
  });

  test('3. Pending member is excluded from public Leadership listing (/api/members)', async () => {
    const res = await fetch(`${baseUrl}/api/members`);
    assert.equal(res.status, 200);
    const members = await res.json();
    const found = members.find(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.equal(found, undefined, 'Pending member must not be visible on the public leadership roster');
  });

  test('4. Unauthorized users cannot approve registrations without a valid admin token', async () => {
    // Attempt without token
    const resNoToken = await fetch(`${baseUrl}/api/members/${testUserId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: true })
    });
    assert.ok([401, 403].includes(resNoToken.status), 'Unauthenticated approval must be blocked');

    // Attempt with invalid token
    const resInvalidToken = await fetch(`${baseUrl}/api/members/${testUserId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake_invalid_jwt_token'
      },
      body: JSON.stringify({ isApproved: true })
    });
    assert.equal(resInvalidToken.status, 401, 'Invalid token approval must be rejected with HTTP 401');
  });

  test('5. Pending member appears in super-admin pending queue (/api/members/pending)', async () => {
    const res = await fetch(`${baseUrl}/api/members/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const pending = await res.json();
    const found = pending.find(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.ok(found, 'Pending member must be visible to the Super Admin');
  });

  test('6. Super admin can approve registration and status updates to isApproved === true', async () => {
    const res = await fetch(`${baseUrl}/api/members/${testUserId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isApproved: true })
    });
    assert.equal(res.status, 200, 'Approval must return HTTP 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.member?.isApproved, true, 'Approved status must be true');
  });

  test('7. Approved member appears in public Leadership listing (/api/members) exactly once', async () => {
    const res = await fetch(`${baseUrl}/api/members`);
    assert.equal(res.status, 200);
    const members = await res.json();
    const matches = members.filter(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.equal(matches.length, 1, 'Approved member should appear exactly once in public leadership');
    assert.equal(matches[0].name, 'Automated Regression Tester');
    assert.equal(matches[0].department, 'Information Technology');
    assert.equal(matches[0].isApproved, true);
  });

  test('8. Repeated approval is idempotent and does not create duplicate entries', async () => {
    const res = await fetch(`${baseUrl}/api/members/${testUserId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isApproved: true })
    });
    assert.equal(res.status, 200);

    const checkRes = await fetch(`${baseUrl}/api/members`);
    const members = await checkRes.json();
    const matches = members.filter(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.equal(matches.length, 1, 'Repeated approval must not duplicate the member');
  });

  test('9. Approved member no longer appears in pending queue', async () => {
    const res = await fetch(`${baseUrl}/api/members/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const pending = await res.json();
    const found = pending.find(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.equal(found, undefined, 'Approved member must be cleared from the pending queue');
  });

  test('10. Deleting / declining member removes them completely from Leadership', async () => {
    const delRes = await fetch(`${baseUrl}/api/members/${testUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(delRes.status, 200);

    const checkRes = await fetch(`${baseUrl}/api/members`);
    const members = await checkRes.json();
    const found = members.find(m => (m.email || '').toLowerCase() === testEmail.toLowerCase());
    assert.equal(found, undefined, 'Deleted member must no longer appear in leadership');
    testUserId = null; // Mark as cleaned up
  });
});
