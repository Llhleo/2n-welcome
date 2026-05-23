# Digger 1.4
import tkinter as tk
from tkinter.simpledialog import askinteger
from PIL.Image import open
from PIL.ImageTk import PhotoImage
from calculation import *
from plyer import notification

window = tk.Tk()
window.title("Nerd")
window.iconbitmap("nerd_32.ico")
window.attributes("-topmost", True)
window.resizable(False, False)
c = tk.Canvas(window, width=200, height=200, borderwidth=-2)
c.pack()

# transparent
window.overrideredirect(True)
transparent_color = 'yellow'
transparent_rec = c.create_rectangle(0, 0, c.winfo_width(), c.winfo_height(), fill=transparent_color,
                                     outline=transparent_color)
window.wm_attributes('-transparentcolor', transparent_color)


page = 1  # digger: 1 centipede: 2
pga_width: float = 200
pga_height: float = 200
state = "animation"
button = False
mode = 1
tick_start = 0


# face
center_x = 100
center_y = 120
tri_height = 17
boost_flag = False
cutter_bg = c.create_rectangle(center_x-73, center_y-73, center_x+73, center_y+73, fill="#111111", width=0)
face = c.create_oval(center_x-53, center_y-53, center_x+53, center_y+53, fill="#999999", width=6, outline="#7B7B7B")
eye1_left = c.create_rectangle(center_x-7, center_y, center_x-20, center_y-25, fill="#232323")
eye1_right = c.create_rectangle(center_x+7, center_y, center_x+20, center_y-25, fill="#232323")
mouth_r = 17
mouth = c.create_arc(center_x+mouth_r, center_y+26-mouth_r*2, center_x-mouth_r, center_y+26, start=-130,
                     extent=85, style=tk.ARC, width=3, fill="#232323")       # 137, 60      263, 186
eye_left = c.create_rectangle(center_x-14, center_y-17, center_x-7, center_y-7, fill="#EEEEEE", width=0)
eye_right = c.create_rectangle(center_x+13, center_y-17, center_x+20, center_y-7, fill="#EEEEEE", width=0)
tri1 = c.create_polygon(center_x-20, center_y-25, center_x-6, center_y-25, center_x-6, center_y-17, fill='#999999')
tri2 = c.create_polygon(center_x+21, center_y-25, center_x+7, center_y-25, center_x+7, center_y-17, fill='#999999')
# moving
move = True
pre_x = 100
pre_y = 120
direction = 0
lazy_direction = direction
movement_dis: float = 1
stop = 0
# cutter. color:#F0F0F0
digger_d = 22
cutter_r = 84
cutter_dis = 147
spin_speed = 4
cutter_centers = []
cutter_d = []
cutters = []
for i in range(8):
    cutter_centers.append(pos(cutter_dis, digger_d, center_x, center_y))
    cutter_d.append(digger_d)
    cutters.append(c.create_oval(cutter_centers[i][0]-cutter_r, cutter_centers[i][1]-cutter_r,
                                 cutter_centers[i][0]+cutter_r, cutter_centers[i][1]+cutter_r, width=0,
                                 fill=transparent_color))
    digger_d = (digger_d + 45) % 360
# Health Bar
health_x = 100
health_y = 120
inc: float = 0
countdown_time = 1200
const_time = 1200
health_base_y = tk.PhotoImage(file="healthBar/digger_base.gif")
health_base = c.create_image(health_x-95, health_y-115, image=health_base_y, anchor="nw")
health_circle1 = c.create_oval(health_x-87, health_y-103, health_x-72, health_y-88, width=0, fill="#85DE48")
health_circle2 = c.create_oval(health_x-87, health_y-103, health_x-72, health_y-88, width=0, fill="#85DE48")
health_rec = c.create_rectangle(health_x-77, health_y-103, health_x+40, health_y-87, width=0, fill="#85DE48")
health_text_y = tk.PhotoImage(file="healthBar/digger_text.gif")
health_text = c.create_image(health_x-95, health_y-115, image=health_text_y, anchor="nw")

# centipede
centipede_y = -140
centipede_x = []
centipede_entities = []
centipede_time = []
centipede_img = tk.PhotoImage(file="centipede.gif")
for i in range(5):
    centipede_x.append(i*62)
    centipede_entities.append(c.create_image(centipede_x[i], centipede_y, image=centipede_img, anchor="nw"))
