import {
  HideoutChamberId,
  HideoutChamberConfig,
  HideoutChamberStatus,
  ChamberBonusInfo
} from '../types/hideout.js';

export const HIDEOUT_CHAMBERS: Record<HideoutChamberId, HideoutChamberConfig> = {
  throne_sarcophagus: {
    id: 'throne_sarcophagus',
    name: 'Trono Carmesim & Sarcófago',
    category: 'GOVERNANCE',
    icon: '👑',
    svgAsset: '/assets/camara_trono_sarcofago.svg',
    tagline: 'O Ápice da Soberania Imortal',
    lore: 'Esculpido em obsidiana pura e forrado com veludo carmesim. Aqui o lorde canaliza a vitae ancestral e comanda as sombras da metrópole.',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.55
  },
  catacomb_vault: {
    id: 'catacomb_vault',
    name: 'Cofre das Catacumbas & Baú de Ferro',
    category: 'ECONOMY',
    icon: '🪙',
    svgAsset: '/assets/camara_cofre_catacumbas.svg',
    tagline: 'Tesouros Blindados contra Saques',
    lore: 'Câmaras subterrâneas lacradas por trancas runificadas de aço negro. Ouro depositado aqui é inviolável mesmo nas derrotas mais sangrentas.',
    maxLevel: 5,
    baseCost: 150,
    costMultiplier: 1.45
  },
  blood_forge: {
    id: 'blood_forge',
    name: 'Forja das Sombras & Bigorna Ancestral',
    category: 'CRAFTING',
    icon: '⚒️',
    svgAsset: '/assets/camara_forja_ancestral.svg',
    tagline: 'Crisol de Aço Místico e Prata',
    lore: 'Alimentada por brasas infernais e fardos de prata pura. Molda lâminas vorazes e couraças imbuídas com sangue de abominações.',
    maxLevel: 5,
    baseCost: 250,
    costMultiplier: 1.6
  },
  ritual_sanctum: {
    id: 'ritual_sanctum',
    name: 'Círculo Oculto & Laboratório Alquímico',
    category: 'OCCULT',
    icon: '🕯️',
    svgAsset: '/assets/camara_circulo_ritual.svg',
    tagline: 'Grimórios Proibidos e Taumaturgia',
    lore: 'Pentagramas desenhados em sangue coagulado e retortas fumegantes. Amplifica os mistérios ocultos e a recuperação espiritual.',
    maxLevel: 5,
    baseCost: 180,
    costMultiplier: 1.5
  },
  gargoyle_parapet: {
    id: 'gargoyle_parapet',
    name: 'Ameias de Gárgula & Portão Bastilha',
    category: 'DEFENSE',
    icon: '🦇',
    svgAsset: '/assets/camara_ameias_gargulas.svg',
    tagline: 'Sentinelas de Pedra e Baluartes',
    lore: 'Muralhas coroadas por gárgulas vigilantes que despertam ao menor sussurro de inquisidores ou alcateias rivais se aproximando.',
    maxLevel: 5,
    baseCost: 160,
    costMultiplier: 1.48
  },
  minion_crypt: {
    id: 'minion_crypt',
    name: 'Mausoléu dos Servos & Alojamento Renegado',
    category: 'MINIONS',
    icon: '👥',
    svgAsset: '/assets/camara_cripta_lacaios.svg',
    tagline: 'Alojamento de Lacaios e Mercenários',
    lore: 'Criptas frias onde espiões humanos dominados e mercenários da taverna se recolhem, gerando tributos constantes de ouro e vigília.',
    maxLevel: 5,
    baseCost: 220,
    costMultiplier: 1.52
  }
};

export function calculateChamberUpgradeCost(chamberId: HideoutChamberId, currentLevel: number): number {
  const cfg = HIDEOUT_CHAMBERS[chamberId];
  if (!cfg) return 100;
  const lvl = Math.max(0, currentLevel);
  return Math.floor(cfg.baseCost * Math.pow(lvl + 1, cfg.costMultiplier));
}
export const calculateChamberCost = calculateChamberUpgradeCost;

export function getChamberStageName(level: number): string {
  if (level <= 0) return 'Ruínas Desmoronadas';
  if (level === 1) return 'Alvenaria Básica de Pedra';
  if (level === 2) return 'Abóbada Fortificada com Ferro';
  if (level === 3) return 'Câmara Gótica Ornamentada';
  if (level === 4) return 'Santuário de Sangue & Vitrais';
  return 'Catedral Soberana Ancestral';
}

export function getChamberBonus(chamberId: HideoutChamberId, currentLevel: number): ChamberBonusInfo {
  const nextLvl = currentLevel + 1;
  switch (chamberId) {
    case 'throne_sarcophagus':
      return {
        title: 'Vitalidade & Recuperação',
        currentValueText: currentLevel === 0 ? 'Sem bônus ativo' : `+${currentLevel * 40} HP Máximo • Regeneração acelerada`,
        nextValueText: `+${nextLvl * 40} HP Máximo • Cura no sono imortal`
      };
    case 'catacomb_vault':
      return {
        title: 'Capacidade do Baú Blindado',
        currentValueText: currentLevel === 0 ? 'Capacidade padrão' : `+${(currentLevel * 15000).toLocaleString('pt-BR')} Gold seguro`,
        nextValueText: `+${(nextLvl * 15000).toLocaleString('pt-BR')} Gold seguro contra saques`
      };
    case 'blood_forge':
      return {
        title: 'Eficiência de Forja Ancestral',
        currentValueText: currentLevel === 0 ? 'Forja básica' : `+${currentLevel * 5}% chance de afixo raro • -${currentLevel * 4}% custo de materiais`,
        nextValueText: `+${nextLvl * 5}% chance de afixo raro • -${nextLvl * 4}% custo de materiais`
      };
    case 'ritual_sanctum':
      return {
        title: 'Reserva e Regeneração de Energia',
        currentValueText: currentLevel === 0 ? 'Sem bônus' : `+${currentLevel * 15} Estamina Máxima • Ritos eficientes`,
        nextValueText: `+${nextLvl * 15} Estamina Máxima • +10% de ganho de XP místico`
      };
    case 'gargoyle_parapet':
      return {
        title: 'Disfarce contra Inquisição',
        currentValueText: currentLevel === 0 ? 'Vigilância nula' : `-${currentLevel * 6}% acúmulo de Alerta da Máscara • +${currentLevel * 8} Defesa`,
        nextValueText: `-${nextLvl * 6}% acúmulo de Alerta da Máscara • +${nextLvl * 8} Defesa em emboscadas`
      };
    case 'minion_crypt':
      return {
        title: 'Tributos e Renda Passiva',
        currentValueText: currentLevel === 0 ? 'Sem servos' : `+${currentLevel * 25} Gold por hora em tributos de lacaios`,
        nextValueText: `+${nextLvl * 25} Gold por hora em tributos de lacaios`
      };
  }
}

export function getChamberStatus(
  chamberId: HideoutChamberId,
  currentLevel: number,
  playerGold: number
): HideoutChamberStatus {
  const config = HIDEOUT_CHAMBERS[chamberId];
  const isMax = currentLevel >= config.maxLevel;
  const upgradeCost = isMax ? 0 : calculateChamberUpgradeCost(chamberId, currentLevel);
  return {
    id: chamberId,
    config,
    level: currentLevel,
    isUnlocked: currentLevel > 0,
    upgradeCost,
    canAfford: !isMax && playerGold >= upgradeCost,
    bonus: getChamberBonus(chamberId, currentLevel),
    stageName: getChamberStageName(currentLevel)
  };
}
