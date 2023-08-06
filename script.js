import {songList} from "./musicData.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// 1.render ra list nhạc...................
// 2.render ra thanh chạy nhạc.............
// 3.scroll hình nhỏ lại...................
// 4.bấm play/pause........................
// 5.tua nhạc..............................
// 6.next, prev............................
// 7.random................................
// 8.repeat................................
// 9.chọn nhạc trong list nhạc.............
// 10.lưu setting:nhạc, setting, volume....
// 11.active bài hát đang nghe.............
// 12.scroll tới bài đang nghe............
// 13.điều chỉnh âm lượng nhạc.............
// 14.điều chỉnh speedRate nhạc............
// 15.tua nhạc tới/lui 10s.................
// 16.hình CD quay.........................
// 17.hiển thị thời gian nhạc chạy.........
// 18.load ra thông tin nhạc...............

const audio = $('.audio')
const listSong = $('.listSongs')
const avatar = $('.avatar')
const nameSinger = $('.name')
const playBtn = $('.control')
const nextBtn = $('.fa-forward')
const prevBtn = $('.fa-backward')
const headerImage = $('.headderImage')
const progress = $('.progress')

const repeatBtn = $('.fa-repeat')
const randomBtn = $('.fa-shuffle ')

const volumeBtn = $('.volumeIcon')
const volumeBar = $('.volumeBar')

const plusBtn = $('.plus')
const minusBtn = $('.minus')

const speedOp = $$('.speedOp')
const numSpeed = $('.numspeed')

const currentTimeBox = $('.currentTime')
const durationBox = $('.duration')

