# pycon2020_videos.py
# Get PyCon2020 video information
import os
from pathlib import Path
from dotenv import load_dotenv

import re
import time
import random
from typing import Dict, Tuple, List, NamedTuple, Iterator

import json
from pprint import pprint

from bs4 import BeautifulSoup
from requests import Session
from requests.exceptions import HTTPError

from collections import defaultdict
from collections import namedtuple

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)
YOUTUBE_KEY = os.getenv('YOUTUBE_KEY')
SECTIONS = {"tutorials", "talks", "sponsor-workshops"}
ALLOWABLE_QUERY_COUNT_PER_A_TRY = 50

class Video(NamedTuple):
    Author: str
    Bio: str
    Title: str
    Description: str
    Video_link: str
    Video_id: str


def get_whole_html(url: str, human_like:bool= False) -> BeautifulSoup:
    with Session() as session:
        if not human_like:
            resp = session.get(url)
        else:
            time.sleep(1 + 2*random.random())
            resp = session.get(url)
            
        if resp.ok:
            soup = BeautifulSoup(resp.content, "html.parser")
        else:
            raise HTTPError("Something went wrong.")
    return soup


def get_video_lists(soup: BeautifulSoup) -> Dict[str, List[Video]]:
    videos = defaultdict(list) 
    
    for id_ in SECTIONS:
        print(f"Web scraping for section '{id_}' starts.")
        ul = soup.find("h1", {"id": f"{id_}"}).next.next.next  # ul
        for li in ul.find_all('li'):
            # 1. extract video title and link
            element = li.find('a')
            title = element.text
            if element.has_attr('href'):
                video_link = element.get('href')
                if 'watch?v=' in video_link:
                    video_id = re.search(r'watch\?v=(?P<id>[\w-]*)', video_link).group('id').strip()
                else:
                    video_id = video_link.rsplit('/')[-1]
            else:
                print('The video "{title}" does not have a link.')

            # 2. extract author information
            # link to another page via a given link ('Tutorial description')
            try:
                author = re.search(r'- (?P<author>.*?) -', element.next_sibling, re.DOTALL).group('author').strip()
                tutorial_element = element.next_sibling.next_sibling
                if not tutorial_element.has_attr('href'):
                    tutorial_url = ""
                tutorial_url = tutorial_element.get('href')
                description, bio = get_author_info(tutorial_url)
            except:
                author = description = bio = ""
                
            video = Video(author, bio, title, description, video_link, video_id)
            videos[id_].append(video)
        print(f"Web scraping for section '{id_}' ends.")    
    return videos


def get_author_info(url: str) -> Tuple[str, str]:
    if not url:
        return "", ""
    
    base_url = "https://us.pycon.org"
    
    soup = get_whole_html(url, True)
    desc = '\n'.join([p.text for p in soup.select('.description > p')]) # find('div', {"class": "description"}).next.text

    bio_url = base_url + soup.find(text="Presented by:").next.next.get('href')
    bio_soup = get_whole_html(bio_url, True)
    bio = '\n'.join([p.text
                     for p in bio_soup.find(text="Presentations").parent.parent.select('div > p')
                     if not any(['a.m' in p.text, 'p.m' in p.text])
                    ])
    
    return desc, bio


def get_video_strings(video_list: List[Video]) -> str:
    return ','.join(video.Video_id for video in video_list if video.Video_id.strip())


def get_video_statistics(video_string: str) -> Dict:
    youtube_api_base = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "id": video_string,
        "key": YOUTUBE_KEY,
        "part": "statistics"
    }
    with Session() as session:
        resp = session.get(youtube_api_base, params=params)
        if resp.ok:
            result = resp.json()
            print("Done with getting video statistics.")
        else:
            print(f"Status code on error: {resp.status_code}")
            raise HTTPError("Something went wrong.")
    return result


def cutter(video_string: str, length: int) -> Iterator[str]:
    pieces = length // ALLOWABLE_QUERY_COUNT_PER_A_TRY
    res = []
    for piece in range(pieces + 1):
        start = piece * ALLOWABLE_QUERY_COUNT_PER_A_TRY
        end = start + 50
        yield ','.join(video_string.split(',')[start:end])


def organize_item(items: Dict[str, str]) -> Dict[str, Dict[str, int]]:
    res = defaultdict(dict)
    for item in items:
        id_ = item['id']
        res[id_].update({
            k: int(v)
            if v.isdigit()
            else v
            for k, v in item['statistics'].items()
        })
    return dict(res)


def merger(videos: List[Video], stats: Dict[str, Dict[str, int]]) -> List[Dict[str, str]]:
    res = []
    for video in videos:
        if video.Video_id in stats:
            video_stat = stats[video.Video_id]
            updated_dict = {**dict(video._asdict()), **video_stat}
            res.append(updated_dict)
    return res


if __name__ == '__main__':
    pycon = "https://us.pycon.org/2020/online/"
    html = get_whole_html(pycon)
    videos = get_video_lists(html)

    videos_dict = {}
    for section in SECTIONS:
        video_string = get_video_strings(videos[section])
        video_string_length = len(video_string.split(','))

        if video_string_length <= ALLOWABLE_QUERY_COUNT_PER_A_TRY:
            items = get_video_statistics(video_string)['items']
        else:
            items = []
            video_string_cutted = cutter(video_string, video_string_length)
            for string in video_string_cutted:
                items += get_video_statistics(string)['items']

        stats = organize_item(items)

        # joining datasets into a dict
        section_lists = merger(videos[section], stats)

        # assign a new dict for each section dict to be stored
        videos_dict[section] = section_lists

    with open('pycon2020_videos.json', 'w') as fp:
        json.dump(videos_dict, fp, ensure_ascii=False, indent=4)