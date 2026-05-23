from math import cos, sin, pi
from time import localtime, time
from random import randint
from itertools import combinations

next_page = [0, 3, 1, 2]
spin_center = [123, 352]
speed = []
extend_r = [0, 10, 18, 25, 32, 38, 43, 48, 52, 56, 60, 63, 66, 68, 71, 73, 75, 76, 78, 79, 80, 82, 83, 83, 84, 85, 86,
            86, 87, 87, 88, 88, 88, 89, 89, 89, 89, 90, 90, 90, 90, 90, 91]
for i in range(8):
    for j in range(8):
        speed.append(i+1)
for i in range(24):
    speed.append(8)
for i in range(8, 0, -1):
    for j in range(8):
        speed.append(i)
length = len(speed)
# cutter radius=body radius
# digger radius=72
# eye height is a little smaller than face_radius*0.25
# face_radius*0.08
# in_coords(7, 12, 192, 37, event)

# centipede color: #333333 #8BC256 #729C45


def convert(sec: int = 0):
    result = ""
    if sec >= 3600:
        result += str(int(sec/3600)) + " h "
        sec %= 3600
    if sec >= 60:
        result += str(int(sec/60)) + " min "
        sec %= 60
    result += str(sec) + " sec"
    return result


def pos(r: float, d: float, cen_x: int = spin_center[0], cen_y: int = spin_center[1]):
    d = d * pi / 180
    x: int = 0
    y: int = 0
    if 0 <= d < 90:  # first quadrant
        x = int(r * cos(d) + cen_x)
        y = int(-r * sin(d) + cen_y)
    elif 90 <= d < 180:  # 2nd quadrant
        d = 180 - d
        x = int(-r * cos(d) + cen_x)
        y = int(-r * sin(d) + cen_y)
    elif 180 <= d < 270:  # 3rd quadrant
        d = d - 180
        x = int(-r * cos(d) + cen_x)
        y = int(r * sin(d) + cen_y)
    elif 270 <= d < 360:  # 4th quadrant
        d = 360 - d
        x = int(r * cos(d) + cen_x)
        y = int(r * sin(d) + cen_y)
    res = (x, y)
    return res


def str_num(x):
    if 0 <= x <= 9:
        return "0"+str(x)
    else:
        return str(x)


def in_window(x, y):
    return 50 <= x <= 150 and 50 <= y <= 150


def edges(ex1, ey1, ex2, ey2, x, y):  # p1: top left; p2: bottom right
    x = max(x, ex1)
    x = min(x, ex2)
    y = max(y, ey1)
    y = min(y, ey2)
    ans = (x, y)
    return ans


def lazy(lazy_dir, dir_):
    if lazy_dir == dir_:
        return dir_
    a = abs(lazy_dir - dir_)
    if a > 180:
        a = 360 - a
    if a <= 16:
        return dir_
    if (lazy_dir > dir_ and lazy_dir - dir_ <= 180) or (lazy_dir < dir_ and dir_ - lazy_dir >= 180):  # lazy 倒退
        lazy_dir = (lazy_dir - 16) % 360
    else:
        lazy_dir = (lazy_dir + 16) % 360
    return lazy_dir


def get_centipede_time():
    hour = localtime().tm_hour
    minute = localtime().tm_min
    ans = []
    if hour < 10:
        ans.append(0)
    else:
        ans.append(hour//10)
    ans.append(hour % 10)
    if minute < 10:
        ans.append(0)
    else:
        ans.append(minute//10)
    ans.append(minute % 10)
    ans.append("")
    return ans


def locate_r_idx(_r: int = 0):
    for i in range(42):
        if extend_r[i] <= _r <= extend_r[i+1]:
            return i


def fail_list(x: int = 2):
    res = list(combinations([0, 1, 2, 3, 4], x))
    return res[randint(0, len(res) - 1)]


def rotate_speed(x):
    return x if x < 24 else 24
