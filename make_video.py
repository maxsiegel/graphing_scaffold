import moviepy
import os

def convert2(filename):
  # shortcut
  convert(filename, filename, filename)

def convert(img, mp3, mp4):
  print(img, mp3, mp4)
  image = moviepy.ImageClip(f"img/{img}.png")

  audio = moviepy.AudioFileClip(f"mp3/{mp3}.mp3")

  video = moviepy.CompositeVideoClip([image.with_duration(audio.duration)])
  video = video.with_audio(audio)

  video.write_videofile(f"mp4/{mp4}.mp4", fps=30)

# for filename in os.listdir('img'):
#   name = filename[:-4]
#   if name == '.DS_S' or name + ".mp4" in os.listdir('mp4'):
#     continue
#   print(name)
#   convert(name)
# diff = {
#   6: '4_alien_intro',
#   9: '5_alien2_intro',
#   10: '6_fruits_intro',
#   14: '7_toy_intro',
#   16: '8_ice_cream_intro',
#   18: 'done'
# }
# for i in range(1, 19, 1):
#   if i in diff.keys():
#     convert(str(i), diff[i], 'transition_' + str(i))
#   else:   
#     convert(str(i), 'transition', 'transition_' + str(i))
# convert('18', 'done', 'done')

convert('7_toy_graph', '7_toy_least_why', '7_toy_least_why')
convert('7_toy_graph', '7_toy_most_why', '7_toy_most_why')
convert('8_ice_cream_graph', '8_ice_cream_least_why', '8_ice_cream_least_why')
convert('8_ice_cream_graph', '8_ice_cream_most_why', '8_ice_cream_most_why')