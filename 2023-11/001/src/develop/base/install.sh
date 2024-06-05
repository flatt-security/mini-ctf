apt upgrade -y
apt update -y
apt install -y \
       jq \
       curl \
       bash \
       docker \
       docker-compose
apt clean
npm update -g
npm install -g npm
