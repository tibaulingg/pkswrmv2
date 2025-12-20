# Système d'Items

## Vue d'ensemble

Le système d'items permet d'ajouter des effets permanents ou temporaires au joueur. Les projectiles sont maintenant capables de gérer des dégâts de zone (AoE).

## Structure d'un Item

```javascript
{
  id: 'item_id',
  name: 'Nom de l\'item',
  description: 'Description de l\'effet',
  type: ItemType.PASSIVE | ItemType.WEAPON | ItemType.ACTIVE,
  rarity: ItemRarity.COMMON | ItemRarity.RARE | ItemRarity.EPIC | ItemRarity.LEGENDARY,
  icon: '💣',
  effect: {
    // Propriétés de l'effet
  }
}
```

## Propriétés des Projectiles AoE

### Dans `Projectile.js`
- `aoeRadius` : Rayon des dégâts de zone (0 = pas d'AoE)
- `hasAoE` : Boolean indiquant si le projectile fait des dégâts de zone
- `hitEnemies` : Set pour tracker les ennemis déjà touchés par l'AoE

### Dans `BattlePlayer.js`
- `aoeRadius` : Rayon AoE par défaut du joueur (0 = désactivé)
- `hasAoE` : Boolean pour savoir si les attaques font des dégâts de zone

## Utilisation

### Ajouter un item au joueur

```javascript
import ItemSystem from './Systems/ItemSystem.js';

// Dans BattleScene.init()
this.itemSystem = new ItemSystem(this.player);

// Ajouter un item
this.itemSystem.addItem('explosive_ammo');
```

### Créer un nouvel item

Dans `ItemSystem.js`, ajouter dans l'objet `Items` :

```javascript
new_item: {
  id: 'new_item',
  name: 'Nouvel Item',
  description: 'Fait quelque chose de cool',
  type: ItemType.PASSIVE,
  rarity: ItemRarity.EPIC,
  icon: '⚡',
  effect: {
    aoeRadius: 100,  // Ou d'autres propriétés
  }
}
```

### Implémenter l'effet

Dans `applyItemEffect()` :

```javascript
if (item.effect.aoeRadius) {
  this.player.aoeRadius = item.effect.aoeRadius;
  this.player.hasAoE = true;
}
```

## Exemples d'effets possibles

- **AoE Damage** : `aoeRadius: 80` - Dégâts de zone
- **Multi-shot** : `projectileCount: 3` - Tirer plusieurs projectiles
- **Pierce** : `pierce: true` - Les projectiles traversent les ennemis
- **Chain Lightning** : `chain: 3` - Les attaques rebondissent
- **DoT** : `burnDuration: 3000, burnDamage: 5` - Dégâts sur la durée

## Rendu Visuel AoE

Les projectiles avec AoE affichent automatiquement :
- Un cercle semi-transparent pulsant autour du projectile
- Le rayon correspond à la zone de dégâts

## Gestion des Collisions AoE

Le système gère deux types de hits :
1. **Direct Hit** : Collision directe avec la hitbox de l'ennemi (détruit le projectile)
2. **AoE Hit** : Ennemi dans le rayon AoE (le projectile continue)

Chaque ennemi ne peut être touché qu'une seule fois par projectile AoE grâce au système `hitEnemies`.


