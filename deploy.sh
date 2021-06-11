echo "> update static files ..."
python manage.py collectstatic --noinput
echo "> restart uwsgi"
echo "> reload nginx"
sudo systemctl reload nginx
