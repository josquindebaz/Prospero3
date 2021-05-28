del database.sql
rmdir main\migrations  /s /q
python manage.py makemigrations main
python manage.py migrate
python manage.py createsuperuser
