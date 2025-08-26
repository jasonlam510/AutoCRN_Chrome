# AutoCRN for Chrome

Helps you a little bit when registering courses @ CityU

This repo is folked from [lhc70000/AutoCRN_Chrome](https://github.com/lhc70000/AutoCRN_Chrome) to solve "This extension is no longer available because it doesn't follow best practices for Chrome extensions."

## Introduction

This is a Chrome extension which provides the following features:
- Fill in CRNs automatically
- Submit CRNs automatically
- Refresh every 5 minutes to avoid session timeout
- Auto refresh at an exact time
- Retry when page load time > 10s
- **Updated to Manifest V3 for Chrome Web Store compliance**

## Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "AutoCRN" or use the direct link
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Features

- **CRN Management**: Add, edit, and save up to 10 CRN numbers
- **Auto-fill**: Automatically fills CRN fields on the registration page
- **Session Management**: Keeps your session alive with automatic refresh
- **Scheduled Refresh**: Set specific times for automatic page refresh
- **Smart Validation**: Validates CRN format and time inputs
- **Error Handling**: Comprehensive error handling and user feedback

## Usage

1. **Add CRNs**: Click the extension icon and add your CRN numbers
2. **Configure Settings**: Set up automatic refresh and session management
3. **Navigate to Registration**: Go to the CityU course registration page
4. **Auto-fill**: The extension will automatically fill in your CRNs
5. **Submit**: Review and submit the form

## Technical Details

- **Manifest Version**: 3 (Chrome Web Store compliant)
- **Permissions**: `activeTab`, `storage`
- **Host Permissions**: `https://banweb.cityu.edu.hk/*`
- **Content Scripts**: Run at `document_end` for better performance
- **Background Service Worker**: Handles extension lifecycle and messaging

## Recent Updates (v1.0.2)

- ✅ Upgraded to Manifest V3
- ✅ Fixed deprecated Chrome APIs
- ✅ Improved error handling and validation
- ✅ Better content script behavior
- ✅ Enhanced user feedback and messaging
- ✅ Chrome Web Store compliance

## Browser Compatibility

- Chrome 88+ (Manifest V3 support required)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Development

### Project Structure
```
AutoCRN_Chrome/
├── manifest.json          # Extension manifest (V3)
├── popup.html            # Extension popup interface
├── main.js               # Popup logic and settings
├── add_crn.js            # Content script for form filling
├── background.js         # Service worker (V3 requirement)
├── package.json          # Project dependencies
└── icons/                # Extension icons
```

### Building
No build process required. Simply load the extension folder in Chrome's developer mode.

## Important Notes

- **Please read and understand the regulations and restrictions of ARRO** before using this extension
- This extension is designed to assist with course registration but should be used responsibly
- The developer is not responsible for any consequences of using this extension
- Always verify your course selections before submitting

## Troubleshooting

### Common Issues
1. **Extension not working**: Ensure you're on the correct CityU registration page
2. **CRNs not saving**: Check that CRN numbers are 4-5 digits
3. **Settings not applying**: Try refreshing the page after saving settings

### Error Messages
- "Invalid CRN Number": Check that CRN is 4-5 digits only
- "Invalid Time Format": Ensure time is in HH:MM format (00-23:00-59)
- "Maximum 10 CRNs allowed": Remove some CRNs before adding more

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.

## Disclaimer

This extension is experimental and provided as-is. Use at your own risk and in accordance with CityU's policies and regulations.
