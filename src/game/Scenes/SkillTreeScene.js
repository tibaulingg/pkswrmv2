import { SkillTreeConfig, getNodeById } from '../Config/SkillTreeConfig.js';
import SaveManager from '../Systems/SaveManager.js';

export default class SkillTreeScene {
	constructor(engine) {
		this.engine = engine;
		this.selectedBranchIndex = 0;
		this.selectedNodeIndex = 0;
	}

	init(data) {
		this.loadSkillTreeState();
		this.selectedBranchIndex = 0;
		this.selectedNodeIndex = 0;
	}

	loadSkillTreeState() {
		if (!this.engine.skillTreeState) {
			this.engine.skillTreeState = {};
		}

		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				const nodeState = this.engine.skillTreeState[node.id];
				if (nodeState && typeof nodeState.currentRank === 'number') {
					node.currentRank = Math.min(Math.max(0, nodeState.currentRank), node.maxRank);
				} else {
					node.currentRank = 0;
				}
			}
		}
	}

	saveSkillTreeState() {
		if (!this.engine.skillTreeState) {
			this.engine.skillTreeState = {};
		}

		for (const branch of SkillTreeConfig.branches) {
			for (const node of branch.nodes) {
				this.engine.skillTreeState[node.id] = {
					currentRank: node.currentRank
				};
			}
		}
	}

	getCurrentBranch() {
		return SkillTreeConfig.branches[this.selectedBranchIndex];
	}

	getCurrentNode() {
		const branch = this.getCurrentBranch();
		if (!branch) return null;
		return branch.nodes[this.selectedNodeIndex];
	}

	isNodeUnlocked(node) {
		if (node.requirements.length === 0) return true;
		
		for (const reqId of node.requirements) {
			const reqNode = getNodeById(reqId);
			if (!reqNode || reqNode.currentRank < reqNode.maxRank) {
				return false;
			}
		}
		return true;
	}

	canAffordNode(node) {
		const currentCost = this.getNodeCost(node);
		return this.engine.money >= currentCost;
	}

	getNodeCost(node) {
		const baseCost = node.cost;
		const rankMultiplier = Math.pow(1.5, node.currentRank);
		return Math.floor(baseCost * rankMultiplier);
	}

	canUpgradeNode(node) {
		return node.currentRank < node.maxRank && 
			   this.isNodeUnlocked(node) && 
			   this.canAffordNode(node);
	}

	purchaseNode() {
		const node = this.getCurrentNode();
		if (!node) return;

		if (!this.canUpgradeNode(node)) {
			this.engine.audio.play('ok', 0.1, 0.1);
			return;
		}

		const cost = this.getNodeCost(node);
		const message = `Acheter ${node.name} pour ${SaveManager.formatLargeNumber(cost)} pièces ?`;

		this.engine.sceneManager.pushScene('confirmMenu', {
			message: message,
			onYes: (engine) => {
				if (engine.money >= cost) {
					engine.money -= cost;
					if (node.currentRank < node.maxRank) {
						node.currentRank = node.currentRank + 1;
					}
					this.saveSkillTreeState();
					SaveManager.saveGame(engine, false);
					engine.audio.play('coins', 0.5, 0.2);
				} else {
					engine.audio.play('ok', 0.1, 0.1);
				}
				engine.sceneManager.popScene();
			},
			onNo: (engine) => {
				engine.sceneManager.popScene();
			}
		});
		this.engine.audio.play('ok', 0.3, 0.1);
	}

	update(deltaTime) {
		const currentScene = this.engine.sceneManager.getCurrentScene();
		const isConfirmMenuOpen = currentScene && (currentScene.constructor.name === 'ConfirmMenuScene' || currentScene === this.engine.sceneManager.scenes.confirmMenu);

		if (isConfirmMenuOpen) {
			return;
		}

		const moneyDiff = this.engine.money - this.engine.displayedMoney;
		if (Math.abs(moneyDiff) > 0.5) {
			this.engine.displayedMoney += moneyDiff * 0.2;
		} else {
			this.engine.displayedMoney = this.engine.money;
		}

		const key = this.engine.input.consumeLastKey();
		const branch = this.getCurrentBranch();

		if (key === 'ArrowLeft') {
			this.selectedBranchIndex = Math.max(0, this.selectedBranchIndex - 1);
			this.selectedNodeIndex = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowRight') {
			this.selectedBranchIndex = Math.min(SkillTreeConfig.branches.length - 1, this.selectedBranchIndex + 1);
			this.selectedNodeIndex = 0;
			this.engine.audio.play('ok', 0.3, 0.1);
		} else if (key === 'ArrowUp') {
			if (branch) {
				this.selectedNodeIndex = Math.max(0, this.selectedNodeIndex - 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (key === 'ArrowDown') {
			if (branch) {
				this.selectedNodeIndex = Math.min(branch.nodes.length - 1, this.selectedNodeIndex + 1);
				this.engine.audio.play('ok', 0.3, 0.1);
			}
		} else if (key === 'Enter') {
			this.purchaseNode();
		} else if (key === 'Escape') {
			this.engine.sceneManager.popScene();
			this.engine.audio.play('ok', 0.3, 0.1);
		}
	}

	render(renderer) {
		renderer.ctx.save();
		renderer.ctx.globalAlpha = 0.8;
		renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
		renderer.ctx.globalAlpha = 1;

		const popupWidth = renderer.width * 0.9;
		const popupHeight = renderer.height * 0.8;
		const popupX = (renderer.width - popupWidth) / 2;
		const popupY = (renderer.height - popupHeight) / 2;

		renderer.ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
		renderer.ctx.fillRect(popupX, popupY, popupWidth, popupHeight);

		renderer.ctx.strokeStyle = 'rgba(100, 100, 120, 0.8)';
		renderer.ctx.lineWidth = 4;
		renderer.ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);

		const titleY = popupY + 30;
		renderer.ctx.save();
		renderer.ctx.font = 'bold 40px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 3;
		renderer.ctx.strokeText('ARBRE D\'AMÉLIORATION', renderer.width / 2, titleY);
		renderer.ctx.fillText('ARBRE D\'AMÉLIORATION', renderer.width / 2, titleY);
		renderer.ctx.restore();

		const moneyY = titleY + 50;
		const moneyFontSize = '24px';
		const coinSize = 28;
		const coinX = popupX + popupWidth - 50;
		const spacing = 5;
		const money = Math.floor(this.engine.displayedMoney) || 0;
		const moneyText = SaveManager.formatLargeNumber(money);

		renderer.ctx.save();
		renderer.ctx.font = `${moneyFontSize} Pokemon`;
		renderer.ctx.textAlign = 'right';
		renderer.ctx.textBaseline = 'middle';
		renderer.ctx.fillStyle = 'rgb(43, 231, 216)';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 2;
		renderer.ctx.strokeText(moneyText, coinX - spacing, moneyY);
		renderer.ctx.fillText(moneyText, coinX - spacing, moneyY);

		const coinsImage = this.engine.sprites.get('coins');
		if (coinsImage) {
			renderer.drawImage(coinsImage, coinX, moneyY - coinSize / 2, coinSize, coinSize);
		}
		renderer.ctx.restore();

		const branchStartY = popupY + 110;
		const branchSpacing = (popupWidth - 30) / SkillTreeConfig.branches.length;
		const nodeHeight = 65;
		const LINKED_NODE_SPACING = 20;
		const UNLINKED_NODE_SPACING = 40;
		
		const calculateNodePositions = (branch) => {
			const positions = [];
			let currentY = branchStartY;
			
			branch.nodes.forEach((node, nodeIndex) => {
				positions.push({
					node: node,
					index: nodeIndex,
					y: currentY,
					centerY: currentY + nodeHeight / 2
				});
				
				const nextNode = branch.nodes[nodeIndex + 1];
				if (nextNode) {
					const isLinked = nextNode.requirements && nextNode.requirements.length > 0 && 
						nextNode.requirements.some(reqId => {
							const reqNode = getNodeById(reqId);
							return reqNode && branch.nodes.some(n => n.id === reqId && branch.nodes.indexOf(n) <= nodeIndex);
						});
					currentY += nodeHeight + (isLinked ? LINKED_NODE_SPACING : UNLINKED_NODE_SPACING);
				}
			});
			
			return positions;
		};

		SkillTreeConfig.branches.forEach((branch, branchIndex) => {
			const branchX = popupX + 15 + branchIndex * branchSpacing;
			const branchWidth = branchSpacing - 20;
			const isSelectedBranch = branchIndex === this.selectedBranchIndex;
			const branchCenterX = branchX + branchWidth / 2;

			renderer.ctx.save();
			renderer.ctx.font = 'bold 22px Pokemon';
			renderer.ctx.textAlign = 'center';
			renderer.ctx.textBaseline = 'top';
			renderer.ctx.fillStyle = isSelectedBranch ? '#ffff00' : '#ffffff';
			renderer.ctx.strokeStyle = '#000000';
			renderer.ctx.lineWidth = 2;
			renderer.ctx.strokeText(branch.name, branchCenterX, branchStartY - 25);
			renderer.ctx.fillText(branch.name, branchCenterX, branchStartY - 25);
			renderer.ctx.restore();
		});

		const nodePositionsMap = new Map();
		SkillTreeConfig.branches.forEach((branch, branchIndex) => {
			nodePositionsMap.set(branchIndex, calculateNodePositions(branch));
		});

		SkillTreeConfig.branches.forEach((branch, branchIndex) => {
			const branchX = popupX + 15 + branchIndex * branchSpacing;
			const branchWidth = branchSpacing - 20;
			const branchCenterX = branchX + branchWidth / 2;
			const positions = nodePositionsMap.get(branchIndex);

			positions.forEach((pos) => {
				const node = pos.node;
				const nodeCenterY = pos.centerY;

				if (node.requirements && node.requirements.length > 0) {
					node.requirements.forEach(reqId => {
						const reqNode = getNodeById(reqId);
						if (reqNode) {
							const reqBranchIndex = SkillTreeConfig.branches.findIndex(b => 
								b.nodes.some(n => n.id === reqId)
							);
							if (reqBranchIndex >= 0) {
								const reqBranch = SkillTreeConfig.branches[reqBranchIndex];
								const reqPositions = nodePositionsMap.get(reqBranchIndex);
								const reqPos = reqPositions.find(p => p.node.id === reqId);
								if (reqPos) {
									const reqBranchX = popupX + 15 + reqBranchIndex * branchSpacing;
									const reqBranchWidth = branchSpacing - 20;
									const reqBranchCenterX = reqBranchX + reqBranchWidth / 2;
									
									const reqNodeState = this.engine.skillTreeState[reqId];
									const reqIsMaxed = reqNodeState && reqNodeState.currentRank >= reqNode.maxRank;
									
									renderer.ctx.save();
									renderer.ctx.strokeStyle = reqIsMaxed ? '#4af626' : '#666666';
									renderer.ctx.lineWidth = 2;
									renderer.ctx.globalAlpha = 0.6;
									renderer.ctx.beginPath();
									renderer.ctx.moveTo(reqBranchCenterX, reqPos.centerY);
									renderer.ctx.lineTo(branchCenterX, nodeCenterY);
									renderer.ctx.stroke();
									renderer.ctx.globalAlpha = 1;
									renderer.ctx.restore();
								}
							}
						}
					});
				} else {
					const nodeIndex = pos.index;
					const nextNodeIndex = nodeIndex + 1;
					if (nextNodeIndex < branch.nodes.length) {
						const nextNode = branch.nodes[nextNodeIndex];
						if (nextNode.requirements && nextNode.requirements.length > 0 && nextNode.requirements.includes(node.id)) {
							const nextPos = positions.find(p => p.index === nextNodeIndex);
							if (nextPos) {
								const baseNodeBottom = pos.y + nodeHeight;
								const nextNodeTop = nextPos.y;
								
								renderer.ctx.save();
								renderer.ctx.strokeStyle = '#666666';
								renderer.ctx.lineWidth = 2;
								renderer.ctx.globalAlpha = 0.5;
								renderer.ctx.beginPath();
								renderer.ctx.moveTo(branchCenterX, baseNodeBottom);
								renderer.ctx.lineTo(branchCenterX, nextNodeTop);
								renderer.ctx.stroke();
								renderer.ctx.globalAlpha = 1;
								renderer.ctx.restore();
							}
						}
					}
				}
			});
		});

		SkillTreeConfig.branches.forEach((branch, branchIndex) => {
			const branchX = popupX + 15 + branchIndex * branchSpacing;
			const branchWidth = branchSpacing - 20;
			const isSelectedBranch = branchIndex === this.selectedBranchIndex;
			const positions = nodePositionsMap.get(branchIndex);

			positions.forEach((pos) => {
				const node = pos.node;
				const nodeIndex = pos.index;
				const nodeY = pos.y;
				const isSelected = isSelectedBranch && nodeIndex === this.selectedNodeIndex;
				const isUnlocked = this.isNodeUnlocked(node);
				const isMaxed = node.currentRank >= node.maxRank;
				const canAfford = this.canAffordNode(node);

				renderer.ctx.save();

				if (isSelected) {
					const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
					renderer.ctx.shadowColor = '#ffff00';
					renderer.ctx.shadowBlur = 20 * pulse;
				}

				let bgColor;
				if (!isUnlocked) {
					bgColor = 'rgba(40, 40, 40, 0.9)';
				} else if (isMaxed) {
					bgColor = 'rgba(255, 215, 0, 0.25)';
				} else if (canAfford) {
					bgColor = 'rgba(26, 26, 26, 0.9)';
				} else {
					bgColor = 'rgba(60, 60, 60, 0.9)';
				}

				renderer.ctx.fillStyle = bgColor;
				renderer.ctx.fillRect(branchX, nodeY, branchWidth, nodeHeight);

				let borderColor;
				if (isSelected) {
					borderColor = '#ffff00';
				} else if (!isUnlocked) {
					borderColor = '#444444';
				} else if (isMaxed) {
					borderColor = '#ffd700';
				} else if (canAfford) {
					borderColor = '#ffffff';
				} else {
					borderColor = '#888888';
				}

				renderer.ctx.strokeStyle = borderColor;
				renderer.ctx.lineWidth = isSelected ? 4 : 2;
				renderer.ctx.strokeRect(branchX, nodeY, branchWidth, nodeHeight);

				if (isMaxed) {
					const barHeight = 4;
					renderer.ctx.fillStyle = '#ffd700';
					renderer.ctx.fillRect(branchX, nodeY, branchWidth, barHeight);
				}

				renderer.ctx.shadowBlur = 0;

				renderer.ctx.font = '16px Pokemon';
				renderer.ctx.textAlign = 'left';
				renderer.ctx.textBaseline = 'top';
				renderer.ctx.fillStyle = isUnlocked ? '#ffffff' : '#888888';
				renderer.ctx.strokeStyle = '#000000';
				renderer.ctx.lineWidth = 1.5;

				let displayName = node.name;
				if (node.id === 'regen_1' && node.effect && node.effect.regen) {
					const nodeState = this.engine.skillTreeState[node.id];
					const currentRank = nodeState ? nodeState.currentRank : 0;
					const regenValue = node.effect.regen * (currentRank > 0 ? currentRank : 1);
					displayName = `+${regenValue} HP/s`;
				}
				
				const nodeNameLines = this.wrapText(renderer.ctx, displayName, branchWidth - 50);
				nodeNameLines.forEach((line, lineIndex) => {
					renderer.ctx.strokeText(line, branchX + 12, nodeY + 8 + lineIndex * 18);
					renderer.ctx.fillText(line, branchX + 12, nodeY + 8 + lineIndex * 18);
				});

				if (isMaxed) {
					renderer.ctx.font = 'bold 14px Pokemon';
					renderer.ctx.fillStyle = '#ffd700';
					renderer.ctx.textAlign = 'left';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 1.5;
					renderer.ctx.strokeText(`${node.maxRank}/${node.maxRank}`, branchX + 12, nodeY + nodeHeight - 20);
					renderer.ctx.fillText(`${node.maxRank}/${node.maxRank}`, branchX + 12, nodeY + nodeHeight - 20);
				} else {
					const cost = this.getNodeCost(node);
					const costText = SaveManager.formatLargeNumber(cost);
					const coinSize = 18;
					const coinSpacing = 4;
					
					renderer.ctx.font = '14px Pokemon';
					renderer.ctx.textAlign = 'right';
					const textMetrics = renderer.ctx.measureText(costText);
					const textWidth = textMetrics.width;
					
					const totalWidth = textWidth + coinSize + coinSpacing;
					const startX = branchX + branchWidth - 10;
					
					renderer.ctx.fillStyle = canAfford ? '#ffffff' : '#ff6666';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 1.5;
					renderer.ctx.strokeText(costText, startX, nodeY + 8);
					renderer.ctx.fillText(costText, startX, nodeY + 8);

					const coinsImage = this.engine.sprites.get('coins');
					if (coinsImage) {
						renderer.drawImage(coinsImage, startX - textWidth - coinSpacing - coinSize, nodeY + 5, coinSize, coinSize);
					}

					renderer.ctx.textAlign = 'left';
					renderer.ctx.fillStyle = '#aaaaaa';
					renderer.ctx.font = '12px Pokemon';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 1;
					renderer.ctx.strokeText(`${node.currentRank}/${node.maxRank}`, branchX + 12, nodeY + nodeHeight - 20);
					renderer.ctx.fillText(`${node.currentRank}/${node.maxRank}`, branchX + 12, nodeY + nodeHeight - 20);
				}

				if (isSelected) {
					const arrowBounce = Math.sin(Date.now() / 200) * 3;
					renderer.ctx.save();
					renderer.ctx.font = '24px Pokemon';
					renderer.ctx.fillStyle = '#ffff00';
					renderer.ctx.textAlign = 'left';
					renderer.ctx.strokeStyle = '#000000';
					renderer.ctx.lineWidth = 2;
					renderer.ctx.strokeText('>', branchX - 30, nodeY + nodeHeight / 2 - arrowBounce);
					renderer.ctx.fillText('>', branchX - 30, nodeY + nodeHeight / 2 - arrowBounce);
					renderer.ctx.restore();
				}

				renderer.ctx.restore();
			});
		});

		const selectedNode = this.getCurrentNode();
		const helperY = popupY + popupHeight - 50;
		renderer.ctx.save();
		renderer.ctx.fillStyle = '#ffffff';
		renderer.ctx.font = '20px Pokemon';
		renderer.ctx.textAlign = 'center';
		renderer.ctx.textBaseline = 'top';
		renderer.ctx.strokeStyle = '#000000';
		renderer.ctx.lineWidth = 1.5;

		if (selectedNode) {
			if (!this.isNodeUnlocked(selectedNode)) {
				renderer.ctx.fillStyle = '#ff6666';
				renderer.ctx.strokeText('Prérequis non remplis', renderer.width / 2, helperY);
				renderer.ctx.fillText('Prérequis non remplis', renderer.width / 2, helperY);
			} else if (selectedNode.currentRank >= selectedNode.maxRank) {
				renderer.ctx.fillStyle = '#ffd700';
				renderer.ctx.strokeText('Amélioration maximale atteinte', renderer.width / 2, helperY);
				renderer.ctx.fillText('Amélioration maximale atteinte', renderer.width / 2, helperY);
			} else if (!this.canAffordNode(selectedNode)) {
				renderer.ctx.fillStyle = '#ff6666';
				renderer.ctx.strokeText('Fonds insuffisants', renderer.width / 2, helperY);
				renderer.ctx.fillText('Fonds insuffisants', renderer.width / 2, helperY);
			} else {
				renderer.ctx.fillStyle = '#ffffff';
				renderer.ctx.strokeText('← → ↑ ↓ pour naviguer | ENTRÉE pour acheter | Échap pour quitter', renderer.width / 2, helperY);
				renderer.ctx.fillText('← → ↑ ↓ pour naviguer | ENTRÉE pour acheter | Échap pour quitter', renderer.width / 2, helperY);
			}
		} else {
			renderer.ctx.fillStyle = '#ffffff';
			renderer.ctx.strokeText('← → ↑ ↓ pour naviguer | ENTRÉE pour acheter | Échap pour quitter', renderer.width / 2, helperY);
			renderer.ctx.fillText('← → ↑ ↓ pour naviguer | ENTRÉE pour acheter | Échap pour quitter', renderer.width / 2, helperY);
		}
		renderer.ctx.restore();

		renderer.ctx.restore();
	}

	wrapText(ctx, text, maxWidth) {
		const words = text.split(' ');
		const lines = [];
		let currentLine = words[0];

		for (let i = 1; i < words.length; i++) {
			const word = words[i];
			const width = ctx.measureText(currentLine + ' ' + word).width;
			if (width < maxWidth) {
				currentLine += ' ' + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}
		lines.push(currentLine);
		return lines;
	}
}