for i in range(5):
    centipede_time.append(c.create_text(centipede_x[i]+18, centipede_y, text="", font=("Arial Rounded MT Bold", 24),
                                        anchor="nw", fill="white"))
active_signal = c.create_oval(health_x-31, health_y-113, health_x-19, health_y-101, fill="#97E624", width=2,
                              outline="#70AB1B", state=tk.HIDDEN)

# craft
shadow = "#B18049"
r: int = 91
d = [18, 90, 162, 234, 306]
stop_t = 0
tick_ = 0
new_petal_d = 0
success_count = 0
succeed = False
coords = [pos(r, d[0]), pos(r, d[1]), pos(r, d[2]), pos(r, d[3]), pos(r, d[4])]
targets = []
rotate_pics = []
breaks = []
empty = tk.PhotoImage(file="petal/empty.gif")
photoImg = tk.PhotoImage(file="petal/ultra.gif")
crafted_image_x = open("petal/super.png")
crafted_image_var = PhotoImage(crafted_image_x)
new = crafted_image_var
crafted_pic = c.create_image(93, 93, anchor="nw", image=new, state=tk.HIDDEN)
for i in range(5):
    targets.append(c.create_rectangle(coords[i][0]-30, coords[i][1]-30, coords[i][0]+30, coords[i][1]+30, fill=shadow,
                   state=tk.HIDDEN, width=0))
    rotate_pics.append(c.create_image(coords[i][0], coords[i][1], anchor='center', image=photoImg))

# buttons
exit_button = c.create_rectangle(210, 140, 210+25, 140+25, fill="#ED573A", width=3, outline="#ED1C24")
mode_button = c.create_rectangle(210, 170, 210+25, 170+25, fill="#97E624", width=3, outline="#70AB1B")
version_text = c.create_text(6, 220, text="v1.0", font=("ubuntu", 13), anchor="sw", fill="white")
exit_id = 0
eb_state = 0


# basic operation
def on_resize(event):
    window.configure(width=event.width, height=event.height)
    c.coords(transparent_rec, 0, 0, c.winfo_width(), c.winfo_height())


def toggle_window(event):
    if state == "animation":
        return
    if window.overrideredirect():
        window.overrideredirect(False)
    else:
        window.overrideredirect(True)


def in_coords(xa, ya, xb, yb, event):
    return xa <= event.x <= xb and ya <= event.y <= yb


def in_mode_button(event):
    return ((page == 1 and 170 <= event.x <= 170+22 and 170 <= event.y <= 170+22) or
            (page == 2 and 218 <= event.x <= 218+22 and 140 <= event.y <= 140+22) or
            (page == 3 and 218 <= event.x <= 218+22 and 218 <= event.y <= 218+22))


def in_window_button(event):
    return ((page == 1 and 170 <= event.x <= 170+22 and 140 <= event.y <= 140+22) or
            (page == 2 and 218 <= event.x <= 218+22 and 100 <= event.y <= 100+22) or
            (page == 3 and 218 <= event.x <= 218+22 and 188 <= event.y <= 188+22))


# digger page
def update_cor(sp=False):
    c.coords(cutter_bg, center_x-73, center_y-73, center_x+73, center_y+73)
    c.coords(face, center_x-53, center_y-53, center_x+53, center_y+53)
    c.coords(eye1_left, center_x-7, center_y, center_x-20, center_y-25)
    c.coords(eye1_right, center_x+7, center_y, center_x+20, center_y-25)
    if boost_flag:
        c.coords(mouth, center_x + 19, center_y + 22 + 19 * 2, center_x - 19, center_y + 22)
    else:
        c.coords(mouth, center_x+mouth_r, center_y+26-mouth_r*2, center_x-mouth_r, center_y+26)
    c.coords(tri1, center_x-20, center_y-25, center_x-6, center_y-25, center_x-6, center_y-17)
    c.coords(tri2, center_x+21, center_y-25, center_x+7, center_y-25, center_x+7, center_y-17)
    c.coords(tri1, center_x-20, center_y-25, center_x-6, center_y-25, center_x-6, center_y-17)
    c.coords(tri2, center_x+21, center_y-25, center_x+7, center_y-25, center_x+7, center_y-17)
    if sp:
        c.coords(eye_left, center_x-14, center_y-17, center_x-7, center_y-7)
        c.coords(eye_right, center_x+13, center_y-17, center_x+20, center_y-7)
        for i in range(8):
            cutter_centers[i] = pos(cutter_dis, cutter_d[i], center_x, center_y)
            c.coords(cutters[i], cutter_centers[i][0] - cutter_r, cutter_centers[i][1] - cutter_r,
                     cutter_centers[i][0] + cutter_r, cutter_centers[i][1] + cutter_r)


