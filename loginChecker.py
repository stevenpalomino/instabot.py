#!/usr/bin/env python
# -*- coding: utf-8 -*-

import atexit
import datetime
import itertools
import os
import json
import logging
import random
import signal
import sys

sys.path.append(os.path.join(sys.path[0], 'src'))


if 'threading' in sys.modules:
    del sys.modules['threading']
import time
import requests
from unfollow_protocol import unfollow_protocol
from userinfo import UserInfo


def main():
    e = ''
    global communication
    communication = ""

    print("Running script")
    #print (sys.argv[1])
    #for line in sys.argv[1]:
        #communication = line[:-1]
        #print json.dumps(json.loads(line))
    
    #print(sys.argv[1])
    e = json.loads(sys.argv[1])
    #print(e)
    #print(json.dumps(e["username"]))
    #e = json.loads(sys.argv[1])
    #print(e)

    global username
    global password
    global hashtags
    global rate
    username = e["username"]
    password = e["password"]
    hashtags = e["hashtags"]
    rate = e["rate"]
    #print(hashtags)
    #print(rate)
    #print(username)
    #print("before login")
    login()



def login():
    accept_language = 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
    user_agent = ("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36")
    url = 'https://www.instagram.com/'
    url_tag = 'https://www.instagram.com/explore/tags/%s/?__a=1'
    url_likes = 'https://www.instagram.com/web/likes/%s/like/'
    url_unlike = 'https://www.instagram.com/web/likes/%s/unlike/'
    url_comment = 'https://www.instagram.com/web/comments/%s/add/'
    url_follow = 'https://www.instagram.com/web/friendships/%s/follow/'
    url_unfollow = 'https://www.instagram.com/web/friendships/%s/unfollow/'
    url_login = 'https://www.instagram.com/accounts/login/ajax/'
    url_logout = 'https://www.instagram.com/accounts/logout/'
    url_media_detail = 'https://www.instagram.com/p/%s/?__a=1'
    url_user_detail = 'https://www.instagram.com/%s/?__a=1'

    user_id = 0
    s = requests.Session()



    log_string = 'Trying to login as %s...\n' % (username)
    print(log_string)
    s.cookies.update({
        'sessionid': '',
        'mid': '',
        'ig_pr': '1',
        'ig_vw': '1920',
        'csrftoken': '',
        's_network': '',
        'ds_user_id': ''
    })
    login_post = {
        'username': username,
        'password': password
    }
    s.headers.update({
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': accept_language,
        'Connection': 'keep-alive',
        'Content-Length': '0',
        'Host': 'www.instagram.com',
        'Origin': 'https://www.instagram.com',
        'Referer': 'https://www.instagram.com/',
        'User-Agent': user_agent,
        'X-Instagram-AJAX': '1',
        'X-Requested-With': 'XMLHttpRequest'
    })
    r = s.get(url)
    s.headers.update({'X-CSRFToken': r.cookies['csrftoken']})
    time.sleep(5 * random.random())
    login = s.post(
        url_login, data=login_post, allow_redirects=True)
    s.headers.update({'X-CSRFToken': login.cookies['csrftoken']})
    csrftoken = login.cookies['csrftoken']
    time.sleep(5 * random.random())

    if login.status_code == 200:
        r = s.get('https://www.instagram.com/')
        finder = r.text.find(username)
        if finder != -1:
            ui = UserInfo()
            user_id = ui.get_user_id_by_login(username)
            login_status = True
            log_string = '%s login success!' % (username)
            print(log_string)
            print('200')
            logout()
        else:
            login_status = False
            print('Login error. Check your login data!')
            print('444')
    else:
        print('Login error! Connection error!')
        print('443')


def logout():
    now_time = datetime.datetime.now()
    try:
        logout_post = {'csrfmiddlewaretoken': self.csrftoken}
        logout = s.post(url_logout, data=logout_post)
        #print("Logout success!")
        login_status = False
    except:
        print('200')


if __name__ == '__main__':
    main()



