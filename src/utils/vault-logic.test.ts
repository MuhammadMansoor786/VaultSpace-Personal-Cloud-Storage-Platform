/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  getCategoryFromMime,
  calculateStorageBreakdown,
  detectDuplicates,
  filterAndSortFiles,
  getFolderPath,
  getDaysUntilPermanentDelete,
} from './vault-logic.ts';
import type { VaultFile, VaultFolder } from '../types/vault.ts';

test('formatBytes correctly formats across magnitude bounds', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(500), '500 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.5), '2.5 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024 * 5), '5 GB');
});

test('getCategoryFromMime identifies media and document types', () => {
  assert.equal(getCategoryFromMime('image/jpeg', 'photo.jpg'), 'photo');
  assert.equal(getCategoryFromMime('video/mp4', 'vacation.mp4'), 'video');
  assert.equal(getCategoryFromMime('audio/mpeg', 'song.mp3'), 'audio');
  assert.equal(getCategoryFromMime('application/pdf', 'contract.pdf'), 'document');
  assert.equal(getCategoryFromMime('application/zip', 'archive.zip'), 'archive');
  assert.equal(getCategoryFromMime('application/octet-stream', 'backup.tar.gz'), 'archive');
  assert.equal(getCategoryFromMime('application/unknown', 'data.bin'), 'other');
});

test('calculateStorageBreakdown computes accurate categories and usage percentage', () => {
  const dummyFiles: VaultFile[] = [
    {
      id: 'f1',
      userId: 'u1',
      name: 'photo1.jpg',
      folderId: null,
      category: 'photo',
      mimeType: 'image/jpeg',
      size: 1000,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastAccessedAt: '2026-01-01',
      isFavorite: false,
      isTrash: false,
      checksum: 'hash1',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [],
      tags: [],
    },
    {
      id: 'f2',
      userId: 'u1',
      name: 'video1.mp4',
      folderId: null,
      category: 'video',
      mimeType: 'video/mp4',
      size: 4000,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastAccessedAt: '2026-01-01',
      isFavorite: false,
      isTrash: false,
      checksum: 'hash2',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [{ id: 'v1', versionNumber: 1, size: 2000, uploadedAt: '2026-01-01', checksum: 'hash2_old' }],
      tags: [],
    },
    {
      id: 'f3',
      userId: 'u1',
      name: 'trashed.pdf',
      folderId: null,
      category: 'document',
      mimeType: 'application/pdf',
      size: 999999,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastAccessedAt: '2026-01-01',
      isFavorite: false,
      isTrash: true,
      checksum: 'hash3',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [],
      tags: [],
    },
  ];

  const dummyFolders: VaultFolder[] = [
    {
      id: 'fold1',
      userId: 'u1',
      name: 'Documents',
      parentId: null,
      color: '#3b82f6',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      isTrash: false,
    },
  ];

  // 1000 + (4000 + 2000) = 7000 used bytes (trashed file is excluded)
  const breakdown = calculateStorageBreakdown(dummyFiles, dummyFolders, 10000);
  assert.equal(breakdown.photosBytes, 1000);
  assert.equal(breakdown.videosBytes, 6000);
  assert.equal(breakdown.usedBytes, 7000);
  assert.equal(breakdown.availableBytes, 3000);
  assert.equal(breakdown.usagePercentage, 70);
  assert.equal(breakdown.filesCount, 2);
  assert.equal(breakdown.foldersCount, 1);
});

