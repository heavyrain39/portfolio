export type OperatorId = "operator01" | "operator02" | "operator03" | "operator04";

export interface SidearmProps {
    themeColor?: string;
    accentColor?: string;
    showOperator?: boolean;
    showOperatorImage?: boolean;
    showOperatorComments?: boolean;
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
    "That heavy laser looks good on you. Very... dominant.",
    "Try not to overheat the core. I hate filing those repair reports.",
    "Target sighted. Show me that 98% accuracy again, okay?",
    "Beautiful shot. You're making this look way too easy.",
    "Enemy signal neutralized. You didn't even break a sweat.",
    "Is it hot in the cockpit, or is it just me watching the feed?",
    "Focus, Raven. Don't let my chatter distract you too much.",
    "Movement is fluid. Your sync rate is literally off the charts.",
    "I've cleared the secondary channel. It's just us now.",
    "Did you get my message about the post-mission drink?",
    "You're glowing on the radar. Literally and figuratively.",
    "Multiple signatures detected. Give 'em hell, Cowboy.",
    "I spent all night calibrating your aim. Don't waste it.",
    "You're the only pilot who can handle this much kickback.",
    "Stay safe out there. I don't want to lose my favorite asset.",
    "Ever visited the Tannhäuser Gate? My hometown is just a sector away.",
    "Target terminated. Clean. I love how you handle that trigger.",
    "Energy levels at 40%. Don't get reckless on me now.",
    "I'm recording this session... for \"tactical review.\" And my private collection.",
    "You done? I've got the debriefing room ready. Just for two.",
    "System idling. Come back soon, Raven. I'll be waiting right here."
];
