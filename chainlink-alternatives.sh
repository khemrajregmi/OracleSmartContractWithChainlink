# Alternative Chainlink Docker setup
# Try different version or approach

# Option 1: Use older Chainlink version
docker run -d \
  --name chainlink_node \
  --platform linux/amd64 \
  -p 6688:6688 \
  -v "./chainlink:/chainlink" \
  -e DATABASE_URL="postgresql://postgres:password@postgres:5432/chainlink?sslmode=disable" \
  --network chainlink_chainlink-network \
  smartcontract/chainlink:1.13.0 \
  local node

# Option 2: Initialize node first
docker run -it \
  --platform linux/amd64 \
  -v "./chainlink:/chainlink" \
  smartcontract/chainlink:2.9.0 \
  admin users create --email=user@chain.link --password=password
