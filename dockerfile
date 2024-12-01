# Use the official Kestra image as the base
FROM kestra/kestra:latest

# Set user to root to allow installing dependencies
USER root

# Install git before installing Python packages
RUN apt-get update && apt-get install -y git

# Install required Python packages
RUN pip install opencv-python-headless boto3 numpy kestra requests GitPython

# Set the default command to run Kestra
CMD ["server", "standalone"]