def update_health(percent: int = -1):
    if percent == -1:
        x = int(countdown_time*158/const_time)
    else:
        x = int(percent*158/100)
    c.coords(health_rec, health_x-77, health_y-103, health_x-77+x, health_y-87)
    c.coords(health_circle2, health_x-87+x, health_y-103, health_x-72+x, health_y-88)


def update_centipede_time():
    t = get_centipede_time()
    for i in range(4):
        c.itemconfig(centipede_time[i], text=str(t[i]))


def boost(t: float = 100, idx: int = 0):
    if t < 0.3:
        global state, boost_flag
        boost_flag = False
        state = 'none'
        c.itemconfig(tri1, state=tk.HIDDEN)
        c.itemconfig(tri2, state=tk.HIDDEN)
        c.coords(mouth, center_x+mouth_r, center_y+26-mouth_r*2, center_x-mouth_r, center_y+26)
        c.itemconfig(mouth, start=-130, extent=83)
        return
    global spin_speed
    spin_speed = int((44-idx) / 7) + 2
    t *= 0.9
    update_health(100-int('%.0f' % t))
    window.after(9, boost, t, idx+1)


def cutter_spin():
    if page != 1:
        return
    for i in range(8):
        cutter_d[i] = (cutter_d[i]-spin_speed) % 360
        cutter_centers[i] = pos(cutter_dis, cutter_d[i], center_x, center_y)
        c.coords(cutters[i], cutter_centers[i][0]-cutter_r, cutter_centers[i][1]-cutter_r,
                 cutter_centers[i][0]+cutter_r, cutter_centers[i][1]+cutter_r)
    window.after(10, cutter_spin)


def cutter_speed_inc(t=0):
    if state != "inc" or page != 1:
        return
    global spin_speed
    spin_speed = speed[t]
    t += 1
    window.after(10, cutter_speed_inc, t % length)


def move():
    global movement_dis, stop, pre_x, pre_y, direction, lazy_direction, center_x, center_y
    if page != 1:
        return
    if not in_window(center_x, center_y):
        xy = edges(50, 50, 150, 150, center_x, center_y)
        center_x = xy[0]
        center_y = xy[1]
        movement_dis = 0.6
        pre_x = center_x
        pre_y = center_y
        direction = (direction+randint(90, 270)) % 360
    else:
        lazy_direction = lazy(lazy_direction, direction)
        move_eyes(lazy_direction)
        movement_dis += 0.6
        new_cor = pos(movement_dis, direction, pre_x, pre_y)
        center_x = new_cor[0]
        center_y = new_cor[1]
    update_cor()
    window.after(10, move)


def tick():
    global countdown_time
    clock = window.after(1000, tick)
    countdown_time -= 1
    if countdown_time < 0:
        global state, boost_flag
        state = 'animation'
        c.itemconfig(tri1, state=tk.NORMAL)
        c.itemconfig(tri2, state=tk.NORMAL)
        c.coords(mouth, center_x+19, center_y+22+19*2, center_x-19, center_y+22)
        c.itemconfig(mouth, start=130, extent=-80)
        boost_flag = True
        msg = "Countdown has finished"
        if success_count != 0:
            msg += "\nSuccess: " + str(success_count)
        notification.notify(title="Digger", message=msg, timeout=3)
        toggle_active_signal()
        boost()
        countdown_time = const_time
        window.after_cancel(clock)
    else:
        update_health()


def change_const_time():
    global state, const_time
    state = "askInt"
    temp = askinteger(title="Input", prompt="Countdown Time(int between 10,100):", minvalue=10, maxvalue=7200,
                      initialvalue=const_time)
    if temp is not None:
        global countdown_time
        const_time = temp
        countdown_time = temp
    state = "none"


