import Renderer from './Renderer.js';
import SceneManager from './SceneManager.js';
import InputManager from './InputManager.js';
import SpriteManager from '../Systems/SpriteManager.js';
import MenuManager from '../UI/MenuManager.js';
import GameManager from '../Systems/GameManager.js';
import AudioManager from '../Systems/AudioManager.js';
import { PokemonSprites } from '../Config/SpriteConfig.js';
import { MapEnemies, EnemyTypes } from '../Config/EnemyConfig.js';
import { ItemConfig } from '../Config/ItemConfig.js';

export default class GameEngine {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.canvas.style.cursor = 'crosshair';
		
		this.renderer = new Renderer(this.ctx);
		this.input = new InputManager();
		this.input.setCanvas(canvas);
		this.sprites = new SpriteManager();
		this.audio = new AudioManager();
		this.input.onFirstInteraction = () => {
			this.audio.unlockAudio();
		};
		this.menuManager = new MenuManager(this);
		this.gameManager = new GameManager(this);
		this.sceneManager = new SceneManager(this);
		
		this.lastTime = 0;
		this.assetsLoaded = false;
		this.money = 0;
		this.displayedMoney = 0;
		this.inventory = {
			rattata_tail: 5, 
			bronze_chest: 1
		};
		this.encounteredPokemons = new Set();
		this.playedPokemons = new Set();
		this.playedMaps = new Set();
		this.defeatedPokemonCounts = {};
		
		this.settings = {
			screenshakeEnabled: true,
			soundEnabled: true,
			musicEnabled: true
		};
		
