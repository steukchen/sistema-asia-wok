# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

show me the flow of my app web restaurant asia wok

*Session: b6370fee2da6b594a8ac9b08570ebff9 | Generated: 5/7/2025, 22:49:44*

### Analysis Summary

# Web Restaurant Application Flow: Asia Wok

This report outlines the architectural flow of the Asia Wok web application, detailing the interaction between its primary components: the **Frontend** (Next.js) and the **Backend** (FastAPI).

## High-Level Architecture

The Asia Wok application operates on a client-server model. The **Frontend** serves as the user interface, handling all user interactions and presenting data. The **Backend** acts as the API server, managing business logic, data persistence, and authentication. Communication between the two is facilitated via RESTful API calls.

```
+-------------------+       HTTP/REST       +-------------------+
|                   | <-------------------> |                   |
|     Frontend      |                       |      Backend      |
|   (Next.js App)   |                       |    (FastAPI)      |
|                   | <-------------------> |                   |
+-------------------+                       +-------------------+
                                                    |
                                                    | Database
                                                    v
                                            +-------------------+
                                            |                   |
                                            |     Database      |
                                            | (e.g., SQLite, PG)|
                                            |                   |
                                            +-------------------+
```

## Frontend Component

The **Frontend** is a Next.js application responsible for rendering the user interface and managing client-side logic. It consumes data and services provided by the **Backend** API.

*   **Purpose:** Provides the user-facing interface for browsing menus, placing orders, managing user profiles, and administrative tasks.
*   **Internal Parts:**
    *   **Application Pages:** Located in [frontend/src/app](frontend/src/app), these define the main routes and views of the application. Key routing groups include [frontend/src/app/(auth)](frontend/src/app/(auth)) for authentication-related pages, [frontend/src/app/(main)](frontend/src/app/(main)) for core application features, and [frontend/src/app/(protected)](frontend/src/app/(protected)) for routes requiring authentication.
    *   **UI Components:** Reusable UI elements are organized within [frontend/src/components](frontend/src/components). This includes general UI components in [frontend/src/components/ui](frontend/src/components/ui), authentication-specific components in [frontend/src/components/auth](frontend/src/components/auth), and administrative components in [frontend/src/components/admin](frontend/src/components/admin).
    *   **Hooks:** Custom React hooks, found in [frontend/src/hooks](frontend/src/hooks), encapsulate logic for interacting with the backend API and managing state. Examples include [useCrudManagement.ts](frontend/src/hooks/useCrudManagement.ts) for generic CRUD operations and [useOrderManagement.ts](frontend/src/hooks/useOrderManagement.ts) for order-specific logic.
    *   **Types:** TypeScript type definitions for data structures are located in [frontend/src/types/index.ts](frontend/src/types/index.ts).
*   **External Relationships:** Makes HTTP requests to the **Backend** API to fetch data, send user input, and perform actions like login, registration, ordering, and managing menu items.

## Backend Component

The **Backend** is a FastAPI application that serves as the API layer for the application. It handles business logic, interacts with the database, and provides data to the frontend.

*   **Purpose:** Provides a robust and secure API for managing users, authentication, menu items (platos), and orders (pedidos).
*   **Internal Parts:**
    *   **Main Application Entry Point:** The FastAPI application is initialized and run from [backend/main.py](backend/main.py).
    *   **API Endpoints:** Defined within [backend/app/api/endpoints](backend/app/api/endpoints), these modules expose the various functionalities of the application:
        *   [auth.py](backend/app/api/endpoints/auth.py): Handles user authentication (login, registration, token generation).
        *   [users.py](backend/app/api/endpoints/users.py): Manages user-related operations (e.g., creating, retrieving users).
        *   [platos.py](backend/app/api/endpoints/platos.py): Manages menu items (platos), including creation, retrieval, update, and deletion.
        *   [pedidos.py](backend/app/api/endpoints/pedidos.py): Manages customer orders (pedidos).
    *   **Dependencies:** Common dependencies for API routes, such as authentication checks, are defined in [backend/app/api/dependencies.py](backend/app/api/dependencies.py).
    *   **Core Configuration & Security:** Found in [backend/app/core](backend/app/core), this includes application settings in [config.py](backend/app/core/config.py) and security utilities (e.g., password hashing, token handling) in [security.py](backend/app/core/security.py).
    *   **Database Models:** Located in [backend/app/models](backend/app/models), these define the structure of the data stored in the database. Key models include [user.py](backend/app/models/user.py), [plato.py](backend/app/models/plato.py), and [pedido.py](backend/app/models/pedido.py). Database connection and utility functions are in [database.py](backend/app/models/database.py) and [db_utils.py](backend/app/models/db_utils.py).
    *   **Schemas:** Pydantic models for data validation and serialization are defined in [backend/app/schemas](backend/app/schemas). These ensure data consistency for API requests and responses (e.g., [user.py](backend/app/schemas/user.py), [plato.py](backend/app/schemas/plato.py), [pedido.py](backend/app/schemas/pedido.py), [tokens.py](backend/app/schemas/tokens.py)).
    *   **Scripts:** Utility scripts, such as [create_tables.py](backend/scripts/create_tables.py) for database initialization, are found in [backend/scripts](backend/scripts).
*   **External Relationships:** Connects to a database (e.g., PostgreSQL, SQLite) for data storage and retrieval. It serves JSON responses to the **Frontend** based on incoming HTTP requests.

## Application Flow

The typical flow within the Asia Wok application involves the following steps:

1.  **User Interaction (Frontend):** A user interacts with the web interface (e.g., navigates to a page, clicks a button, submits a form).
2.  **Frontend Request (Frontend to Backend):** The **Frontend** application, often using custom hooks like [useCrudManagement.ts](frontend/src/hooks/useCrudManagement.ts) or [useOrderManagement.ts](frontend/src/hooks/useOrderManagement.ts), constructs an HTTP request (GET, POST, PUT, DELETE) to a specific **Backend** API endpoint.
3.  **API Endpoint Processing (Backend):** The **Backend** receives the request.
    *   FastAPI routes the request to the appropriate endpoint function (e.g., in [backend/app/api/endpoints/platos.py](backend/app/api/endpoints/platos.py) for menu items).
    *   Dependencies (e.g., authentication from [backend/app/api/dependencies.py](backend/app/api/dependencies.py)) are resolved.
    *   Request data is validated against Pydantic schemas (e.g., [backend/app/schemas/plato.py](backend/app/schemas/plato.py)).
    *   Business logic is executed, often involving interaction with the database via SQLAlchemy models defined in [backend/app/models](backend/app/models).
4.  **Database Interaction (Backend):** The **Backend** performs necessary database operations (e.g., querying for menu items, inserting a new order, updating user information) using the database connection defined in [backend/app/models/database.py](backend/app/models/database.py).
5.  **Backend Response (Backend to Frontend):** The **Backend** constructs a JSON response, often based on Pydantic schemas, and sends it back to the **Frontend**.
6.  **Frontend Update (Frontend):** The **Frontend** receives the response.
    *   It processes the data.
    *   Updates the user interface accordingly (e.g., displays a list of menu items, shows a success message, redirects the user).

This continuous cycle of request-response enables the dynamic functionality of the Asia Wok web application.

