# Changelog

All notable changes to the Hajjefy MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-30

### Added
- **Intelligent Name Variation Matching for Salesforce**: Automatically tries multiple name formats when searching Salesforce
  - Converts account codes to company names (e.g., "THOMSONREU" → "Thomson Reuters")
  - Extracts company name prefixes from account codes
  - Tests multiple variations until a match is found
  - Significantly improves match success rate for abbreviated account codes

### Fixed
- Fixed axios interceptor to preserve error response objects for proper 404 handling
- Improved Salesforce account matching reliability with fuzzy matching threshold of 60%

### Changed
- Enhanced Salesforce integration with better error handling and logging
- Improved customer analysis Salesforce data display

## [1.0.1] - 2025-11-29

### Added
- Salesforce CRM integration for customer analysis
- JSforce for direct Salesforce API connectivity
- Fuzzy name matching for automatic account linkage
- 5-minute intelligent caching to minimize Salesforce API calls
- Salesforce data in PDF export functionality

### Changed
- Moved Salesforce Account Information to top of customer analysis
- Removed redundant Customer Information section

## [1.0.0] - 2025-09-22

### Added
- Initial release
- Time tracking summary tool
- User analytics tool
- Team overview tool
- Billable analysis tool
- Customer analysis tool
- Capacity analysis tool
- Daily hours breakdown
- TAM insights tool
- Sync status tool
- Data export functionality (JSON/CSV)