def zoom_in(t: float = 40, button_flag=False, eid=(exit_id+1) % 10000):
    if t < 0.5:
        window.after(3000, zoom_out, 40, button_flag, exit_id)
        return
    if button_flag:
        if page == 1:
            c.coords(mode_button, 170+int(t), 170, 170+int(t)+22, 170+22)
            c.coords(exit_button, 170+int(t), 140, 170+int(t)+22, 140+22)
        elif page == 2:
            c.coords(mode_button, 218+int(t), 130, 218+int(t)+22, 130+22)
            c.coords(exit_button, 218+int(t), 100, 218+int(t)+22, 100+22)
        elif page == 3:
            c.coords(mode_button, 218+int(t), 218, 218+int(t)+22, 218+22)
            c.coords(exit_button, 218+int(t), 188, 218+int(t)+22, 188+22)
    if page == 1:
        c.coords(version_text, 6, 190+int(t))
    elif page == 2:
        c.coords(version_text, 6, 150 + int(t))
    elif page == 3:
        c.coords(version_text, 6, 238 + int(t))
    t *= 0.8
    window.after(9, zoom_in, t, button_flag, eid)


def zoom_out(t: float = 40, button_flag=False, eid=-1):
    if exit_id != eid:
        return
    global state
    if t < 0.5:
        global button, eb_state
        if eb_state == 1:
            eb_state = 0
            c.itemconfig(exit_button, fill="#ED573A")
        button = False
        return
    if button_flag:
        if page == 1:
            c.coords(mode_button, 210-int(t), 170, 210-int(t)+22, 170+22)
            c.coords(exit_button, 210-int(t), 140, 210-int(t)+22, 140+22)
        elif page == 2:
            c.coords(mode_button, 258-int(t), 130, 258-int(t)+22, 130+22)
            c.coords(exit_button, 258-int(t), 100, 258-int(t)+22, 100+22)
        elif page == 3:
            c.coords(mode_button, 258-int(t), 218, 258-int(t)+22, 218+22)
            c.coords(exit_button, 258-int(t), 188, 258-int(t)+22, 188+22)
    if page == 1:
        c.coords(version_text, 6, 230-int(t))
    elif page == 2:
        c.coords(version_text, 6, 190-int(t))
    elif page == 3:
        c.coords(version_text, 6, 278-int(t))
    t *= 0.8
    window.after(9, zoom_out, t, button_flag, eid)


def move_eyes(angle):
    eyes_d = angle
    width = 6
    eye1_c_cor = pos(6, eyes_d, center_x-13, center_y-12)
    eye2_c_cor = pos(6, eyes_d, center_x+13, center_y-12)
    eye1_c_cor = edges(center_x-19, center_y-22, center_x-7, center_y+3, eye1_c_cor[0], eye1_c_cor[1])
    eye2_c_cor = edges(center_x+8, center_y-22, center_x+20, center_y+3, eye2_c_cor[0], eye2_c_cor[1])
    eye_left_nw = edges(center_x-19, center_y-22, center_x-7, center_y-3, eye1_c_cor[0]-width, eye1_c_cor[1]-width)
    eye_left_se = edges(center_x-20, center_y-22, center_x-7, center_y-3, eye1_c_cor[0]+width, eye1_c_cor[1]+width)
    eye_right_nw = edges(center_x+8, center_y-22, center_x+20, center_y-3, eye2_c_cor[0]-width, eye2_c_cor[1]-width)
    eye_right_se = edges(center_x+8, center_y-22, center_x+20, center_y-3, eye2_c_cor[0]+width, eye2_c_cor[1]+width)
    c.coords(eye_left, eye_left_nw[0], eye_left_nw[1], eye_left_se[0], eye_left_se[1])
    c.coords(eye_right, eye_right_nw[0], eye_right_nw[1], eye_right_se[0], eye_right_se[1])


# centipede page
def toggle_active_signal():
    if page != 2 or state == "none" or state == "animation":
        c.itemconfig(active_signal, state=tk.HIDDEN)
    elif mode == 1:  # countdown
        c.itemconfig(active_signal, fill="#97E624", outline="#70AB1B", state=tk.NORMAL)
    elif mode == 0:
        c.itemconfig(active_signal, fill="#99D9EA", outline="#06C7E8", state=tk.NORMAL)


