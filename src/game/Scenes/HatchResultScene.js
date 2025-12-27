import { getPokemonConfig } from '../Config/SpriteConfig.js';
import SaveManager from '../Systems/SaveManager.js';

export default class HatchResultScene {
	constructor(engine) {
		this.engine = engine;
		this.hatchResultData = null;
		this.keyProcessed = false;
	}

	init(data) {
		this.hatchResultData = data?.hatchResultData || null;
		this.keyProcessed = false;
	}

	update(deltaTime) {
		const key = this.engine.input.consumeLastKey();
		
		// Vérifier les touches pour fermer le menu
		if (key && (key === 'Enter' || key === 'NumpadEnter' || key === 'Escape' || key === 'Space')) {
			if (!this.keyProcessed) {
				this.keyProcessed = true;
				this.close();
				this.engine.audio.play('ok', 0.3, 0.1);
			}
			return;
		}
		
		// Réinitialiser le flag si aucune touche n'est pressée
		if (!key) {
			this.keyProcessed = false;
		}
	}

	close() {
		if (!this.hatchResultData) {
			this.engine.sceneManager.popScene();
			return;
		}

		const hatchedPokemon = this.hatchResultData.pokemon;
		
		if (!this.engine.encounteredPokemons) {
			this.engine.encounteredPokemons = new Set();
		}
		if (!this.engine.playedPokemons) {
			this.engine.playedPokemons = new Set();
		}
		
		this.engine.encounteredPokemons.add(hatchedPokemon);
		this.engine.playedPokemons.add(hatchedPokemon);
		SaveManager.saveGame(this.engine, false);
		
		// Nettoyer l'animation de hatch pour faire disparaître le pokémon
		const gameScene = this.engine.sceneManager.scenes.game;
		if (gameScene && gameScene.eggHatchingAnimation) {
			gameScene.eggHatchingAnimation = null;
		}
		
		this.engine.sceneManager.popScene();
		
		// Retourner au shop
		setTimeout(() => {
			this.engine.sceneManager.pushScene('shop', { shopId: 'chansey' });
			const shopScene = this.engine.sceneManager.stack.find(
				scene => scene === this.engine.sceneManager.scenes.shop
			);
			if (shopScene) {
				shopScene.mode = 'hatching';
				shopScene.selectedItemIndex = 0;
				shopScene.currentPage = 0;
			}
		}, 100);
	}

