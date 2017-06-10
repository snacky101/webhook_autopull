REPOSITORY="/root/music_chart"
cd $REPOSITORY
pm2 stop app.js
git pull
npm install
pm2 start app.js