def switch_time(update, t=-15, centipede_x_sum=0, text_x_sum=8):
    global centipede_x
    if t == 16 or page != 2:
        for i in range(5):
            c.coords(centipede_entities[i], centipede_x[i], centipede_y)
        return
    if t == -15:
        text_x_sum += 4
    centipede_x_sum -= 2
    text_x_sum = (text_x_sum - (16-abs(t)))
    for i in range(5):
        if (centipede_x[i]+text_x_sum) % 248 > 230:
            c.itemconfig(centipede_time[i], text=str(update[i]))
        c.coords(centipede_entities[i], centipede_x[i]+centipede_x_sum, centipede_y)
        c.coords(centipede_time[i], ((centipede_x[i]+text_x_sum) % 248)+18, centipede_y+20)
    window.after(10, switch_time, update, t+1, centipede_x_sum, text_x_sum)


def activate_time(pre):
    if page != 2:
        return
    tm_now = localtime().tm_min
    if tm_now != pre:
        switch_time(get_centipede_time())
    window.after(5000, activate_time, tm_now)


# craft page
def flash(updates=(0, 1, 2, 3, 4)):
    for i in updates:
        coords[i] = pos(r, d[i], spin_center[0], spin_center[1])
        c.coords(rotate_pics[i], coords[i][0], coords[i][1])


def update_targets():
    for i in range(5):
        c.coords(targets[i], coords[i][0]-30, coords[i][1]-30, coords[i][0]+30, coords[i][1]+30)


def insert_to_rotate_slot(dis_: float = 61, updates=(0, 1, 2, 3, 4)):
    global r, d, state

    if dis_ == 61:
        global photoImg
        for i in updates:
            c.itemconfig(rotate_pics[i], image=photoImg)
            c.itemconfig(targets[i], state=tk.NORMAL)
        insert_to_rotate_slot(60, updates)
        return
    elif dis_ < 0.3:
        for i in updates:
            c.itemconfig(targets[i], state=tk.HIDDEN)
        if (state == "inc" or state == "countdown") and page == 3:
            window.after(500, craft)
        return
    dis_ *= 0.8
    r = int(91-dis_)
    flash(updates)
    window.after(15, insert_to_rotate_slot, dis_, updates)


def craft_success(t=30, pic_width=65):
    global r, d, new_petal_d
    if r > 45:
        r -= 3
        for i in range(5):
            d[i] = (d[i] - 20) % 360
        flash()
        window.after(9, craft_success, 30, pic_width)
        return
    if t == 30:
        new_petal_d = -55
        for i in range(5):
            c.itemconfig(rotate_pics[i], state=tk.HIDDEN)
        update_targets()
        c.itemconfig(crafted_pic, state=tk.NORMAL)
        t = 35
    else:
        global new, crafted_image_var
        if 36 <= t <= 40:
            pic_width += 6
            new_petal_d += 7
        elif 41 <= t <= 45:
            pic_width -= 3
            new_petal_d += 3
        elif 46 <= t <= 50:
            pic_width -= 2
            new_petal_d += 1
        else:
            global success_count
            success_count += 1
            if (state == "inc" or state == "countdown") and page == 3:
                window.after(3000, extend)
            return
        new = crafted_image_x.resize((pic_width, pic_width))
        new = new.rotate(new_petal_d)
        crafted_image_var = PhotoImage(new)
        c.itemconfig(crafted_pic, image=crafted_image_var)
    window.after(9, craft_success, t+1, pic_width)


def craft_fail(idx=-1, x=3, t: float = 20):
    global r, breaks
    if idx == -1:
        idx = locate_r_idx(r)
        breaks = fail_list(x)
        for i in breaks:
            c.itemconfig(rotate_pics[i], image=empty)
    elif idx >= 42:
        update_targets()
        if (state == "inc" or state == "countdown") and page == 3:
            window.after(500, insert_to_rotate_slot, 61, breaks)
        return
    else:
        idx += 1
        for i in range(5):
            d[i] = (d[i] - max(rotate_speed(91 - extend_r[idx]), t)) % 360
    flash()
    update_targets()
    r = extend_r[idx]
    window.after(15, craft_fail, idx, x, t*0.9)


