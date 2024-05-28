// Import the functions to be tested
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
} = require('../../src/model/data/index');

// Import the MemoryDB class
const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('MemoryDB Functions', () => {
  test('writeFragment stores a fragment in MemoryDB and readFragment', async () => {
    // Define the fragment to be written
    const ownerId = 'a';
    const id = 'b';
    const fragment = { ownerId, id, value: 123 };

    // Call the writeFragment function to store the fragment
    await writeFragment(fragment);

    // Received value must be a promise
    await expect(readFragment(ownerId, id)).resolves.toEqual(fragment);
  });

  test('write and read fragment data', async () => {
    const ownerId = 'a';
    const id = 'b';
    const buffer = Buffer.from([1, 2, 3]);
    await writeFragmentData(ownerId, id, buffer);
    await expect(readFragmentData(ownerId, id)).resolves.toEqual(buffer);
  });

  test('writes fragment metadata to memory db', async () => {
    const fragment = { ownerId: 'user1', id: 'fragment1', data: 'fragment data' };
    await expect(writeFragment(fragment)).resolves.toBeUndefined();
  });

  test('writes fragment data to memory db', async () => {
    const ownerId = 'user1';
    const id = 'fragment1';
    const buffer = Buffer.from([1, 2, 3]);
    await expect(writeFragmentData(ownerId, id, buffer)).resolves.toBeUndefined();
  });
});