const app = {
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  isMuted: false,
  volume: 1,
  speedRate: 1,
  currentSongIndex: 0,
  songSetting: JSON.parse(localStorage.getItem('songSetting')) || {},
  arraySongPlayed: [],
  songs: songList,

  render() {
    let list = []
    this.songs.forEach((item, index) => {
      const songBox = `<div class="gg ${
        index === this.currentSongIndex ? 'active' : ''
      }"  data-index="${index}">
      <img  class="singerAvatar" src="${item.image}" alt="Singer" />
      <div class="singerName">
        <span>${item.name}</span>
        <span>${item.singer}</span>
      </div>
      <i class="fa-solid fa-ellipsis"></i>
    </div>`

      list.push(songBox)
    })
    listSong.innerHTML = list.join('')
  },

  handleEvent() {
    // nhỏ hình khi scroll
    const headerImageWidth = headerImage.offsetWidth
    document.onscroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const newWidth = headerImageWidth - scrollY > 0 ? headerImageWidth - scrollY : 0
      headerImage.style.width = `${newWidth}px`
      headerImage.style.opacity = `${newWidth / headerImageWidth}`
    }

    // play khi bấm
    playBtn.onclick = () => {
      if (!this.isPlaying) {
        audio.play()
        this.isPlaying = true
        playBtn.classList.add('active')
        animate.play()
      } else {
        audio.pause()
        this.isPlaying = false
        playBtn.classList.remove('active')
        animate.pause()
      }
    }

    // render progressBar khi playing
    const maxValue = progress.getAttribute('max')
    audio.ontimeupdate = () => {
      const duration = Math.floor(audio.duration)
      const currentTime = audio.currentTime
      const newValue = (currentTime * maxValue) / duration || 0
      progress.value = newValue
      this.updateTime(duration, currentTime)
    }

    // tua
    progress.onchange = (e) => {
      const currentValue = e.target.value
      const duration = Math.floor(audio.duration)

      const newValue = (duration * currentValue) / maxValue
      audio.currentTime = newValue
    }

    // hình xoay khi hát
    const keyFrames = [{ transform: 'rotate(360deg)' }]
    const timing = {
      duration: 10000,
      iterations: 999,
    }
    const animate = avatar.animate(keyFrames, timing)
    animate.pause()

    // bấm next, pre button
    nextBtn.onclick = () => {
      if (this.isRepeat || this.isRandom) {
        this.handleSettingButton()
      } else {
        this.currentSongIndex++
        this.currentSongIndex =
          this.currentSongIndex <= this.songs.length - 1 ? this.currentSongIndex : 0
        this.setPlaySong(this.currentSongIndex)
      }
      this.saveSongName(this.currentSongIndex)
    }
    prevBtn.onclick = () => {
      if (this.isRepeat || this.isRandom) {
        this.handleSettingButton()
      } else {
        this.currentSongIndex--
        this.currentSongIndex =
          this.currentSongIndex >= 0 ? this.currentSongIndex : this.songs.length - 1
        this.setPlaySong(this.currentSongIndex)
      }
      this.saveSongName(this.currentSongIndex)
    }

    // song end
    audio.onended = () => {
      this.checkArraySongsLength(this.currentSongIndex)
      if (this.isRepeat || this.isRandom) {
        this.handleSettingButton()
      } else {
        nextBtn.click()
      }
      this.saveSongName(this.currentSongIndex)
    }

    // repead Button
    repeatBtn.onclick = () => {
      this.isRepeat = !this.isRepeat
      this.isRandom = false

      // lưu setting dô localStorage....
      this.songSetting.isRepeat = this.isRepeat
      this.songSetting.isRandom = this.isRandom
      localStorage.setItem('songSetting', JSON.stringify(this.songSetting))

      repeatBtn.classList.toggle('active')
      randomBtn.classList.remove('active')
    }

    // random Button
    randomBtn.onclick = () => {
      this.isRandom = !this.isRandom
      this.isRepeat = false

      // lưu setting dô localStorage.....
      this.songSetting.isRepeat = this.isRepeat
      this.songSetting.isRandom = this.isRandom
      localStorage.setItem('songSetting', JSON.stringify(this.songSetting))

      randomBtn.classList.toggle('active')
      repeatBtn.classList.remove('active')
    }

    // nhấn chọn bài
    const songBox = $$('.gg')
    songBox.forEach((item) => {
      item.onclick = (e) => {
        const item = e.target.closest('.gg')
        const indexItem = item.dataset.index

        const isDotItem = e.target.matches('.fa-ellipsis')
        const activeItem = item.matches('.active')

        if (!activeItem && !isDotItem) {
          this.currentSongIndex = Number(indexItem)
          this.setPlaySong(this.currentSongIndex)
          this.saveSongName(this.currentSongIndex)
          animate.play()
        } else if (isDotItem) {
          console.log('ba cham')
        }
      }
    })

    // khi win load xong
    window.onload = () => {
      // set các chức năng mucic
      if (this.songSetting.isRepeat || this.songSetting.isRandom) {
        if (this.songSetting.isRepeat) {
          this.isRepeat = this.songSetting.isRepeat
          this.isRandom = false
          repeatBtn.classList.add('active')
        } else if (this.songSetting.isRandom) {
          this.isRandom = this.songSetting.isRandom
          this.isRepeat = false
          randomBtn.classList.add('active')
        }
      }

      // set bài hát
      if (this.songSetting.songName) {
        this.songs.forEach((item, index) => {
          if (item.name === this.songSetting.songName) {
            this.currentSongIndex = index
            this.setPlaySongOnLoad(this.currentSongIndex)
            animate.play()
          }
        })
      } else {
        this.setPlaySongOnLoad(0)
        animate.play()
      }

      // set volume
      const typeVolume = typeof this.songSetting.volume
      if (this.songSetting.volume || typeVolume === 'number') {
        if (Number(this.songSetting.volume) === 0) {
          audio.volume = 0
          volumeBar.value = 0
          volumeBtn.classList.add('muted')
        } else if (Number(this.songSetting.volume) > 0) {
          audio.volume = this.songSetting.volume
          volumeBar.value = this.songSetting.volume
          volumeBtn.classList.remove('muted')
        }
      } else {
        audio.volume = 1
      }
    }

    // điều chỉnh volume của nhạc
    volumeBtn.onclick = () => {
      volumeBtn.classList.toggle('muted')

      if (!this.isMuted) {
        this.isMuted = !this.isMuted
        audio.volume = 0
        volumeBar.value = 0
      } else {
        this.isMuted = !this.isMuted
        audio.volume = this.volume
        volumeBar.value = this.volume
      }
      this.saveVolume(audio.volume)
    }
    volumeBar.onchange = (e) => {
      const value = e.target.value
      this.volume = value
      audio.volume = this.volume
      this.saveVolume(value)
    }

    // tua bài hát tới/lui 10s
    plusBtn.onclick = () => {
      audio.currentTime = audio.currentTime + 10
    }
    minusBtn.onclick = () => {
      console.log('ss')
      audio.currentTime = audio.currentTime - 10
    }

    // chọn tốc độ
    speedOp.forEach((item) => {
      item.classList.remove('active')
      item.onclick = (e) => {
        this.speedRate = e.target.dataset.speed
        audio.playbackRate = this.speedRate
        numSpeed.innerText = this.speedRate
        this.renderActiveSpeed()
      }
    })
  },

  defineMethod() {
    ;(this.getRandomNumber = (min, max) => {
      return Math.floor(Math.random() * (max - min) + min)
    }),
      (this.checkArraySongsLength = (index) => {
        if (this.arraySongPlayed > 4) {
          this.arraySongPlayed = []
          this.arraySongPlayed.push(index)
        } else {
          this.arraySongPlayed.push(index)
        }
      }),
      (this.handleSettingButton = () => {
        if (this.isRepeat) {
          audio.currentTime = 0
        } else if (this.isRandom) {
          let index
          do {
            index = this.getRandomNumber(0, this.songs.length - 1)
          } while (index === this.currentSongIndex || this.arraySongPlayed.includes(index))
          this.currentSongIndex = index
          this.setPlaySong(this.currentSongIndex)
        }
      }),
      (this.setPlaySong = (index) => {
        this.renderSong(index)
        this.renderActiveSong()
        this.scrollIntoView()
        audio.play()
        playBtn.classList.add('active')
        this.isPlaying = true
      }),
      (this.setPlaySongOnLoad = (index) => {
        this.renderSong(index)
        this.renderActiveSong()
        this.scrollIntoView()
        playBtn.classList.remove('active')
        this.isPlaying = false
      }),
      (this.saveSongName = (index) => {
        const songName = this.songs[index].name
        this.songSetting.songName = songName
        localStorage.setItem('songSetting', JSON.stringify(this.songSetting))
      }),
      (this.saveVolume = (value) => {
        this.songSetting.volume = value
        localStorage.setItem('songSetting', JSON.stringify(this.songSetting))
      }),
      (this.renderActiveSpeed = () => {
        speedOp.forEach((item) => {
          if (Number(item.dataset.speed) === Number(this.speedRate)) {
            item.classList.add('active')
          } else {
            item.classList.remove('active')
          }
        })
      }),
      (this.scrollIntoView = () => {
        const songBox = $$('.gg')

        songBox.forEach((item, index) => {
          if (item.classList.contains('active') && index > 3) {
            item.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          } else if (item.classList.contains('active') && index <= 3) {
            item.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
            })
          }
        })
      }),
      (this.renderSong = (index) => {
        const songRender = this.songs[index]

        nameSinger.innerText = songRender.name
        audio.src = songRender.path
        avatar.style.backgroundImage = `url(${songRender.image})`
      }),
      (this.renderActiveSong = () => {
        const songBox = $$('.gg')

        songBox.forEach((item) => {
          if (item.dataset.index == this.currentSongIndex) {
            item.classList.add('active')
          } else {
            item.classList.remove('active')
          }
        })
      }),
      (this.updateTime = (duration, currentTime) => {
        const durationMin = Math.floor(duration / 60) || 0
        let durationSec = duration % 60 || 0

        currentTime = Math.floor(currentTime)
        const currentMin = Math.floor(currentTime / 60)
        let currentSec = currentTime % 60

        if (currentSec < 10) {
          currentSec = `0${currentSec}`
        }
        if (durationSec < 10) {
          durationSec = `0${durationSec}`
        }

        durationBox.innerText = `/${durationMin}:${durationSec}`
        currentTimeBox.innerText = `${currentMin}:${currentSec}`
      })
  },

  star() {
    // define các method dùng trong handleEvent
    this.defineMethod()

    // render ra bài hát
    this.render()

    //  xử lý DOM EVENT
    this.handleEvent()
  },
}

app.star()
