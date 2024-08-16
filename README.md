# Fragments Microservice

- Initial setup of the back-end microservice project.

## Overview

**Fragments** is a microservice built with Node.js that allows users to create, update, delete, and retrieve data fragments (small pieces of content). The service supports different content types such as plain text, markdown, JSON, and various image formats. It also supports converting between certain formats (e.g., markdown to HTML, image resizing).

This service is designed to be highly scalable and can be deployed using Docker. It uses AWS DynamoDB for storing metadata about the fragments and AWS S3 for storing the fragment data itself. The service also uses the `sharp` library for image processing and format conversion.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Creating a Fragment](#creating-a-fragment)
  - [Retrieving Fragments](#retrieving-fragments)
  - [Updating Fragments](#updating-fragments)
  - [Deleting Fragments](#deleting-fragments)
  - [Format Conversions](#format-conversions)
- [Local Development](#local-development)
  - [Docker Setup](#docker-setup)
  - [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Before you start, make sure you have the following installed on your machine:

- **Node.js** (>= 18.17.0)
- **Docker** and **Docker Compose**
- **AWS CLI** configured with access to DynamoDB and S3 (for local development with LocalStack)

## API Endpoints

### Authentication

This service uses AWS Cognito for authentication. Ensure you have valid AWS Cognito credentials and set them in the environment variables.

### Creating a Fragment

```
POST /v1/fragments
```

Create a new fragment by sending raw data in the request body. The Content-Type header determines the type of fragment.

### Retrieving Fragments

```
GET /v1/fragments
GET /v1/fragments/:id
```

Retrieve all fragments for the authenticated user or a specific fragment by ID. Supports retrieving metadata or the actual data.

### Updating Fragments

```
PUT /v1/fragments/:id
```

Update an existing fragment by sending new data in the request body. The Content-Type must match the fragment's existing type.

### Deleting Fragments

```
DELETE /v1/fragments/:id
```

Delete a specific fragment by ID.

### Format Conversions

Certain content types support conversion, such as:

- Markdown to HTML
- Image format conversion (e.g., PNG to JPEG)

Use extensions in the URL to request the converted format:

```
GET /v1/fragments/:id.html
GET /v1/fragments/:id.png
```

## Local Development

### Docker Setup

Ensure Docker and Docker Compose are installed. Start the services:

```
docker compose up --build -d
```

### Running Tests

This project uses Jest for testing. To run tests, use the following command:

```
npm test
```

Ensure that the LOG_LEVEL is set to debug in env.jest for more detailed test logs.

## Deployment

Deployment can be handled by deploying the Docker image to a cloud platform like AWS ECS, GCP, or Azure. Ensure that the necessary AWS credentials are available in the environment where the service is deployed.

## Troubleshooting

- **Cannot do operations on a non-existent table:** Ensure the DynamoDB table is created before the service tries to access it. Use the provided script or AWS CLI to create and verify the table.
- **Sharp module errors:** Ensure Node.js version is compatible with sharp and the correct dependencies are installed. For Docker, the Node.js version should be >= 18.17.0.
