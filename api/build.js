#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const src = 'dist/api';
const dst = 'dist';

// Remove old dist/functions and dist/services if they exist
const toRemove = [
  path.join(dst, 'functions'),
  path.join(dst, 'services'),
];

toRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
});

// Recursive copy function
const copyDir = (s, d) => {
  const stat = fs.statSync(s);
  if (stat.isDirectory()) {
    fs.mkdirSync(d, { recursive: true });
    fs.readdirSync(s).forEach(file => {
      const srcFile = path.join(s, file);
      const dstFile = path.join(d, file);
      copyDir(srcFile, dstFile);
    });
  } else {
    fs.copyFileSync(s, d);
  }
};

// Copy all files from dist/api to dist
fs.readdirSync(src).forEach(file => {
  const srcFile = path.join(src, file);
  const dstFile = path.join(dst, file);
  copyDir(srcFile, dstFile);
});

// Also copy prompts directory from source to dist
const promptsDir = 'prompts';
if (fs.existsSync(promptsDir)) {
  const dstPromptsDir = path.join(dst, promptsDir);
  fs.mkdirSync(dstPromptsDir, { recursive: true });
  fs.readdirSync(promptsDir).forEach(file => {
    const srcFile = path.join(promptsDir, file);
    const dstFile = path.join(dstPromptsDir, file);
    fs.copyFileSync(srcFile, dstFile);
  });
  console.log('Copied prompts directory to dist/');
}

console.log('Build complete: dist/api copied to dist/');
