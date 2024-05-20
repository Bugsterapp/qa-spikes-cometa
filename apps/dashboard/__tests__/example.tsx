import { expect, test } from 'vitest';

test('Test 1: Array length', () => {
  const arr = [1, 2, 3, 4, 5];
  expect(arr.length).toBe(5);
});

test('Test 2: Object properties', () => {
  const obj = { name: 'John', age: 30 };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('age');
});

test('Test 3: Array contains', () => {
  const arr = ['apple', 'banana', 'cherry'];
  expect(arr).toContain('banana');
});

test('Test 4: String contains', () => {
  const str = 'Hello, world!';
  expect(str).toMatch(/world/);
});

test('Test 5: Promise resolves', async () => {
  const promise = new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve('resolved');
    }, 500);
  });
  await expect(promise).resolves.toBe('resolved');
});

test('Test 6: Number comparison', () => {
  const num = 10;
  expect(num).toBeGreaterThan(5);
  expect(num).toBeLessThan(20);
});

test('Test 7: Array sorting with complex sort function', () => {
  const arr = [{ age: 5 }, { age: 3 }, { age: 4 }, { age: 1 }, { age: 2 }];
  arr.sort((a, b) => a.age - b.age);
  expect(arr).toEqual([{ age: 1 }, { age: 2 }, { age: 3 }, { age: 4 }, { age: 5 }]);
});

test('Test 8: String length', () => {
  const str = 'Hello, world!';
  expect(str.length).toBe(13);
});

test('Test 9: Object equality', () => {
  const obj1 = { name: 'John', age: 30 };
  const obj2 = { name: 'John', age: 30 };
  expect(obj1).toEqual(obj2);
});

test('Test 10: Promise rejects', async () => {
  const promise = new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject('rejected');
    }, 500);
  });
  await expect(promise).rejects.toBe('rejected');
});
