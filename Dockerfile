# Use the official Ruby image from the Docker Hub
FROM docker.io/ruby:3.1

# Install dependencies
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# Set the working directory
WORKDIR /usr/src/app

# Copy the Gemfile and Gemfile.lock into the image
COPY Gemfile* ./

# Install the gems specified in the Gemfile
RUN bundle install

# Copy the rest of the application code
COPY . .

# Expose the port that Jekyll will run on
EXPOSE 4000

# Command to run Jekyll server
CMD ["bundle", "exec", "jekyll", "serve", "--watch", "--host", "0.0.0.0"]
