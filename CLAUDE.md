# Next.js Macro Tracker Project Guidelines

# CRITICAL: Git Workflow Rules
**NEVER commit directly to main branch!**
**ALWAYS create a feature branch and pull request!**
**DEFAULT BEHAVIOR: Follow Git flow for ALL changes!**

## Next.js Development Standards

### Project Structure
- Use App Router directory structure
- Place route-specific components in `app` directory
- Place shared components in `components` directory  
- Place utilities and helpers in `lib` directory
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)

### Component Best Practices
- Use Server Components by default
- Mark client components explicitly with 'use client'
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Implement proper error boundaries
- Place static content and interfaces at file end

### Performance
- Optimize images: Use WebP format, size data, lazy loading
- Minimize use of 'useEffect' and 'setState'
- Favor Server Components (RSC) where possible
- Use dynamic loading for non-critical components
- Implement proper caching strategies

### Data Fetching
- Use Server Components for data fetching when possible
- Implement proper error handling for data fetching
- Use appropriate caching strategies
- Handle loading and error states appropriately

### Forms and Validation
- Use Zod for form validation
- Implement proper server-side validation
- Handle form errors appropriately
- Show loading states during form submission

### State Management
- Minimize client-side state
- Use React Context sparingly
- Prefer server state when possible
- Implement proper loading states

## Database Guidelines

### Supabase Integration
- Configure proper project setup
- Implement proper authentication
- Use proper database setup
- Configure proper storage
- Implement proper policies
- Use proper client setup

### Security
- Implement proper RLS policies
- Use proper authentication
- Configure proper permissions
- Handle sensitive data properly
- Implement proper backups
- Use proper encryption

### Query Optimization
- Use proper query optimization
- Implement proper filtering
- Use proper joins
- Handle real-time properly
- Implement proper pagination
- Use proper functions

### Database Design
- Use proper normalization
- Implement proper indexing
- Use proper constraints
- Define proper relations
- Implement proper cascades
- Use proper data types

## Git Workflow

### Critical Rules for Claude
- **NEVER use `git push origin main` directly**
- **ALWAYS create a feature branch first**
- **ALWAYS create a PR instead of direct commits to main**
- **When user says "update github" or "push changes", create a PR, don't push to main**
- **Direct commits to develop branch are allowed only when explicitly requested**
- **DEFAULT: Create feature branch and PR for ALL changes**

### Branch Management
- Use Gitflow workflow
- Branch from develop for features (or main if no develop branch exists)
- Use naming convention: `feature/descriptive-name`
- Keep branches up-to-date before creating PRs
- Delete branches after merge

### Commit Standards
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Use semantic versioning
- Write clear, descriptive commit messages
- Include PR creation command in workflow

### Pull Request Process
- All changes must go through Pull Requests (except develop when explicitly allowed)
- Required approvals: minimum 1
- CI checks must pass
- No direct commits to main branch EVER
- Branch must be up to date before merging
- Use `gh pr create` to create PRs programmatically

## Code Quality Standards

### Development Guidelines
- Verify information before presenting it
- Make changes file by file
- Preserve existing code structure
- Provide all edits in single chunks
- Use real file links, not examples
- Don't suggest unnecessary updates

### Clean Code Principles
- Use meaningful names for variables, functions, and classes
- Replace magic numbers with named constants
- Keep functions small and focused (single responsibility)
- Extract repeated code into reusable functions
- Hide implementation details through proper encapsulation
- Write self-documenting code

### Testing Strategy
- Apply test coverage based on component criticality and business value
- Critical features (user data, authentication, core business logic) receive comprehensive coverage
- Utility components and UI elements tested based on complexity and risk
- Write tests before fixing bugs
- Keep tests readable and maintainable
- Test edge cases and error conditions

### Code Organization
- Keep related code together
- Use consistent file and folder naming conventions
- Organize code in logical hierarchy
- Refactor continuously
- Fix technical debt early
- Leave code cleaner than you found it

## Important Reminders for Claude

### Git Workflow is MANDATORY
1. When making any code changes, ALWAYS:
   - Create a feature branch: `git checkout -b feature/descriptive-name`
   - Make commits on the feature branch
   - Push the feature branch: `git push -u origin feature/descriptive-name`
   - Create a PR: `gh pr create --title "..." --body "..."`

2. NEVER:
   - Push directly to main: ❌ `git push origin main`
   - Commit directly to main without PR
   - Assume "update github" means push to main

3. EXCEPTIONS:
   - Direct commits to develop branch ONLY when user explicitly says "commit to develop"
   - All other cases: create feature branch and PR

### When User Says "Update GitHub" or "Push Changes"
This means: Create a feature branch and PR, NOT push to main!

### Default Workflow for Any Changes:
```bash
git checkout -b feature/description
git add .
git commit -m "type: description"
git push -u origin feature/description
gh pr create
```
