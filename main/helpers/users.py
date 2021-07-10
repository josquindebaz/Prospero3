def setPassword(user, password):
    user.set_password(password)
    user.save()
