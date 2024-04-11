mkdir creds
cp -n bot_creds_template.json creds/bot_creds_prod.json
cp -n bot_creds_template.json creds/bot_creds_dev.json
echo "Bot creds template copied to creds/bot_creds.json, please fill in the keys and such"
nvm install --lts
npm install
npm install pm2 -g

mkdir backups/