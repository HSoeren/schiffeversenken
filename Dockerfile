FROM lipanski/docker-static-website:latest

COPY . .

# docker build --platform linux/amd64 -t bogenscheibe:1 .