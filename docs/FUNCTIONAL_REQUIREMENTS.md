# Functional Requirements - Lokali 📍

This document outlines the functional requirements for the Lokali platform, categorized by system modules and user roles.

## 1. Core Platform (Search & Discovery)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-01 | Interactive Map | System must display an interactive map using Mapbox/OpenStreetMap. | High |
| FR-02 | Location Search | Users must be able to search for locations by name, category, or city. | High |
| FR-03 | Real-time Autocomplete | Search bar must provide suggestions as the user types. | Medium |
| FR-04 | Category Filtering | Users must be able to filter spots by categories (Food, Sightseeing, etc.). | High |
| FR-05 | Tag Filtering | Users must be able to filter spots by specific tags (Work-friendly, Viral, etc.). | Medium |
| FR-06 | Spot Details | System must display full details of a spot, including photos, description, and operating hours. | High |

## 2. User & Community (Social)
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-07 | User Authentication | Users must be able to register, login, and manage their passwords. | High |
| FR-08 | Add New Spot | Registered members must be able to submit new locations. (Restricted fields: Menu/Hours are Owner/Admin only). | High |
| FR-09 | Review & Rating | Members must be able to write reviews, give star ratings, and upload photos/videos. | High |
| FR-10 | Like/Favorite | Members must be able to save spots to their personal "Favorites" list. | Medium |
| FR-11 | User Profile | Members must have a profile page showing their stats, badges, and contribution history. | Medium |
| FR-12 | Report Content | Users must be able to report inappropriate spots, reviews, or photos. | High |

## 3. Gamification & Engagement
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-13 | Geolocation Check-in | Members can check-in if their GPS coordinates are within 100m of the spot. | Medium |
| FR-14 | XP System | Members earn Experience Points (XP) for every contribution (Add spot, review, check-in). | Medium |
| FR-15 | Badge System | System automatically awards badges based on specific milestones (e.g., "Foodie", "Explorer"). | Low |
| FR-16 | Leaderboard | System displays a global ranking of members based on accumulated XP. | Low |

## 4. AI Features
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-17 | AI Vibe Check | System uses AI (Gemini) to summarize reviews into "Pros", "Cons", and "Verdict". | Medium |
| FR-18 | Auto-Tagging | AI analyzes spot descriptions and photos to suggest relevant tags automatically. | Low |

## 5. Business Management
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-19 | Claim Business | Users can apply to claim ownership of an existing spot with proof of legality. | High |
| FR-20 | Official Content | Verified owners can manage official menus, business hours, and professional photos via Business Dashboard. | High |
| FR-21 | Business Analytics | Owners can view statistics on spot views and check-in counts. | Medium |

## 6. Administration & Moderation
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| FR-22 | Content Moderation | Admins must be able to approve, reject, or hide pending spots and reviews. | High |
| FR-23 | User Management | Admins can view user lists, change roles, or ban users for violations. | High |
| FR-24 | Verification Workflow | Admins must be able to review and verify business claim applications. | High |
| FR-25 | Platform Analytics | Admins can view growth charts (New users, spots, reviews) and search trends. | Medium |
| FR-26 | AI Sync | Admins can manually trigger a re-generation of AI summaries for specific spots. | Low |
