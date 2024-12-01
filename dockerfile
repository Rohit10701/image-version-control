# Use the official Kestra image as the base
FROM kestra/kestra:latest

# Set user to root to allow installing dependencies
USER root

# Install required Python packages
RUN pip install opencv-python-headless numpy kestra requests GitPython

# Set the default command to run Kestra
CMD ["server", "standalone"]
