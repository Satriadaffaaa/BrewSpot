# Non-Functional Requirements - Lokali 📍

This document outlines the quality attributes and constraints for the Lokali platform.

## 1. Performance
| ID | Requirement | Description |
| :--- | :--- | :--- |
| NFR-01 | Page Load Time | Initial page load should be under 3 seconds on a 4G connection. |
| NFR-02 | Search Response | Search results and autocomplete suggestions must appear within 500ms. |
| NFR-03 | Map Rendering | Map markers and layers should render smoothly without significant lag when panning/zooming. |
| NFR-04 | Image Optimization | Images must be automatically resized and optimized (via Cloudinary) to reduce bandwidth usage. |

## 2. Scalability & Availability
| ID | Requirement | Description |
| :--- | :--- | :--- |
| NFR-05 | Cloud-Native | The system must be hosted on scalable cloud infrastructure (Firebase/Cloudflare). |
| NFR-06 | Uptime | The platform should aim for 99.9% availability. |
| NFR-07 | Database Scalability | Firestore must be configured to handle concurrent reads/writes from thousands of users. |

## 3. Security & Privacy
| ID | Requirement | Description |
| :--- | :--- | :--- |
| NFR-08 | Authentication | All sensitive actions (Add spot, review, admin) must require a valid JWT via Firebase Auth. |
| NFR-09 | Data Protection | Firestore Security Rules must ensure that users can only edit/delete their own content. |
| NFR-10 | API Security | API endpoints must be protected against common attacks (SQL Injection, XSS, CSRF). |
| NFR-11 | Bot Protection | Critical forms (Login, Register, Add Spot) must use Cloudflare Turnstile for bot prevention. |

## 4. Usability
| ID | Requirement | Description |
| :--- | :--- | :--- |
| NFR-12 | Responsive Design | The platform must be fully functional on Desktop, Tablet, and Mobile devices. |
| NFR-13 | Accessibility | The UI should follow WCAG 2.1 Level AA guidelines for accessibility. |
| NFR-14 | Intuitive UI | Navigation should be simple, with common actions (Search, Add Spot) accessible within 2 clicks. |

## 5. Reliability & Maintainability
| ID | Requirement | Description |
| :--- | :--- | :--- |
| NFR-15 | Error Handling | The system must provide user-friendly error messages (e.g., using SweetAlert2) instead of raw stack traces. |
| NFR-16 | Code Standards | The codebase must follow the feature-based architecture and naming conventions defined in `GEMINI.md`. |
| NFR-17 | Logging | Critical events (Errors, AI failures, Admin actions) must be logged for auditing. |
| NFR-18 | Backup | Data stored in Firestore and Cloudinary must be backed up periodically. |
