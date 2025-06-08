# Next.js Macro Tracker Project Guidelines

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

### Branch Management
- Use Gitflow workflow
- Branch from develop for features
- Use naming convention: `feature/descriptive-name`
- Keep branches up-to-date before creating PRs
- Delete branches after merge

### Commit Standards
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Use semantic versioning
- Write clear, descriptive commit messages

### Pull Request Process
- All changes must go through Pull Requests
- Required approvals: minimum 1
- CI checks must pass
- No direct commits to protected branches
- Branch must be up to date before merging

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
