#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import time
import json
if 'threading' in sys.modules:
    del sys.modules['threading']
sys.path.append(os.path.join(sys.path[0], 'src'))

from check_status import check_status
from feed_scanner import feed_scanner
from follow_protocol import follow_protocol
from instabot import InstaBot
from unfollow_protocol import unfollow_protocol



def main():
    e = ''
    global communication
    communication = ""

    print("Running script")
    #print (sys.argv[1])
    #for line in sys.argv[1]:
        #communication = line[:-1]
        #print json.dumps(json.loads(line))
    e = json.loads(sys.argv[1])
    #print(json.dumps(json.loads(e)))
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
    scripty()

def scripty():
        bot = InstaBot(

        # lines = sys.stdin.readlines()
        # lines = json.loads(lines[0])
        # lines = lines[0]
        # e = json.loads(lines)
        # print e['password']
        # username = username + e["username"]
        login=username,
        password=password,
        like_per_day=rate,
        comments_per_day=0,
        tag_list=hashtags,
        tag_blacklist=['rain', 'thunderstorm'],
        user_blacklist={},
        max_like_for_one_tag=3,
        log_mod=0,
        proxy='',
        # Use unwanted_username_list to block usernames containing a string
        ## Will do partial matches; i.e. 'mozart' will block 'legend_mozart'
        ### 'free_followers' will be blocked because it contains 'free'
        unwanted_username_list=[
            'second', 'stuff', 'art', 'project', 'love', 'life', 'food', 'blog',
            'free', 'keren', 'photo', 'graphy', 'indo', 'travel', 'art', 'shop',
            'store', 'sex', 'toko', 'jual', 'online', 'murah', 'jam', 'kaos',
            'case', 'baju', 'fashion', 'corp', 'tas', 'butik', 'grosir', 'karpet',
            'sosis', 'salon', 'skin', 'care', 'cloth', 'tech', 'rental', 'kamera',
            'beauty', 'express', 'kredit', 'collection', 'impor', 'preloved',
            'follow', 'follower', 'gain', '.id', '_id', 'bags'
        ],
        unfollow_whitelist=['example_user_1', 'example_user_2'])
    
        while True:

            #print("# MODE 0 = ORIGINAL MODE BY LEVPASHA")
            #print("## MODE 1 = MODIFIED MODE BY KEMONG")
            #print("### MODE 2 = ORIGINAL MODE + UNFOLLOW WHO DON'T FOLLOW BACK")
            #print("#### MODE 3 = MODIFIED MODE : UNFOLLOW USERS WHO DON'T FOLLOW YOU BASED ON RECENT FEED")
            #print("##### MODE 4 = MODIFIED MODE : FOLLOW USERS BASED ON RECENT FEED ONLY")
            #print("###### MODE 5 = MODIFIED MODE : JUST UNFOLLOW EVERYBODY, EITHER YOUR FOLLOWER OR NOT")

            ################################
            ##  WARNING   ###
            ################################

            # DON'T USE MODE 5 FOR A LONG PERIOD. YOU RISK YOUR ACCOUNT FROM GETTING BANNED
            ## USE MODE 5 IN BURST MODE, USE IT TO UNFOLLOW PEOPLE AS MANY AS YOU WANT IN SHORT TIME PERIOD

            mode = 0

            #print("You choose mode : %i" %(mode))
            #print("CTRL + C to cancel this operation or wait 30 seconds to start")
            #time.sleep(30)

            if mode == 0:
                bot.new_auto_mod()

            elif mode == 1:
                check_status(bot)
                while bot.self_following - bot.self_follower > 200:
                    unfollow_protocol(bot)
                    time.sleep(10 * 60)
                    check_status(bot)
                while bot.self_following - bot.self_follower < 400:
                    while len(bot.user_info_list) < 50:
                        feed_scanner(bot)
                        time.sleep(5 * 60)
                        follow_protocol(bot)
                        time.sleep(10 * 60)
                        check_status(bot)

            elif mode == 2:
                bot.bot_mode = 1
                bot.new_auto_mod()

            elif mode == 3:
                unfollow_protocol(bot)
                time.sleep(10 * 60)

            elif mode == 4:
                feed_scanner(bot)
                time.sleep(60)
                follow_protocol(bot)
                time.sleep(10 * 60)

            elif mode == 5:
                bot.bot_mode = 2
                unfollow_protocol(bot)

            else:
                print("Wrong mode!")



if __name__ == '__main__':
    main()
