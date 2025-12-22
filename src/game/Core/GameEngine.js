import AudioManager from '../Systems/AudioManager.js'
import GameManager from '../Systems/GameManager.js'
import SpriteManager from '../Systems/SpriteManager.js'
import { EnemyTypes, MapEnemies } from '../Config/EnemyConfig.js'
import { ItemConfig } from '../Config/ItemConfig.js'
import { PokemonSprites } from '../Config/SpriteConfig.js'
import InputManager from './InputManager.js'
import Renderer from './Renderer.js'
import SceneManager from './SceneManager.js'

export default class GameEngine {
	constructor(canvas) {
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.canvas.style.cursor = 'crosshair'

		this.renderer = new Renderer(this.ctx)
		this.input = new InputManager()
		this.input.setCanvas(canvas)

		this.sprites = new SpriteManager()
		this.audio = new AudioManager()

		this.input.onFirstInteraction = () => this.audio.unlockAudio()

		this.gameManager = new GameManager(this)
		this.sceneManager = new SceneManager(this)

		this.lastTime = 0
		this.assetsLoaded = false

		this.money = 0
		this.displayedMoney = 0
		this.inventory = {}
		this.equippedItems = []
		this.assignedConsumable = null
		this.incubatingEgg = null
		this.eggProgress = {}
		this.eggUniqueIds = {}

		this.encounteredPokemons = new Set()
		this.playedPokemons = new Set()
		this.playedMaps = new Set()

		this.defeatedPokemonCounts = {}
		this.totalPlayTime = 0
		this.gamesPlayed = 0

		this.settings = {
			screenshakeEnabled: true,
			soundEnabled: true,
			musicEnabled: true
		}

		this.loadSettings()
		this.applySettings()
	}

	async start() {
		await this.loadAssets()
		this.assetsLoaded = true
		this.sceneManager.pushScene('menu')
		requestAnimationFrame(this.loop.bind(this))
	}

	async loadAssets() {
		const base = process.env.PUBLIC_URL

		const loadSprite = (id, path) => this.sprites.load(id, `${base}${path}`)
		const loadOptional = async (id, path) => {
			try {
				await loadSprite(id, path)
			} catch {}
		}

		const staticSprites = {
			background_1: '/background_1.png',
			background_2: '/background_2.png',
			background_3: '/background_3.png',
			menu_empty: '/menu_empty.png',
			empty_continue_game: '/empty_continue_game.png',
			continue_menu_overlay: '/continue_menu_overlay.png',
			new_char_overlay: '/new_char_overlay.png',
			inventory_overlay: '/inventory_overlay.png',
			hub_pause: '/hub_pause.png',
			shop: '/shop.png',
			shop_long: '/shop_long.png',
			shop_overlay: '/shop_overlay.png',
			map_selection_screen: '/map_selection_screen.png',
			confirm_menu: '/confirm_menu.png',
			hub: '/hub.png',
			coins: '/coins.png',
			stone: '/stone.png',
			game_over: '/game_over.png'
		}

		for (const [id, path] of Object.entries(staticSprites)) {
			await loadSprite(id, path)
		}

		const items = {
			apple: '/sprites/items/apple.png',
			golden_apple: '/sprites/items/golden_apple.png',
			mystic_water: '/sprites/items/mystic_water.png',
			key: '/sprites/items/key.png',
			bronze_chest: '/sprites/items/bronze_chest.png',
			rattata_tail: '/sprites/items/rattata_tail.png',
			no_egg: '/sprites/items/no_egg.png'
		}

		for (const [id, path] of Object.entries(items)) {
			await loadSprite(id, path)
		}

		const pokemonSprites = [
			['quaksire', ['walk', 'hurt', 'faint', 'charge']],
			['rattata', ['walk', 'hurt', 'faint']],
			['caterpie', ['walk', 'hurt', 'faint', 'shoot']],
			['pidgey', ['walk', 'hurt', 'faint']],
			['kecleon', ['normal', 'happy', 'idle', 'hurt', 'walk']],
			['chansey', ['normal', 'happy', 'idle', 'hurt', 'walk']],
			['garchomp', ['normal', 'hurt', 'walk', 'charge', 'sleep']],
			['wooper', ['walk', 'hurt']],
		]

		for (const [name, states] of pokemonSprites) {
			for (const state of states) {
				const file =
					state === 'normal' || state === 'happy'
						? `${state[0].toUpperCase()}${state.slice(1)}.png`
						: `${state[0].toUpperCase()}${state.slice(1)}-Anim.png`

				await loadOptional(
					`${name}_${state}`,
					`/sprites/pokemon/${name}/${file}`
				)
			}
		}

		const maps = ['forest', 'mountain', 'cave', 'desert', 'volcano']
		for (const map of maps) {
			await loadOptional(`map_${map}`, `/maps/${map}.png`)
			this.audio.loadMusic(`map_${map}`, `${base}/${map}.mp3`)
		}

		const sounds = {
			orb: '/orb.wav',
			coins: '/coins.wav',
			hit: '/hit.wav',
			ok: '/ok.wav',
			victory: '/victory.mp3',
			defeat: '/defeat.mp3'
		}

		for (const [id, path] of Object.entries(sounds)) {
			this.audio.load(id, `${base}${path}`)
		}

		const musics = {
			main_menu: '/main_menu.mp3',
			hub: '/hub.mp3',
			victory: '/victory.mp3',
			defeat: '/defeat.mp3'
		}

		for (const [id, path] of Object.entries(musics)) {
			this.audio.loadMusic(id, `${base}${path}`)
		}

		const pokemonSet = new Set([
			...Object.keys(PokemonSprites),
			...Object.values(MapEnemies)
				.flat()
				.map(e => EnemyTypes[e.type]?.pokemon)
				.filter(Boolean)
		])

		for (const name of pokemonSet) {
			await loadOptional(
				`pokemon_${name}_normal`,
				`/sprites/pokemon/${name}/Normal.png`
			)
		}

		for (const [id, item] of Object.entries(ItemConfig)) {
			if (item.iconImage) {
				await loadOptional(`item_${id}`, item.iconImage)
			}
		}
	}

	loop(timestamp) {
		const deltaTime = timestamp - this.lastTime
		this.lastTime = timestamp
		this.update(deltaTime)
		this.render()
		requestAnimationFrame(this.loop.bind(this))
	}

	update(deltaTime) {
		this.sceneManager.update(deltaTime)
	}

	render() {
		this.renderer.clear()
		this.sceneManager.render(this.renderer)
	}

	loadSettings() {
		const saved = localStorage.getItem('poksrm_settings')
		if (!saved) return

		const parsed = JSON.parse(saved)

		if (parsed.soundVolume !== undefined) {
			parsed.soundEnabled = parsed.soundVolume > 0
			delete parsed.soundVolume
		}

		if (parsed.musicVolume !== undefined) {
			parsed.musicEnabled = parsed.musicVolume > 0
			delete parsed.musicVolume
		}

		this.settings = { ...this.settings, ...parsed }
	}

	saveSettings() {
		localStorage.setItem('poksrm_settings', JSON.stringify(this.settings))
	}

	applySettings() {
		this.audio.setEnabled(this.settings.soundEnabled)
		this.audio.setMusicEnabled(this.settings.musicEnabled)
	}
}
