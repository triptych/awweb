# Footer Web Component Task

Create a reusable footer web component that displays contact information fetched from a remote JSON file. This component should be easily embeddable on any website.

## Requirements

### Component Features
- Create a custom web component named `contact-footer`
- Component should fetch contact data from `contact.json` in the repository
- Display the following information in an elegant footer layout:
  - Name
  - Email
  - Social media links
  - Any additional contact methods specified in the JSON
- Implement error handling for failed fetch requests
- Add loading state while data is being fetched
- Style the component with a modern, minimal design
- Ensure the component is responsive

### Technical Requirements
- Use vanilla JavaScript and Web Components standard
- No external dependencies or frameworks
- Component should be self-contained in a single JavaScript file
- Implement shadow DOM for style encapsulation
- Add appropriate CORS headers for JSON fetching
- Include retry logic for failed fetches
- Cache fetched data with appropriate expiration

### Usage Example
```html
<!-- Add this in the head of your HTML -->
<script src="https://[your-repo-url]/contact-footer.js" type="module"></script>

<!-- Use anywhere in your HTML -->
<contact-footer></contact-footer>
```

### JSON Structure
The component should expect a JSON file with the following structure:
```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "social": {
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "twitter": "https://twitter.com/yourusername"
  },
  "additional_contact": {
    "website": "https://yourwebsite.com",
    "blog": "https://yourblog.com"
  }
}
```

### Styling Requirements
- Dark theme by default with a light theme option
- Smooth transitions for hover states
- Mobile-responsive layout
- Accessible color contrast
- Clear typography hierarchy

### Accessibility Requirements
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## Deliverables
1. A single JavaScript file containing the web component
2. Sample contact.json file
3. Documentation for:
   - Installation
   - Usage
   - Customization options
   - JSON format requirements
   - Error handling

## Testing Requirements
- Test across major browsers (Chrome, Firefox, Safari)
- Verify mobile responsiveness
- Validate accessibility
- Test offline behavior
- Verify error states
