#!/bin/bash

# Publishing script for next-controllers
# Usage: ./scripts/publish.sh [patch|minor|major]

set -e  # Exit on error

VERSION_TYPE=${1:-patch}

echo "🚀 Publishing next-controllers to npm"
echo "Version bump type: $VERSION_TYPE"
echo ""

# Check if we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Error: You must be on the main branch to publish"
  echo "Current branch: $BRANCH"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: You have uncommitted changes"
  echo "Please commit or stash your changes before publishing"
  exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Build the package
echo "🔨 Building package..."
npm run build

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist folder not found"
  echo "Build may have failed"
  exit 1
fi

# Show what will be published
echo ""
echo "📦 Package contents:"
npm pack --dry-run

echo ""
read -p "Does this look correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Aborted by user"
  exit 1
fi

# Bump version
echo ""
echo "📝 Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "New version: $NEW_VERSION"

# Create git tag
echo "🏷️  Creating git tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

# Publish to npm
echo ""
echo "🚀 Publishing to npm..."
npm publish

# Push changes and tags
echo ""
echo "📤 Pushing to git..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "✅ Successfully published next-controllers@$NEW_VERSION to npm!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub release at https://github.com/aronkalo/next-controllers/releases/new"
echo "2. Update CHANGELOG.md if needed"
echo "3. Announce the release!"
