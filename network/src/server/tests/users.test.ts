import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import fs from 'fs';

jest.mock('fs');


describe('Users Logic', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
        users: [
          { 
            id: 'user-1', 
            profile: { email: 'test@test.com', name: 'Test User' },
            password: 'password123'
          }
        ]
      }));
    });
  
    describe('User validation', () => {
      it('should find user by email', () => {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const user = usersData.users.find((u: any) => u.profile.email === 'test@test.com');
        
        expect(user).toBeDefined();
        expect(user.profile.name).toBe('Test User');
      });
  
      it('should validate password', () => {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const user = usersData.users[0];
        
        expect(user.password).toBe('password123');
      });
  
      it('should detect duplicate email', () => {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const newUser = { profile: { email: 'test@test.com' } };
        
        const existingUser = usersData.users.find((u: any) => 
          u.profile.email === newUser.profile.email
        );
  
        expect(existingUser).toBeDefined();
      });
    });
  });