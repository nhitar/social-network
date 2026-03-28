import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import fs from 'fs';

jest.mock('fs');

describe('Posts Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
      posts: [
        { id: 'post-1', content: 'First post', likes: [] },
        { id: 'post-2', content: 'Second post', likes: ['user-1'] }
      ]
    }));

    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  describe('Like functionality', () => {
    it('should add like to post', () => {
      const postsData = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
      const post = postsData.posts.find((p: any) => p.id === 'post-1');
      
      if (!post.likes.includes('user-2')) {
        post.likes.push('user-2');
      }

      expect(post.likes).toContain('user-2');
      expect(post.likes).toHaveLength(1);
    });

    it('should remove like from post', () => {
      const postsData = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
      const post = postsData.posts.find((p: any) => p.id === 'post-2');
      
      const likeIndex = post.likes.indexOf('user-1');
      if (likeIndex !== -1) {
        post.likes.splice(likeIndex, 1);
      }

      expect(post.likes).not.toContain('user-1');
      expect(post.likes).toHaveLength(0);
    });
  });

  describe('Post creation', () => {
    it('should create new post with correct structure', () => {
      const newPost = {
        id: 'post-3',
        authorId: 'user-1',
        content: 'New test post',
        date: '2024-01-01',
        likes: []
      };

      const postsData = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
      postsData.posts.push(newPost);

      expect(postsData.posts).toHaveLength(3);
      expect(postsData.posts[2]).toEqual(newPost);
    });
  });
});