test('detectDuplicates groups files sharing identical checksums and calculates wasted space', () => {
  const files: VaultFile[] = [
    {
      id: 'f1',
      userId: 'u1',
      name: 'img_copy1.png',
      folderId: null,
      category: 'photo',
      mimeType: 'image/png',
      size: 5000,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastAccessedAt: '2026-01-01',
      isFavorite: false,
      isTrash: false,
      checksum: 'duplicate_hash_abc',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [],
      tags: [],
    },
    {
      id: 'f2',
      userId: 'u1',
      name: 'img_copy2.png',
      folderId: null,
      category: 'photo',
      mimeType: 'image/png',
      size: 5000,
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
      lastAccessedAt: '2026-01-02',
      isFavorite: false,
      isTrash: false,
      checksum: 'duplicate_hash_abc',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [],
      tags: [],
    },
    {
      id: 'f3',
      userId: 'u1',
      name: 'unique.png',
      folderId: null,
      category: 'photo',
      mimeType: 'image/png',
      size: 3000,
      createdAt: '2026-01-03',
      updatedAt: '2026-01-03',
      lastAccessedAt: '2026-01-03',
      isFavorite: false,
      isTrash: false,
      checksum: 'unique_hash_xyz',
      isEncrypted: true,
      encryptionAlgorithm: 'AES-GCM-256',
      versions: [],
      tags: [],
    },
  ];

  const duplicates = detectDuplicates(files);
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].checksum, 'duplicate_hash_abc');
  assert.equal(duplicates[0].files.length, 2);
  assert.equal(duplicates[0].wastedBytes, 5000);
});

test('filterAndSortFiles respects search query and sort orders', () => {
  const files: VaultFile[] = [
    {
      id: '1',
      userId: 'u1',
      name: 'Zebra.txt',
      folderId: null,
      category: 'document',
      mimeType: 'text/plain',
      size: 200,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
      lastAccessedAt: '2026-01-01T10:00:00Z',
      isFavorite: true,
      isTrash: false,
      checksum: 'h1',
      isEncrypted: false,
      encryptionAlgorithm: 'none',
      versions: [],
      tags: ['animals'],
    },
    {
      id: '2',
      userId: 'u1',
      name: 'Apple.txt',
      folderId: null,
      category: 'document',
      mimeType: 'text/plain',
      size: 800,
      createdAt: '2026-01-02T10:00:00Z',
      updatedAt: '2026-01-02T10:00:00Z',
      lastAccessedAt: '2026-01-02T10:00:00Z',
      isFavorite: false,
      isTrash: false,
      checksum: 'h2',
      isEncrypted: false,
      encryptionAlgorithm: 'none',
      versions: [],
      tags: ['fruit'],
    },
  ];

  // Sort by name ASC
  const byNameAsc = filterAndSortFiles(files, { sortField: 'name', sortOrder: 'asc' });
  assert.equal(byNameAsc[0].name, 'Apple.txt');
  assert.equal(byNameAsc[1].name, 'Zebra.txt');

  // Search by tag
  const searchResult = filterAndSortFiles(files, { search: 'fruit', sortField: 'name', sortOrder: 'asc' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].name, 'Apple.txt');

  // Favorites only
  const favResult = filterAndSortFiles(files, { onlyFavorites: true, sortField: 'name', sortOrder: 'asc' });
  assert.equal(favResult.length, 1);
  assert.equal(favResult[0].name, 'Zebra.txt');
});

test('getFolderPath creates hierarchical breadcrumb path', () => {
  const folders: VaultFolder[] = [
    { id: 'f1', userId: 'u1', name: 'Work', parentId: null, color: '#3b82f6', createdAt: '', updatedAt: '', isTrash: false },
    { id: 'f2', userId: 'u1', name: '2026', parentId: 'f1', color: '#10b981', createdAt: '', updatedAt: '', isTrash: false },
    { id: 'f3', userId: 'u1', name: 'Q1', parentId: 'f2', color: '#f59e0b', createdAt: '', updatedAt: '', isTrash: false },
  ];

  const path = getFolderPath(folders, 'f3');
  assert.deepEqual(path, [
    { id: null, name: 'Vault Root' },
    { id: 'f1', name: 'Work' },
    { id: 'f2', name: '2026' },
    { id: 'f3', name: 'Q1' },
  ]);
});

test('getDaysUntilPermanentDelete calculates retention days', () => {
  const now = new Date();
  assert.equal(getDaysUntilPermanentDelete(now.toISOString(), 30), 30);
  
  // 10 days ago
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  assert.equal(getDaysUntilPermanentDelete(tenDaysAgo.toISOString(), 30), 20);
});
