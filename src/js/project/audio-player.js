export default class AudioPlayer {

	// Private fields
	
	#container = null;
	#audio = null;
	#playPauseButton = null;
	#progressBar = null;
	#progress = null;
	#progressThumb = null;
	#volumeSlider = null;
	#muteButton = null;
	#volumeLevel = null;
	#volumeThumb = null;
	#currentTotalTime = null;
	#cover = null;
	#coverDuration = null;
	#progressContainer = null;
	#volumeContainer = null;
	#isPlaying = false;
	#dragType = null;
	#volumeBeforeMute = null;
	#coverVisible = false;

	// Private methods

	#toggleClasses(element, class1 = null, class2 = null) {
		if (element.classList.contains(class1)) {
			element.classList.remove(class1);
			element.classList.add(class2);
		} else {
			element.classList.remove(class2);
			element.classList.add(class1);
		}
	}

	#togglePlayPause() {
	
		// Hide cover on first play if it exists
		if (this.#cover && this.#coverVisible) {
			this.#hideCover();
		}
		
		if (this.#isPlaying) {
			this.#audio.pause();
		} else {
			this.#audio.play();
		}
		this.#isPlaying = !this.#isPlaying;
		this.#toggleClasses(
			this.#playPauseButton.querySelector('span.icon'),
			'icon-play',
			'icon-pause'
		);
	}

	#toggleMute() {
		if (!this.#audio || !this.#muteButton) return;
		
		if (this.#audio.volume === 0) {
			this.#audio.volume = this.#volumeBeforeMute || 1;
		} else {
			this.#volumeBeforeMute = this.#audio.volume;
			this.#audio.volume = 0;
		}
		this.#setVolumeLevel();
	}

	#updateProgress = () => {
		if (!this.#audio.duration || isNaN(this.#audio.duration)) {
			// Duration not available yet - just return without updating
			return;
		}
		
		// Update progress bar
		const progressPercentage = (this.#audio.currentTime / this.#audio.duration) * 100;
		this.#progress.style.width = `${progressPercentage}%`;
		const progressThumb = this.#progress.querySelector('.audio-player__thumb');
		if (progressThumb) {
			progressThumb.style.left = `${progressPercentage}%`;
		}
		
		// Format current time
		const currentMinutes = Math.floor(this.#audio.currentTime / 60);
		const currentSeconds = Math.floor(this.#audio.currentTime - currentMinutes * 60);
		const currentTimeText = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
		
		// Format total time
		const totalMinutes = Math.floor(this.#audio.duration / 60);
		const totalSeconds = Math.floor(this.#audio.duration - totalMinutes * 60);
		const totalTimeText = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
		
		// Update current/total time display (YouTube style)
		this.#currentTotalTime.innerText = `${currentTimeText} / ${totalTimeText}`;
		
		// Update cover duration if it exists
		if (this.#coverDuration && this.#coverDuration.innerText === '--:--') {
			this.#coverDuration.innerText = totalTimeText;
		}
	};

	#setTime = (e) => {
		const clickPositionInBar = e.clientX - this.#progressBar.getBoundingClientRect().left;
		const progressPercentage = (clickPositionInBar / this.#progressBar.offsetWidth) * 100;
		this.#audio.currentTime = (progressPercentage / 100) * this.#audio.duration;
	};

	#setVolume = (e) => {
		if (!this.#volumeSlider) return;
		
		const clickPositionInBar = e.clientX - this.#volumeSlider.getBoundingClientRect().left;
		const volumePercentage = (clickPositionInBar / this.#volumeSlider.offsetWidth) * 100;
		const volume = volumePercentage / 100;

		this.#audio.volume = Math.min(1, volume);
		this.#setVolumeLevel();
	};

	#setVolumeLevel() {
		if (!this.#volumeLevel || !this.#muteButton) return;
		
		const volumePercentage = this.#audio.volume * 100;
		this.#volumeLevel.style.width = `${volumePercentage}%`;

		const volumeThumb = this.#volumeLevel.querySelector('.audio-player__thumb');
		if (volumeThumb) {
			volumeThumb.style.left = `${volumePercentage}%`;
		}

		const isMuted = this.#audio.volume < 0.1;
		const volumeIcon = this.#muteButton.querySelector('span.icon');

		if (volumeIcon) {
			if (isMuted) {
				volumeIcon.classList.remove('icon-volume');
				volumeIcon.classList.add('icon-volume-mute');
			} else {
				volumeIcon.classList.remove('icon-volume-mute');
				volumeIcon.classList.add('icon-volume');
			}
		}
	}

	#handleKeyDown(e) {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
			if (e.currentTarget === this.#progressBar) {
				this.#audio.currentTime += e.key === 'ArrowLeft' ? -5 : 5;
				this.#updateProgress();
			} else if (this.#volumeSlider && e.currentTarget === this.#volumeSlider) {
				let newVolume = this.#audio.volume + (e.key === 'ArrowLeft' ? -0.05 : 0.05);
				newVolume = Math.max(0, Math.min(1, newVolume)); // Ensures newVolume is in the range [0, 1]
				this.#audio.volume = newVolume;
				this.#setVolumeLevel();
			}
		}
	}

	#startDrag = (e, type) => {
		e.preventDefault();
		
		// Add both mouse and touch event listeners
		document.addEventListener('mousemove', this.#drag);
		document.addEventListener('mouseup', this.#stopDrag);
		document.addEventListener('touchmove', this.#drag, { passive: false });
		document.addEventListener('touchend', this.#stopDrag);
		
		this.#dragType = type;
	};

	#drag = (e) => {
		e.preventDefault();
		
		let slider, setFunction;
		if (this.#dragType === 'progress') {
			slider = this.#progressBar;
			setFunction = this.#setTime;
		} else {
			slider = this.#volumeSlider;
			setFunction = this.#setVolume;
		}

		const rect = slider.getBoundingClientRect();
		// Handle both mouse and touch events
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const x = clientX - rect.left;
		const width = rect.right - rect.left;

		if (x >= 0 && x <= width) {
			const progressPercentage = (x / width) * 100;

			const clickEvent = new MouseEvent('click', {
				clientX: x + rect.left,
			});

			setFunction(clickEvent);

			// Update the progress thumb position in real-time
			const thumb = slider.querySelector('.audio-player__thumb');
			thumb.style.left = `${progressPercentage}%`;

			// Update the progress fill width in real-time
			const progressFill = slider.querySelector('[class*="__fill"]');
			progressFill.style.width = `${progressPercentage}%`;
		}
	};

	#stopDrag = () => {
		// Remove both mouse and touch event listeners
		document.removeEventListener('mousemove', this.#drag);
		document.removeEventListener('mouseup', this.#stopDrag);
		document.removeEventListener('touchmove', this.#drag);
		document.removeEventListener('touchend', this.#stopDrag);
	};

	#showCover() {
		if (this.#cover && this.#progressContainer) {
			this.#cover.style.display = 'flex';
			this.#progressContainer.style.display = 'none';
			if (this.#volumeContainer) {
				this.#volumeContainer.style.display = 'none';
			}
			this.#coverVisible = true;
		}
	}
	
	#hideCover() {
		if (this.#cover && this.#progressContainer) {
			this.#cover.style.display = 'none';
			this.#progressContainer.style.display = 'flex';
			if (this.#volumeContainer) {
				this.#volumeContainer.style.display = 'flex';
			}
			this.#coverVisible = false;
		}
	}

	// Public methods
	
	destroy() {
		if (this.#audio) {
			this.#audio.removeEventListener('timeupdate', this.#updateProgress);
			this.#audio.removeEventListener('loadedmetadata', this.#updateProgress);
		}
		this.#muteButton?.removeEventListener('click', this.#toggleMute);
		this.#playPauseButton?.removeEventListener('click', this.#togglePlayPause);
		this.#progressBar?.removeEventListener('click', this.#setTime);
		this.#progressBar?.removeEventListener('keydown', this.#handleKeyDown);
		this.#volumeSlider?.removeEventListener('click', this.#setVolume);
		this.#volumeSlider?.removeEventListener('keydown', this.#handleKeyDown);
		this.#progressThumb?.removeEventListener('mousedown', this.#startDrag);
		this.#progressThumb?.removeEventListener('touchstart', this.#startDrag);
		this.#volumeThumb?.removeEventListener('mousedown', this.#startDrag);
		this.#volumeThumb?.removeEventListener('touchstart', this.#startDrag);
		
		document.removeEventListener('mousemove', this.#drag);
		document.removeEventListener('mouseup', this.#stopDrag);
	}

	init(container) {
		// Accept a container element, or find the first .audio-player if none provided
		this.#container = container || document.querySelector('.audio-player');
		
		if (!this.#container) {
			return;
		}
		
		// Scope all selectors to the container
		this.#audio = this.#container.querySelector('audio');
		this.#playPauseButton = this.#container.querySelector('.audio-player__play-pause');
		this.#progressBar = this.#container.querySelector('.audio-player__progress');
		this.#progress = this.#container.querySelector('.audio-player__progress__fill');
		this.#progressThumb = this.#progress?.querySelector('.audio-player__thumb');
		this.#volumeSlider = this.#container.querySelector('.audio-player__volume');
		this.#muteButton = this.#container.querySelector('.audio-player__volume-container button');
		this.#volumeLevel = this.#container.querySelector('.audio-player__volume__fill');
		this.#volumeThumb = this.#volumeLevel?.querySelector('.audio-player__thumb');
		this.#currentTotalTime = this.#container.querySelector('.audio-player__timestamp');
		this.#cover = this.#container.querySelector('.audio-player__cover');
		this.#coverDuration = this.#container.querySelector('.audio-player__duration');
		this.#progressContainer = this.#container.querySelector('.audio-player__progress-container');
		this.#volumeContainer = this.#container.querySelector('.audio-player__volume-container');

		if (!this.#audio) {
			return;
		}

		try {
			this.#muteButton?.addEventListener('click', () => this.#toggleMute());
			this.#playPauseButton.addEventListener('click', () => this.#togglePlayPause());
			this.#audio.addEventListener('timeupdate', () => this.#updateProgress());
			this.#progressBar.addEventListener('click', (e) => this.#setTime(e));
			this.#volumeSlider?.addEventListener('click', (e) => this.#setVolume(e));
			this.#progressBar.addEventListener('keydown', (e) => this.#handleKeyDown(e));
			this.#volumeSlider?.addEventListener('keydown', (e) => this.#handleKeyDown(e));
		} catch (error) {
			console.error('Error setting up audio player event listeners:', error);
			return;
		}

		// Set the initial volume of the audio to 1 if it doesn't already have a value
		if (isNaN(this.#audio.volume) || this.#audio.volume === 0) {
			this.#audio.volume = 1;
		}

		// Set the initial position of the volume thumb and fill
		this.#setVolumeLevel();
		
		// Show cover initially if it exists
		if (this.#cover) {
			this.#showCover();
		}

		// Drag handlers - both mouse and touch events
		this.#progressThumb?.addEventListener('mousedown', (e) => this.#startDrag(e, 'progress'));
		this.#progressThumb?.addEventListener('touchstart', (e) => this.#startDrag(e, 'progress'), { passive: false });
		this.#volumeThumb?.addEventListener('mousedown', (e) => this.#startDrag(e, 'volume'));
		this.#volumeThumb?.addEventListener('touchstart', (e) => this.#startDrag(e, 'volume'), { passive: false });

		// Single reliable event listener
		this.#audio.addEventListener('loadedmetadata', () => {
			if (this.#audio.duration && !isNaN(this.#audio.duration)) {
				const totalMinutes = Math.floor(this.#audio.duration / 60);
				const totalSeconds = Math.floor(this.#audio.duration - totalMinutes * 60);
				const totalTimeText = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
				
				// Set initial current/total time display
				this.#currentTotalTime.innerText = `0:00 / ${totalTimeText}`;
				
				// Set cover duration
				if (this.#coverDuration) {
					this.#coverDuration.innerText = totalTimeText;
				}
			}
		});

		// Add error handling for audio loading
		this.#audio.addEventListener('error', (e) => {
			console.error('Audio loading error:', e);
			this.#currentTotalTime.innerText = 'Error / Error';
		});

		// Simple approach - just call load and let the events handle it
		this.#audio.load();

	}
}