	render(renderer) {
		if (!this.hatchResultData) {
			this.close();
			return;
		}

		const hatchedPokemon = this.hatchResultData.pokemon;
		const newIVs = this.hatchResultData.newIVs;
		const oldIVs = this.hatchResultData.oldIVs;
		const pokemonConfig = getPokemonConfig(hatchedPokemon);
		
		if (!pokemonConfig) {
			this.close();
			return;
		}

		// Fond semi-transparent
		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		renderer.ctx.restore();

		// Panel principal
		const panelWidth = 800;
		const panelHeight = 550; // Réduit pour un écran plus compact
		const panelX = (renderer.width - panelWidth) / 2;
		const panelY = (renderer.height - panelHeight) / 2;

		renderer.ctx.save();
		renderer.ctx.fillStyle = 'rgba(30, 30, 50, 0.95)';
		renderer.ctx.strokeStyle = '#87CEEB';
		renderer.ctx.lineWidth = 4;
		renderer.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
		renderer.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
		renderer.ctx.restore();

		// Titre
		const pokemonName = pokemonConfig.name || hatchedPokemon;
		const isNewPokemon = !oldIVs; // Nouveau pokémon si oldIVs est null
		const titleY = panelY + 40;
		renderer.ctx.save();
		renderer.ctx.font = 'bold 36px Pokemon';
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'top';
		
		let titleText = pokemonName;
		if (isNewPokemon) {
			titleText = '🆕 ' + pokemonName + ' 🆕';
		}
		
		if (newIVs && newIVs.shiny) {
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 3;
			renderer.ctx.strokeText('✨ ' + titleText + ' ✨', renderer.width / 2, titleY);
			renderer.ctx.fillStyle = '#FFD700';
			renderer.ctx.fillText('✨ ' + titleText + ' ✨', renderer.width / 2, titleY);
		} else {
			renderer.ctx.fillText(titleText, renderer.width / 2, titleY);
		}
		renderer.ctx.restore();

		// Icône du pokémon
		const iconSize = 120;
		const iconX = renderer.width / 2 - iconSize / 2;
		const iconY = titleY + 60;
		const pokemonSprite = this.engine.sprites.get(`pokemon_${hatchedPokemon}_normal`);
		
		if (pokemonSprite) {
			if (newIVs && newIVs.shiny) {
				renderer.ctx.save();
				renderer.ctx.globalAlpha = 0.3;
				renderer.ctx.fillStyle = '#FFD700';
				renderer.ctx.fillRect(iconX - 4, iconY - 4, iconSize + 8, iconSize + 8);
				renderer.ctx.globalAlpha = 1;
				renderer.ctx.restore();
			}
			renderer.drawImage(pokemonSprite, iconX, iconY, iconSize, iconSize);
		}

		// Stats de base et IVs côte à côte
		const statsStartY = iconY + iconSize + 50; // Espacement après l'icône
		const statsFontSize = 18;
		const lineSpacing = 28; // Réduit l'espacement entre les lignes
		const baseColumnX = panelX + 150; // Colonne Base
		const ivColumnX = panelX + 450; // Colonne IV
		
		// Titres en colonnes
		renderer.ctx.save();
		renderer.ctx.textAlign = 'left';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.font = `bold ${statsFontSize}px Pokemon`;
		renderer.ctx.fillStyle = '#87CEEB';
		renderer.ctx.fillText('Base:', baseColumnX, statsStartY);
		renderer.ctx.restore();
		
		if (newIVs) {
			renderer.ctx.save();
			renderer.ctx.textAlign = 'left';
			renderer.ctx.textBaseline = 'top';
			renderer.ctx.font = `bold ${statsFontSize}px Pokemon`;
			renderer.ctx.fillStyle = '#FFD700';
			renderer.ctx.fillText('IV:', ivColumnX, statsStartY);
			renderer.ctx.restore();
		}

		const baseHp = pokemonConfig.hp || 0;
		const baseDamage = pokemonConfig.damage || 0;
		const baseAttackSpeed = pokemonConfig.attackSpeed || 0;
		const baseRange = pokemonConfig.range || 0;
		const baseSpeed = (pokemonConfig.speedMultiplier || 1) * 2;
		const baseKnockback = pokemonConfig.knockback || 0;

		const baseStats = [
			{ label: 'HP', value: baseHp },
			{ label: 'ATK', value: baseDamage },
			{ label: 'SPD', value: baseSpeed.toFixed(1) },
			{ label: 'ASP', value: baseAttackSpeed.toFixed(1) },
			{ label: 'RNG', value: baseRange },
			{ label: 'KNOC', value: baseKnockback }
		];

		const ivStats = newIVs ? [
			{ label: 'HP', key: 'hp' },
			{ label: 'ATK', key: 'damage' },
			{ label: 'SPD', key: 'speed' },
			{ label: 'ASP', key: 'attackSpeed' },
			{ label: 'RNG', key: 'range' },
			{ label: 'KNOC', key: 'knockback' }
		] : [];

		// Afficher les stats en colonnes
		baseStats.forEach((stat, index) => {
			const y = statsStartY + 30 + index * lineSpacing;
			
			// Base stat dans la colonne Base
			renderer.ctx.save();
			renderer.ctx.font = `bold ${statsFontSize}px Pokemon`;
			renderer.ctx.fillStyle = '#87CEEB';
			renderer.ctx.textAlign = 'left';
			renderer.ctx.fillText(`${stat.label}:`, baseColumnX, y);
			
			const labelWidth = renderer.ctx.measureText(`${stat.label}:`).width;
			renderer.ctx.font = `${statsFontSize}px Pokemon`;
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.fillText(stat.value.toString(), baseColumnX + labelWidth + 10, y);
			renderer.ctx.restore();
			
			// IV correspondant dans la colonne IV
			if (newIVs && ivStats[index]) {
				const ivStat = ivStats[index];
				const newValue = newIVs[ivStat.key] || 0;
				const oldValue = oldIVs ? (oldIVs[ivStat.key] || 0) : null;
				const isImproved = oldValue !== null && newValue > oldValue;
				const isMaxed = newValue === 31;
				
				renderer.ctx.save();
				renderer.ctx.font = `bold ${statsFontSize}px Pokemon`;
				renderer.ctx.fillStyle = '#FFD700';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.fillText(`${ivStat.label}:`, ivColumnX, y);
				
				const ivLabelWidth = renderer.ctx.measureText(`${ivStat.label}:`).width;
				let currentX = ivColumnX + ivLabelWidth + 10;
				
				// Afficher l'ancienne valeur si elle existe et qu'elle a été améliorée
				if (oldValue !== null && isImproved) {
					renderer.ctx.font = `${statsFontSize}px Pokemon`;
					renderer.ctx.fillStyle = '#888888';
					renderer.ctx.fillText(oldValue.toString(), currentX, y);
					
					currentX += renderer.ctx.measureText(oldValue.toString()).width + 10;
					renderer.ctx.fillStyle = '#FFD700';
					renderer.ctx.fillText('→', currentX, y);
					
					currentX += renderer.ctx.measureText('→').width + 10;
					renderer.ctx.font = `bold ${statsFontSize}px Pokemon`;
					renderer.ctx.fillStyle = isMaxed ? 'rgb(43, 231, 216)' : '#FFD700';
					renderer.ctx.fillText(newValue.toString(), currentX, y);
				} else {
					renderer.ctx.font = `${statsFontSize}px Pokemon`;
					renderer.ctx.fillStyle = isMaxed ? 'rgb(43, 231, 216)' : '#ffffff';
					renderer.ctx.fillText(newValue.toString(), currentX, y);
				}
				
				renderer.ctx.restore();
			}
		});

		// Instructions
		const instructionY = panelY + panelHeight - 40;
		renderer.ctx.save();
		renderer.ctx.font = '16px Pokemon';
		renderer.ctx.fillStyle = '#aaaaaa';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.fillText('Appuyez sur Entrée ou Espace pour continuer', renderer.width / 2, instructionY);
		renderer.ctx.restore();
	}
}