		this.loadSettings();
		this.applySettings();
	}

	async start() {
		await this.loadAssets();
		this.assetsLoaded = true;
		this.sceneManager.pushScene('menu');
		requestAnimationFrame(this.loop.bind(this));
	}

	async loadAssets() {
		try {
			await this.sprites.load('background_1', process.env.PUBLIC_URL + '/background_1.png');
			await this.sprites.load('background_2', process.env.PUBLIC_URL + '/background_2.png');
			await this.sprites.load('background_3', process.env.PUBLIC_URL + '/background_3.png');
			const hubPath = process.env.PUBLIC_URL + '/hub.png';
			const quaksireWalkPath = process.env.PUBLIC_URL + '/sprites/pokemon/quaksire/Walk-Anim.png';
			const rattataWalkPath = process.env.PUBLIC_URL + '/sprites/pokemon/rattata/Walk-Anim.png';
			const quaksireHurtPath = process.env.PUBLIC_URL + '/sprites/pokemon/quaksire/Hurt-Anim.png';
			const rattataHurtPath = process.env.PUBLIC_URL + '/sprites/pokemon/rattata/Hurt-Anim.png';
			const quaksireFaintPath = process.env.PUBLIC_URL + '/sprites/pokemon/quaksire/Faint-Anim.png';
			const rattataFaintPath = process.env.PUBLIC_URL + '/sprites/pokemon/rattata/Faint-Anim.png';
			const quaksireChargePath = process.env.PUBLIC_URL + '/sprites/pokemon/quaksire/Charge-Anim.png';
			const caterpieWalkPath = process.env.PUBLIC_URL + '/sprites/pokemon/caterpie/Walk-Anim.png';
			const caterpieHurtPath = process.env.PUBLIC_URL + '/sprites/pokemon/caterpie/Hurt-Anim.png';
			const caterpieFaintPath = process.env.PUBLIC_URL + '/sprites/pokemon/caterpie/Faint-Anim.png';
			const caterpieShootPath = process.env.PUBLIC_URL + '/sprites/pokemon/caterpie/Shoot-Anim.png';
			const pidgeyWalkPath = process.env.PUBLIC_URL + '/sprites/pokemon/pidgey/Walk-Anim.png';
			const pidgeyHurtPath = process.env.PUBLIC_URL + '/sprites/pokemon/pidgey/Hurt-Anim.png';
			const pidgeyFaintPath = process.env.PUBLIC_URL + '/sprites/pokemon/pidgey/Faint-Anim.png';
			const rattataTailPath = process.env.PUBLIC_URL + '/sprites/items/rattata_tail.png';
			const keyPath = process.env.PUBLIC_URL + '/sprites/items/key.png';
			const bronzechestPath = process.env.PUBLIC_URL + '/sprites/items/bronze_chest.png';

			await this.sprites.load('hub', hubPath);
			await this.sprites.load('quaksire_walk', quaksireWalkPath);
			await this.sprites.load('rattata_walk', rattataWalkPath);
			await this.sprites.load('quaksire_hurt', quaksireHurtPath);
			await this.sprites.load('rattata_hurt', rattataHurtPath);
			await this.sprites.load('rattata_tail', rattataTailPath);
			await this.sprites.load('key', keyPath);
			await this.sprites.load('bronze_chest', bronzechestPath);

			try {
				await this.sprites.load('quaksire_faint', quaksireFaintPath);
			} catch (error) {
				console.warn('Quaksire faint animation not found, skipping');
			}
			try {
				await this.sprites.load('rattata_faint', rattataFaintPath);
			} catch (error) {
				console.warn('Rattata faint animation not found, skipping');
			}
			await this.sprites.load('quaksire_charge', quaksireChargePath);
			await this.sprites.load('caterpie_walk', caterpieWalkPath);
			await this.sprites.load('caterpie_hurt', caterpieHurtPath);
			try {
				await this.sprites.load('caterpie_faint', caterpieFaintPath);
			} catch (error) {
				console.warn('Caterpie faint animation not found, skipping');
			}
			await this.sprites.load('caterpie_shoot', caterpieShootPath);
			
			await this.sprites.load('pidgey_walk', pidgeyWalkPath);
			await this.sprites.load('pidgey_hurt', pidgeyHurtPath);
			try {
				await this.sprites.load('pidgey_faint', pidgeyFaintPath);
			} catch (error) {
				console.warn('Pidgey faint animation not found, skipping');
			}
			const coinsSpritePath = process.env.PUBLIC_URL + '/coins.png';
			await this.sprites.load('coins', coinsSpritePath);

			const stoneSpritePath = process.env.PUBLIC_URL + '/stone.png';
			await this.sprites.load('stone', stoneSpritePath);

			const mapBackgrounds = ['forest', 'mountain', 'cave', 'desert', 'volcano'];
			for (const mapName of mapBackgrounds) {
				try {
					const mapPath = process.env.PUBLIC_URL + `/maps/${mapName}.png`;
					await this.sprites.load(`map_${mapName}`, mapPath);
				} catch (error) {
					console.warn(`Map background ${mapName} not found, skipping`);
				}
			}

			const orbSoundPath = process.env.PUBLIC_URL + '/orb.wav';
			this.audio.load('orb', orbSoundPath);

			const coinsSoundPath = process.env.PUBLIC_URL + '/coins.wav';
			this.audio.load('coins', coinsSoundPath);

			const hitSoundPath = process.env.PUBLIC_URL + '/hit.wav';
			this.audio.load('hit', hitSoundPath);

			const okSoundPath = process.env.PUBLIC_URL + '/ok.wav';
			this.audio.load('ok', okSoundPath);

			const earthquakeSoundPath = process.env.PUBLIC_URL + '/earthquake.wav';
			this.audio.load('earthquake', earthquakeSoundPath);

			const hydrocanonSoundPath = process.env.PUBLIC_URL + '/hydrocanon.wav';
			this.audio.load('hydrocanon', hydrocanonSoundPath);

			const victorySoundPath = process.env.PUBLIC_URL + '/victory.mp3';
			this.audio.load('victory', victorySoundPath);

			const defeatSoundPath = process.env.PUBLIC_URL + '/defeat.mp3';
			this.audio.load('defeat', defeatSoundPath);

			const mainMenuMusicPath = process.env.PUBLIC_URL + '/main_menu.mp3';
			this.audio.loadMusic('main_menu', mainMenuMusicPath);

			const hubMusicPath = process.env.PUBLIC_URL + '/hub.mp3';
			this.audio.loadMusic('hub', hubMusicPath);

			const victoryMusicPath = process.env.PUBLIC_URL + '/victory.mp3';
			this.audio.loadMusic('victory', victoryMusicPath);

			const defeatMusicPath = process.env.PUBLIC_URL + '/defeat.mp3';
			this.audio.loadMusic('defeat', defeatMusicPath);

			const mapMusics = ['forest', 'mountain', 'cave', 'desert', 'volcano'];
			for (const mapName of mapMusics) {
				try {
					const mapMusicPath = process.env.PUBLIC_URL + `/${mapName}.mp3`;
					this.audio.loadMusic(`map_${mapName}`, mapMusicPath);
				} catch (error) {
					console.warn(`Map music ${mapName} not found, skipping`);
				}
			}

			// Load pokemon profile images (Normal.png)
			const pokemonSet = new Set();
			Object.keys(PokemonSprites).forEach(pokemonName => {
				pokemonSet.add(pokemonName);
			});
			Object.keys(MapEnemies).forEach(mapId => {
				const enemyPool = MapEnemies[mapId];
				enemyPool.forEach(enemyData => {
					const enemyType = EnemyTypes[enemyData.type];
					if (enemyType && enemyType.pokemon) {
						pokemonSet.add(enemyType.pokemon);
					}
				});
			});

			for (const pokemonName of pokemonSet) {
				try {
					const normalImagePath = process.env.PUBLIC_URL + `/sprites/pokemon/${pokemonName}/Normal.png`;
					await this.sprites.load(`pokemon_${pokemonName}_normal`, normalImagePath);
				} catch (error) {
					console.warn(`Pokemon normal image for ${pokemonName} not found, skipping`);
				}
			}

			try {
				const kecleonNormalPath = process.env.PUBLIC_URL + '/sprites/pokemon/kecleon/Normal.png';
				await this.sprites.load('kecleon_normal', kecleonNormalPath);
			} catch (error) {
				console.warn('Kecleon normal image not found, skipping');
			}
			try {
				const kecleonHappyPath = process.env.PUBLIC_URL + '/sprites/pokemon/kecleon/Happy.png';
				await this.sprites.load('kecleon_happy', kecleonHappyPath);
			} catch (error) {
				console.warn('Kecleon happy image not found, skipping');
			}
			try {
				const kecleonIdlePath = process.env.PUBLIC_URL + '/sprites/pokemon/kecleon/Idle-Anim.png';
				await this.sprites.load('kecleon_idle', kecleonIdlePath);
			} catch (error) {
				console.warn('Kecleon idle animation not found, skipping');
			}

			for (const itemId of Object.keys(ItemConfig)) {
				const item = ItemConfig[itemId];
				if (item.iconImage) {
					try {
						const itemImagePath = process.env.PUBLIC_URL + item.iconImage;
						await this.sprites.load(`item_${itemId}`, itemImagePath);
					} catch (error) {
						console.warn(`Item image for ${itemId} not found, skipping`);
					}
				}
			}
		} catch (error) {
			console.error('Error loading assets:', error);
		}
	}

	loop(timestamp) {
		const deltaTime = timestamp - this.lastTime;
		this.lastTime = timestamp;

		this.update(deltaTime);
		this.render();

		requestAnimationFrame(this.loop.bind(this));
	}

	update(deltaTime) {
		this.sceneManager.update(deltaTime);
	}

	render() {
		this.renderer.clear();
		this.sceneManager.render(this.renderer);
	}

	loadSettings() {
		try {
			const saved = localStorage.getItem('poksrm_settings');
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.soundVolume !== undefined) {
					parsed.soundEnabled = parsed.soundVolume > 0;
					delete parsed.soundVolume;
				}
				if (parsed.musicVolume !== undefined) {
					parsed.musicEnabled = parsed.musicVolume > 0;
					delete parsed.musicVolume;
				}
				this.settings = { ...this.settings, ...parsed };
			}
		} catch (error) {
			console.warn('Failed to load settings:', error);
		}
	}

	saveSettings() {
		try {
			localStorage.setItem('poksrm_settings', JSON.stringify(this.settings));
		} catch (error) {
			console.warn('Failed to save settings:', error);
		}
	}

	applySettings() {
		this.audio.setEnabled(this.settings.soundEnabled);
		this.audio.setMusicEnabled(this.settings.musicEnabled);
	}
}

