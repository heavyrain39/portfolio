export type OperatorId = "operator01" | "operator02" | "operator03" | "operator04";

export interface SidearmProps {
    themeColor?: string;
    accentColor?: string;
    showOperator?: boolean;
    dialogueList?: string[];
    operatorAssetBasePath?: string;
    operatorId?: OperatorId;
    enableSound?: boolean;
    initialMuted?: boolean;
    volume?: number;
    projectileSpeed?: number;
    spray?: number;
    hitParticleMultiplier?: number;
    killParticleMultiplier?: number;
    showHud?: boolean;
    isEditorMode?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const DEFAULT_DIALOGUES: string[] = [
    "Initialization sequence complete. Welcome back, Raven.",
    "Neural link stabilized. Feeling any feedback in your nerves?",
    "Your vitals are steady. As always. It's almost intimidating.",
    "The vector field is messy today. Keep your eyes peeled.",
    "Target sighted. Show me that 98% accuracy again, okay?",
    "Beautiful shot. You're making this look way too easy.",
    "Enemy signal neutralized. You didn't even break a sweat.",
    "Focus, Raven. Don't let my chatter distract you too much.",
    "Movement is fluid. Your sync rate is literally off the charts.",
    "Multiple signatures detected. Give 'em hell, Cowboy.",
    "Target terminated. Clean.",
    "Energy levels at 40%. Don't get reckless on me now.",
    "System idling. Come back soon, Raven."
];
