export default class AudioManager {
	constructor() {
		this.sounds = new Map();
		this.musics = new Map();
		this.currentMusic = null;
		this.currentMusicName = null;
		this.pendingMusic = null;
		this.pendingMusicVolume = null;
		this.userInteracted = false;
		this.enabled = true;
		this.musicEnabled = true;
		this.musicVolume = 0.5;
	}

	load(name, path) {
		const audio = new Audio(path);
		audio.preload = 'auto';
		this.sounds.set(name, audio);
	}

	loadMusic(name, path) {
		const audio = new Audio(path);
		audio.preload = 'auto';
		audio.loop = true;
		this.musics.set(name, audio);
	}

	play(name, volume = 1.0, pitchVariation = 1) {
		if (!this.enabled) return;


		const sound = this.sounds.get(name);
		if (!sound) return;
	
		const clone = sound.cloneNode();
		clone.volume = volume;

		pitchVariation *= 2;


		const randomPitch = Math.pow(2, (Math.random() * 2 - 1) * pitchVariation);
		clone.playbackRate = randomPitch;

		clone.play();
	}

	playMusic(name, volume = null, loop = true) {
		this.currentMusicName = name;

		if (this.currentMusic) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
		}

		const music = this.musics.get(name);
		if (!music) {
			console.warn('Music not found:', name);
			return;
		}

		this.currentMusic = music;
		this.currentMusic.volume = volume !== null ? volume : this.musicVolume;
		this.currentMusic.loop = loop;
		
		if (!this.musicEnabled) {
			return;
		}
		
		if (!this.userInteracted) {
			this.pendingMusic = name;
			this.pendingMusicVolume = volume;
			return;
		}
		
		const playPromise = this.currentMusic.play();
		if (playPromise !== undefined) {
			playPromise.catch(error => {
				console.warn('Error playing music:', error);
			});
		}
	}

	unlockAudio() {
		if (this.userInteracted) return;
		
		this.userInteracted = true;
		
		if (this.currentMusic) {
			const playPromise = this.currentMusic.play();
			if (playPromise !== undefined) {
				playPromise.catch(error => {
					console.warn('Error playing pending music:', error);
				});
			}
			this.pendingMusic = null;
			this.pendingMusicVolume = null;
		}
	}

	stopMusic() {
		if (this.currentMusic) {
			this.currentMusic.pause();
			this.currentMusic.currentTime = 0;
			this.currentMusic = null;
		}
	}

	setMusicVolume(volume) {
		this.musicVolume = Math.max(0, Math.min(1, volume));
		if (this.currentMusic) {
			this.currentMusic.volume = this.musicVolume;
		}
	}

	setEnabled(enabled) {
		this.enabled = enabled;
	}

	setMusicEnabled(enabled) {
		this.musicEnabled = enabled;
		if (!enabled && this.currentMusic) {
			this.currentMusic.pause();
		} else if (enabled && this.currentMusicName && this.userInteracted) {
			if (this.currentMusic) {
				this.currentMusic.play().catch(error => {
					console.warn('Error resuming music:', error);
				});
			} else {
				this.playMusic(this.currentMusicName);
			}
		}
	}
}

