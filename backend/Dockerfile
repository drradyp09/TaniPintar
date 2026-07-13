# Dockerfile for Backend

# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Gunicorn tuning:
#   --preload    load the app (and TFLite models) ONCE in the master, then fork
#                workers — cuts RAM ~Nx and speeds boot vs. per-worker loading.
#   -w 2         fewer workers; ML model + opencv make each worker memory-heavy.
#   --timeout    give slow model inference / boot room before worker is killed.
# Override worker count at runtime with GUNICORN_WORKERS.
CMD ["sh", "-c", "gunicorn --preload -w ${GUNICORN_WORKERS:-2} --timeout 120 -b 0.0.0.0:5000 run:app"]
