# Use Cases - Lokali 📍

This document provides a summary of the primary use cases for the Lokali platform. For detailed scenarios, refer to `docs/USE_CASE_SCENARIOS.md`.

## 👥 Actors
- **Visitor**: Unregistered user browsing for information.
- **Member**: Registered user contributing content and earning XP.
- **Business Owner**: Verified owner managing their business profile.
- **Admin**: System administrator and moderator.

## 🛠️ Use Case Catalog

### 1. Discovery & Search
| UC-ID | Title | Actor | Description |
| :--- | :--- | :--- | :--- |
| UC-01 | Search for Spots | Visitor, Member | Find locations by name or category on the map. |
| UC-02 | Filter Content | Visitor, Member | Narrow down spots by specific tags or categories. |
| UC-03 | AI Vibe Check | Visitor, Member | View an AI-generated summary of reviews for a spot. |
| UC-16 | Explore Trending | Visitor, Member | Discover popular spots based on community check-ins. |

### 2. Community Contribution
| UC-ID | Title | Actor | Description |
| :--- | :--- | :--- | :--- |
| UC-04 | Add New Spot | Member | Submit a new location with details and photos. |
| UC-05 | Write Review | Member | Provide a rating, text review, and media for a spot. |
| UC-06 | Geolocation Check-in | Member | Validate presence at a location to earn XP. |
| UC-10 | Report Content | Member, Admin | Flag inappropriate content for moderation. |
| UC-14 | Save Favorites | Member | Bookmark spots for future reference. |
| UC-15 | Edit/Delete Own Content | Member | Manage personal contributions (reviews/spots). |

### 3. User Management
| UC-ID | Title | Actor | Description |
| :--- | :--- | :--- | :--- |
| UC-11 | Manage Profile | Member | Update personal info and view contribution stats. |
| UC-12 | View Activity History | Member | Track the status of submitted spots and reviews. |
| UC-13 | View Leaderboard | Member | See global rankings based on XP. |

### 4. Business Management
| UC-ID | Title | Actor | Description |
| :--- | :--- | :--- | :--- |
| UC-07 | Claim Spot | Member | Apply for official ownership of a business profile. |
| UC-08 | Manage Official Content| Business Owner | Update menus, hours, and official photos. |
| UC-17 | View Business Analytics| Business Owner | Monitor spot views and check-in trends. |

### 5. Administration & Moderation
| UC-ID | Title | Actor | Description |
| :--- | :--- | :--- | :--- |
| UC-09 | Content Moderation | Admin | Approve or reject pending contributions. |
| UC-18 | Verify Business Claim | Admin | Review legal documents and grant Owner status. |
| UC-19 | AI Management | Admin | Manually trigger AI summary re-generation. |
| UC-20 | Platform Monitoring | Admin | View growth analytics and system health. |
| UC-21 | Search Insights | Admin | Analyze search trends to identify data gaps. |
| UC-22 | Data Aggregation | System | Automatically generate daily statistical snapshots. |
