# Image Version Control System

## Project Overview

This project is a sophisticated image version control system that leverages modern cloud-native technologies to provide advanced image management, processing, and collaboration capabilities.

## Key Features

- Image version tracking
- Built-in image editor
- Version graph visualization
- Branching and merging
- Collaborative workspace management

## Kestra: The Workflow Orchestration Backbone

### What is Kestra?

Kestra is a powerful workflow orchestration tool that acts as the central nervous system of our image version control platform. Think of it like a conductor of an orchestra, carefully coordinating complex processes and ensuring each step of image processing happens precisely and reliably.

### Kestra's Critical Roles in Our Project

#### 1. Image Processing Pipeline

Kestra manages two fundamental workflows that are crucial to our image version control system:

##### Pixel Extraction Workflow
**Purpose**: Transform raw image data into a compact, storable format
**Process Breakdown**:
- Receives base64 encoded image file
- Decodes image to a numerical representation
- Extracts pixel information
- Generates a compact pixel string with metadata
- Associates the processed image with a specific workspace

**Example Workflow**:
```yaml
tasks:
  - id: extract_pixels_to_string
    type: io.kestra.plugin.scripts.python.Commands
    containerImage: python:slim
    commands:
      - python extract_pixels_to_string.py
```

##### Image Reconstruction Workflow
**Purpose**: Retrieve and rebuild images from stored pixel data
**Process Breakdown**:
- Fetches artifact URL from S3 storage
- Retrieves specific commit hash
- Downloads and checks out repository state
- Reconstructs full image from stored pixel information
- Converts back to a viewable image format

#### 2. Distributed Task Management

Kestra enables our system to:
- Execute complex image processing tasks
- Manage environment-specific configurations
- Handle dynamic workflow triggers
- Provide scalable, reproducible processing environments

### Technical Architecture of Kestra Integration

#### Key Components
- **Webhook Triggers**: Initiate workflows via HTTP endpoints
- **Python Script Execution**: Process images using containerized tasks
- **Multi-environment Support**: Consistent behavior across different setups

### Why Kestra Matters

1. **Reproducibility**: Ensures consistent image processing
2. **Scalability**: Easily handle varying workload complexities
3. **Flexibility**: Adapt workflows to changing requirements
4. **Observability**: Comprehensive logging and monitoring

## System Architecture

### Components
- **Frontend**: Web-based image editing interface
- **Backend (Node.js)**: REST API and business logic
- **Kestra**: Workflow orchestration
- **PostgreSQL**: Metadata and version tracking
- **LocalStack S3**: Image and artifact storage

## Development Environment

### Prerequisites
- Node.js
- Python
- Docker
- PostgreSQL
- Kestra
- LocalStack

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/Rohit10701/image-version-control.git

cd image-version-control

# Start services
docker-compose up -d

# Install dependencies
npm install
```

## Challenges and Learnings

- Complex workflow configuration
- Handling large-scale image processing
- Ensuring consistent state management

## Future Roadmap
- Enhanced image editing features
- Improved merge conflict resolution
- Performance optimizations

## Contributing

Contributions are welcome! Please review our contribution guidelines.