def spin(t: int = 0):
    global r, tick_
    tick_ = t % 42
    if t == stop_t:
        if page != 3:
            return
        if succeed == 0:
            craft_success()
        else:
            craft_fail(-1, succeed)
        return
    global d
    if tick_ < 13:
        r -= 4
    elif tick_ < 21:
        r -= 1
    elif tick_ < 34:
        r += 4
    else:
        r += 1
    for i in range(5):
        d[i] = (d[i]-rotate_speed(t//2)) % 360
    flash()
    window.after(9, spin, t+1)


def extend(t=0):
    global r
    if t == 15:
        if (state == "inc" or state == "countdown") and page == 3:
            window.after(500, craft)
        update_targets()
        return
    elif t == 0:
        c.itemconfig(crafted_pic, state=tk.HIDDEN)
        r = 0
        for i in range(5):
            c.itemconfig(rotate_pics[i], image=photoImg, state=tk.NORMAL)
    else:
        r = extend_r[(t*3)]
    flash()
    window.after(15, extend, t+1)


def craft():
    global r, stop_t, succeed
    r = 91
    stop_t = 340
    succeed = 0 if randint(1, 100) == 1 else randint(1, 4)  # succeed: petals left.
    if succeed != 0:
        stop_t = stop_t * succeed // 5
        stop_t += randint(5, 24)
    spin(0)


# basic_control
def toggle_countdown():
    global countdown_time, const_time, state
    if countdown_time != const_time:
        countdown_time = 0
    elif state == "none":
        global spin_speed, success_count
        success_count = 0
        spin_speed = 4
        state = "countdown"
        countdown_time = const_time
        toggle_active_signal()
        if page == 3:
            insert_to_rotate_slot(dis_=float(61))
        tick()


def toggle_timer():
    global inc, state, success_count
    if state == "none":
        success_count = 0
        inc = time()
        state = "inc"
        if page == 1:
            cutter_speed_inc()
        elif page == 2:
            toggle_active_signal()
        elif page == 3:
            insert_to_rotate_slot()
    elif state == "inc":
        state = "animation"
        if page == 1:
            c.itemconfig(tri1, state=tk.NORMAL)
            c.itemconfig(tri2, state=tk.NORMAL)
            c.coords(mouth, center_x+19, center_y+22+19*2, center_x-19, center_y+22)
            c.itemconfig(mouth, start=130, extent=-80)
        elif page == 2:
            toggle_active_signal()
        global boost_flag
        boost_flag = True
        boost()
        tick_end = time()
        inc = tick_end - inc
        msg = "You spend " + convert(int(inc))
        if success_count != 0:
            msg += "\nSuccess: " + str(success_count)
        notification.notify(title="Time", message=msg, timeout=3)


def switch(event, t=0, old_page=1, new_page=2):
    global page, pga_width, pga_height, health_x, health_y, center_y, centipede_y, spin_center
    flag = False
    if t == 0:
        global exit_id, button
        button = False
        exit_id = -1
        c.config(borderwidth=-1)
        old_page = page
        new_page = next_page[page]
        page = 0
        if new_page == 1:
            c.itemconfig(active_signal, state=tk.HIDDEN)
            c.coords(mode_button, 210, 170, 210+22, 170+22)
            c.coords(exit_button, 210, 140, 210+22, 140+22)
            c.coords(version_text, 6, 230)
        elif new_page == 2:
            update_centipede_time()
            c.coords(mode_button, 258, 130, 258+22, 130+22)
            c.coords(exit_button, 258, 100, 258+22, 100+22)
            c.coords(version_text, 6, 190)
        elif new_page == 3:
            c.coords(mode_button, 258, 218, 258+22, 218+22)
            c.coords(exit_button, 258, 188, 258+22, 188+22)
            c.coords(version_text, 6, 278)
    elif t == 13:
        global health_base_y, health_text_y
        if new_page == 1:
            health_base_y = tk.PhotoImage(file="healthBar/digger_base.gif")
            health_text_y = tk.PhotoImage(file="healthBar/digger_text.gif")
            health_x = 100
        elif new_page == 2:
            health_base_y = tk.PhotoImage(file="healthBar/centipede_base.gif")
            health_text_y = tk.PhotoImage(file="healthBar/centipede_text.gif")
            health_x = 124
        c.itemconfig(health_base, image=health_base_y)
        c.itemconfig(health_text, image=health_text_y)
    if t < 13 and old_page != 3:
        health_y -= (health_y - 50) * 0.1
    elif 13 <= t < 26 and new_page != 3:
        health_y += (138 - health_y) * 0.1
    if old_page == 1 and new_page == 3:
        pga_height += (250 - pga_height) * 0.1
        pga_width += (250 - pga_width) * 0.1
        global coords
        spin_center[1] -= (30-t) // 2
        flash()
        center_y += int(t / 1.25)
        c.coords(health_base, health_x - 95, health_y - 115)
        c.coords(health_circle1, health_x - 87, health_y - 103, health_x - 72, health_y - 88)
        c.coords(health_text, health_x - 95, health_y - 115)
        update_health()
        update_cor(True)
        if int(pga_height) == 248:
            flag = True
            pga_height = 248
            pga_width = 248
        c.config(width=pga_width, height=pga_height)
    if old_page == 3 and new_page == 2:
        pga_height -= (pga_height - 160) * 0.1
        centipede_y += (80-centipede_y) * 0.1
        if t <= 30:
            global coords
            spin_center[1] += (30-t) // 2
            flash()
        c.coords(health_base, health_x - 95, health_y - 115)
        c.coords(health_circle1, health_x - 87, health_y - 103, health_x - 72, health_y - 88)
        c.coords(health_text, health_x - 95, health_y - 115)
        for i in range(5):
            c.coords(centipede_entities[i], centipede_x[i], centipede_y)
        for i in range(4):
            c.coords(centipede_time[i], centipede_x[i]+20, centipede_y+18)
        update_health()
        if int(pga_height) == 160:
            flag = True
            pga_height = 160
            pga_width = 248
        c.config(width=pga_width, height=pga_height)
    elif old_page == 2 and new_page == 1:
        pga_height += (200 - pga_height) * 0.1
        pga_width -= (pga_width - 198) * 0.1
        center_y -= int((35-t) / 2)
        centipede_y -= (centipede_y+145) * 0.1
        c.coords(health_base, health_x - 95, health_y - 115)
        c.coords(health_circle1, health_x - 87, health_y - 103, health_x - 72, health_y - 88)
        c.coords(health_text, health_x - 95, health_y - 115)
        for i in range(5):
            c.coords(centipede_entities[i], centipede_x[i], centipede_y)
        for i in range(4):
            c.coords(centipede_time[i], centipede_x[i]+20, centipede_y+18)
        update_health()
        update_cor(True)
        if int(pga_height) == 199:
            flag = True
            pga_height = 200
            pga_width = 200
        c.config(width=pga_width, height=pga_height)
    if flag:
        page = new_page
        if new_page != 3:
            health_y = 120
        window.after(300, window.overrideredirect, False)
        c.config(borderwidth=-2)
        if page == 1:
            move()
            cutter_spin()
            if mode == 0:
                cutter_speed_inc()
        elif page == 2:
            pass
            toggle_active_signal()
            activate_time(localtime().tm_min)
        elif page == 3:
            update_targets()
            if state == "inc" or state == "countdown":
                insert_to_rotate_slot()
        return
    window.after(10, switch, event, t+1, old_page, new_page)


def l_click(event):
    global state
    if in_mode_button(event) and button:
        change_const_time()
        return
    if in_window_button(event) and button:
        global eb_state
        if eb_state == 0:
            eb_state = 1
            c.itemconfig(exit_button, fill="#ED1C24")
        else:
            exit(0)
        return
    if state != "animation" and mode == 1 and page != 0:
        toggle_countdown()
    elif state != "animation" and mode == 0 and page != 0:
        toggle_timer()


def r_click(event):
    global mode, button, exit_id
    if state == "inc":
        c.itemconfig(version_text, text=convert(int(time()-inc)))
    elif state == "countdown":
        c.itemconfig(version_text, text=convert(countdown_time)+" left")
    else:
        c.itemconfig(version_text, text=str_num(localtime().tm_hour)+":"+str_num(localtime().tm_min))
    if button and in_window_button(event):
        switch(event)
        return
    if state != "none":
        pass
    elif state == "none" and mode == 1:
        mode = 0
        c.itemconfig(mode_button, fill="#99D9EA", outline="#06C7E8")
    elif state == "none" and mode == 0:
        mode = 1
        c.itemconfig(mode_button, fill="#97E624", outline="#70AB1B")
    if not button:
        button = True
        exit_id = (exit_id+1) % 10000
        zoom_in(40, True)


c.itemconfig(tri1, state=tk.HIDDEN)
c.itemconfig(tri2, state=tk.HIDDEN)
c.bind('<Configure>', on_resize)
window.bind("<ButtonRelease-1>", l_click)
window.bind("<ButtonRelease-2>", toggle_window)
window.bind("<ButtonRelease-3>", r_click)
boost()
move()
cutter_spin()
update_health()
window.mainloop()
